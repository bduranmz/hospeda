-- =============================================================================
-- Hospeda — Plataforma de Arriendos (Chile)
-- Migration: 0001_initial_schema.sql
-- Fecha: 2026-06-27
-- Descripcion: Schema completo inicial — tablas, enums, funciones, indices, RLS
-- =============================================================================

-- ---------------------------------------------------------------------------
-- EXTENSIONS
-- ---------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- Para busqueda de texto en address

-- ---------------------------------------------------------------------------
-- ENUMS
-- ---------------------------------------------------------------------------

CREATE TYPE verification_status_enum AS ENUM (
  'unverified',
  'phone_verified',
  'identity_verified',
  'host_verified',
  'suspended'
);

CREATE TYPE property_type_enum AS ENUM (
  'house',
  'apartment',
  'cabin',
  'villa',
  'loft',
  'room',
  'other'
);

CREATE TYPE space_type_enum AS ENUM (
  'entire',
  'private_room',
  'shared_room'
);

CREATE TYPE property_status_enum AS ENUM (
  'draft',
  'pending_review',
  'published',
  'paused',
  'suspended',
  'archived'
);

CREATE TYPE cancellation_policy_enum AS ENUM (
  'flexible',
  'moderate',
  'strict',
  'non_refundable'
);

CREATE TYPE reservation_status_enum AS ENUM (
  'pending_approval',
  'approved',
  'rejected',
  'payment_pending',
  'payment_failed',
  'confirmed',
  'cancelled_by_guest',
  'cancelled_by_host',
  'checked_in',
  'completed',
  'disputed'
);

CREATE TYPE payment_provider_enum AS ENUM (
  'webpay',
  'flow'
);

CREATE TYPE payment_type_enum AS ENUM (
  'charge',
  'refund',
  'payout'
);

CREATE TYPE payment_status_enum AS ENUM (
  'pending',
  'success',
  'failed',
  'refunded'
);

CREATE TYPE review_type_enum AS ENUM (
  'guest_to_host',
  'host_to_guest'
);

CREATE TYPE review_status_enum AS ENUM (
  'pending',
  'published',
  'hidden',
  'deleted'
);

CREATE TYPE message_type_enum AS ENUM (
  'text',
  'image',
  'file',
  'system'
);

CREATE TYPE dispute_type_enum AS ENUM (
  'property_mismatch',
  'damage',
  'access_issue',
  'payment_dispute',
  'other'
);

CREATE TYPE dispute_status_enum AS ENUM (
  'open',
  'under_review',
  'resolved',
  'appealed'
);

CREATE TYPE dispute_resolution_enum AS ENUM (
  'full_refund',
  'partial_refund',
  'host_wins',
  'mixed'
);

CREATE TYPE payout_status_enum AS ENUM (
  'pending',
  'processing',
  'completed',
  'failed'
);

CREATE TYPE identity_document_type_enum AS ENUM (
  'rut',
  'passport'
);

CREATE TYPE identity_provider_enum AS ENUM (
  'truora',
  'manual'
);

CREATE TYPE identity_status_enum AS ENUM (
  'pending',
  'approved',
  'rejected'
);

CREATE TYPE calendar_block_reason_enum AS ENUM (
  'manual',
  'reservation',
  'ical_import'
);

CREATE TYPE dispute_evidence_type_enum AS ENUM (
  'photo',
  'document',
  'text'
);

CREATE TYPE notification_type_enum AS ENUM (
  'reservation_request',
  'reservation_approved',
  'reservation_rejected',
  'reservation_cancelled',
  'payment_received',
  'payment_failed',
  'check_in_reminder',
  'check_out_reminder',
  'review_request',
  'review_received',
  'dispute_opened',
  'dispute_resolved',
  'message_received',
  'payout_processed',
  'identity_verified',
  'identity_rejected',
  'system'
);

CREATE TYPE consent_type_enum AS ENUM (
  'terms',
  'privacy',
  'biometrics',
  'marketing'
);

-- ---------------------------------------------------------------------------
-- HELPER FUNCTIONS (definidas antes de RLS policies que las usan)
-- ---------------------------------------------------------------------------

-- Verifica si un usuario es admin (cualquier sub-rol)
CREATE OR REPLACE FUNCTION is_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM auth.users
    WHERE id = user_id
      AND (
        raw_app_meta_data->>'role' = 'admin'
        OR raw_app_meta_data->>'role' = 'admin_super'
        OR raw_app_meta_data->>'role' = 'admin_ops'
        OR raw_app_meta_data->>'role' = 'admin_soporte'
        OR raw_app_meta_data->>'role' = 'admin_finanzas'
        OR raw_app_meta_data->>'role' = 'admin_moderacion'
      )
  );
$$;

-- Genera ubicacion aproximada con offset aleatorio de 200-500m (privacidad)
CREATE OR REPLACE FUNCTION generate_approximate_location(
  exact_location geography
)
RETURNS geography
LANGUAGE plpgsql
AS $$
DECLARE
  offset_meters float := 200 + random() * 300;
  angle float := random() * 2 * pi();
BEGIN
  RETURN ST_Project(exact_location, offset_meters, angle);
END;
$$;

-- Trigger: actualiza updated_at automaticamente
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- ---------------------------------------------------------------------------
-- TABLA: profiles
-- Extiende auth.users de Supabase con datos de perfil de la plataforma
-- ---------------------------------------------------------------------------
CREATE TABLE profiles (
  id                      uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name               text NOT NULL,
  phone                   text UNIQUE,
  phone_verified          boolean NOT NULL DEFAULT false,
  avatar_url              text,
  date_of_birth           date,
  nationality             text,
  bio                     text,
  is_host                 boolean NOT NULL DEFAULT false,
  verification_status     verification_status_enum NOT NULL DEFAULT 'unverified',
  host_verification_status text,                   -- descripcion libre del estado de verificacion de anfitrion
  bank_account            jsonb,                   -- cifrado en app: {bank, account_type, account_number, rut_holder, name_holder}
  superhost               boolean NOT NULL DEFAULT false,
  total_reviews           int NOT NULL DEFAULT 0,
  avg_rating              numeric(3,2),
  -- Soft delete / suspension
  deleted_at              timestamptz,
  deletion_scheduled_at   timestamptz,
  -- Timestamps
  created_at              timestamptz NOT NULL DEFAULT now(),
  updated_at              timestamptz NOT NULL DEFAULT now(),
  -- Constraints
  CONSTRAINT profiles_avg_rating_range CHECK (avg_rating IS NULL OR (avg_rating >= 1 AND avg_rating <= 5))
);

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------------------------
-- TABLA: consents
-- Consentimientos GDPR/Ley 21.719 por usuario
-- ---------------------------------------------------------------------------
CREATE TABLE consents (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  consent_type consent_type_enum NOT NULL,
  granted      boolean NOT NULL,
  version      text NOT NULL,
  granted_at   timestamptz NOT NULL DEFAULT now(),
  revoked_at   timestamptz,
  ip_address   text,            -- hasheada HMAC-SHA256
  UNIQUE(user_id, consent_type, version)
);

