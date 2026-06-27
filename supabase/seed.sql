-- =============================================================================
-- Hospeda — seed.sql
-- Datos de prueba para desarrollo local
-- Ejecutar DESPUES de aplicar la migration 0001_initial_schema.sql
-- =============================================================================
-- NOTA: En desarrollo local, los IDs de auth.users deben ser creados primero
--       via Supabase Studio o con el script de setup. Los UUIDs usados aqui
--       son ficticios y corresponden a usuarios creados manualmente en
--       el proyecto local de Supabase.
-- =============================================================================

-- Limpiar datos existentes (orden inverso de dependencias)
TRUNCATE TABLE
  audit_log,
  notifications,
  platform_settings,
  user_blocks,
  payouts,
  host_balances,
  favorites,
  dispute_evidence,
  disputes,
  messages,
  conversations,
  reviews,
  payment_transactions,
  reservations,
  calendar_blocks,
  seasonal_prices,
  property_photos,
  properties,
  consents,
  identity_verifications,
  profiles
RESTART IDENTITY CASCADE;

-- ---------------------------------------------------------------------------
-- PERFILES DE PRUEBA
-- (Asumiendo que los auth.users ya fueron creados con estos UUIDs en el panel)
-- En desarrollo local, usar: supabase auth admin create-user
-- ---------------------------------------------------------------------------

-- Admin
INSERT INTO profiles (id, full_name, phone, phone_verified, is_host, verification_status)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Admin Sistema',
  '+56900000001',
  true,
  false,
  'host_verified'
);

-- Anfitrion 1 — verificado, con propiedades
INSERT INTO profiles (id, full_name, phone, phone_verified, avatar_url, bio, is_host, verification_status, host_verification_status, superhost)
VALUES (
  '00000000-0000-0000-0000-000000000002',
  'Carlos Morales',
  '+56912345678',
  true,
  'https://i.pravatar.cc/256?u=carlos',
  'Anfitrion en Santiago desde 2022. Ofrezco departamentos equipados para estadias cortas y medianas.',
  true,
  'host_verified',
  'approved',
  true
);

-- Anfitrion 2 — verificado
INSERT INTO profiles (id, full_name, phone, phone_verified, avatar_url, bio, is_host, verification_status, host_verification_status)
VALUES (
  '00000000-0000-0000-0000-000000000003',
  'Valentina Soto',
  '+56987654321',
  true,
  'https://i.pravatar.cc/256?u=valentina',
  'Tengo una cabana en Pucón y un departamento en Viña del Mar. Bienvenidos!',
  true,
  'host_verified',
  'approved'
);

-- Huesped 1 — verificado de identidad
INSERT INTO profiles (id, full_name, phone, phone_verified, avatar_url, verification_status)
VALUES (
  '00000000-0000-0000-0000-000000000004',
  'Maria Fernandez',
  '+56911111111',
  true,
  'https://i.pravatar.cc/256?u=maria',
  'identity_verified'
);

-- Huesped 2 — verificado
INSERT INTO profiles (id, full_name, phone, phone_verified, avatar_url, verification_status)
VALUES (
  '00000000-0000-0000-0000-000000000005',
  'Diego Ramirez',
  '+56922222222',
  true,
  'https://i.pravatar.cc/256?u=diego',
  'identity_verified'
);

-- Huesped 3 — solo telefono verificado
INSERT INTO profiles (id, full_name, phone, phone_verified, verification_status)
VALUES (
  '00000000-0000-0000-0000-000000000006',
  'Ana Lopez',
  '+56933333333',
  true,
  'phone_verified'
);

-- ---------------------------------------------------------------------------
-- HOST BALANCES para anfitriones
-- ---------------------------------------------------------------------------

INSERT INTO host_balances (host_id, available_balance, pending_balance, total_earned)
VALUES
  ('00000000-0000-0000-0000-000000000002', 450000, 180000, 2300000),
  ('00000000-0000-0000-0000-000000000003', 0, 0, 0);

-- ---------------------------------------------------------------------------
-- PROPERTIES — Propiedad 1: Departamento en Providencia, Santiago
-- ---------------------------------------------------------------------------

