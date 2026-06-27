import Link from "next/link";
import {
  Plus,
  Eye,
  Pencil,
  Home,
  Star,
  Users,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import {
  PROPERTY_STATUS_LABELS,
  PROPERTY_TYPE_LABELS,
  type PropertyStatus,
  type PropertyType,
} from "@/types/database";
import PropertyStatusActions from "@/components/dashboard/PropertyStatusActions";

function formatCLP(amount: number): string {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    minimumFractionDigits: 0,
  }).format(amount);
}

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-100 text-gray-600",
  pending_review: "bg-yellow-50 text-yellow-700",
  published: "bg-green-50 text-green-700",
  paused: "bg-orange-50 text-orange-700",
  suspended: "bg-red-50 text-red-700",
  archived: "bg-gray-100 text-gray-500",
};

export default async function DashboardPropiedades() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: properties } = await supabase
    .from("properties")
    .select(
      `
      id, title, property_type, status, base_price, max_guests,
      bedrooms, bathrooms, address, created_at,
      property_photos ( url, is_cover ),
      reviews ( rating )
    `
    )
    .eq("host_id", user.id)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  const items = properties ?? [];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Mis propiedades
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {items.length} propiedad{items.length !== 1 ? "es" : ""}
          </p>
        </div>
        <Link
          href="/dashboard/propiedades/nueva"
          className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
        >
          <Plus size={16} />
          Nueva propiedad
        </Link>
      </div>

      {items.length > 0 ? (
        <div className="space-y-4">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {items.map((p: any) => {
            const cover =
              p.property_photos?.find((ph: any) => ph.is_cover)?.url ??
              p.property_photos?.[0]?.url ??
              null;

            const reviews = p.reviews ?? [];
            const avgRating =
              reviews.length > 0
                ? Math.round(
                    (reviews.reduce(
                      (s: number, r: { rating: number }) => s + r.rating,
                      0
                    ) /
                      reviews.length) *
                      10
                  ) / 10
                : null;

            return (
              <div
                key={p.id}
                className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col sm:flex-row gap-4"
              >
                {/* Photo */}
                <div className="w-full sm:w-40 h-28 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                  {cover ? (
                    <img
                      src={cover}
                      alt={p.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <Home size={32} />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-gray-900 truncate">
                        {p.title}
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {PROPERTY_TYPE_LABELS[p.property_type as PropertyType]} ·{" "}
                        {p.address?.commune}
                        {p.address?.region ? `, ${p.address.region}` : ""}
                      </p>
                    </div>
                    <span
                      className={`text-xs font-medium px-2.5 py-1 rounded-lg whitespace-nowrap ${
                        STATUS_COLORS[p.status] ?? "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {PROPERTY_STATUS_LABELS[p.status as PropertyStatus]}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                    <span className="font-medium text-gray-900 text-sm">
                      {formatCLP(p.base_price)}/noche
                    </span>
                    <span className="flex items-center gap-1">
                      <Users size={13} /> {p.max_guests}
                    </span>
                    {avgRating !== null && (
                      <span className="flex items-center gap-1">
                        <Star
                          size={13}
                          className="text-amber-400 fill-amber-400"
                        />
                        {avgRating} ({reviews.length})
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-3">
                    <Link
                      href={`/propiedades/${p.id}`}
                      className="flex items-center gap-1 text-xs text-gray-500 hover:text-teal-600 transition-colors"
                    >
                      <Eye size={13} />
                      Ver
                    </Link>
                    <Link
                      href={`/dashboard/propiedades/${p.id}`}
                      className="flex items-center gap-1 text-xs text-gray-500 hover:text-teal-600 transition-colors"
                    >
                      <Pencil size={13} />
                      Editar
                    </Link>
                    <PropertyStatusActions
                      propertyId={p.id}
                      currentStatus={p.status}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 bg-white border border-gray-200 rounded-2xl">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Home className="text-gray-300" size={32} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            Sin propiedades aún
          </h3>
          <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
            Publica tu primera propiedad y empieza a recibir reservas.
          </p>
          <Link
            href="/dashboard/propiedades/nueva"
            className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold px-6 py-3 rounded-xl transition-colors"
          >
            <Plus size={16} />
            Crear propiedad
          </Link>
        </div>
      )}
    </div>
  );
}