-- ---------------------------------------------------------------------------
-- TABLA: identity_verifications
-- Verificaciones de identidad via Truora o manual
-- ---------------------------------------------------------------------------
CREATE TABLE identity_verifications (
  id                       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                  uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  document_type            identity_document_type_enum NOT NULL,
  provider                 identity_provider_enum NOT NULL DEFAULT 'truora',
  provider_verification_id text,
  status                   identity_status_enum NOT NULL DEFAULT 'pending',
  rejection_reason         text,
  attempt_number           int NOT NULL DEFAULT 1,
  verified_at              timestamptz,
  created_at               timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- TABLA: properties
-- Propiedades disponibles para arriendo
-- ---------------------------------------------------------------------------
CREATE TABLE properties (
  id                             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id                        uuid NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  title                          text NOT NULL,
  description                    text,
  property_type                  property_type_enum NOT NULL DEFAULT 'apartment',
  space_type                     space_type_enum NOT NULL DEFAULT 'entire',
  status                         property_status_enum NOT NULL DEFAULT 'draft',
  -- Ubicacion
  address                        jsonb NOT NULL DEFAULT '{}',  -- {street, number, apt, commune, region, country, zip}
  location                       geography(POINT, 4326),       -- coordenadas exactas (privadas)
  location_approximate           geography(POINT, 4326),       -- offset 200-500m para busqueda publica
  -- Capacidad
  max_guests                     int NOT NULL DEFAULT 1,
  bedrooms                       int NOT NULL DEFAULT 1,
  beds                           int NOT NULL DEFAULT 1,
  bathrooms                      numeric(3,1) NOT NULL DEFAULT 1,
  area_m2                        numeric(8,2),
  -- Caracteristicas
  amenities                      text[] NOT NULL DEFAULT '{}',
  rules                          jsonb DEFAULT '{}',           -- {no_smoking, no_pets, no_parties, check_in_instructions, ...}
  -- Politicas de tiempo
  check_in_time                  time,
  check_out_time                 time,
  cancellation_policy            cancellation_policy_enum NOT NULL DEFAULT 'flexible',
  -- Reservas
  instant_booking                boolean NOT NULL DEFAULT false,
  requires_identity_verification boolean NOT NULL DEFAULT false,
  min_nights                     int NOT NULL DEFAULT 1,
  max_nights                     int,
  preparation_days               int NOT NULL DEFAULT 0,
  advance_notice_hours           int NOT NULL DEFAULT 0,
  -- Precios base
  base_price                     numeric(12,0) NOT NULL,       -- CLP por noche
  weekend_price                  numeric(12,0),                -- precio viernes/sabado
  cleaning_fee                   numeric(12,0) NOT NULL DEFAULT 0,
  security_deposit               numeric(12,0) NOT NULL DEFAULT 0,
  -- Descuentos por estadia larga
  long_stay_discount_7           numeric(5,2),                 -- % descuento para 7+ noches
  long_stay_discount_28          numeric(5,2),                 -- % descuento para 28+ noches
  -- iCal sync
  ical_export_token              text UNIQUE DEFAULT gen_random_uuid()::text,
  ical_import_urls               text[] DEFAULT '{}',
  -- Timestamps
  published_at                   timestamptz,
  created_at                     timestamptz NOT NULL DEFAULT now(),
  updated_at                     timestamptz NOT NULL DEFAULT now(),
  -- Soft delete
  deleted_at                     timestamptz,
  -- Constraints
  CONSTRAINT properties_max_guests_positive CHECK (max_guests >= 1),
  CONSTRAINT properties_base_price_positive CHECK (base_price >= 0),
  CONSTRAINT properties_min_nights_positive CHECK (min_nights >= 1),
  CONSTRAINT properties_max_nights_valid    CHECK (max_nights IS NULL OR max_nights >= min_nights),
  CONSTRAINT properties_discount_range_7    CHECK (long_stay_discount_7 IS NULL OR (long_stay_discount_7 >= 0 AND long_stay_discount_7 <= 100)),
  CONSTRAINT properties_discount_range_28   CHECK (long_stay_discount_28 IS NULL OR (long_stay_discount_28 >= 0 AND long_stay_discount_28 <= 100))
);

CREATE TRIGGER properties_updated_at
  BEFORE UPDATE ON properties
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------------------------
-- TABLA: property_photos
-- Fotos de las propiedades (almacenadas en Supabase Storage bucket property-photos)
-- ---------------------------------------------------------------------------
CREATE TABLE property_photos (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id  uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  url          text NOT NULL,
  storage_path text NOT NULL,
  order_index  int NOT NULL DEFAULT 0,
  is_cover     boolean NOT NULL DEFAULT false,
  caption      text,
  created_at   timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- TABLA: seasonal_prices
-- Precios especiales por temporada (navidad, verano, fines de semana largo, etc.)
-- ---------------------------------------------------------------------------
CREATE TABLE seasonal_prices (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  name        text NOT NULL,
  start_date  date NOT NULL,
  end_date    date NOT NULL,
  price       numeric(12,0) NOT NULL,   -- CLP por noche
  min_nights  int,
  created_at  timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT seasonal_prices_date_order CHECK (end_date >= start_date),
  CONSTRAINT seasonal_prices_price_positive CHECK (price >= 0)
);

-- ---------------------------------------------------------------------------
-- TABLA: calendar_blocks
-- Bloqueos de calendario (por reserva, manual o iCal importado)
-- ---------------------------------------------------------------------------
CREATE TABLE calendar_blocks (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id    uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  start_date     date NOT NULL,
  end_date       date NOT NULL,
  reason         calendar_block_reason_enum NOT NULL DEFAULT 'manual',
  reservation_id uuid,                  -- FK hacia reservations (se agrega despues para evitar ciclico)
  notes          text,
  created_at     timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT calendar_blocks_date_order CHECK (end_date > start_date)
);

-- ---------------------------------------------------------------------------
-- TABLA: reservations
-- Reservas — ciclo de vida completo (10 estados via reservation_status_enum)
-- ---------------------------------------------------------------------------
CREATE TABLE reservations (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id         uuid NOT NULL REFERENCES properties(id) ON DELETE RESTRICT,
  guest_id            uuid NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  host_id             uuid NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  status              reservation_status_enum NOT NULL DEFAULT 'pending_approval',
  -- Fechas
  check_in            date NOT NULL,
  check_out           date NOT NULL,
  nights              int NOT NULL,
  guests_count        int NOT NULL,
  -- Precios (calculados server-side, en CLP)
  base_amount         numeric(12,0),
  cleaning_fee        numeric(12,0) NOT NULL DEFAULT 0,
  security_deposit    numeric(12,0) NOT NULL DEFAULT 0,
  guest_commission    numeric(12,0) NOT NULL DEFAULT 0,   -- comision que paga el huesped (8%)
  host_commission     numeric(12,0) NOT NULL DEFAULT 0,   -- comision que paga el anfitrion (5%)
  total_amount        numeric(12,0) NOT NULL,             -- base + limpieza + deposito
  guest_pays          numeric(12,0) NOT NULL,             -- total_amount + guest_commission
  host_receives       numeric(12,0) NOT NULL,             -- total_amount - host_commission
  platform_fee        numeric(12,0) NOT NULL,             -- guest_commission + host_commission
  -- Snapshot de politica de cancelacion al momento de la reserva
  cancellation_policy cancellation_policy_enum NOT NULL,
  -- Mensajes y notas
  guest_message       text,
  rejection_reason    text,
  -- Timestamps de eventos
  check_in_at         timestamptz,    -- cuando el huesped confirmo check-in
  check_out_at        timestamptz,    -- cuando el anfitrion confirmo check-out
  funds_released_at   timestamptz,    -- cuando se liberaron los fondos al anfitrion
  payment_deadline    timestamptz,    -- fecha limite para pagar (si instant_booking=false)
  -- Timestamps
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now(),
  -- Constraints
  CONSTRAINT reservations_date_order        CHECK (check_out > check_in),
  CONSTRAINT reservations_nights_positive   CHECK (nights >= 1),
  CONSTRAINT reservations_guests_positive   CHECK (guests_count >= 1),
  CONSTRAINT reservations_amounts_positive  CHECK (
    total_amount >= 0
    AND guest_pays >= 0
    AND host_receives >= 0
    AND platform_fee >= 0
  )
);

CREATE TRIGGER reservations_updated_at
  BEFORE UPDATE ON reservations
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- FK diferida hacia calendar_blocks (se crea despues de reservations)
ALTER TABLE calendar_blocks
  ADD CONSTRAINT calendar_blocks_reservation_id_fk
  FOREIGN KEY (reservation_id) REFERENCES reservations(id) ON DELETE SET NULL;

-- ---------------------------------------------------------------------------
-- TABLA: payment_transactions
-- Historial de transacciones de pago (cobros, reembolsos, liquidaciones)
-- ---------------------------------------------------------------------------
CREATE TABLE payment_transactions (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id          uuid NOT NULL REFERENCES reservations(id) ON DELETE RESTRICT,
  provider                payment_provider_enum NOT NULL,
  provider_transaction_id text,
  type                    payment_type_enum NOT NULL,
  amount                  numeric(12,0) NOT NULL,
  currency                text NOT NULL DEFAULT 'CLP',
  status                  payment_status_enum NOT NULL DEFAULT 'pending',
  provider_response       jsonb,                  -- respuesta completa del proveedor (sin datos de tarjeta)
  idempotency_key         text UNIQUE,            -- previene reembolsos duplicados
  created_at              timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT payment_transactions_amount_positive CHECK (amount >= 0)
);

-- ---------------------------------------------------------------------------
-- TABLA: reviews
-- Reseñas bidireccionales (huesped→anfitrion, anfitrion→huesped)
-- Sistema "sobre cerrado": ambas reseñas se publican simultaneamente
-- ---------------------------------------------------------------------------
CREATE TABLE reviews (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id       uuid NOT NULL REFERENCES reservations(id) ON DELETE RESTRICT,
  reviewer_id          uuid NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  reviewee_id          uuid NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  property_id          uuid REFERENCES properties(id) ON DELETE SET NULL,
  type                 review_type_enum NOT NULL,
  -- Ratings (1-5, solo para guest_to_host)
  rating_overall       numeric(3,1),
  rating_cleanliness   numeric(3,1),
  rating_communication numeric(3,1),
  rating_checkin       numeric(3,1),
  rating_accuracy      numeric(3,1),
  rating_location      numeric(3,1),
  rating_value         numeric(3,1),
  -- Evaluacion anfitrion→huesped
  would_recommend      boolean,
  -- Contenido
  comment              text,
  host_response        text,           -- respuesta publica del anfitrion a la resena del huesped
  -- Estado
  status               review_status_enum NOT NULL DEFAULT 'pending',
  moderation_note      text,
  published_at         timestamptz,
  -- Timestamps
  created_at           timestamptz NOT NULL DEFAULT now(),
  -- Constraints
  UNIQUE(reservation_id, reviewer_id),  -- una resena por reserva por persona
  CONSTRAINT reviews_rating_range CHECK (
    (rating_overall IS NULL OR (rating_overall >= 1 AND rating_overall <= 5)) AND
    (rating_cleanliness IS NULL OR (rating_cleanliness >= 1 AND rating_cleanliness <= 5)) AND
    (rating_communication IS NULL OR (rating_communication >= 1 AND rating_communication <= 5)) AND
    (rating_checkin IS NULL OR (rating_checkin >= 1 AND rating_checkin <= 5)) AND
    (rating_accuracy IS NULL OR (rating_accuracy >= 1 AND rating_accuracy <= 5)) AND
    (rating_location IS NULL OR (rating_location >= 1 AND rating_location <= 5)) AND
    (rating_value IS NULL OR (rating_value >= 1 AND rating_value <= 5))
  )
);

-- ---------------------------------------------------------------------------
-- TABLA: conversations
-- Hilo de mensajes entre huesped y anfitrion, asociado a una propiedad/reserva
-- ---------------------------------------------------------------------------
CREATE TABLE conversations (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id   uuid REFERENCES reservations(id) ON DELETE SET NULL,  -- puede existir pre-reserva
  property_id      uuid NOT NULL REFERENCES properties(id) ON DELETE RESTRICT,
  participant_ids  uuid[] NOT NULL,   -- [guest_id, host_id]
  last_message_at  timestamptz,
  created_at       timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- TABLA: messages
-- Mensajes dentro de una conversacion
-- No se permiten editar ni eliminar (auditabilidad para disputas)
-- ---------------------------------------------------------------------------
CREATE TABLE messages (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id       uuid NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  type            message_type_enum NOT NULL DEFAULT 'text',
  content         text,
  attachments     jsonb,              -- [{url, storage_path, type, size}]
  read_by         uuid[] NOT NULL DEFAULT '{}',
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- TABLA: disputes
-- Disputas abiertas por huesped o anfitrion post check-in
-- ---------------------------------------------------------------------------
CREATE TABLE disputes (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id  uuid NOT NULL REFERENCES reservations(id) ON DELETE RESTRICT,
  opened_by       uuid NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  type            dispute_type_enum NOT NULL,
  description     text NOT NULL,
  status          dispute_status_enum NOT NULL DEFAULT 'open',
  resolution      text,
  resolution_type dispute_resolution_enum,
  refund_amount   numeric(12,0),
  resolved_by     uuid REFERENCES profiles(id) ON DELETE SET NULL,
  resolved_at     timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- TABLA: dispute_evidence
-- Evidencia enviada por las partes en una disputa
-- ---------------------------------------------------------------------------
CREATE TABLE dispute_evidence (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dispute_id   uuid NOT NULL REFERENCES disputes(id) ON DELETE CASCADE,
  submitted_by uuid NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  type         dispute_evidence_type_enum NOT NULL,
  content      text,
  storage_path text,
  created_at   timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- TABLA: favorites
-- Propiedades guardadas por el usuario en listas
-- ---------------------------------------------------------------------------
CREATE TABLE favorites (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  property_id uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  list_name   text NOT NULL DEFAULT 'default',
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, property_id, list_name)
);

-- ---------------------------------------------------------------------------
-- TABLA: host_balances
-- Balance virtual de cada anfitrion (fondos en espera + disponibles)
-- ---------------------------------------------------------------------------
CREATE TABLE host_balances (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id           uuid NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  available_balance numeric(12,0) NOT NULL DEFAULT 0,
  pending_balance   numeric(12,0) NOT NULL DEFAULT 0,
  total_earned      numeric(12,0) NOT NULL DEFAULT 0,
  updated_at        timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT host_balances_available_non_negative CHECK (available_balance >= 0),
  CONSTRAINT host_balances_pending_non_negative   CHECK (pending_balance >= 0),
  CONSTRAINT host_balances_total_non_negative     CHECK (total_earned >= 0)
);

-- ---------------------------------------------------------------------------
-- TABLA: payouts
-- Liquidaciones enviadas al anfitrion (transferencia bancaria)
-- ---------------------------------------------------------------------------
CREATE TABLE payouts (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id               uuid NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  amount                numeric(12,0) NOT NULL,
  status                payout_status_enum NOT NULL DEFAULT 'pending',
  bank_account_snapshot jsonb NOT NULL,   -- snapshot de cuenta bancaria al momento del payout
  provider_transfer_id  text,
  notes                 text,
  created_at            timestamptz NOT NULL DEFAULT now(),
  completed_at          timestamptz,
  CONSTRAINT payouts_amount_positive CHECK (amount > 0)
);

-- ---------------------------------------------------------------------------
-- TABLA: notifications
-- Notificaciones in-app para cada usuario
-- ---------------------------------------------------------------------------
CREATE TABLE notifications (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type       notification_type_enum NOT NULL,
  title      text NOT NULL,
  body       text,
  data       jsonb,               -- datos extra (ej: reservation_id, property_id)
  read       boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- TABLA: platform_settings
-- Configuracion global de la plataforma (editable solo por admins)
-- ---------------------------------------------------------------------------
CREATE TABLE platform_settings (
  key        text PRIMARY KEY,
  value      jsonb NOT NULL,
  updated_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- TABLA: user_blocks
-- Usuarios que se han bloqueado entre si
-- ---------------------------------------------------------------------------
CREATE TABLE user_blocks (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  blocked_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(blocker_id, blocked_id),
  CONSTRAINT user_blocks_no_self_block CHECK (blocker_id <> blocked_id)
);

-- ---------------------------------------------------------------------------
-- TABLA: audit_log
-- Log de auditoria para acciones criticas (autenticacion, pagos, admin)
-- ---------------------------------------------------------------------------
CREATE TABLE audit_log (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid REFERENCES profiles(id) ON DELETE SET NULL,
  action        text NOT NULL,
  resource_type text NOT NULL,
  resource_id   uuid,
  details       jsonb,           -- sin PII innecesaria
  ip_address    text,            -- hasheada HMAC-SHA256
  user_agent    text,
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- INDICES
-- ---------------------------------------------------------------------------

-- profiles
CREATE INDEX idx_profiles_verification_status  ON profiles(verification_status);
CREATE INDEX idx_profiles_is_host              ON profiles(is_host) WHERE is_host = true;
CREATE INDEX idx_profiles_deleted              ON profiles(deleted_at) WHERE deleted_at IS NOT NULL;

-- properties — geograficos (PostGIS)
CREATE INDEX idx_properties_location           ON properties USING GIST(location);
CREATE INDEX idx_properties_location_approx    ON properties USING GIST(location_approximate);
-- properties — funcionales
CREATE INDEX idx_properties_status             ON properties(status);
CREATE INDEX idx_properties_host               ON properties(host_id);
CREATE INDEX idx_properties_type               ON properties(property_type);
CREATE INDEX idx_properties_base_price         ON properties(base_price);
CREATE INDEX idx_properties_max_guests         ON properties(max_guests);
CREATE INDEX idx_properties_deleted            ON properties(deleted_at) WHERE deleted_at IS NOT NULL;
-- properties — busqueda textual en address (GIN + pg_trgm)
CREATE INDEX idx_properties_commune            ON properties USING GIN((address->>'commune') gin_trgm_ops);
CREATE INDEX idx_properties_region             ON properties USING GIN((address->>'region') gin_trgm_ops);

-- calendar_blocks — disponibilidad
CREATE INDEX idx_calendar_blocks_property_dates ON calendar_blocks(property_id, start_date, end_date);
CREATE INDEX idx_calendar_blocks_reservation    ON calendar_blocks(reservation_id) WHERE reservation_id IS NOT NULL;

-- seasonal_prices
CREATE INDEX idx_seasonal_prices_property_dates ON seasonal_prices(property_id, start_date, end_date);

-- reservations
CREATE INDEX idx_reservations_property_dates   ON reservations(property_id, check_in, check_out);
CREATE INDEX idx_reservations_guest            ON reservations(guest_id);
CREATE INDEX idx_reservations_host             ON reservations(host_id);
CREATE INDEX idx_reservations_status           ON reservations(status);
CREATE INDEX idx_reservations_check_in         ON reservations(check_in);

-- payment_transactions
CREATE INDEX idx_payment_transactions_reservation ON payment_transactions(reservation_id);
CREATE INDEX idx_payment_transactions_status      ON payment_transactions(status);
CREATE INDEX idx_payment_transactions_provider    ON payment_transactions(provider);

-- reviews
CREATE INDEX idx_reviews_property_published   ON reviews(property_id, status) WHERE status = 'published';
CREATE INDEX idx_reviews_reviewee             ON reviews(reviewee_id);
CREATE INDEX idx_reviews_reviewer             ON reviews(reviewer_id);
CREATE INDEX idx_reviews_reservation          ON reviews(reservation_id);

-- conversations
CREATE INDEX idx_conversations_reservation    ON conversations(reservation_id);
CREATE INDEX idx_conversations_property       ON conversations(property_id);
CREATE INDEX idx_conversations_last_message   ON conversations(last_message_at DESC);
-- GIN index para buscar por participant_ids
CREATE INDEX idx_conversations_participants   ON conversations USING GIN(participant_ids);

-- messages
CREATE INDEX idx_messages_conversation       ON messages(conversation_id, created_at DESC);
CREATE INDEX idx_messages_sender             ON messages(sender_id);

-- disputes
CREATE INDEX idx_disputes_reservation        ON disputes(reservation_id);
CREATE INDEX idx_disputes_status             ON disputes(status);

-- favorites
CREATE INDEX idx_favorites_user              ON favorites(user_id);
CREATE INDEX idx_favorites_property          ON favorites(property_id);

-- payouts
CREATE INDEX idx_payouts_host                ON payouts(host_id);
CREATE INDEX idx_payouts_status              ON payouts(status);

-- notifications
CREATE INDEX idx_notifications_user          ON notifications(user_id, created_at DESC);
CREATE INDEX idx_notifications_unread        ON notifications(user_id, read) WHERE read = false;

-- audit_log
CREATE INDEX idx_audit_log_user              ON audit_log(user_id);
CREATE INDEX idx_audit_log_action            ON audit_log(action);
CREATE INDEX idx_audit_log_resource          ON audit_log(resource_type, resource_id);
CREATE INDEX idx_audit_log_created           ON audit_log(created_at DESC);

-- identity_verifications
CREATE INDEX idx_identity_verifications_user ON identity_verifications(user_id);

-- consents
CREATE INDEX idx_consents_user               ON consents(user_id);

-- ---------------------------------------------------------------------------
-- VISTA MATERIALIZADA: property_ratings
-- Ratings agregados por propiedad (se refresca cada 1h via cron)
-- ---------------------------------------------------------------------------
CREATE MATERIALIZED VIEW property_ratings AS
SELECT
  property_id,
  COUNT(*) AS review_count,
  AVG(rating_overall)       AS avg_overall,
  AVG(rating_cleanliness)   AS avg_cleanliness,
  AVG(rating_communication) AS avg_communication,
  AVG(rating_checkin)       AS avg_checkin,
  AVG(rating_accuracy)      AS avg_accuracy,
  AVG(rating_location)      AS avg_location,
  AVG(rating_value)         AS avg_value
FROM reviews
WHERE type = 'guest_to_host'
  AND status = 'published'
GROUP BY property_id
WITH DATA;

CREATE UNIQUE INDEX idx_property_ratings_property ON property_ratings(property_id);

-- ---------------------------------------------------------------------------
-- FUNCION: search_properties
-- Busqueda geografica de propiedades publicadas con filtros
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION search_properties(
  p_lat        float,
  p_lng        float,
  p_radius_m   float DEFAULT 10000,
  p_check_in   date  DEFAULT NULL,
  p_check_out  date  DEFAULT NULL,
  p_guests     int   DEFAULT 1,
  p_min_price  numeric DEFAULT NULL,
  p_max_price  numeric DEFAULT NULL,
  p_property_type property_type_enum DEFAULT NULL,
  p_space_type    space_type_enum    DEFAULT NULL
)
RETURNS TABLE (
  id                   uuid,
  title                text,
  property_type        property_type_enum,
  space_type           space_type_enum,
  max_guests           int,
  base_price           numeric,
  cleaning_fee         numeric,
  avg_rating           numeric,
  review_count         bigint,
  distance_m           float,
  location_approximate geography
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    p.id,
    p.title,
    p.property_type,
    p.space_type,
    p.max_guests,
    p.base_price,
    p.cleaning_fee,
    pr.avg_overall AS avg_rating,
    COALESCE(pr.review_count, 0) AS review_count,
    ST_Distance(
      p.location_approximate,
      ST_MakePoint(p_lng, p_lat)::geography
    ) AS distance_m,
    p.location_approximate
  FROM properties p
  LEFT JOIN property_ratings pr ON pr.property_id = p.id
  WHERE p.status = 'published'
    AND p.deleted_at IS NULL
    AND p.max_guests >= p_guests
    AND ST_DWithin(
      p.location_approximate,
      ST_MakePoint(p_lng, p_lat)::geography,
      p_radius_m
    )
    AND (p_min_price IS NULL OR p.base_price >= p_min_price)
    AND (p_max_price IS NULL OR p.base_price <= p_max_price)
    AND (p_property_type IS NULL OR p.property_type = p_property_type)
    AND (p_space_type IS NULL OR p.space_type = p_space_type)
    -- Excluir propiedades no disponibles en las fechas solicitadas
    AND (
      p_check_in IS NULL OR p_check_out IS NULL
      OR NOT EXISTS (
        SELECT 1 FROM calendar_blocks cb
        WHERE cb.property_id = p.id
          AND cb.start_date < p_check_out
          AND cb.end_date > p_check_in
      )
    )
  ORDER BY distance_m ASC;
$$;

-- ---------------------------------------------------------------------------
-- FUNCION: check_availability
-- Verifica si una propiedad esta disponible para un rango de fechas
-- Retorna true si disponible, false si bloqueada
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION check_availability(
  p_property_id uuid,
  p_check_in    date,
  p_check_out   date
)
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT NOT EXISTS (
    SELECT 1 FROM calendar_blocks
    WHERE property_id = p_property_id
      AND start_date < p_check_out
      AND end_date > p_check_in
  );
$$;

-- ---------------------------------------------------------------------------
-- TRIGGER: auto-crear host_balance cuando un perfil activa is_host
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION create_host_balance_on_host_activation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NEW.is_host = true AND (OLD.is_host IS DISTINCT FROM true) THEN
    INSERT INTO host_balances (host_id)
    VALUES (NEW.id)
    ON CONFLICT (host_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_host_balance_auto_create
  AFTER UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION create_host_balance_on_host_activation();

-- ---------------------------------------------------------------------------
-- TRIGGER: auto-crear perfil cuando se registra un usuario en Supabase Auth
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION create_profile_on_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_profile_on_signup();

-- ---------------------------------------------------------------------------
-- TRIGGER: actualizar last_message_at en conversations al insertar mensaje
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE conversations
  SET last_message_at = NEW.created_at
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER messages_update_conversation
  AFTER INSERT ON messages
  FOR EACH ROW EXECUTE FUNCTION update_conversation_last_message();

-- =============================================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE profiles               ENABLE ROW LEVEL SECURITY;
ALTER TABLE consents               ENABLE ROW LEVEL SECURITY;
ALTER TABLE identity_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties             ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_photos        ENABLE ROW LEVEL SECURITY;
ALTER TABLE seasonal_prices        ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_blocks        ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations           ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions   ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews                ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations          ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages               ENABLE ROW LEVEL SECURITY;
ALTER TABLE disputes               ENABLE ROW LEVEL SECURITY;
ALTER TABLE dispute_evidence       ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites              ENABLE ROW LEVEL SECURITY;
ALTER TABLE host_balances          ENABLE ROW LEVEL SECURITY;
ALTER TABLE payouts                ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications          ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_settings      ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_blocks            ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log              ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- RLS: profiles
-- ---------------------------------------------------------------------------

-- SELECT: cualquiera puede ver perfiles (columnas sensibles se controlan en la query)
CREATE POLICY "profiles_select_public"
  ON profiles FOR SELECT
  USING (deleted_at IS NULL);

-- UPDATE: solo el propio usuario puede actualizar su perfil
CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- UPDATE: admins pueden actualizar cualquier perfil
CREATE POLICY "profiles_update_admin"
  ON profiles FOR UPDATE
  USING (is_admin(auth.uid()));

-- INSERT: lo crea el trigger on_auth_user_created (service_role), no el usuario directamente
-- No se necesita policy INSERT para usuarios normales

-- ---------------------------------------------------------------------------
-- RLS: consents
-- ---------------------------------------------------------------------------

CREATE POLICY "consents_select_own"
  ON consents FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "consents_insert_own"
  ON consents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "consents_update_own"
  ON consents FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "consents_select_admin"
  ON consents FOR SELECT
  USING (is_admin(auth.uid()));

-- ---------------------------------------------------------------------------
-- RLS: identity_verifications
-- ---------------------------------------------------------------------------

CREATE POLICY "identity_select_own"
  ON identity_verifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "identity_insert_own"
  ON identity_verifications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "identity_select_admin"
  ON identity_verifications FOR SELECT
  USING (is_admin(auth.uid()));

CREATE POLICY "identity_update_admin"
  ON identity_verifications FOR UPDATE
  USING (is_admin(auth.uid()));

-- ---------------------------------------------------------------------------
-- RLS: properties
-- ---------------------------------------------------------------------------

-- SELECT: propiedades publicadas son visibles por todos
CREATE POLICY "properties_select_published"
  ON properties FOR SELECT
  USING (status = 'published' AND deleted_at IS NULL);

-- SELECT: el anfitrion ve todas sus propiedades (cualquier estado)
CREATE POLICY "properties_select_own"
  ON properties FOR SELECT
  USING (host_id = auth.uid());

-- SELECT: admins ven todas
CREATE POLICY "properties_select_admin"
  ON properties FOR SELECT
  USING (is_admin(auth.uid()));

-- INSERT: solo anfitriones verificados pueden publicar propiedades
CREATE POLICY "properties_insert_host"
  ON properties FOR INSERT
  WITH CHECK (
    host_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
        AND is_host = true
        AND verification_status = 'host_verified'
    )
  );

-- UPDATE: solo el anfitrion puede editar sus propiedades
CREATE POLICY "properties_update_own"
  ON properties FOR UPDATE
  USING (host_id = auth.uid())
  WITH CHECK (host_id = auth.uid());

-- UPDATE: admins pueden editar cualquier propiedad
CREATE POLICY "properties_update_admin"
  ON properties FOR UPDATE
  USING (is_admin(auth.uid()));

-- DELETE (soft): solo el anfitrion o admin pueden archivar
CREATE POLICY "properties_delete_own"
  ON properties FOR DELETE
  USING (host_id = auth.uid());

CREATE POLICY "properties_delete_admin"
  ON properties FOR DELETE
  USING (is_admin(auth.uid()));

-- ---------------------------------------------------------------------------
-- RLS: property_photos
-- ---------------------------------------------------------------------------

-- SELECT: fotos de propiedades publicadas son publicas
CREATE POLICY "property_photos_select_public"
  ON property_photos FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM properties
      WHERE id = property_photos.property_id
        AND (status = 'published' OR host_id = auth.uid())
        AND deleted_at IS NULL
    )
  );

-- INSERT: solo el anfitrion de la propiedad
CREATE POLICY "property_photos_insert_host"
  ON property_photos FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM properties
      WHERE id = property_photos.property_id
        AND host_id = auth.uid()
    )
  );

-- UPDATE / DELETE: solo el anfitrion
CREATE POLICY "property_photos_update_host"
  ON property_photos FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM properties
      WHERE id = property_photos.property_id AND host_id = auth.uid()
    )
  );

CREATE POLICY "property_photos_delete_host"
  ON property_photos FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM properties
      WHERE id = property_photos.property_id AND host_id = auth.uid()
    )
  );

CREATE POLICY "property_photos_admin"
  ON property_photos FOR ALL
  USING (is_admin(auth.uid()));

-- ---------------------------------------------------------------------------
-- RLS: seasonal_prices
-- ---------------------------------------------------------------------------

CREATE POLICY "seasonal_prices_select_public"
  ON seasonal_prices FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM properties
      WHERE id = seasonal_prices.property_id
        AND (status = 'published' OR host_id = auth.uid())
    )
  );

