import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { CreditCard, ArrowDownCircle, ArrowUpCircle, Clock, CheckCircle2, XCircle } from "lucide-react";

const STATUS_STYLES: Record<string, { label: string; color: string }> = {
  pending: { label: "Pendiente", color: "bg-amber-100 text-amber-700" },
  success: { label: "Exitoso", color: "bg-green-100 text-green-700" },
  failed: { label: "Fallido", color: "bg-red-100 text-red-700" },
  refunded: { label: "Reembolsado", color: "bg-purple-100 text-purple-700" },
};

const STATUS_ICONS: Record<string, React.ElementType> = {
  pending: Clock,
  success: CheckCircle2,
  failed: XCircle,
  refunded: ArrowDownCircle,
};

export default async function PagosPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Fetch payments where user is guest (charges) or host (payouts)
  const { data: guestReservations } = await supabase
    .from("reservations")
    .select("id")
    .eq("guest_id", user.id);

  const { data: hostReservations } = await supabase
    .from("reservations")
    .select("id")
    .eq("host_id", user.id);

  const reservationIds = [
    ...(guestReservations || []).map((r) => r.id),
    ...(hostReservations || []).map((r) => r.id),
  ];

  let payments: Array<{
    id: string;
    reservation_id: string;
    provider: string;
    payment_type: string;
    status: string;
    amount: number;
    currency: string;
    created_at: string;
    completed_at: string | null;
  }> = [];

  if (reservationIds.length > 0) {
    const { data } = await supabase
      .from("payment_transactions")
      .select("id, reservation_id, provider, payment_type, status, amount, currency, created_at, completed_at")
      .in("reservation_id", reservationIds)
      .order("created_at", { ascending: false });
    payments = data || [];
  }

  // Host balance
  const { data: balance } = await supabase
    .from("host_balances")
    .select("available_balance, pending_balance, total_earned")
    .eq("host_id", user.id)
    .single();

  return (
    <main className="p-6 lg:p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Pagos</h1>

      {/* Balance cards (host only) */}
      {balance && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
            <p className="text-sm text-gray-500 mb-1">Disponible</p>
            <p className="text-2xl font-bold text-emerald-600">
              ${(balance.available_balance ?? 0).toLocaleString("es-CL")}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
            <p className="text-sm text-gray-500 mb-1">Pendiente</p>
            <p className="text-2xl font-bold text-amber-600">
              ${(balance.pending_balance ?? 0).toLocaleString("es-CL")}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
            <p className="text-sm text-gray-500 mb-1">Total ganado</p>
            <p className="text-2xl font-bold text-gray-900">
              ${(balance.total_earned ?? 0).toLocaleString("es-CL")}
            </p>
          </div>
        </div>
      )}

      {/* Transactions list */}
      {payments.length === 0 ? (
        <div className="text-center py-16">
          <CreditCard size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">No tienes transacciones aun</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50">
            <h2 className="font-semibold text-gray-900">Historial de transacciones</h2>
          </div>
          <ul className="divide-y divide-gray-50">
            {payments.map((p) => {
              const style = STATUS_STYLES[p.status] || STATUS_STYLES.pending;
              const StatusIcon = STATUS_ICONS[p.status] || Clock;
              const isCharge = p.payment_type === "charge";
              const TypeIcon = isCharge ? ArrowUpCircle : ArrowDownCircle;

              return (
                <li key={p.id} className="flex items-center gap-4 px-6 py-4">
                  <div className={`p-2 rounded-lg ${isCharge ? "bg-blue-50" : "bg-emerald-50"}`}>
                    <TypeIcon size={18} className={isCharge ? "text-blue-500" : "text-emerald-500"} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {p.payment_type === "charge" ? "Cobro" : p.payment_type === "refund" ? "Reembolso" : "Payout"}
                    </p>
                    <p className="text-xs text-gray-400">
                      {p.provider.toUpperCase()} &middot;{" "}
                      {new Date(p.created_at).toLocaleDateString("es-CL", {
                        day: "numeric", month: "short", year: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">
                      ${p.amount.toLocaleString("es-CL")}
                    </p>
                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${style.color}`}>
                      <StatusIcon size={12} /> {style.label}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </main>
  );
}
