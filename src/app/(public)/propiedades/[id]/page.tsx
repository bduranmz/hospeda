import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Star,
  Users,
  BedDouble,
  Bath,
  MapPin,
  Shield,
  Clock,
  Award,
  ArrowLeft,
  Ban,
  Dog,
  PartyPopper,
  Cigarette,
} from "lucide-react";
import { getPropertyById } from "@/lib/queries/property-detail";
import {
  PROPERTY_TYPE_LABELS,
  SPACE_TYPE_LABELS,
  CANCELLATION_POLICY_LABELS,
  AMENITIES,
  type PropertyType,
  type SpaceType,
  type CancellationPolicy,
} from "@/types/database";
import PhotoGallery from "@/components/properties/PhotoGallery";
import BookingCard from "@/components/properties/BookingCard";

interface PageProps {
  params: Promise<{ id: string }>;
}

function formatCLP(amount: number): string {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    minimumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("es-CL", {
    year: "numeric",
    month: "long",
  });
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const property = await getPropertyById(id);
  if (!property) return { title: "Propiedad no encontrada | Hospeda" };
  return {
    title: `${property.title} | Hospeda`,
    description: property.description?.slice(0, 160) ?? `Arriendo en ${property.address.commune}`,
  };
}

export default async function PropertyDetailPage({ params }: PageProps) {
  const { id } = await params;
  const property = await getPropertyById(id);
  if (!property) notFound();

  const p = property;
  const amenityMap = Object.fromEntries(AMENITIES.map((a) => [a.id, a.label]));

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back */}
      <Link
        href="/propiedades"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-teal-600 mb-4 transition-colors"
      >
        <ArrowLeft size={14} />
        Volver a propiedades
      </Link>

      {/* Gallery */}
      <PhotoGallery photos={p.photos} />

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mt-8">
        {/* Left — Details */}
        <div className="lg:col-span-2 space-y-8">
          {/* Title + location */}
          <div>
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
              <span>{PROPERTY_TYPE_LABELS[p.property_type as PropertyType]}</span>
              <span>·</span>
              <span>{SPACE_TYPE_LABELS[p.space_type as SpaceType]}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              {p.title}
            </h1>
            <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <MapPin size={14} />
                {p.address.commune}, {p.address.region}
              </span>
              {p.avg_rating !== null && (
                <>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Star size={14} className="text-amber-400 fill-amber-400" />
                    {p.avg_rating} ({p.total_reviews} reseña{p.total_reviews !== 1 ? "s" : ""})
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Quick stats */}
          <div className="flex flex-wrap gap-6 py-5 border-y border-gray-100">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Users size={18} className="text-teal-600" />
              <span>{p.max_guests} huéspedes</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <BedDouble size={18} className="text-teal-600" />
              <span>
                {p.bedrooms} dormitorio{p.bedrooms !== 1 ? "s" : ""} · {p.beds}{" "}
                cama{p.beds !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Bath size={18} className="text-teal-600" />
              <span>{p.bathrooms} baño{p.bathrooms !== 1 ? "s" : ""}</span>
            </div>
          </div>

          {/* Host */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-teal-100 rounded-full flex items-center justify-center text-teal-700 font-bold text-lg shrink-0">
              {p.host.avatar_url ? (
                <img
                  src={p.host.avatar_url}
                  alt={p.host.full_name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                p.host.full_name.charAt(0).toUpperCase()
              )}
            </div>
            <div>
              <p className="font-semibold text-gray-900">
                Anfitrión: {p.host.full_name}
                {p.host.superhost && (
                  <span className="ml-2 inline-flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                    <Award size={12} />
                    Superhost
                  </span>
                )}
              </p>
              <p className="text-xs text-gray-500">
                Miembro desde {formatDate(p.host.created_at)}
                {p.host.total_reviews > 0 &&
                  ` · ${p.host.total_reviews} reseñas`}
              </p>
            </div>
          </div>

          {/* Description */}
          {p.description && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                Acerca de este alojamiento
              </h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                {p.description}
              </p>
            </div>
          )}

          {/* Amenities */}
          {p.amenities.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                Servicios y comodidades
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {p.amenities.map((a) => (
                  <div
                    key={a}
                    className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2"
                  >
                    <span className="w-2 h-2 bg-teal-400 rounded-full shrink-0" />
                    {amenityMap[a] ?? a}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Rules */}
          {p.rules && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                Reglas de la propiedad
              </h2>
              <div className="space-y-2 text-sm text-gray-600">
                {p.rules.no_smoking && (
                  <div className="flex items-center gap-2">
                    <Cigarette size={16} className="text-red-400" />
                    <span>No se permite fumar</span>
                  </div>
                )}
                {p.rules.no_pets && (
                  <div className="flex items-center gap-2">
                    <Dog size={16} className="text-red-400" />
                    <span>No se permiten mascotas</span>
                  </div>
                )}
                {p.rules.no_parties && (
                  <div className="flex items-center gap-2">
                    <PartyPopper size={16} className="text-red-400" />
                    <span>No se permiten fiestas</span>
                  </div>
                )}
                {p.rules.additional_rules && (
                  <p className="mt-2 text-gray-500">{p.rules.additional_rules}</p>
                )}
              </div>
            </div>
          )}

          {/* Check-in / Check-out */}
          <div className="flex flex-wrap gap-6 py-5 border-y border-gray-100">
            {p.check_in_time && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock size={16} className="text-teal-600" />
                <span>Check-in: {p.check_in_time}</span>
              </div>
            )}
            {p.check_out_time && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock size={16} className="text-teal-600" />
                <span>Check-out: {p.check_out_time}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Shield size={16} className="text-teal-600" />
              <span>
                Cancelación:{" "}
                {CANCELLATION_POLICY_LABELS[p.cancellation_policy as CancellationPolicy]}
              </span>
            </div>
          </div>

          {/* Reviews */}
          {p.reviews.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Star size={18} className="text-amber-400 fill-amber-400" />
                {p.avg_rating} · {p.total_reviews} reseña{p.total_reviews !== 1 ? "s" : ""}
              </h2>
              <div className="space-y-5">
                {p.reviews.slice(0, 6).map((review) => (
                  <div key={review.id} className="flex gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 font-medium text-sm shrink-0">
                      {review.reviewer.avatar_url ? (
                        <img
                          src={review.reviewer.avatar_url}
                          alt=""
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        review.reviewer.full_name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm text-gray-900">
                          {review.reviewer.full_name}
                        </span>
                        <span className="flex items-center gap-0.5 text-xs text-gray-500">
                          <Star
                            size={12}
                            className="text-amber-400 fill-amber-400"
                          />
                          {review.rating}
                        </span>
                      </div>
                      {review.comment && (
                        <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                          {review.comment}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">
                        {formatDate(review.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right — Booking card */}
        <div className="lg:col-span-1">
          <BookingCard
            basePrice={p.base_price}
            weekendPrice={p.weekend_price}
            cleaningFee={p.cleaning_fee}
            securityDeposit={p.security_deposit}
            minNights={p.min_nights}
            maxNights={p.max_nights}
            instantBooking={p.instant_booking}
          />
        </div>
      </div>
    </section>
  );
}