CREATE POLICY "seasonal_prices_manage_host"
  ON seasonal_prices FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM properties
      WHERE id = seasonal_prices.property_id AND host_id = auth.uid()
    )
  );

CREATE POLICY "seasonal_prices_admin"
  ON seasonal_prices FOR ALL
  USING (is_admin(auth.uid()));

-- ---------------------------------------------------------------------------
-- RLS: calendar_blocks
-- ---------------------------------------------------------------------------

-- SELECT: cualquiera puede ver los bloqueos de propiedades publicadas (para verificar disponibilidad)
CREATE POLICY "calendar_blocks_select_public"
  ON calendar_blocks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM properties
      WHERE id = calendar_blocks.property_id
        AND (status = 'published' OR host_id = auth.uid())
    )
  );

-- INSERT/UPDATE/DELETE: solo el anfitrion (bloqueos manuales) o el sistema (via service_role)
CREATE POLICY "calendar_blocks_manage_host"
  ON calendar_blocks FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM properties
      WHERE id = calendar_blocks.property_id AND host_id = auth.uid()
    )
  );

CREATE POLICY "calendar_blocks_admin"
  ON calendar_blocks FOR ALL
  USING (is_admin(auth.uid()));

-- ---------------------------------------------------------------------------
-- RLS: reservations
-- ---------------------------------------------------------------------------

