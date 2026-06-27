// ============================================================================
// Hospeda — Database Types
// Matches supabase/migrations/0001_initial_schema.sql
// ============================================================================

// ---------------------------------------------------------------------------
// ENUMS
// ---------------------------------------------------------------------------

export type VerificationStatus =
  | "unverified"
  | "phone_verified"
  | "identity_verified"
  | "host_verified"
  | "suspended";

export type PropertyType =
  | "house"
  | "apartment"
  | "cabin"
  | "villa"
  | "loft"
  | "room"
  | "other";

export type SpaceType = "entire" | "private_room" | "shared_room";

export type PropertyStatus =
  | "draft"
  | "pending_review"
  | "published"
  | "paused"
  | "suspended"
  | "archived";

export type CancellationPolicy =
  | "flexible"
  | "moderate"
  | "strict"
  | "non_refundable";

export type ReservationStatus =
  | "pending_approval"
  | "approved"
  | "rejected"
  | "payment_pending"
  | "payment_failed"
  | "confirmed"
  | "cancelled_by_guest"
  | "cancelled_by_host"
  | "checked_in"
  | "completed"
  | "disputed";

export type PaymentProvider = "webpay" | "flow";
export type PaymentType = "charge" | "refund" | "payout";
export type PaymentStatus = "pending" | "success" | "failed" | "refunded";

export type ReviewType = "guest_to_host" | "host_to_guest";

export type MessageType = "text" | "image" | "system";

export type ConsentType =
  | "terms"
  | "privacy"
  | "marketing"
  | "analytics"
  | "identity_verification";

export type IdentityDocumentType = "rut" | "passport" | "foreign_id";
export type IdentityProvider = "truora" | "manual";
export type IdentityStatus = "pending" | "approved" | "rejected" | "expired";

// ---------------------------------------------------------------------------
// TABLES
// ---------------------------------------------------------------------------