INSERT INTO properties (
  id, host_id, title, description, property_type, space_type, status,
  address, location, location_approximate,
  max_guests, bedrooms, beds, bathrooms, area_m2,
  amenities, rules,
  check_in_time, check_out_time, cancellation_policy,
  instant_booking, requires_identity_verification,
  min_nights, max_nights, preparation_days, advance_notice_hours,
  base_price, weekend_price, cleaning_fee, security_deposit,
  long_stay_discount_7, long_stay_discount_28,
  published_at
)
VALUES (
  'aaaaaaaa-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000002',
  'Departamento moderno en Providencia con terraza',
  'Acogedor departamento de 2 habitaciones en el corazon de Providencia, a pasos del metro Baquedano. Vista panoramica de la cordillera desde la terraza. Totalmente equipado con cocina americana, internet de alta velocidad y estacionamiento cubierto. Ideal para parejas, familias pequenas o viaje de negocios.',
  'apartment',
  'entire',
  'published',
  '{"street": "Av. Providencia", "number": "1850", "apt": "Depto 42B", "commune": "Providencia", "region": "Metropolitana", "country": "Chile", "zip": "7500000"}'::jsonb,
  ST_MakePoint(-70.6193, -33.4341)::geography,
  ST_MakePoint(-70.6210, -33.4328)::geography,
  4, 2, 3, 1.5, 72,
  ARRAY['wifi','kitchen','washing_machine','dryer','air_conditioning','heating','tv','parking','elevator','balcony','city_view'],
  '{"no_smoking": true, "no_pets": false, "no_parties": true, "quiet_hours": "23:00-08:00", "max_additional_guests": 0}'::jsonb,
  '15:00', '11:00', 'moderate',
  true, false,
  2, 30, 1, 24,
  65000, 75000, 25000, 50000,
  10.0, 20.0,
  NOW() - INTERVAL '30 days'
);

-- ---------------------------------------------------------------------------
-- PROPERTIES — Propiedad 2: Cabana en Pucon
-- ---------------------------------------------------------------------------

INSERT INTO properties (
  id, host_id, title, description, property_type, space_type, status,
  address, location, location_approximate,
  max_guests, bedrooms, beds, bathrooms, area_m2,
  amenities, rules,
  check_in_time, check_out_time, cancellation_policy,
  instant_booking, requires_identity_verification,
  min_nights, max_nights, preparation_days, advance_notice_hours,
  base_price, weekend_price, cleaning_fee, security_deposit,
  long_stay_discount_7, long_stay_discount_28,
  published_at
)
VALUES (
  'aaaaaaaa-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000003',
  'Cabana rustica con vista al lago Villarrica',
  'Hermosa cabana de madera para 6 personas a orillas del lago Villarrica, en Pucon. Cuenta con chimenea, terraza con vista al lago y al volcan, kayaks incluidos. A 5 minutos del centro de Pucon y acceso a playa privada. Perfecta para desconectarse y disfrutar de la naturaleza del sur de Chile.',
  'cabin',
  'entire',
  'published',
  '{"street": "Camino Caburgua", "number": "km 3.5", "commune": "Pucon", "region": "Araucania", "country": "Chile"}'::jsonb,
  ST_MakePoint(-71.9599, -39.2762)::geography,
  ST_MakePoint(-71.9617, -39.2748)::geography,
  6, 3, 4, 2, 95,
  ARRAY['wifi','kitchen','fireplace','bbq','parking','lake_view','private_beach','kayaks','heating','washer'],
  '{"no_smoking": true, "no_pets": true, "no_parties": false, "children_allowed": true}'::jsonb,
  '14:00', '12:00', 'strict',
  false, true,
  3, 21, 2, 48,
  95000, 110000, 40000, 100000,
  5.0, 15.0,
  NOW() - INTERVAL '60 days'
);

-- ---------------------------------------------------------------------------
-- PROPERTIES — Propiedad 3: Habitacion privada en Vitacura
-- ---------------------------------------------------------------------------

