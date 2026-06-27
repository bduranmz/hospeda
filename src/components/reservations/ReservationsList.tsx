"use client";

import { useState, useTransition } from "react";
import {
  Calendar,
  Users,
  MapPin,
  CheckCircle2,
  XCircle,
  Clock,
  MessageSquare,
  Star,
  ChevronDown,
} from "lucide-react";
import { updateReservationStatus, confirmCheckIn, confirmCheckOut } from "@/lib/actions/reservations";
import { RESERVATION_STATUS_LABELS } from "@/types/database";
import type { ReservationStatus } from "@/types/database";
import Link from "next/link";

const STATUS_COLORS: Record<string, string> = {
  pending_approval: "bg-amber-100 text-amber-700",
  approved: "bg-blue-100 text-blue-700",
  payment_pending: "bg-orange-100 text-orange-700",
  payment_failed: "bg-red-100 text-red-700",
  confirmed: "bg-emerald-100 text-emerald-700",
  cancelled_by_guest: "bg-gray-100 text-gray-500",
  cancelled_by_host: "bg-gray-100 text-gray-500",
  rejected: "bg-red-100 text-red-600",
  checked_in: "bg-teal-100 text-teal-700",
  completed: "bg-green-100 text-green-700",
  disputed: "bg-red-100 text-red-700",
};

