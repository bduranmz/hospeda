import DeletionForm from "./DeletionForm";

export const metadata = {
  title: "Eliminación de Datos Personales | Hospeda",
  description:
    "Solicita la eliminación de tus datos personales conforme a la Ley N° 21.719.",
};

export default function EliminacionDatosPage() {
  return (
    <div className="bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-10 border-b border-gray-200 pb-8">
          <p className="text-sm font-semibold uppercase tracking-widest text-teal-600 mb-2">
            Legal
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Solicitud de Eliminación de Datos
          </h1>
          <p className="mt-3 text-gray-500 text-sm">
            Ejerce tu derecho a la eliminación de datos personales conforme a la
            Ley N° 21.719 sobre Protección de Datos Personales.
          </p>
        </div>

        {/* Info boxes */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          {[
            {
              icon: "📋",
              title: "Tu derecho",
              body: "Puedes solicitar la eliminación de tus datos personales cuando ya no sean necesarios para la finalidad para la que fueron recogidos.",
            },
            {
              icon: "⏱",
              title: "Plazo de respuesta",
              body: "Responderemos tu solicitud en un máximo de 30 días hábiles desde su recepción.",
            },
            {
              icon: "⚠️",
              title: "Excepciones",
              body: "Algunos datos deben conservarse por obligación legal (ej: historial tributario por 7 años) y no podrán eliminarse antes del plazo legal.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-xl border border-gray-200 bg-gray-50 p-4"
            >
              <div className="text-2xl mb-2">{item.icon}</div>
              <h3 className="font-semibold text-gray-900 text-sm">
                {item.title}
              </h3>
              <p className="mt-1 text-xs text-gray-500 leading-relaxed">
                {item.body}
              </p>
            </div>
          ))}
        </div>

        {/* ARCO rights info */}
        <div className="mb-8 rounded-xl border border-teal-100 bg-teal-50 p-5">
          <h2 className="font-semibold text-teal-800 mb-2 text-sm">
            Otros derechos disponibles
          </h2>
          <p className="text-sm text-teal-700 mb-3">
            Además de la eliminación, tienes derecho a:
          </p>
          <ul className="space-y-1 text-sm text-teal-700 list-disc pl-4">
            <li>
              <strong>Acceso:</strong> conocer qué datos tuyos tenemos
            </li>
            <li>
              <strong>Rectificación:</strong> corregir datos inexactos
            </li>
            <li>
              <strong>Portabilidad:</strong> recibir tus datos en formato
              exportable
            </li>
            <li>
              <strong>Oposición:</strong> oponerte a ciertos usos de tus datos
            </li>
          </ul>
          <p className="mt-3 text-sm text-teal-700">
            Para ejercer cualquiera de estos derechos, usa el formulario a
            continuación o escríbenos a{" "}
            <a
              href="mailto:privacidad@hospeda.cl"
              className="font-medium underline hover:no-underline"
            >
              privacidad@hospeda.cl
            </a>
            .
          </p>
        </div>

        {/* Form */}
        <DeletionForm />

        {/* Disclaimer */}
        <div className="mt-8 text-xs text-gray-400 space-y-2">
          <p>
            Al enviar este formulario, Hospeda iniciará el proceso de verificación
            de tu identidad antes de proceder con cualquier acción sobre tus datos.
            Esto es necesario para garantizar que no se eliminen datos de terceros
            sin autorización.
          </p>
          <p>
            Recibirás una confirmación por correo electrónico con el número de
            seguimiento de tu solicitud. Si no recibes respuesta dentro de 30 días
            hábiles, puedes escalar tu solicitud ante el Consejo para la
            Transparencia (CPLT).
          </p>
          <p>
            Para más información, consulta nuestra{" "}
            <a href="/privacidad" className="text-teal-600 hover:underline">
              Política de Privacidad
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
