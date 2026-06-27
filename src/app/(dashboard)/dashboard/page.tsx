import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  Building2,
  CalendarDays,
  MessageSquare,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plane,
} from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, is_host")
    .eq("id", user.id)
    .single();

  const displayName =
    profile?.full_name ?? user.user_metadata?.full_name ?? user.email?.split("@")[0] ?? "Usuario";
  const firstName = displayName.split(" ")[0];
  const isHost = profile?.is_host ?? false;

  // Fetch real stats in parallel
  const [propertiesRes, hostReservationsRes, guestReservationsRes, unreadRes] = await Promise.all([
    supabase
      .from("properties")
      .select("id", { count: "exact", head: true })
      .eq("host_id", user.id)
      .eq("status", "published")
      .is("deleted_at", null),
    supabase
      .from("reservations")
      .select("id, status, created_at, check_in, check_out, host_payout, properties(title), profiles!reservations_guest_id_fkey(full_name)")
      .eq("host_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10),
    supabase
      .from("reservations")
      .select("id", { count: "exact", head: true })
      .eq("guest_id", user.id),
    supabase
      .from("messages")
      .select("id", { count: "exact", head: true })
      .eq("receiver_id", user.id)
      .is("read_at", null),
  ]);

  const activeProperties = propertiesRes.count ?? 0;
  const hostReservations = hostReservationsRes.data ?? [];
  const guestTrips = guestReservationsRes.count ?? 0;
  const unreadMessages = unreadRes.count ?? 0;

  const pendingCount = hostReservations.filter((r) => r.status === "pending_approval").length;

  // Monthly revenue
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const monthlyRevenue = hostReservations
    .filter((r) => ["confirmed", "checked_in", "completed"].includes(r.status) && r.created_at >= monthStart)
    .reduce((sum, r) => sum + (r.host_payout ?? 0), 0);

  const stats = [
    ...(isHost
      ? [
          { label: "Propiedades activas", value: String(activeProperties), icon: Building2, color: "text-teal-600", bg: "bg-teal-50", href: "/dashboard/propiedades" },
          { label: "Reservas pendientes", value: String(pendingCount), icon: CalendarDays, color: "text-amber-600", bg: "bg-amber-50", href: "/dashboard/reservas" },
        ]
      : []),
    { label: "Mis viajes", value: String(guestTrips), icon: Plane, color: "text-blue-600", bg: "bg-blue-50", href: "/dashboard/viajes" },
    { label: "Mensajes sin leer", value: String(unreadMessages), icon: MessageSquare, color: "text-purple-600", bg: "bg-purple-50", href: "/dashboard/mensajes" },
    ...(isHost
      ? [{ label: "Ingresos del mes", value: `$${monthlyRevenue.toLocaleString("es-CL")}`, icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50", href: "/dashboard/reservas" }]
      : []),
  ];

  // Build recent activity from real reservations
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recentActivity: { icon: any; iconColor: string; title: string; description: string; time: string; href: string }[] = [];

  for (const r of hostReservations.slice(0, 5)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const propTitle = (r.properties as any)?.title ?? "Propiedad";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const guestName = (r.profiles as any)?.full_name ?? "Huésped";
    const timeAgo = getTimeAgo(r.created_at);

    if (r.status === "pending_approval") {
      recentActivity.push({ icon: AlertCircle, iconColor: "text-amber-500", title: "Reserva pendiente", description: `${propTitle} — ${guestName}`, time: timeAgo, href: "/dashboard/reservas" });
    } else if (r.status === "confirmed") {
      recentActivity.push({ icon: CheckCircle2, iconColor: "text-emerald-500", title: "Reserva confirmada", description: `${propTitle} — ${formatDateRange(r.check_in, r.check_out)}`, time: timeAgo, href: "/dashboard/reservas" });
    } else if (r.status === "checked_in") {
      recentActivity.push({ icon: Clock, iconColor: "text-teal-500", title: "Huésped en propiedad", description: `${propTitle} — ${guestName}`, time: timeAgo, href: "/dashboard/reservas" });
    }
  }

  if (recentActivity.length === 0) {
    recentActivity.push({
      icon: Clock, iconColor: "text-gray-400",
      title: isHost ? "Sin actividad reciente" : "Sin viajes aún",
      description: isHost ? "Las reservas aparecerán aquí." : "Explora propiedades y haz tu primera reserva.",
      time: "", href: isHost ? "/dashboard/propiedades" : "/propiedades",
    });
  }

  return (
    <main className="p-6 lg:p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Bienvenido, {firstName}</h1>
        <p className="text-gray-500 mt-1 text-sm">Aquí tienes un resumen de tu actividad.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link key={stat.label} href={stat.href} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className={`p-2 rounded-lg ${stat.bg} w-fit mb-3`}>
                <Icon size={18} className={stat.color} />
              </div>
              <p className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </Link>
          );
        })}
      </div>

      {/* CTA for non-hosts */}
      {!isHost && (
        <div className="mb-8 bg-gradient-to-r from-teal-500 to-teal-600 rounded-xl p-6 text-white">
          <h2 className="text-lg font-semibold mb-2">¿Tienes una propiedad?</h2>
          <p className="text-teal-100 text-sm mb-4">Publica tu propiedad y comienza a recibir reservas.</p>
          <Link href="/dashboard/propiedades/nueva" className="inline-flex items-center gap-2 px-5 py-2 bg-white text-teal-700 rounded-lg text-sm font-medium hover:bg-teal-50 transition-colors">
            Publicar propiedad <ArrowRight size={14} />
          </Link>
        </div>
      )}

      {/* Recent activity */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
          <h2 className="font-semibold text-gray-900">Actividad reciente</h2>
          <Link href="/dashboard/reservas" className="text-sm text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1 transition-colors">
            Ver todo <ArrowRight size={14} />
          </Link>
        </div>
        <ul className="divide-y divide-gray-50">
          {recentActivity.map((item, idx) => {
            const Icon = item.icon;
            return (
              <li key={idx}>
                <Link href={item.href} className="flex items-start gap-4 px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="mt-0.5 shrink-0"><Icon size={18} className={item.iconColor} /></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{item.title}</p>
                    <p className="text-sm text-gray-500 truncate">{item.description}</p>
                  </div>
                  {item.time && <span className="text-xs text-gray-400 shrink-0 mt-0.5">{item.time}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </main>
  );
}

function getTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = diff / (1000 * 60 * 60);
  if (hours < 1) return "Hace un momento";
  if (hours < 24) return `Hace ${Math.floor(hours)}h`;
  if (hours < 48) return "Ayer";
  const days = Math.floor(hours / 24);
  if (days < 7) return `Hace ${days} días`;
  return new Date(dateStr).toLocaleDateString("es-CL", { day: "numeric", month: "short" });
}

function formatDateRange(checkIn: string, checkOut: string): string {
  const fmt = (d: string) => new Date(d).toLocaleDateString("es-CL", { day: "numeric", month: "short" });
  return `${fmt(checkIn)} — ${fmt(checkOut)}`;
}
