import { getNotifications, markNotificationRead, markAllNotificationsRead, deleteNotification } from "@/lib/actions/notifications";
import { Bell, Check, CheckCheck, Trash2 } from "lucide-react";
import { revalidatePath } from "next/cache";

const TYPE_COLORS: Record<string, string> = {
  reservation_request: "bg-amber-100 text-amber-700",
  reservation_confirmed: "bg-green-100 text-green-700",
  payment_received: "bg-emerald-100 text-emerald-700",
  reservation_cancelled: "bg-red-100 text-red-700",
  new_review: "bg-purple-100 text-purple-700",
  check_in_reminder: "bg-blue-100 text-blue-700",
  new_message: "bg-indigo-100 text-indigo-700",
};

const TYPE_LABELS: Record<string, string> = {
  reservation_request: "Reserva",
  reservation_confirmed: "Confirmada",
  payment_received: "Pago",
  reservation_cancelled: "Cancelada",
  new_review: "Reseña",
  check_in_reminder: "Check-in",
  new_message: "Mensaje",
};

export default async function NotificacionesPage() {
  const notifications = await getNotifications(50);

  async function handleMarkRead(formData: FormData) {
    "use server";
    const id = formData.get("id") as string;
    await markNotificationRead(id);
    revalidatePath("/dashboard/notificaciones");
  }

  async function handleMarkAllRead() {
    "use server";
    await markAllNotificationsRead();
    revalidatePath("/dashboard/notificaciones");
  }

  async function handleDelete(formData: FormData) {
    "use server";
    const id = formData.get("id") as string;
    await deleteNotification(id);
    revalidatePath("/dashboard/notificaciones");
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <main className="p-6 lg:p-8 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Notificaciones</h1>
          <p className="text-sm text-gray-500 mt-1">
            {unreadCount > 0 ? `${unreadCount} sin leer` : "Todo al dia"}
          </p>
        </div>
        {unreadCount > 0 && (
          <form action={handleMarkAllRead}>
            <button className="flex items-center gap-2 text-sm text-teal-600 hover:text-teal-700 font-medium">
              <CheckCheck size={16} /> Marcar todo como leido
            </button>
          </form>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-16">
          <Bell size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">No tienes notificaciones</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`bg-white rounded-xl border p-4 flex items-start gap-4 transition ${
                n.read ? "border-gray-100" : "border-teal-200 bg-teal-50/30"
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${TYPE_COLORS[n.type] || "bg-gray-100 text-gray-600"}`}>
                    {TYPE_LABELS[n.type] || n.type}
                  </span>
                  {!n.read && <span className="w-2 h-2 rounded-full bg-teal-500" />}
                </div>
                <p className="text-sm font-medium text-gray-900">{n.title}</p>
                <p className="text-sm text-gray-500 mt-0.5">{n.body}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(n.created_at).toLocaleDateString("es-CL", {
                    day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
                  })}
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {!n.read && (
                  <form action={handleMarkRead}>
                    <input type="hidden" name="id" value={n.id} />
                    <button className="p-1.5 rounded-lg text-gray-400 hover:text-teal-600 hover:bg-teal-50 transition" title="Marcar como leida">
                      <Check size={16} />
                    </button>
                  </form>
                )}
                <form action={handleDelete}>
                  <input type="hidden" name="id" value={n.id} />
                  <button className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition" title="Eliminar">
                    <Trash2 size={16} />
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