INSERT INTO properties (
  id, host_id, title, description, property_type, space_type, status,
  address, location, location_approximate,
  max_guests, bedrooms, beds, bathrooms, area_m2,
  amenities, rules,
  check_in_time, check_out_time, cancellation_policy,
  instant_booking, requires_identity_verification,
  min_nights, advance_notice_hours,
  base_price, cleaning_fee,
  published_at
)
VALUES (
  'aaaaaaaa-0000-0000-0000-000000000003',
  '00000000-0000-0000-0000-000000000002',
  'Habitacion privada en casa familiar, Vitacura',
  'Habitacion privada con bano compartido en casa familiar ubicada en Vitacura. Ambiente tranquilo, seguro y comodo. Acceso a cocina y living. Cercano a principales empresas y centro comercial Parque Arauco.',
  'house',
  'private_room',
  'published',
  '{"street": "Av. Vitacura", "number": "6500", "commune": "Vitacura", "region": "Metropolitana", "country": "Chile"}'::jsonb,
  ST_MakePoint(-70.5789, -33.3869)::geography,
  ST_MakePoint(-70.5801, -33.3857)::geography,
  2, 1, 1, 1, 18,
  ARRAY['wifi','kitchen_shared','heating','tv','parking'],
  '{"no_smoking": true, "no_pets": true, "no_parties": true, "quiet_hours": "22:00-08:00"}'::jsonb,
  '16:00', '10:00', 'flexible',
  true, false,
  1, 12,
  35000, 10000,
  NOW() - INTERVAL '15 days'
);

-- ---------------------------------------------------------------------------
-- PROPERTIES — Propiedad 4: Draft (no publicada)
-- ---------------------------------------------------------------------------

INSERT INTO properties (
  id, host_id, title, property_type, space_type, status,
  address, max_guests, bedrooms, beds, bathrooms,
  base_price, cleaning_fee
)
VALUES (
  'aaaaaaaa-0000-0000-0000-000000000004',
  '00000000-0000-0000-0000-000000000003',
  'Departamento en Viña del Mar (borrador)',
  'apartment', 'entire', 'draft',
  '{"commune": "Viña del Mar", "region": "Valparaiso", "country": "Chile"}'::jsonb,
  4, 2, 2, 1,
  55000, 20000
);

-- ---------------------------------------------------------------------------
-- PROPERTY PHOTOS
-- ---------------------------------------------------------------------------