const FILTER_OPTIONS: { value: ReservationStatus | "all"; label: string }[] = [
  { value: "all", label: "Todas" },
  { value: "pending_approval", label: "Pendientes" },
  { value: "confirmed", label: "Confirmadas" },
  { value: "checked_in", label: "En curso" },
  { value: "completed", label: "Completadas" },
  { value: "cancelled_by_guest", label: "Canceladas" },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function ReservationsList({ reservations, role }: { reservations: any[]; role: "host" | "guest" }) {
  const [filter, setFilter] = useState<ReservationStatus | "all">("all");
  const [isPending, startTransition] = useTransition();

  const filtered = filter === "all"
    ? reservations
    : reservations.filter((r) => r.status === filter || (filter === "cancelled_by_guest" && r.status === "cancelled_by_host"));

  const handleAction = (reservationId: string, action: "approve" | "reject" | "cancel") => {
    startTransition(async () => {
      const result = await updateReservationStatus(reservationId, action);
      if (result.error) alert(result.error);
      else window.location.reload();
    });
  };

  const handleCheckIn = (reservationId: string) => {
    startTransition(async () => {
      const result = await confirmCheckIn(reservationId);
      if (result.error) alert(result.error);
      else window.location.reload();
    });
  };

  const handleCheckOut = (reservationId: string) => {
    startTransition(async () => {
      const result = await confirmCheckOut(reservationId);
      if (result.error) alert(result.error);
      else window.location.reload();
    });
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("es-CL", { day: "numeric", month: "short" });
  const formatPrice = (n: number) => `$${n.toLocaleString("es-CL")}`;

  if (reservations.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
        <Calendar size={40} className="mx-auto text-gray-300 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-1">
          {role === "host" ? "Sin reservas aún" : "Sin viajes aún"}
        </h3>
        <p className="text-gray-500 text-sm">
          {role === "host"
            ? "Las reservas aparecerán aquí cuando alguien reserve tus propiedades."
            : "Explora propiedades y haz tu primera reserva."}
        </p>
        {role === "guest" && (
          <Link href="/propiedades" className="inline-block mt-4 px-6 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors">
            Explorar propiedades
          </Link>
        )}
      </div>
    );
  }

  return (
    <div>
      {/* Filters */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {FILTER_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setFilter(opt.value)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filter === opt.value
                ? "bg-teal-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-4">
        {filtered.map((r) => {
          const property = r.properties;
          const person = r.profiles;
          const coverPhoto = property?.property_photos?.find((p: { is_cover: boolean }) => p.is_cover)?.url
            ?? property?.property_photos?.[0]?.url;

          return (
            <div
              key={r.id}
              className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col sm:flex-row">
                {/* Photo */}
                {coverPhoto && (
                  <div className="sm:w-48 h-32 sm:h-auto shrink-0">
                    <img src={coverPhoto} alt={property?.title} className="w-full h-full object-cover" />
                  </div>
                )}

                {/* Info */}
                <div className="flex-1 p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">{property?.title}</h3>
                      <div className="flex items-center gap-1 text-sm text-gray-500 mt-0.5">
                        <MapPin size={14} />
                        <span>{property?.address?.commune}, {property?.address?.region}</span>
                      </div>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium shrink-0 ${STATUS_COLORS[r.status] ?? "bg-gray-100 text-gray-600"}`}>
                      {RESERVATION_STATUS_LABELS[r.status as ReservationStatus]}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                    <span className="flex items-center gap-1">
                      <Calendar size={14} />
                      {formatDate(r.check_in)} — {formatDate(r.check_out)} ({r.nights} noches)
                    </span>
                    <span className="flex items-center gap-1">
                      <Users size={14} />
                      {r.guests_count} huéspedes
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-sm">
                    <span className="font-semibold text-gray-900">
                      {role === "host" ? formatPrice(r.host_payout) : formatPrice(r.total_charged)}
                    </span>
                    <span className="text-gray-400">
                      {role === "host" ? "ingreso neto" : "total pagado"}
                    </span>
                    {person && (
                      <span className="text-gray-500 ml-auto flex items-center gap-1.5">
                        {person.avatar_url && (
                          <img src={person.avatar_url} alt="" className="w-5 h-5 rounded-full" />
                        )}
                        {person.full_name}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-gray-50">
                    {role === "host" && r.status === "pending_approval" && (
                      <>
                        <button
                          onClick={() => handleAction(r.id, "approve")}
                          disabled={isPending}
                          className="px-4 py-1.5 bg-teal-600 text-white text-sm rounded-lg font-medium hover:bg-teal-700 transition-colors disabled:opacity-50 flex items-center gap-1"
                        >
                          <CheckCircle2 size={14} /> Aprobar
                        </button>
                        <button
                          onClick={() => handleAction(r.id, "reject")}
                          disabled={isPending}
                          className="px-4 py-1.5 bg-red-50 text-red-600 text-sm rounded-lg font-medium hover:bg-red-100 transition-colors disabled:opacity-50 flex items-center gap-1"
                        >
                          <XCircle size={14} /> Rechazar
                        </button>
                      </>
                    )}

                    {role === "host" && r.status === "confirmed" && (
                      <button
                        onClick={() => handleCheckIn(r.id)}
                        disabled={isPending}
                        className="px-4 py-1.5 bg-teal-600 text-white text-sm rounded-lg font-medium hover:bg-teal-700 transition-colors disabled:opacity-50 flex items-center gap-1"
                      >
                        <CheckCircle2 size={14} /> Confirmar check-in
                      </button>
                    )}

                    {role === "host" && r.status === "checked_in" && (
                      <button
                        onClick={() => handleCheckOut(r.id)}
                        disabled={isPending}
                        className="px-4 py-1.5 bg-teal-600 text-white text-sm rounded-lg font-medium hover:bg-teal-700 transition-colors disabled:opacity-50 flex items-center gap-1"
                      >
                        <CheckCircle2 size={14} /> Confirmar check-out
                      </button>
                    )}

                    {["pending_approval", "approved", "payment_pending", "confirmed"].includes(r.status) && (
                      <button
                        onClick={() => handleAction(r.id, "cancel")}
                        disabled={isPending}
                        className="px-4 py-1.5 text-gray-500 text-sm rounded-lg font-medium hover:bg-gray-100 transition-colors disabled:opacity-50 flex items-center gap-1"
                      >
                        <XCircle size={14} /> Cancelar
                      </button>
                    )}

                    {r.status === "completed" && (
                      <Link
                        href={`/dashboard/viajes?review=${r.id}`}
                        className="px-4 py-1.5 bg-amber-50 text-amber-700 text-sm rounded-lg font-medium hover:bg-amber-100 transition-colors flex items-center gap-1"
                      >
                        <Star size={14} /> Dejar reseña
                      </Link>
                    )}

                    <Link
                      href={`/dashboard/mensajes/${role === "host" ? r.guest_id : r.host_id}?reservationId=${r.id}`}
                      className="px-4 py-1.5 text-gray-500 text-sm rounded-lg font-medium hover:bg-gray-100 transition-colors flex items-center gap-1"
                    >
                      <MessageSquare size={14} /> Mensaje
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-gray-500 text-sm">
          No hay reservas con este filtro.
        </div>
      )}
    </div>
  );
}