-- SELECT: huesped ve sus reservas
CREATE POLICY "reservations_select_guest"
  ON reservations FOR SELECT
  USING (guest_id = auth.uid());

-- SELECT: anfitrion ve reservas de sus propiedades
CREATE POLICY "reservations_select_host"
  ON reservations FOR SELECT
  USING (host_id = auth.uid());

-- SELECT: admins ven todas
CREATE POLICY "reservations_select_admin"
  ON reservations FOR SELECT
  USING (is_admin(auth.uid()));

-- INSERT: solo huespedes verificados pueden crear reservas
CREATE POLICY "reservations_insert_guest"
  ON reservations FOR INSERT
  WITH CHECK (
    guest_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
        AND verification_status IN ('identity_verified', 'host_verified')
    )
  );

-- UPDATE: las partes involucradas o admin pueden actualizar
CREATE POLICY "reservations_update_parties"
  ON reservations FOR UPDATE
  USING (
    guest_id = auth.uid()
    OR host_id = auth.uid()
    OR is_admin(auth.uid())
  );

-- ---------------------------------------------------------------------------
-- RLS: payment_transactions
-- ---------------------------------------------------------------------------

CREATE POLICY "payment_transactions_select_guest"
  ON payment_transactions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM reservations
      WHERE id = payment_transactions.reservation_id
        AND guest_id = auth.uid()
    )
  );