INSERT INTO property_photos (property_id, url, storage_path, order_index, is_cover) VALUES
-- Propiedad 1
('aaaaaaaa-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800', 'property-photos/seed/prop1-1.jpg', 0, true),
('aaaaaaaa-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800', 'property-photos/seed/prop1-2.jpg', 1, false),
('aaaaaaaa-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800', 'property-photos/seed/prop1-3.jpg', 2, false),
('aaaaaaaa-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800', 'property-photos/seed/prop1-4.jpg', 3, false),
-- Propiedad 2
('aaaaaaaa-0000-0000-0000-000000000002', 'https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?w=800', 'property-photos/seed/prop2-1.jpg', 0, true),
('aaaaaaaa-0000-0000-0000-000000000002', 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=800', 'property-photos/seed/prop2-2.jpg', 1, false),
('aaaaaaaa-0000-0000-0000-000000000002', 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800', 'property-photos/seed/prop2-3.jpg', 2, false),
-- Propiedad 3
('aaaaaaaa-0000-0000-0000-000000000003', 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800', 'property-photos/seed/prop3-1.jpg', 0, true);

-- ---------------------------------------------------------------------------
-- SEASONAL PRICES
-- ---------------------------------------------------------------------------

INSERT INTO seasonal_prices (property_id, name, start_date, end_date, price, min_nights) VALUES
-- Temporada alta verano (prop 1)
('aaaaaaaa-0000-0000-0000-000000000001', 'Temporada Verano 2027', '2027-01-06', '2027-02-28', 85000, 3),
-- Navidad y Año Nuevo (prop 1)
('aaaaaaaa-0000-0000-0000-000000000001', 'Navidad y Año Nuevo 2026-27', '2026-12-23', '2027-01-05', 95000, 5),
-- Fiestas Patrias (prop 2)
('aaaaaaaa-0000-0000-0000-000000000002', 'Fiestas Patrias 2026', '2026-09-17', '2026-09-20', 130000, 3),
-- Temporada alta sur verano (prop 2)
('aaaaaaaa-0000-0000-0000-000000000002', 'Temporada Alta Pucon 2027', '2027-01-06', '2027-02-28', 140000, 4);

-- ---------------------------------------------------------------------------
-- RESERVATIONS
-- ---------------------------------------------------------------------------

-- Reserva 1: completada (Maria en prop 1)
INSERT INTO reservations (
  id, property_id, guest_id, host_id, status,
  check_in, check_out, nights, guests_count,
  base_amount, cleaning_fee, security_deposit,
  guest_commission, host_commission,
  total_amount, guest_pays, host_receives, platform_fee,
  cancellation_policy,
  guest_message, check_in_at, check_out_at, funds_released_at
)
VALUES (
  'bbbbbbbb-0000-0000-0000-000000000001',
  'aaaaaaaa-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000004',
  '00000000-0000-0000-0000-000000000002',
  'completed',
  '2026-06-05', '2026-06-08', 3, 2,
  195000, 25000, 50000,
  17600, 11000,
  270000, 287600, 259000, 28600,
  'moderate',
  'Hola Carlos! Viaje de trabajo a Santiago, llegamos el viernes por la tarde.',
  '2026-06-05 16:00:00-03', '2026-06-08 10:30:00-03', '2026-06-09 12:00:00-03'
);

-- Reserva 2: confirmada (Diego en prop 2)
INSERT INTO reservations (
  id, property_id, guest_id, host_id, status,
  check_in, check_out, nights, guests_count,
  base_amount, cleaning_fee, security_deposit,
  guest_commission, host_commission,
  total_amount, guest_pays, host_receives, platform_fee,
  cancellation_policy,
  guest_message, payment_deadline
)
VALUES (
  'bbbbbbbb-0000-0000-0000-000000000002',
  'aaaaaaaa-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000005',
  '00000000-0000-0000-0000-000000000003',
  'confirmed',
  '2026-07-10', '2026-07-17', 7, 4,
  665000, 40000, 100000,
  64400, 40250,
  805000, 869400, 764750, 104650,
  'strict',
  'Hola Valentina! Somos 2 parejas amigas, buscamos descansar en la naturaleza.',
  NOW() + INTERVAL '5 days'
);

-- Reserva 3: pendiente de aprobacion (Ana en prop 1)
INSERT INTO reservations (
  id, property_id, guest_id, host_id, status,
  check_in, check_out, nights, guests_count,
  base_amount, cleaning_fee, security_deposit,
  guest_commission, host_commission,
  total_amount, guest_pays, host_receives, platform_fee,
  cancellation_policy, guest_message
)
VALUES (
  'bbbbbbbb-0000-0000-0000-000000000003',
  'aaaaaaaa-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000006',
  '00000000-0000-0000-0000-000000000002',
  'pending_approval',
  '2026-08-01', '2026-08-04', 3, 2,
  195000, 25000, 50000,
  17600, 11000,
  270000, 287600, 259000, 28600,
  'moderate',
  'Buenos dias! Busco alojamiento para reuniones de trabajo en Santiago.'
);

-- ---------------------------------------------------------------------------
-- CALENDAR BLOCKS
-- ---------------------------------------------------------------------------

-- Bloqueo por reserva 1 (ya completada — historico)
INSERT INTO calendar_blocks (property_id, start_date, end_date, reason, reservation_id)
VALUES ('aaaaaaaa-0000-0000-0000-000000000001', '2026-06-05', '2026-06-08', 'reservation', 'bbbbbbbb-0000-0000-0000-000000000001');

-- Bloqueo por reserva 2 (confirmada)
INSERT INTO calendar_blocks (property_id, start_date, end_date, reason, reservation_id)
VALUES ('aaaaaaaa-0000-0000-0000-000000000002', '2026-07-10', '2026-07-17', 'reservation', 'bbbbbbbb-0000-0000-0000-000000000002');

-- Bloqueo manual (Carlos se va de vacaciones)
INSERT INTO calendar_blocks (property_id, start_date, end_date, reason, notes)
VALUES ('aaaaaaaa-0000-0000-0000-000000000001', '2026-07-20', '2026-07-31', 'manual', 'Vacaciones del anfitrion');

-- ---------------------------------------------------------------------------
-- PAYMENT TRANSACTIONS
-- ---------------------------------------------------------------------------

INSERT INTO payment_transactions (
  reservation_id, provider, provider_transaction_id,
  type, amount, currency, status, idempotency_key
)
VALUES
  -- Cobro reserva 1 (completada)
  (
    'bbbbbbbb-0000-0000-0000-000000000001', 'webpay', 'WP-20260605-001',
    'charge', 287600, 'CLP', 'success',
    'charge-bbbbbbbb-0001-webpay'
  ),
  -- Cobro reserva 2 (confirmada)
  (
    'bbbbbbbb-0000-0000-0000-000000000002', 'flow', 'FL-20260615-001',
    'charge', 869400, 'CLP', 'success',
    'charge-bbbbbbbb-0002-flow'
  );

-- ---------------------------------------------------------------------------
-- REVIEWS
-- ---------------------------------------------------------------------------

-- Reseña 1: Maria → Carlos (guest_to_host) — publicada
INSERT INTO reviews (
  id, reservation_id, reviewer_id, reviewee_id, property_id,
  type, rating_overall, rating_cleanliness, rating_communication,
  rating_checkin, rating_accuracy, rating_location, rating_value,
  comment, status, published_at
)
VALUES (
  'cccccccc-0000-0000-0000-000000000001',
  'bbbbbbbb-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000004',
  '00000000-0000-0000-0000-000000000002',
  'aaaaaaaa-0000-0000-0000-000000000001',
  'guest_to_host',
  5.0, 5.0, 5.0, 5.0, 4.5, 4.5, 4.5,
  'Excelente departamento, exactamente como las fotos. Carlos fue muy atento y resolvio todo rapidamente. La ubicacion es perfecta, a pasos del metro y de buenos restaurantes. Totalmente recomendado.',
  'published',
  NOW() - INTERVAL '15 days'
);

-- Reseña 2: Carlos → Maria (host_to_guest) — publicada
INSERT INTO reviews (
  id, reservation_id, reviewer_id, reviewee_id, property_id,
  type, would_recommend, comment, status, published_at
)
VALUES (
  'cccccccc-0000-0000-0000-000000000002',
  'bbbbbbbb-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000004',
  'aaaaaaaa-0000-0000-0000-000000000001',
  'host_to_guest',
  true,
  'Maria fue una huesped impecable. Dejo el departamento en perfectas condiciones. Comunicacion excelente durante toda la estadia. Bienvenida de vuelta cuando quiera.',
  'published',
  NOW() - INTERVAL '15 days'
);

-- ---------------------------------------------------------------------------
-- CONVERSATIONS Y MESSAGES
-- ---------------------------------------------------------------------------

-- Conversacion entre Diego y Valentina (reserva 2)
INSERT INTO conversations (id, reservation_id, property_id, participant_ids, last_message_at)
VALUES (
  'dddddddd-0000-0000-0000-000000000001',
  'bbbbbbbb-0000-0000-0000-000000000002',
  'aaaaaaaa-0000-0000-0000-000000000002',
  ARRAY['00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000003']::uuid[],
  NOW() - INTERVAL '2 hours'
);

INSERT INTO messages (conversation_id, sender_id, type, content, read_by) VALUES
(
  'dddddddd-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000005',
  'text',
  'Hola Valentina! Confirmamos la reserva para julio. Tenemos alguna restriccion para llevar perro pequeño?',
  ARRAY['00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000003']::uuid[]
),
(
  'dddddddd-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000003',
  'text',
  'Hola Diego! Si, aceptamos mascotas pequenas. Solo les pido que avisen el dia de llegada si traen mascota. Los espero!',
  ARRAY['00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000003']::uuid[]
);

-- Conversacion entre Ana y Carlos (reserva pendiente)
INSERT INTO conversations (id, reservation_id, property_id, participant_ids, last_message_at)
VALUES (
  'dddddddd-0000-0000-0000-000000000002',
  'bbbbbbbb-0000-0000-0000-000000000003',
  'aaaaaaaa-0000-0000-0000-000000000001',
  ARRAY['00000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000002']::uuid[],
  NOW() - INTERVAL '30 minutes'
);

INSERT INTO messages (conversation_id, sender_id, type, content, read_by) VALUES
(
  'dddddddd-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000006',
  'text',
  'Buenos dias Carlos! Acabo de enviar la solicitud de reserva para agosto. Llegaria el viernes en la tarde, hay estacionamiento disponible?',
  ARRAY['00000000-0000-0000-0000-000000000006']::uuid[]
);

-- ---------------------------------------------------------------------------
-- FAVORITES
-- ---------------------------------------------------------------------------

INSERT INTO favorites (user_id, property_id, list_name) VALUES
('00000000-0000-0000-0000-000000000004', 'aaaaaaaa-0000-0000-0000-000000000002', 'default'),
('00000000-0000-0000-0000-000000000004', 'aaaaaaaa-0000-0000-0000-000000000003', 'default'),
('00000000-0000-0000-0000-000000000005', 'aaaaaaaa-0000-0000-0000-000000000001', 'Santiago'),
('00000000-0000-0000-0000-000000000005', 'aaaaaaaa-0000-0000-0000-000000000002', 'default');

-- ---------------------------------------------------------------------------
-- NOTIFICATIONS
-- ---------------------------------------------------------------------------

INSERT INTO notifications (user_id, type, title, body, data, read) VALUES
-- Para Carlos (anfitrion): nueva solicitud de Ana
(
  '00000000-0000-0000-0000-000000000002',
  'reservation_request',
  'Nueva solicitud de reserva',
  'Ana Lopez quiere reservar tu departamento del 1 al 4 de agosto.',
  '{"reservation_id": "bbbbbbbb-0000-0000-0000-000000000003", "property_id": "aaaaaaaa-0000-0000-0000-000000000001"}'::jsonb,
  false
),
-- Para Diego (huesped): reserva confirmada
(
  '00000000-0000-0000-0000-000000000005',
  'reservation_approved',
  'Reserva confirmada',
  'Tu reserva en Cabana rustica con vista al lago Villarrica fue confirmada.',
  '{"reservation_id": "bbbbbbbb-0000-0000-0000-000000000002", "property_id": "aaaaaaaa-0000-0000-0000-000000000002"}'::jsonb,
  true
),
-- Para Maria (huesped): solicitar resena
(
  '00000000-0000-0000-0000-000000000004',
  'review_request',
  'Cuéntanos como estuvo tu estadia',
  'Ya pasaron algunos dias desde tu estadia en Departamento moderno en Providencia. Dejanos tu opinion!',
  '{"reservation_id": "bbbbbbbb-0000-0000-0000-000000000001", "property_id": "aaaaaaaa-0000-0000-0000-000000000001"}'::jsonb,
  true
);

-- ---------------------------------------------------------------------------
-- PLATFORM SETTINGS (ya insertados en la migration, pero se repiten
-- aqui como referencia de los valores default para desarrollo)
-- Si se ejecuta truncate arriba, hay que re-insertarlos:
-- ---------------------------------------------------------------------------

INSERT INTO platform_settings (key, value, updated_by) VALUES
  ('guest_commission_pct',   '8',     '00000000-0000-0000-0000-000000000001'),
  ('host_commission_pct',    '5',     '00000000-0000-0000-0000-000000000001'),
  ('min_reservation_amount', '10000', '00000000-0000-0000-0000-000000000001'),
  ('payout_day_of_week',     '1',     '00000000-0000-0000-0000-000000000001'),
  ('funds_release_hours',    '24',    '00000000-0000-0000-0000-000000000001'),
  ('deposit_release_hours',  '72',    '00000000-0000-0000-0000-000000000001'),
  ('request_expiry_hours',   '24',    '00000000-0000-0000-0000-000000000001'),
  ('max_properties_per_host','10',    '00000000-0000-0000-0000-000000000001'),
  ('max_pending_requests',   '3',     '00000000-0000-0000-0000-000000000001'),
  ('maintenance_mode',       'false', '00000000-0000-0000-0000-000000000001'),
  ('registration_open',      'true',  '00000000-0000-0000-0000-000000000001')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_by = EXCLUDED.updated_by;

-- ---------------------------------------------------------------------------
-- REFRESCAR VISTA MATERIALIZADA
-- ---------------------------------------------------------------------------

REFRESH MATERIALIZED VIEW property_ratings;

-- ---------------------------------------------------------------------------
-- FIN DEL SEED
-- ---------------------------------------------------------------------------
-- Para aplicar en local:
--   supabase db reset       (aplica migrations + seed)
-- O:
--   psql $DATABASE_URL -f supabase/seed.sql
-- ---------------------------------------------------------------------------
