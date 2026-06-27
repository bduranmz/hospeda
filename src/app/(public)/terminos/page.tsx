export const metadata = {
  title: "Términos y Condiciones | Hospeda",
  description:
    "Términos y condiciones de uso de la plataforma Hospeda para arriendos temporales y vacacionales en Chile.",
};

export default function TerminosPage() {
  return (
    <div className="bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-10 border-b border-gray-200 pb-8">
          <p className="text-sm font-semibold uppercase tracking-widest text-teal-600 mb-2">
            Legal
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Términos y Condiciones
          </h1>
          <p className="mt-3 text-gray-500 text-sm">
            Última actualización: 27 de junio de 2026. Vigentes desde la misma
            fecha.
          </p>
        </div>

        {/* Intro */}
        <div className="mb-8 rounded-xl border border-teal-100 bg-teal-50 p-5 text-sm text-teal-800">
          Estos Términos y Condiciones regulan el uso de la plataforma{" "}
          <strong>Hospeda</strong> (&ldquo;la Plataforma&rdquo;), operada en la
          República de Chile. Al registrarte o utilizar la Plataforma, aceptas
          íntegramente estos Términos. Si no estás de acuerdo, no debes usar el
          servicio.
        </div>

        <div className="prose prose-gray max-w-none space-y-10 text-gray-700 text-sm leading-relaxed">

          {/* 1 */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              1. Definiciones
            </h2>
            <ul className="space-y-2 list-disc pl-5">
              <li>
                <strong>Hospeda / la Plataforma:</strong> Sitio web y servicios
                digitales disponibles en <em>hospeda.cl</em> y subdominios.
              </li>
              <li>
                <strong>Usuario:</strong> Toda persona natural o jurídica que se
                registre o utilice la Plataforma.
              </li>
              <li>
                <strong>Anfitrión:</strong> Usuario que publica una propiedad en
                arriendo a través de la Plataforma.
              </li>
              <li>
                <strong>Huésped:</strong> Usuario que realiza una reserva de
                alojamiento a través de la Plataforma.
              </li>
              <li>
                <strong>Propiedad:</strong> Inmueble o espacio habitable
                publicado por un Anfitrión en la Plataforma.
              </li>
              <li>
                <strong>Reserva:</strong> Acuerdo vinculante entre Anfitrión y
                Huésped, intermediado por la Plataforma, para el arriendo
                temporal de una Propiedad.
              </li>
              <li>
                <strong>Comisión de Servicio:</strong> Cargo cobrado por Hospeda
                a Huéspedes (8%) y Anfitriones (5%) sobre el precio base del
                arriendo.
              </li>
            </ul>
          </section>

          {/* 2 */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              2. Naturaleza de la Plataforma
            </h2>
            <p>
              Hospeda actúa exclusivamente como intermediario tecnológico entre
              Anfitriones y Huéspedes. La Plataforma no es parte del contrato de
              arriendo celebrado entre las partes, no presta servicios de
              alojamiento, ni asume responsabilidad por el estado, condiciones o
              descripción de las Propiedades publicadas.
            </p>
            <p className="mt-3">
              Las transacciones de pago son procesadas por proveedores externos
              (Webpay Plus de Transbank S.A. y Flow S.A.), sujetos a sus propios
              términos y condiciones.
            </p>
          </section>

          {/* 3 */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              3. Registro y Cuenta de Usuario
            </h2>
            <h3 className="font-medium text-gray-800 mt-4 mb-2">
              3.1 Requisitos de registro
            </h3>
            <p>
              Para usar la Plataforma debes ser mayor de 18 años y tener
              capacidad legal para celebrar contratos según la ley chilena (Código
              Civil, artículo 1446 y siguientes). Al registrarte declaras cumplir
              estos requisitos.
            </p>
            <h3 className="font-medium text-gray-800 mt-4 mb-2">
              3.2 Veracidad de la información
            </h3>
            <p>
              Eres responsable de proporcionar información veraz, completa y
              actualizada. El uso de identidades falsas, datos inexactos o
              cuentas duplicadas está prohibido y puede resultar en la suspensión
              inmediata de tu cuenta.
            </p>
            <h3 className="font-medium text-gray-800 mt-4 mb-2">
              3.3 Seguridad de la cuenta
            </h3>
            <p>
              Eres responsable de mantener la confidencialidad de tus credenciales
              de acceso. Debes notificar a Hospeda de inmediato ante cualquier uso
              no autorizado de tu cuenta.
            </p>
          </section>

          {/* 4 */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              4. Verificación de Identidad
            </h2>
            <p>
              Hospeda puede requerir la verificación de identidad de sus Usuarios,
              especialmente para publicar Propiedades o efectuar Reservas. El
              proceso de verificación puede incluir la presentación de documentos
              de identidad (RUT, pasaporte u otro) y fotografías.
            </p>
            <p className="mt-3">
              Hospeda procesa esta información conforme a su{" "}
              <a href="/privacidad" className="text-teal-600 hover:underline">
                Política de Privacidad
              </a>{" "}
              y la Ley N° 21.719 sobre protección de datos personales.
            </p>
          </section>

          {/* 5 */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              5. Publicación de Propiedades (Anfitriones)
            </h2>
            <h3 className="font-medium text-gray-800 mt-4 mb-2">
              5.1 Requisitos del anuncio
            </h3>
            <p>
              Los Anfitriones deben contar con los derechos necesarios para
              arrendar la Propiedad publicada y cumplir la normativa aplicable,
              incluyendo la Ley N° 21.442 (Ley de Copropiedad Inmobiliaria) y la
              normativa municipal vigente para arriendos temporales.
            </p>
            <h3 className="font-medium text-gray-800 mt-4 mb-2">
              5.2 Exactitud de la información
            </h3>
            <p>
              Los Anfitriones se comprometen a que las fotografías, descripciones,
              precios, disponibilidad y amenidades informadas en su anuncio sean
              veraces y se correspondan con el estado real de la Propiedad. La
              Plataforma puede retirar anuncios que presenten información engañosa.
            </p>
            <h3 className="font-medium text-gray-800 mt-4 mb-2">
              5.3 Responsabilidad tributaria
            </h3>
            <p>
              Los ingresos obtenidos por Anfitriones a través de la Plataforma
              pueden estar sujetos a impuestos de acuerdo con la legislación
              tributaria chilena. Hospeda no es responsable por el cumplimiento
              tributario de los Anfitriones.
            </p>
          </section>

          {/* 6 */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              6. Reservas y Pagos
            </h2>
            <h3 className="font-medium text-gray-800 mt-4 mb-2">
              6.1 Proceso de reserva
            </h3>
            <p>
              Una Reserva queda confirmada una vez que el Huésped completa el pago
              y recibe la confirmación por parte del sistema. Para Propiedades sin
              reserva instantánea, la confirmación está condicionada a la
              aprobación del Anfitrión.
            </p>
            <h3 className="font-medium text-gray-800 mt-4 mb-2">
              6.2 Precios y comisiones
            </h3>
            <p>
              El precio total pagado por el Huésped incluye: precio base del
              arriendo, tarifas adicionales (limpieza, depósito de seguridad) y la
              Comisión de Servicio de Hospeda (8% sobre el precio base). Los
              Anfitriones reciben el precio base menos la Comisión de Servicio
              del Anfitrión (5%).
            </p>
            <h3 className="font-medium text-gray-800 mt-4 mb-2">
              6.3 Depósito de seguridad
            </h3>
            <p>
              El depósito de seguridad definido por el Anfitrión se cobra al
              momento del pago de la Reserva y se devuelve al Huésped dentro de
              los 7 días hábiles posteriores al check-out, salvo que existan
              daños comprobados a la Propiedad.
            </p>
          </section>

          {/* 7 */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              7. Políticas de Cancelación
            </h2>
            <p>
              Cada Propiedad tiene asociada una política de cancelación definida
              por el Anfitrión al momento de crear el anuncio. Las políticas
              disponibles son:
            </p>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-gray-50 text-gray-700">
                    <th className="text-left px-4 py-3 font-medium">
                      Política
                    </th>
                    <th className="text-left px-4 py-3 font-medium">
                      Reembolso completo
                    </th>
                    <th className="text-left px-4 py-3 font-medium">
                      Reembolso parcial
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr>
                    <td className="px-4 py-3 font-medium">Flexible</td>
                    <td className="px-4 py-3">Hasta 24h antes del check-in</td>
                    <td className="px-4 py-3">No aplica</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium">Moderada</td>
                    <td className="px-4 py-3">Hasta 5 días antes</td>
                    <td className="px-4 py-3">50% entre 1 y 5 días antes</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium">Estricta</td>
                    <td className="px-4 py-3">Hasta 14 días antes</td>
                    <td className="px-4 py-3">50% entre 7 y 14 días antes</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium">No reembolsable</td>
                    <td className="px-4 py-3">No aplica</td>
                    <td className="px-4 py-3">No aplica</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-3">
              La Comisión de Servicio de Hospeda no es reembolsable en ningún
              caso, salvo que la cancelación sea imputable a Hospeda.
            </p>
          </section>

          {/* 8 */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              8. Sistema de Disputas
            </h2>
            <p>
              En caso de conflicto entre Anfitrión y Huésped relacionado con una
              Reserva, cualquiera de las partes puede abrir una disputa a través
              de la Plataforma dentro de los 7 días posteriores al check-out. El
              proceso de disputa contempla:
            </p>
            <ol className="list-decimal pl-5 mt-3 space-y-1">
              <li>Apertura de la disputa con descripción y evidencia.</li>
              <li>
                Período de respuesta de 72 horas para la contraparte.
              </li>
              <li>
                Intervención del equipo de Hospeda si no hay acuerdo en 72h.
              </li>
              <li>
                Resolución por parte de Hospeda, que puede incluir reembolso
                total, parcial o sin reembolso.
              </li>
            </ol>
            <p className="mt-3">
              La decisión de Hospeda en el proceso de disputa es vinculante en el
              contexto de la Plataforma, sin perjuicio de los derechos de las
              partes ante los tribunales de justicia.
            </p>
          </section>

          {/* 9 */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              9. Conducta del Usuario y Usos Prohibidos
            </h2>
            <p>Está estrictamente prohibido:</p>
            <ul className="list-disc pl-5 mt-3 space-y-1.5">
              <li>
                Realizar transacciones fuera de la Plataforma para evadir el
                pago de comisiones.
              </li>
              <li>
                Publicar contenido falso, engañoso, discriminatorio, ilegal u
                ofensivo.
              </li>
              <li>
                Usar la Plataforma con fines distintos al arriendo temporal
                legítimo.
              </li>
              <li>
                Realizar actividades que vulneren los derechos de terceros,
                incluyendo propiedad intelectual y privacidad.
              </li>
              <li>
                Interferir con el funcionamiento técnico de la Plataforma,
                intentar acceder sin autorización o introducir malware.
              </li>
              <li>
                Usar la Plataforma para fines ilegales, incluyendo lavado de
                activos o fraude.
              </li>
            </ul>
          </section>

          {/* 10 */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              10. Reseñas y Calificaciones
            </h2>
            <p>
              Tras el término de una Reserva, Anfitriones y Huéspedes pueden
              dejar reseñas y calificaciones. Las reseñas deben ser honestas,
              basadas en experiencias personales y no deben contener lenguaje
              ofensivo, discriminatorio ni información personal de terceros.
            </p>
            <p className="mt-3">
              Hospeda se reserva el derecho de eliminar reseñas que violen estas
              condiciones, sin que ello implique responsabilidad por el contenido
              publicado por los Usuarios.
            </p>
          </section>

          {/* 11 */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              11. Limitación de Responsabilidad
            </h2>
            <p>
              En la máxima medida permitida por la ley chilena, Hospeda no será
              responsable por:
            </p>
            <ul className="list-disc pl-5 mt-3 space-y-1.5">
              <li>
                Daños, pérdidas o perjuicios derivados de la conducta de
                Anfitriones o Huéspedes.
              </li>
              <li>
                El estado, calidad, seguridad o legalidad de las Propiedades
                publicadas.
              </li>
              <li>
                La incapacidad de los Usuarios para celebrar contratos de
                arriendo.
              </li>
              <li>
                Interrupciones del servicio por causas ajenas al control de
                Hospeda (fuerza mayor, fallas de terceros, etc.).
              </li>
              <li>
                Pérdidas indirectas, consecuenciales o lucro cesante.
              </li>
            </ul>
            <p className="mt-3">
              La responsabilidad máxima de Hospeda frente a cualquier Usuario no
              excederá el monto de la Comisión de Servicio cobrada en la
              transacción que dio origen al reclamo.
            </p>
          </section>

          {/* 12 */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              12. Propiedad Intelectual
            </h2>
            <p>
              El contenido de la Plataforma (logotipos, diseño, código fuente,
              textos propios) es propiedad de Hospeda y está protegido por la Ley
              N° 17.336 sobre Propiedad Intelectual. Los Usuarios no pueden
              reproducir, modificar ni distribuir dicho contenido sin autorización
              expresa.
            </p>
            <p className="mt-3">
              Los Usuarios otorgan a Hospeda una licencia no exclusiva, gratuita
              y transferible para usar el contenido que publiquen (fotografías,
              descripciones) con el fin de operar y promover la Plataforma.
            </p>
          </section>

          {/* 13 */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              13. Modificaciones a los Términos
            </h2>
            <p>
              Hospeda puede modificar estos Términos en cualquier momento. Los
              cambios serán comunicados con al menos 15 días de anticipación por
              correo electrónico y mediante aviso en la Plataforma. El uso
              continuado de la Plataforma tras dicho plazo implicará la aceptación
              de los nuevos Términos.
            </p>
          </section>

          {/* 14 */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              14. Suspensión y Cierre de Cuenta
            </h2>
            <p>
              Hospeda puede suspender o eliminar cuentas de Usuario en caso de
              incumplimiento de estos Términos, conducta fraudulenta, actividades
              ilegales o daño a otros usuarios. En caso de cierre de cuenta, el
              Usuario podrá solicitar la eliminación de sus datos conforme a la
              Política de Privacidad.
            </p>
          </section>

          {/* 15 */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              15. Ley Aplicable y Jurisdicción
            </h2>
            <p>
              Estos Términos se rigen por las leyes de la República de Chile,
              incluyendo el Código Civil, la Ley N° 19.496 sobre Protección de
              los Derechos de los Consumidores, la Ley N° 21.719 sobre Protección
              de Datos Personales y demás normas aplicables.
            </p>
            <p className="mt-3">
              Para la resolución de conflictos, las partes se someten a la
              jurisdicción de los Juzgados de Letras de la ciudad de Santiago,
              Chile, renunciando a cualquier otro fuero que pudiera corresponder.
            </p>
          </section>

          {/* 16 */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              16. Contacto
            </h2>
            <p>
              Para consultas relacionadas con estos Términos, puedes escribirnos a{" "}
              <a
                href="mailto:legal@hospeda.cl"
                className="text-teal-600 hover:underline"
              >
                legal@hospeda.cl
              </a>
              .
            </p>
          </section>
        </div>

        {/* Bottom links */}
        <div className="mt-12 pt-8 border-t border-gray-200 flex flex-wrap gap-4 text-sm">
          <a href="/privacidad" className="text-teal-600 hover:underline">
            Política de Privacidad
          </a>
          <a href="/eliminacion-datos" className="text-teal-600 hover:underline">
            Solicitar eliminación de datos
          </a>
        </div>
      </div>
    </div>
  );
}
