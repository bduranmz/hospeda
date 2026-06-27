export const metadata = {
  title: "Política de Privacidad | Hospeda",
  description:
    "Conoce cómo Hospeda recopila, usa y protege tus datos personales conforme a la Ley N° 21.719.",
};

export default function PrivacidadPage() {
  return (
    <div className="bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-10 border-b border-gray-200 pb-8">
          <p className="text-sm font-semibold uppercase tracking-widest text-teal-600 mb-2">
            Legal
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Política de Privacidad
          </h1>
          <p className="mt-3 text-gray-500 text-sm">
            Última actualización: 27 de junio de 2026. Conforme a la Ley N° 21.719
            sobre Protección de Datos Personales de la República de Chile.
          </p>
        </div>

        {/* Intro */}
        <div className="mb-8 rounded-xl border border-teal-100 bg-teal-50 p-5 text-sm text-teal-800">
          En Hospeda nos comprometemos a proteger tu privacidad. Esta Política
          explica qué datos recopilamos, cómo los utilizamos, con quién los
          compartimos y cuáles son tus derechos. Te recomendamos leerla
          detenidamente.
        </div>

        <div className="space-y-10 text-gray-700 text-sm leading-relaxed">

          {/* 1 */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              1. Responsable del Tratamiento
            </h2>
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 space-y-1">
              <p>
                <strong>Razón social:</strong> Hospeda SpA
              </p>
              <p>
                <strong>RUT:</strong> [Por determinar]
              </p>
              <p>
                <strong>Domicilio:</strong> Santiago, Chile
              </p>
              <p>
                <strong>Correo de contacto privacidad:</strong>{" "}
                <a
                  href="mailto:privacidad@hospeda.cl"
                  className="text-teal-600 hover:underline"
                >
                  privacidad@hospeda.cl
                </a>
              </p>
            </div>
          </section>

          {/* 2 */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              2. Datos Personales que Recopilamos
            </h2>

            <h3 className="font-medium text-gray-800 mt-4 mb-2">
              2.1 Datos de registro y perfil
            </h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Nombre completo</li>
              <li>Correo electrónico</li>
              <li>Número de teléfono</li>
              <li>Fecha de nacimiento</li>
              <li>Nacionalidad</li>
              <li>Fotografía de perfil (opcional)</li>
              <li>Descripción biográfica (opcional)</li>
            </ul>

            <h3 className="font-medium text-gray-800 mt-4 mb-2">
              2.2 Datos de verificación de identidad
            </h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>RUT u otro número de documento de identidad</li>
              <li>Imágenes de documentos de identidad (frontal y trasera)</li>
              <li>Fotografía de rostro (selfie)</li>
            </ul>

            <h3 className="font-medium text-gray-800 mt-4 mb-2">
              2.3 Datos financieros y de pago
            </h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                Datos bancarios para pagos a Anfitriones (banco, tipo de
                cuenta, número de cuenta, RUT titular)
              </li>
              <li>
                Historial de transacciones realizadas en la Plataforma
              </li>
              <li>
                <em>
                  Nota: Los datos de tarjetas de crédito/débito son procesados
                  directamente por Transbank o Flow. Hospeda no almacena este
                  tipo de datos.
                </em>
              </li>
            </ul>

            <h3 className="font-medium text-gray-800 mt-4 mb-2">
              2.4 Datos de uso de la Plataforma
            </h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Búsquedas realizadas</li>
              <li>Propiedades visitadas y guardadas como favoritos</li>
              <li>Mensajes intercambiados entre usuarios</li>
              <li>Reseñas y calificaciones</li>
              <li>Historial de reservas</li>
            </ul>

            <h3 className="font-medium text-gray-800 mt-4 mb-2">
              2.5 Datos técnicos y de navegación
            </h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Dirección IP (anonimizada para análisis)</li>
              <li>Tipo y versión del navegador</li>
              <li>Sistema operativo y dispositivo</li>
              <li>Páginas visitadas y tiempo de visita</li>
              <li>Cookies y tecnologías similares (ver sección 8)</li>
            </ul>
          </section>

          {/* 3 */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              3. Finalidades del Tratamiento
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-gray-50 text-gray-700">
                    <th className="text-left px-4 py-3 font-medium">
                      Finalidad
                    </th>
                    <th className="text-left px-4 py-3 font-medium">
                      Base legal
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {[
                    ["Crear y gestionar tu cuenta de usuario", "Ejecución de contrato"],
                    ["Procesar reservas y pagos", "Ejecución de contrato"],
                    ["Verificar tu identidad", "Obligación legal / consentimiento"],
                    ["Comunicarte con otros usuarios de la Plataforma", "Ejecución de contrato"],
                    ["Enviar notificaciones sobre tus reservas", "Ejecución de contrato"],
                    ["Mejorar y personalizar la experiencia de uso", "Interés legítimo"],
                    ["Análisis de uso de la Plataforma (analytics)", "Consentimiento"],
                    ["Envío de comunicaciones comerciales", "Consentimiento"],
                    ["Cumplimiento de obligaciones legales", "Obligación legal"],
                    ["Prevención de fraudes y seguridad", "Interés legítimo / obligación legal"],
                  ].map(([fin, base]) => (
                    <tr key={fin}>
                      <td className="px-4 py-3">{fin}</td>
                      <td className="px-4 py-3 text-gray-500">{base}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* 4 */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              4. Compartición de Datos con Terceros
            </h2>
            <p>
              Hospeda puede compartir tus datos personales con terceros en las
              siguientes situaciones:
            </p>
            <ul className="list-disc pl-5 mt-3 space-y-2">
              <li>
                <strong>Entre Anfitrión y Huésped:</strong> Una vez confirmada
                una Reserva, ambas partes recibirán la información necesaria para
                llevar a cabo el arriendo (nombre, datos de contacto básicos).
              </li>
              <li>
                <strong>Proveedores de pago:</strong> Transbank S.A. (Webpay
                Plus) y Flow S.A. para el procesamiento de transacciones.
              </li>
              <li>
                <strong>Proveedores de infraestructura:</strong> Supabase
                (almacenamiento de datos), Vercel (hosting), Firebase Cloud
                Messaging (notificaciones push) — todos con contratos de
                encargado de datos que garantizan niveles de protección adecuados.
              </li>
              <li>
                <strong>Autoridades y tribunales:</strong> Cuando sea requerido
                por ley, orden judicial o resolución de autoridad competente.
              </li>
            </ul>
            <p className="mt-3">
              No vendemos ni cedemos tus datos personales a terceros con fines
              publicitarios o comerciales sin tu consentimiento expreso.
            </p>
          </section>

          {/* 5 */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              5. Transferencias Internacionales de Datos
            </h2>
            <p>
              Algunos de nuestros proveedores procesan datos fuera de Chile
              (principalmente en Estados Unidos y la Unión Europea). Cuando
              realizamos transferencias internacionales, aplicamos salvaguardas
              adecuadas como cláusulas contractuales estándar o nos aseguramos de
              que el país receptor cuente con niveles de protección equivalentes.
            </p>
          </section>

          {/* 6 */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              6. Plazos de Conservación de Datos
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-gray-50 text-gray-700">
                    <th className="text-left px-4 py-3 font-medium">Tipo de dato</th>
                    <th className="text-left px-4 py-3 font-medium">Plazo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {[
                    ["Datos de cuenta activa", "Mientras la cuenta esté activa"],
                    ["Documentos de verificación de identidad", "5 años desde la verificación"],
                    ["Historial de reservas y transacciones", "7 años (obligación tributaria)"],
                    ["Mensajes entre usuarios", "3 años desde el último mensaje"],
                    ["Logs de seguridad y acceso", "1 año"],
                    ["Datos analíticos anonimizados", "Indefinido"],
                    ["Datos tras solicitud de eliminación", "30 días hábiles para eliminación efectiva"],
                  ].map(([tipo, plazo]) => (
                    <tr key={tipo}>
                      <td className="px-4 py-3">{tipo}</td>
                      <td className="px-4 py-3 text-gray-500">{plazo}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* 7 */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              7. Tus Derechos (ARCO+)
            </h2>
            <p>
              Conforme a la Ley N° 21.719, tienes los siguientes derechos sobre
              tus datos personales:
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {[
                {
                  title: "Acceso",
                  desc: "Conocer qué datos personales tuyos tenemos y cómo los procesamos.",
                },
                {
                  title: "Rectificación",
                  desc: "Corregir datos inexactos o incompletos.",
                },
                {
                  title: "Cancelación / Eliminación",
                  desc: "Solicitar la eliminación de tus datos cuando ya no sean necesarios.",
                },
                {
                  title: "Oposición",
                  desc: "Oponerte al tratamiento de tus datos para fines específicos.",
                },
                {
                  title: "Portabilidad",
                  desc: "Recibir tus datos en formato estructurado y legible por máquina.",
                },
                {
                  title: "Revocación del consentimiento",
                  desc: "Retirar tu consentimiento cuando el tratamiento se base en él.",
                },
              ].map((right) => (
                <div
                  key={right.title}
                  className="rounded-lg border border-gray-200 bg-gray-50 p-4"
                >
                  <h4 className="font-semibold text-gray-900 text-sm">
                    {right.title}
                  </h4>
                  <p className="mt-1 text-xs text-gray-500">{right.desc}</p>
                </div>
              ))}
            </div>
            <p className="mt-4">
              Para ejercer estos derechos, visita nuestra{" "}
              <a
                href="/eliminacion-datos"
                className="text-teal-600 hover:underline"
              >
                página de solicitudes
              </a>{" "}
              o escríbenos a{" "}
              <a
                href="mailto:privacidad@hospeda.cl"
                className="text-teal-600 hover:underline"
              >
                privacidad@hospeda.cl
              </a>
              . Responderemos en un plazo máximo de 30 días hábiles.
            </p>
          </section>

          {/* 8 */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              8. Cookies y Tecnologías de Rastreo
            </h2>
            <p>Utilizamos cookies para:</p>
            <ul className="list-disc pl-5 mt-3 space-y-1">
              <li>
                <strong>Cookies esenciales:</strong> Necesarias para el
                funcionamiento de la Plataforma (sesión, autenticación). No
                requieren consentimiento.
              </li>
              <li>
                <strong>Cookies analíticas:</strong> Miden el uso de la
                Plataforma (páginas visitadas, tiempo de sesión). Requieren tu
                consentimiento.
              </li>
              <li>
                <strong>Cookies de preferencias:</strong> Recuerdan tus
                preferencias de idioma y configuración. Requieren consentimiento.
              </li>
            </ul>
            <p className="mt-3">
              Puedes gestionar o rechazar las cookies no esenciales a través del
              banner de cookies al ingresar a la Plataforma o desde la
              configuración de tu navegador.
            </p>
          </section>

          {/* 9 */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              9. Seguridad de los Datos
            </h2>
            <p>
              Implementamos medidas técnicas y organizativas adecuadas para
              proteger tus datos personales, incluyendo:
            </p>
            <ul className="list-disc pl-5 mt-3 space-y-1">
              <li>Cifrado de datos en tránsito (TLS/HTTPS)</li>
              <li>
                Cifrado de datos sensibles en reposo (AES-256-GCM para
                información particularmente sensible)
              </li>
              <li>Control de acceso basado en roles</li>
              <li>Registro de auditoría de accesos</li>
              <li>Revisiones periódicas de seguridad</li>
              <li>
                Protocolo de respuesta ante brechas de seguridad con
                notificación en 72 horas
              </li>
            </ul>
            <p className="mt-3">
              Sin embargo, ningún sistema es completamente seguro. En caso de
              detectar una brecha de seguridad que afecte tus datos, te
              notificaremos en los plazos establecidos por la ley.
            </p>
          </section>

          {/* 10 */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              10. Menores de Edad
            </h2>
            <p>
              La Plataforma no está dirigida a menores de 18 años y no recopilamos
              datos de forma intencional de personas menores de edad. Si detectamos
              que hemos recopilado datos de un menor, procederemos a su eliminación
              inmediata.
            </p>
          </section>

          {/* 11 */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              11. Modificaciones a esta Política
            </h2>
            <p>
              Podemos actualizar esta Política de Privacidad periódicamente. Los
              cambios sustanciales serán comunicados con al menos 15 días de
              anticipación por correo electrónico y mediante aviso en la
              Plataforma. La fecha de última actualización siempre estará indicada
              al inicio de este documento.
            </p>
          </section>

          {/* 12 */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              12. Autoridad de Control
            </h2>
            <p>
              Si consideras que el tratamiento de tus datos no cumple con la Ley
              N° 21.719, tienes derecho a presentar una reclamación ante el
              Consejo para la Transparencia (CPLT) o la autoridad de protección
              de datos que resulte competente conforme a la normativa vigente.
            </p>
          </section>

          {/* 13 */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              13. Contacto
            </h2>
            <p>
              Para cualquier consulta sobre esta Política o el tratamiento de tus
              datos personales, escríbenos a{" "}
              <a
                href="mailto:privacidad@hospeda.cl"
                className="text-teal-600 hover:underline"
              >
                privacidad@hospeda.cl
              </a>
              . También puedes{" "}
              <a
                href="/eliminacion-datos"
                className="text-teal-600 hover:underline"
              >
                solicitar la eliminación de tus datos
              </a>{" "}
              a través de nuestro formulario en línea.
            </p>
          </section>
        </div>

        {/* Bottom links */}
        <div className="mt-12 pt-8 border-t border-gray-200 flex flex-wrap gap-4 text-sm">
          <a href="/terminos" className="text-teal-600 hover:underline">
            Términos y Condiciones
          </a>
          <a href="/eliminacion-datos" className="text-teal-600 hover:underline">
            Solicitar eliminación de datos
          </a>
        </div>
      </div>
    </div>
  );
}
