import { Resend } from "resend";

let _resend: Resend | null = null;
function getResend(): Resend {
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY ?? "");
  }
  return _resend;
}

const FROM_ADDRESS =
  process.env.EMAIL_FROM ?? "Hospeda <no-reply@hospeda.cl>";

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  const { data, error } = await getResend().emails.send({
    from: FROM_ADDRESS,
    to,
    subject,
    html,
  });

  if (error) {
    console.error("[email] Error sending email:", error);
    throw new Error(error.message);
  }

  return data;
}

// ---------------------------------------------------------------------------
// Shared layout wrapper
// ---------------------------------------------------------------------------

function layout(content: string): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Hospeda</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background-color:#3EACA8;padding:28px 40px;text-align:center;">
              <span style="color:#ffffff;font-size:26px;font-weight:bold;letter-spacing:1px;">Hospeda</span>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px 28px;border-top:1px solid #e5e7eb;text-align:center;">
              <p style="margin:0;font-size:12px;color:#9ca3af;">
                © 2026 Hospeda · <a href="https://hospeda.cl" style="color:#3EACA8;text-decoration:none;">hospeda.cl</a>
              </p>
              <p style="margin:6px 0 0;font-size:11px;color:#9ca3af;">
                Si no esperabas este correo, puedes ignorarlo con seguridad.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function heading(text: string): string {
  return `<h1 style="margin:0 0 16px;font-size:22px;color:#111827;font-weight:bold;">${text}</h1>`;
}

function para(text: string): string {
  return `<p style="margin:0 0 14px;font-size:15px;color:#374151;line-height:1.6;">${text}</p>`;
}

function detailsTable(rows: [string, string][]): string {
  const cells = rows
    .map(
      ([label, value]) => `
      <tr>
        <td style="padding:10px 14px;font-size:13px;color:#6b7280;background-color:#f9fafb;border-bottom:1px solid #e5e7eb;white-space:nowrap;">${label}</td>
        <td style="padding:10px 14px;font-size:14px;color:#111827;border-bottom:1px solid #e5e7eb;">${value}</td>
      </tr>`
    )
    .join("");

  return `<table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:6px;overflow:hidden;margin:20px 0;">
    ${cells}
  </table>`;
}

function ctaButton(label: string, href: string): string {
  return `<p style="margin:24px 0 0;text-align:center;">
    <a href="${href}" style="display:inline-block;background-color:#3EACA8;color:#ffffff;font-size:15px;font-weight:bold;padding:12px 32px;border-radius:6px;text-decoration:none;">${label}</a>
  </p>`;
}

// ---------------------------------------------------------------------------
// Templates
// ---------------------------------------------------------------------------

export function reservationConfirmedEmail(
  guestName: string,
  propertyTitle: string,
  checkIn: string,
  checkOut: string,
  total: string
): string {
  return layout(`
    ${heading("¡Reserva confirmada!")}
    ${para(`Hola <strong>${guestName}</strong>, tu reserva ha sido confirmada exitosamente. ¡Nos alegra que hayas elegido Hospeda para tu próximo viaje!`)}
    ${detailsTable([
      ["Propiedad", propertyTitle],
      ["Check-in", checkIn],
      ["Check-out", checkOut],
      ["Total pagado", total],
    ])}
    ${para("Si tienes alguna pregunta, no dudes en contactar al anfitrión a través de la plataforma.")}
    ${ctaButton("Ver mi reserva", "https://hospeda.cl/reservas")}
  `);
}

export function newReservationEmail(
  hostName: string,
  guestName: string,
  propertyTitle: string,
  checkIn: string,
  checkOut: string
): string {
  return layout(`
    ${heading("Nueva reserva recibida")}
    ${para(`Hola <strong>${hostName}</strong>, tienes una nueva reserva para tu propiedad.`)}
    ${detailsTable([
      ["Propiedad", propertyTitle],
      ["Huésped", guestName],
      ["Check-in", checkIn],
      ["Check-out", checkOut],
    ])}
    ${para("Recuerda preparar el espacio para la llegada de tu huésped. Puedes ver todos los detalles desde el panel de anfitrión.")}
    ${ctaButton("Ver reserva", "https://hospeda.cl/anfitrion/reservas")}
  `);
}

export function reservationCancelledEmail(
  name: string,
  propertyTitle: string,
  checkIn: string,
  checkOut: string,
  reason: string
): string {
  return layout(`
    ${heading("Reserva cancelada")}
    ${para(`Hola <strong>${name}</strong>, te informamos que la siguiente reserva ha sido cancelada.`)}
    ${detailsTable([
      ["Propiedad", propertyTitle],
      ["Check-in", checkIn],
      ["Check-out", checkOut],
      ["Motivo", reason],
    ])}
    ${para("Si crees que esto es un error o necesitas más información, puedes contactarnos a través de la plataforma.")}
    ${ctaButton("Ir a Hospeda", "https://hospeda.cl")}
  `);
}

export function reviewReceivedEmail(
  hostName: string,
  guestName: string,
  propertyTitle: string,
  rating: number
): string {
  const stars = "★".repeat(Math.min(5, Math.max(1, rating))) +
    "☆".repeat(5 - Math.min(5, Math.max(1, rating)));

  return layout(`
    ${heading("Recibiste una nueva reseña")}
    ${para(`Hola <strong>${hostName}</strong>, <strong>${guestName}</strong> dejó una reseña para tu propiedad <strong>${propertyTitle}</strong>.`)}
    <p style="margin:20px 0;font-size:28px;color:#F59E0B;letter-spacing:2px;">${stars}</p>
    ${para("Ingresa a tu panel para ver el comentario completo y responder si lo deseas.")}
    ${ctaButton("Ver reseña", "https://hospeda.cl/anfitrion/resenas")}
  `);
}

export function welcomeEmail(name: string): string {
  return layout(`
    ${heading(`¡Bienvenido/a a Hospeda, ${name}!`)}
    ${para("Estamos muy contentos de tenerte en nuestra comunidad. Con Hospeda puedes encontrar alojamientos únicos en todo Chile o publicar tu propiedad para recibir viajeros.")}
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;">
      <tr>
        <td style="padding:12px;background-color:#f0fdfb;border-left:4px solid #3EACA8;border-radius:4px;">
          <p style="margin:0;font-size:14px;color:#374151;line-height:1.6;">
            ✅ <strong>Explora alojamientos</strong> disponibles cerca de tu destino.<br/>
            ✅ <strong>Publica tu propiedad</strong> y comienza a generar ingresos.<br/>
            ✅ <strong>Paga de forma segura</strong> con Webpay o Flow.
          </p>
        </td>
      </tr>
    </table>
    ${para("Si tienes alguna duda, estamos aquí para ayudarte.")}
    ${ctaButton("Explorar propiedades", "https://hospeda.cl/buscar")}
  `);
}