CREATE POLICY "payment_transactions_select_host"
  ON payment_transactions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM reservations
      WHERE id = payment_transactions.reservation_id
        AND host_id = auth.uid()
    )
  );

CREATE POLICY "payment_transactions_select_admin"
  ON payment_transactions FOR SELECT
  USING (is_admin(auth.uid()));

-- INSERT: solo via service_role (API routes de pago)
-- Los usuarios no insertan directamente

-- ---------------------------------------------------------------------------
-- RLS: reviews
-- ---------------------------------------------------------------------------

-- SELECT: resenas publicadas son visibles por todos
CREATE POLICY "reviews_select_published"
  ON reviews FOR SELECT
  USING (status = 'published');

-- SELECT: el autor ve su propia resena (aunque no este publicada aun)
CREATE POLICY "reviews_select_own"
  ON reviews FOR SELECT
  USING (reviewer_id = auth.uid());

-- SELECT: admins ven todas
CREATE POLICY "reviews_select_admin"
  ON reviews FOR SELECT
  USING (is_admin(auth.uid()));

-- INSERT: solo se puede escribir resena de una reserva completada en la que se participo
CREATE POLICY "reviews_insert_party"
  ON reviews FOR INSERT
  WITH CHECK (
    reviewer_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM reservations
      WHERE id = reviews.reservation_id
        AND status = 'completed'
        AND (guest_id = auth.uid() OR host_id = auth.uid())
    )
  );

