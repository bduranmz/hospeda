import Link from "next/link";
import { Star, Users, BedDouble, Bath, Zap, MapPin } from "lucide-react";
import type { PropertySearchResult } from "@/lib/queries/properties";
import { PROPERTY_TYPE_LABELS, SPACE_TYPE_LABELS } from "@/types/database";

function formatCLP(amount: number): string {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    minimumFractionDigits: 0,
  }).format(amount);
}

export default function PropertyCard({ property }: { property: PropertySearchResult }) {
  const p = property;

  return (
    <Link
      href={`/propiedades/${p.id}`}
      className="group block bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg hover:border-teal-200 transition-all"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
        {p.cover_photo ? (
          <img
            src={p.cover_photo}
            alt={p.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <BedDouble size={48} />
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          <span className="bg-white/90 backdrop-blur-sm text-xs font-medium text-gray-700 px-2.5 py-1 rounded-lg">
            {PROPERTY_TYPE_LABELS[p.property_type]}
          </span>
          {p.instant_booking && (
            <span className="bg-teal-600/90 backdrop-blur-sm text-xs font-medium text-white px-2.5 py-1 rounded-lg flex items-center gap-1">
              <Zap size={12} />
              Reserva instantánea
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Location */}
        <div className="flex items-center gap-1 text-gray-400 text-xs mb-1">
          <MapPin size={12} />
          <span>
            {p.address.commune}
            {p.address.region ? `, ${p.address.region}` : ""}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-gray-900 text-base leading-snug group-hover:text-teal-700 transition-colors line-clamp-2">
          {p.title}
        </h3>

        {/* Space type */}
        <p className="text-xs text-gray-500 mt-0.5">
          {SPACE_TYPE_LABELS[p.space_type]}
        </p>

        {/* Details */}
        <div className="flex items-center gap-3 mt-3 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Users size={13} /> {p.max_guests}
          </span>
          <span className="flex items-center gap-1">
            <BedDouble size={13} /> {p.bedrooms}
          </span>
          <span className="flex items-center gap-1">
            <Bath size={13} /> {p.bathrooms}
          </span>
        </div>

        {/* Price + Rating */}
        <div className="flex items-end justify-between mt-4 pt-3 border-t border-gray-50">
          <div>
            <span className="text-lg font-bold text-gray-900">
              {formatCLP(p.base_price)}
            </span>
            <span className="text-xs text-gray-500 ml-1">/ noche</span>
          </div>

          {p.avg_rating !== null && (
            <div className="flex items-center gap-1 text-sm">
              <Star size={14} className="text-amber-400 fill-amber-400" />
              <span className="font-medium text-gray-700">{p.avg_rating}</span>
              <span className="text-gray-400 text-xs">({p.total_reviews})</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
