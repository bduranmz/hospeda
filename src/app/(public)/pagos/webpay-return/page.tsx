import { confirmWebpayPayment } from "@/lib/actions/payments";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function WebpayReturnPage(props: {
  searchParams: Promise<{ payment_id?: string; token_ws?: string; TBK_TOKEN?: string }>;
}) {
  const searchParams = await props.searchParams;
  const { payment_id, token_ws, TBK_TOKEN } = searchParams;

  // User cancelled or aborted
  if (TBK_TOKEN || !payment_id || !token_ws) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Pago cancelado</h1>
          <p className="text-gray-600 mb-6">La transaccion fue cancelada o no pudo completarse.</p>
          <Link
            href="/dashboard/viajes"
            className="inline-block bg-rose-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-rose-600 transition"
          >
            Volver a mis viajes
          </Link>
        </div>
      </div>
    );
  }

  const result = await confirmWebpayPayment(payment_id, token_ws);

  if (result.success) {
    redirect(`/dashboard/viajes?confirmed=${result.reservationId}`);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
          <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Error en el pago</h1>
        <p className="text-gray-600 mb-6">{result.error || "No se pudo procesar el pago."}</p>
        <Link
          href="/dashboard/viajes"
          className="inline-block bg-rose-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-rose-600 transition"
        >
          Volver a mis viajes
        </Link>
      </div>
    </div>
  );
}