export interface Profile {
  id: string;
  full_name: string;
  phone: string | null;
  phone_verified: boolean;
  avatar_url: string | null;
  date_of_birth: string | null; // date
  nationality: string | null;
  bio: string | null;
  is_host: boolean;
  verification_status: VerificationStatus;
  host_verification_status: string | null;
  bank_account: BankAccount | null; // jsonb
  superhost: boolean;
  total_reviews: number;
  avg_rating: number | null;
  deleted_at: string | null;
  deletion_scheduled_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface BankAccount {
  bank: string;
  account_type: string;
  account_number: string;
  rut_holder: string;
  name_holder: string;
}

export interface Consent {
  id: string;
  user_id: string;
  consent_type: ConsentType;
  granted: boolean;
  version: string;
  granted_at: string;
  revoked_at: string | null;
  ip_address: string | null;
}

export interface IdentityVerification {
  id: string;
  user_id: string;
  document_type: IdentityDocumentType;
  provider: IdentityProvider;
  provider_verification_id: string | null;
  status: IdentityStatus;
  rejection_reason: string | null;
  attempt_number: number;
  verified_at: string | null;
  created_at: string;
}

export interface Property {
  id: string;
  host_id: string;
  title: string;
  description: string | null;
  property_type: PropertyType;
  space_type: SpaceType;
  status: PropertyStatus;
  address: PropertyAddress; // jsonb
  location: unknown | null; // geography — returned as GeoJSON from Supabase
  location_approximate: unknown | null;
  max_guests: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  amenities: string[];
  rules: PropertyRules | null; // jsonb
  check_in_time: string | null; // time
  check_out_time: string | null;
  cancellation_policy: CancellationPolicy;
  instant_booking: boolean;
  requires_identity_verification: boolean;
  min_nights: number;
  max_nights: number | null;
  preparation_days: number;
  advance_notice_hours: number;
  base_price: number; // CLP
  weekend_price: number | null;
  cleaning_fee: number;
  security_deposit: number;
  ical_export_token: string | null;
  ical_import_urls: string[];
  published_at: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface PropertyAddress {
  street: string;
  number: string;
  apt?: string;
  commune: string;
  region: string;
  country: string;
  zip?: string;
}

export interface PropertyRules {
  no_smoking?: boolean;
  no_pets?: boolean;
  no_parties?: boolean;
  check_in_instructions?: string;
  additional_rules?: string;
}

export interface PropertyPhoto {
  id: string;
  property_id: string;
  url: string;
  storage_path: string;
  order_index: number;
  is_cover: boolean;
  caption: string | null;
  created_at: string;
}

export interface SeasonalPrice {
  id: string;
  property_id: string;
  name: string;
  start_date: string;
  end_date: string;
  price: number; // CLP
  min_nights: number | null;
  created_at: string;
}

export interface CalendarBlock {
  id: string;
  property_id: string;
  start_date: string;
  end_date: string;
  reason: string | null;
  reservation_id: string | null;
  created_at: string;
}

export interface Reservation {
  id: string;
  property_id: string;
  guest_id: string;
  host_id: string;
  status: ReservationStatus;
  check_in: string;
  check_out: string;
  nights: number;
  guests_count: number;
  base_price_per_night: number;
  base_price_total: number;
  cleaning_fee: number;
  security_deposit: number;
  service_fee_guest: number;
  service_fee_host: number;
  total_charged: number;
  host_payout: number;
  currency: string;
  special_requests: string | null;
  rejection_reason: string | null;
  cancelled_at: string | null;
  cancellation_reason: string | null;
  refund_amount: number | null;
  check_in_confirmed_at: string | null;
  check_out_confirmed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  reservation_id: string;
  provider: PaymentProvider;
  payment_type: PaymentType;
  status: PaymentStatus;
  amount: number;
  currency: string;
  provider_transaction_id: string | null;
  provider_response: Record<string, unknown> | null;
  initiated_at: string;
  completed_at: string | null;
  created_at: string;
}

export interface Review {
  id: string;
  reservation_id: string;
  reviewer_id: string;
  reviewee_id: string;
  property_id: string | null;
  review_type: ReviewType;
  rating: number; // 1-5
  cleanliness_rating: number | null;
  communication_rating: number | null;
  checkin_rating: number | null;
  accuracy_rating: number | null;
  location_rating: number | null;
  value_rating: number | null;
  comment: string | null;
  host_response: string | null;
  host_response_at: string | null;
  is_visible: boolean;
  created_at: string;
}

export interface Message {
  id: string;
  reservation_id: string | null;
  sender_id: string;
  receiver_id: string;
  message_type: MessageType;
  content: string | null;
  media_url: string | null;
  read_at: string | null;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string;
  data: Record<string, unknown> | null;
  read: boolean;
  read_at: string | null;
  created_at: string;
}

// ---------------------------------------------------------------------------
// VIEW / JOIN TYPES
// ---------------------------------------------------------------------------

export interface PropertyWithPhotos extends Property {
  property_photos: PropertyPhoto[];
}

export interface PropertyWithHost extends Property {
  host: Profile;
  property_photos: PropertyPhoto[];
}

export interface ReservationWithDetails extends Reservation {
  property: Property & { property_photos: PropertyPhoto[] };
  guest: Profile;
  host: Profile;
}

// ---------------------------------------------------------------------------
// FORM TYPES
// ---------------------------------------------------------------------------

export interface PropertyFormData {
  // Step 1: basic info
  title: string;
  description: string;
  property_type: PropertyType;
  space_type: SpaceType;
  // Step 2: location
  address: PropertyAddress;
  // Step 3: details
  max_guests: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  // Step 4: amenities
  amenities: string[];
  // Step 5: pricing
  base_price: number;
  weekend_price: number | null;
  cleaning_fee: number;
  security_deposit: number;
  // Step 6: rules
  rules: PropertyRules;
  cancellation_policy: CancellationPolicy;
  instant_booking: boolean;
  min_nights: number;
  max_nights: number | null;
  check_in_time: string;
  check_out_time: string;
}

// ---------------------------------------------------------------------------
// AMENITIES CATALOGUE (static list used in UI)
// ---------------------------------------------------------------------------

export const AMENITIES = [
  // Esenciales
  { id: "wifi", label: "WiFi", group: "Esenciales" },
  { id: "kitchen", label: "Cocina", group: "Esenciales" },
  { id: "washer", label: "Lavadora", group: "Esenciales" },
  { id: "dryer", label: "Secadora", group: "Esenciales" },
  { id: "air_conditioning", label: "Aire acondicionado", group: "Esenciales" },
  { id: "heating", label: "Calefacción", group: "Esenciales" },
  { id: "tv", label: "Televisión", group: "Esenciales" },
  { id: "iron", label: "Plancha", group: "Esenciales" },
  { id: "hair_dryer", label: "Secador de pelo", group: "Esenciales" },
  // Estacionamiento
  { id: "free_parking", label: "Estacionamiento gratis", group: "Estacionamiento" },
  { id: "paid_parking", label: "Estacionamiento pagado", group: "Estacionamiento" },
  { id: "garage", label: "Garage", group: "Estacionamiento" },
  // Exterior
  { id: "pool", label: "Piscina", group: "Exterior" },
  { id: "hot_tub", label: "Jacuzzi", group: "Exterior" },
  { id: "bbq", label: "Parrilla / BBQ", group: "Exterior" },
  { id: "garden", label: "Jardín", group: "Exterior" },
  { id: "terrace", label: "Terraza", group: "Exterior" },
  // Seguridad
  { id: "smoke_detector", label: "Detector de humo", group: "Seguridad" },
  { id: "co_detector", label: "Detector de CO", group: "Seguridad" },
  { id: "fire_extinguisher", label: "Extintor", group: "Seguridad" },
  { id: "first_aid", label: "Botiquín", group: "Seguridad" },
  { id: "security_camera", label: "Cámara de seguridad exterior", group: "Seguridad" },
  // Mascotas
  { id: "pets_allowed", label: "Se permiten mascotas", group: "Mascotas" },
] as const;

export type AmenityId = (typeof AMENITIES)[number]["id"];

export const PROPERTY_TYPE_LABELS: Record<PropertyType, string> = {
  house: "Casa",
  apartment: "Departamento",
  cabin: "Cabaña",
  villa: "Villa",
  loft: "Loft",
  room: "Habitación",
  other: "Otro",
};

export const SPACE_TYPE_LABELS: Record<SpaceType, string> = {
  entire: "Propiedad completa",
  private_room: "Habitación privada",
  shared_room: "Habitación compartida",
};

export const CANCELLATION_POLICY_LABELS: Record<CancellationPolicy, string> = {
  flexible: "Flexible",
  moderate: "Moderada",
  strict: "Estricta",
  non_refundable: "No reembolsable",
};

export const PROPERTY_STATUS_LABELS: Record<PropertyStatus, string> = {
  draft: "Borrador",
  pending_review: "En revisión",
  published: "Publicada",
  paused: "Pausada",
  suspended: "Suspendida",
  archived: "Archivada",
};

export const RESERVATION_STATUS_LABELS: Record<ReservationStatus, string> = {
  pending_approval: "Pendiente de aprobación",
  approved: "Aprobada",
  rejected: "Rechazada",
  payment_pending: "Pago pendiente",
  payment_failed: "Pago fallido",
  confirmed: "Confirmada",
  cancelled_by_guest: "Cancelada por huésped",
  cancelled_by_host: "Cancelada por anfitrión",
  checked_in: "Check-in realizado",
  completed: "Completada",
  disputed: "En disputa",
};
