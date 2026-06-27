import Link from "next/link";
import { getDisputes } from "@/lib/actions/disputes";
import {
  DISPUTE_STATUS_LABELS,
  DISPUTE_REASON_LABELS,
  type DisputeStatus,
} from "@/types/database";

export const metadata = {
  title: "Disputas | Hospeda",
  description: "Gestiona tus disputas de reservas",
};

const STATUS_BADGE: Record<DisputeStatus, { bg: string; text: string }> = {
  open: { bg: "bg-yellow-100", text: "text-yellow-800" },
  under_review: { bg: "bg-blue-100", text: "text-blue-800" },
  resolved_guest_favor: { bg: "bg-green-100", text: "text-green-800" },
  resolved_host_favor: { bg: "bg-green-100", text: "text-green-800" },
  resolved_partial: { bg: "bg-teal-100", text: "text-teal-800" },
  closed: { bg: "bg-gray-100", text: "text-gray-600" },
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("es-CL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default async function DisputasPage() {
  const disputes = await getDisputes();

  return (
    <main className="p-6 lg:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Disputas</h1>
        <p className="text-gray-500 mt-1 text-sm">
          Gestiona las disputas asociadas a tus reservas.
        </p>
      </div>

      {disputes.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-teal-50">
            <svg
              className="h-7 w-7 text-teal-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
              />
            </svg>
          </div>
          <h3 className="text-base font-medium text-gray-900">Sin disputas</h3>
          <p className="mt-1 text-sm text-gray-500">
            No tienes disputas activas ni historial de disputas anteriores.
          </p>
          <Link
            href="/dashboard/viajes"
            className="mt-4 inline-block text-sm font-medium text-teal-600 hover:text-teal-700"
          >
            Ver mis reservas
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Summary row */}
          <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-6">
            <span>
              <strong className="text-gray-900">{disputes.length}</strong>{" "}
              {disputes.length === 1 ? "disputa" : "disputas"} en total
            </span>
            <span>
              <strong className="text-yellow-700">
                {disputes.filter((d) => d.status === "open").length}
              </strong>{" "}
              abiertas
            </span>
            <span>
              <strong className="text-blue-700">
                {disputes.filter((d) => d.status === "under_review").length}
              </strong>{" "}
              en revisión
            </span>
          </div>

          {/* Dispute cards */}
          <ul className="space-y-3">
            {disputes.map((dispute) => {
              const badge = STATUS_BADGE[dispute.status as DisputeStatus] ?? {
                bg: "bg-gray-100",
                text: "text-gray-600",
              };

              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const property = (dispute as any).reservations?.properties;
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const reservation = (dispute as any).reservations;
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const complainant = (dispute as any).complainant;

              const isOpen =
                dispute.status === "open" || dispute.status === "under_review";

              return (
                <li key={dispute.id}>
                  <Link
                    href={`/dashboard/disputas/${dispute.id}`}
                    className="block rounded-xl border border-gray-200 bg-white p-5 hover:border-teal-300 hover:shadow-sm transition-all"
                  >
                    <div className="flex items-start justify-between gap-4">
                      {/* Left: info */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${badge.bg} ${badge.text}`}
                          >
                            {DISPUTE_STATUS_LABELS[dispute.status as DisputeStatus] ??
                              dispute.status}
                          </span>
                          {isOpen && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-2.5 py-0.5 text-xs font-medium text-orange-700">
                              <span className="h-1.5 w-1.5 rounded-full bg-orange-500 animate-pulse" />
                              Requiere atención
                            </span>
                          )}
                        </div>

                        <p className="mt-2 font-medium text-gray-900 truncate">
                          {property?.title ?? "Propiedad eliminada"}
                        </p>

                        <p className="mt-0.5 text-sm text-gray-500">
                          Motivo:{" "}
                          {DISPUTE_REASON_LABELS[dispute.reason] ?? dispute.reason}
                        </p>

                        {reservation && (
                          <p className="mt-0.5 text-xs text-gray-400">
                            Reserva:{" "}
                            {formatDate(reservation.check_in)} →{" "}
                            {formatDate(reservation.check_out)}
                          </p>
                        )}

                        {complainant && (
                          <p className="mt-1 text-xs text-gray-400">
                            Iniciada por: {complainant.full_name}
                          </p>
                        )}
                      </div>

                      {/* Right: date + arrow */}
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <span className="text-xs text-gray-400">
                          {formatDate(dispute.created_at)}
                        </span>
                        <svg
                          className="h-4 w-4 text-gray-300"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Info box */}
      <div className="mt-8 rounded-lg border border-teal-100 bg-teal-50 p-4">
        <h3 className="text-sm font-medium text-teal-800">
          ¿Cómo funciona el proceso de disputa?
        </h3>
        <ul className="mt-2 space-y-1 text-sm text-teal-700 list-disc list-inside">
          <li>Abre una disputa desde los detalles de tu reserva.</li>
          <li>Ambas partes pueden agregar mensajes y evidencia.</li>
          <li>
            Si no se resuelve en 72 horas, el equipo de Hospeda interviene.
          </li>
          <li>
            La resolución puede incluir reembolso total, parcial o sin
            reembolso.
          </li>
        </ul>
      </div>
    </main>
  );
}