-- UPDATE: el reviewee puede agregar host_response
CREATE POLICY "reviews_update_host_response"
  ON reviews FOR UPDATE
  USING (reviewee_id = auth.uid())
  WITH CHECK (reviewee_id = auth.uid());

-- UPDATE/DELETE: admins para moderacion
CREATE POLICY "reviews_update_admin"
  ON reviews FOR UPDATE
  USING (is_admin(auth.uid()));

CREATE POLICY "reviews_delete_admin"
  ON reviews FOR DELETE
  USING (is_admin(auth.uid()));

-- ---------------------------------------------------------------------------
-- RLS: conversations
-- ---------------------------------------------------------------------------

-- SELECT: solo los participantes ven sus conversaciones
CREATE POLICY "conversations_select_participant"
  ON conversations FOR SELECT
  USING (auth.uid() = ANY(participant_ids));

CREATE POLICY "conversations_select_admin"
  ON conversations FOR SELECT
  USING (is_admin(auth.uid()));

-- INSERT: participantes pueden crear conversaciones
CREATE POLICY "conversations_insert_participant"
  ON conversations FOR INSERT
  WITH CHECK (auth.uid() = ANY(participant_ids));

-- UPDATE: solo actualizacion de last_message_at via trigger (service_role)
-- Los usuarios no actualizan directamente

