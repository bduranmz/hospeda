import Link from "next/link";

export default async function FlowReturnPage(props: {
  searchParams: Promise<{ payment_id?: string; status?: string }>;
}) {
  const searchParams = await props.searchParams;
  const { status } = searchParams;

  // Flow confirms via webhook, this page is just UI feedback
  const isSuccess = status !== "error";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
        {isSuccess ? (
          <>
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Pago procesado</h1>
            <p className="text-gray-600 mb-6">Tu reserva esta siendo confirmada. Recibiras una notificacion pronto.</p>
          </>
        ) : (
          <>
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Error en el pago</h1>
            <p className="text-gray-600 mb-6">No se pudo procesar el pago. Intenta nuevamente.</p>
          </>
        )}
        <Link
          href="/dashboard/viajes"
          className="inline-block bg-rose-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-rose-600 transition"
        >
          Ir a mis viajes
        </Link>
      </div>
    </div>
  );
}
