import { getVerificationStatus } from "@/lib/actions/verification";
import VerificationFlow from "./VerificationFlow";
import { IDENTITY_STATUS_LABELS, type IdentityStatus } from "@/types/database";

export const metadata = {
  title: "Verificación de identidad | Hospeda",
  description: "Verifica tu identidad para anunciar o reservar propiedades",
};

const STATUS_CONFIG: Record<
  IdentityStatus,
  { icon: string; bg: string; text: string; border: string; heading: string; body: string }
> = {
  pending: {
    icon: "⏳",
    bg: "bg-yellow-50",
    text: "text-yellow-800",
    border: "border-yellow-200",
    heading: "Verificación en revisión",
    body: "Hemos recibido tus documentos. El equipo de Hospeda los revisará dentro de 1-2 días hábiles. Te notificaremos por correo cuando esté listo.",
  },
  approved: {
    icon: "✓",
    bg: "bg-green-50",
    text: "text-green-800",
    border: "border-green-200",
    heading: "Identidad verificada",
    body: "Tu identidad ha sido verificada exitosamente. Puedes reservar propiedades y publicar anuncios sin restricciones.",
  },
  rejected: {
    icon: "✗",
    bg: "bg-red-50",
    text: "text-red-800",
    border: "border-red-200",
    heading: "Verificación rechazada",
    body: "Tu solicitud fue rechazada. Revisa el motivo indicado y vuelve a intentarlo con documentos válidos.",
  },
  expired: {
    icon: "!",
    bg: "bg-gray-50",
    text: "text-gray-700",
    border: "border-gray-200",
    heading: "Verificación expirada",
    body: "Tu verificación ha vencido. Por favor, envía nuevamente tus documentos.",
  },
};

export default async function VerificacionPage() {
  const verification = await getVerificationStatus();

  const isVerified = verification?.status === "approved";
  const isPending = verification?.status === "pending";
  const showForm =
    !verification ||
    verification.status === "rejected" ||
    verification.status === "expired";

  const statusCfg = verification
    ? STATUS_CONFIG[verification.status as IdentityStatus]
    : null;

  return (
    <main className="p-6 lg:p-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">
          Verificación de identidad
        </h1>
        <p className="text-gray-500 mt-1 text-sm">
          Hospeda requiere que verifiques tu identidad para garantizar la
          seguridad de todos los usuarios.
        </p>
      </div>

      {/* Status banner (when not showing form) */}
      {statusCfg && (
        <div
          className={`mb-6 rounded-xl border p-5 ${statusCfg.bg} ${statusCfg.border}`}
        >
          <div className="flex items-start gap-3">
            <span className={`text-2xl leading-none ${statusCfg.text}`}>
              {statusCfg.icon}
            </span>
            <div>
              <h2 className={`font-semibold ${statusCfg.text}`}>
                {statusCfg.heading}
              </h2>
              <p className={`mt-1 text-sm ${statusCfg.text} opacity-90`}>
                {statusCfg.body}
              </p>

              {verification?.rejection_reason && (
                <p className="mt-2 text-sm font-medium text-red-700">
                  Motivo: {verification.rejection_reason}
                </p>
              )}

              {verification?.verified_at && (
                <p className="mt-2 text-xs text-green-600">
                  Verificado el{" "}
                  {new Date(verification.verified_at).toLocaleDateString(
                    "es-CL",
                    { day: "2-digit", month: "long", year: "numeric" }
                  )}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Benefits list */}
      {!isVerified && (
        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5">
          <h3 className="font-medium text-gray-900 mb-3">
            ¿Por qué verificar tu identidad?
          </h3>
          <ul className="space-y-2">
            {[
              "Reserva propiedades que requieren verificación previa",
              "Publica tus propiedades en la plataforma",
              "Genera mayor confianza con otros usuarios",
              "Accede a funciones exclusivas para usuarios verificados",
            ].map((benefit) => (
              <li key={benefit} className="flex items-start gap-2 text-sm text-gray-600">
                <span className="mt-0.5 flex-shrink-0 h-4 w-4 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-xs">
                  ✓
                </span>
                {benefit}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Status label */}
      <div className="mb-6 flex items-center gap-2">
        <span className="text-sm text-gray-500">Estado actual:</span>
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
            isVerified
              ? "bg-green-100 text-green-700"
              : isPending
              ? "bg-yellow-100 text-yellow-700"
              : "bg-gray-100 text-gray-600"
          }`}
        >
          {verification
            ? IDENTITY_STATUS_LABELS[verification.status as IdentityStatus]
            : "Sin verificar"}
        </span>
      </div>

      {/* Form */}
      {showForm && <VerificationFlow />}

      {/* Privacy note */}
      <p className="mt-8 text-xs text-gray-400 text-center">
        Tu información es procesada de forma segura y cifrada. Consulta nuestra{" "}
        <a href="/privacidad" className="underline hover:text-teal-600">
          Política de Privacidad
        </a>{" "}
        para más detalles. Solo personal autorizado de Hospeda puede revisar tus
        documentos.
      </p>
    </main>
  );
}