-- ---------------------------------------------------------------------------
-- RLS: messages
-- ---------------------------------------------------------------------------

-- SELECT: solo los participantes de la conversacion ven mensajes
CREATE POLICY "messages_select_participant"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE id = messages.conversation_id
        AND auth.uid() = ANY(participant_ids)
    )
  );

-- SELECT: admins pueden leer para disputas
CREATE POLICY "messages_select_admin"
  ON messages FOR SELECT
  USING (is_admin(auth.uid()));

-- INSERT: solo participantes pueden enviar mensajes
CREATE POLICY "messages_insert_participant"
  ON messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM conversations
      WHERE id = messages.conversation_id
        AND auth.uid() = ANY(participant_ids)
    )
  );

-- Los mensajes NO se pueden editar ni eliminar por usuarios (auditabilidad)

-- ---------------------------------------------------------------------------
-- RLS: disputes
-- ---------------------------------------------------------------------------

-- SELECT: solo las partes involucradas o admin
CREATE POLICY "disputes_select_party"
  ON disputes FOR SELECT
  USING (
    opened_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM reservations
      WHERE id = disputes.reservation_id
        AND (guest_id = auth.uid() OR host_id = auth.uid())
    )
  );

CREATE POLICY "disputes_select_admin"
  ON disputes FOR SELECT
  USING (is_admin(auth.uid()));

-- INSERT: solo partes de la reserva pueden abrir disputa
CREATE POLICY "disputes_insert_party"
  ON disputes FOR INSERT
  WITH CHECK (
    opened_by = auth.uid()
    AND EXISTS (
      SELECT 1 FROM reservations
      WHERE id = disputes.reservation_id
        AND (guest_id = auth.uid() OR host_id = auth.uid())
        AND status IN ('confirmed', 'checked_in', 'completed')
    )
  );

-- UPDATE: solo admins pueden resolver
CREATE POLICY "disputes_update_admin"
  ON disputes FOR UPDATE
  USING (is_admin(auth.uid()));

-- ---------------------------------------------------------------------------
-- RLS: dispute_evidence
-- ---------------------------------------------------------------------------

CREATE POLICY "dispute_evidence_select_party"
  ON dispute_evidence FOR SELECT
  USING (
    submitted_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM disputes d
      JOIN reservations r ON r.id = d.reservation_id
      WHERE d.id = dispute_evidence.dispute_id
        AND (r.guest_id = auth.uid() OR r.host_id = auth.uid())
    )
  );

CREATE POLICY "dispute_evidence_select_admin"
  ON dispute_evidence FOR SELECT
  USING (is_admin(auth.uid()));

CREATE POLICY "dispute_evidence_insert_party"
  ON dispute_evidence FOR INSERT
  WITH CHECK (
    submitted_by = auth.uid()
    AND EXISTS (
      SELECT 1 FROM disputes d
      JOIN reservations r ON r.id = d.reservation_id
      WHERE d.id = dispute_evidence.dispute_id
        AND (r.guest_id = auth.uid() OR r.host_id = auth.uid())
        AND d.status IN ('open', 'under_review')
    )
  );

-- ---------------------------------------------------------------------------
-- RLS: favorites
-- ---------------------------------------------------------------------------

CREATE POLICY "favorites_all_own"
  ON favorites FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "favorites_select_admin"
  ON favorites FOR SELECT
  USING (is_admin(auth.uid()));

-- ---------------------------------------------------------------------------
-- RLS: host_balances
-- ---------------------------------------------------------------------------

CREATE POLICY "host_balances_select_own"
  ON host_balances FOR SELECT
  USING (host_id = auth.uid());

CREATE POLICY "host_balances_select_admin"
  ON host_balances FOR SELECT
  USING (is_admin(auth.uid()));

-- UPDATE solo via service_role (cron de liquidaciones)

-- ---------------------------------------------------------------------------
-- RLS: payouts
-- ---------------------------------------------------------------------------

CREATE POLICY "payouts_select_own"
  ON payouts FOR SELECT
  USING (host_id = auth.uid());

CREATE POLICY "payouts_select_admin"
  ON payouts FOR SELECT
  USING (is_admin(auth.uid()));

CREATE POLICY "payouts_update_admin"
  ON payouts FOR UPDATE
  USING (is_admin(auth.uid()));

-- ---------------------------------------------------------------------------
-- RLS: notifications
-- ---------------------------------------------------------------------------

CREATE POLICY "notifications_all_own"
  ON notifications FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "notifications_select_admin"
  ON notifications FOR SELECT
  USING (is_admin(auth.uid()));

-- ---------------------------------------------------------------------------
-- RLS: platform_settings
-- ---------------------------------------------------------------------------

-- SELECT: cualquier usuario autenticado puede leer la configuracion publica
CREATE POLICY "platform_settings_select_authenticated"
  ON platform_settings FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- INSERT/UPDATE/DELETE: solo admins
CREATE POLICY "platform_settings_manage_admin"
  ON platform_settings FOR ALL
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- ---------------------------------------------------------------------------
-- RLS: user_blocks
-- ---------------------------------------------------------------------------

CREATE POLICY "user_blocks_select_own"
  ON user_blocks FOR SELECT
  USING (blocker_id = auth.uid());

CREATE POLICY "user_blocks_insert_own"
  ON user_blocks FOR INSERT
  WITH CHECK (blocker_id = auth.uid());

CREATE POLICY "user_blocks_delete_own"
  ON user_blocks FOR DELETE
  USING (blocker_id = auth.uid());

CREATE POLICY "user_blocks_admin"
  ON user_blocks FOR ALL
  USING (is_admin(auth.uid()));

-- ---------------------------------------------------------------------------
-- RLS: audit_log
-- ---------------------------------------------------------------------------

-- Solo admins pueden leer el audit log
CREATE POLICY "audit_log_select_admin"
  ON audit_log FOR SELECT
  USING (is_admin(auth.uid()));

-- INSERT solo via service_role (lib/audit/log.ts con supabaseAdmin)
-- Los usuarios no insertan directamente

-- =============================================================================
-- DATOS INICIALES: platform_settings
-- =============================================================================

INSERT INTO platform_settings (key, value) VALUES
  ('guest_commission_pct',  '8'),              -- 8% comision que paga el huesped
  ('host_commission_pct',   '5'),              -- 5% comision que paga el anfitrion
  ('min_reservation_amount','10000'),          -- CLP minimo para procesar pago
  ('payout_day_of_week',    '1'),              -- lunes (1=lunes, 0=domingo)
  ('funds_release_hours',   '24'),             -- horas post check-in para liberar fondos al anfitrion
  ('deposit_release_hours', '72'),             -- horas post check-out sin disputa para liberar deposito
  ('request_expiry_hours',  '24'),             -- horas para que expire una solicitud sin respuesta
  ('max_properties_per_host','10'),            -- limite de propiedades por anfitrion
  ('max_pending_requests',  '3'),              -- limite de solicitudes pendientes por huesped
  ('maintenance_mode',      'false'),
  ('registration_open',     'true');
