import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  Building2,
  CalendarDays,
  MessageSquare,
  TrendingUp,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

const stats = [
  {
    label: "Propiedades activas",
    value: "3",
    icon: Building2,
    color: "text-teal-600",
    bg: "bg-teal-50",
    change: "+1 este mes",
    positive: true,
  },
  {
    label: "Reservas pendientes",
    value: "7",
    icon: CalendarDays,
    color: "text-amber-600",
    bg: "bg-amber-50",
    change: "2 por confirmar",
    positive: null,
  },
  {
    label: "Mensajes sin leer",
    value: "4",
    icon: MessageSquare,
    color: "text-blue-600",
    bg: "bg-blue-50",
    change: "Últimas 24 horas",
    positive: null,
  },
  {
    label: "Ingresos del mes",
    value: "$480.000",
    icon: TrendingUp,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    change: "+12% vs mes anterior",
    positive: true,
  },
];

const recentActivity = [
  {
    type: "reserva",
    icon: CheckCircle2,
    iconColor: "text-emerald-500",
    title: "Nueva reserva confirmada",
    description: "Cabaña Los Pinos — 3 noches (15–18 julio)",
    time: "Hace 2 horas",
  },
  {
    type: "mensaje",
    icon: MessageSquare,
    iconColor: "text-blue-500",
    title: "Nuevo mensaje recibido",
    description: "Consulta sobre disponibilidad en agosto",
    time: "Hace 4 horas",
  },
  {
    type: "alerta",
    icon: AlertCircle,
    iconColor: "text-amber-500",
    title: "Reserva pendiente de confirmación",
    description: "Departamento Centro — 2 noches (20–22 julio)",
    time: "Hace 6 horas",
  },
  {
    type: "reserva",
    icon: CheckCircle2,
    iconColor: "text-emerald-500",
    title: "Pago recibido",
    description: "Reserva #2847 — $96.000 CLP",
    time: "Ayer, 15:30",
  },
  {
    type: "pendiente",
    icon: Clock,
    iconColor: "text-gray-400",
    title: "Check-out programado",
    description: "Casa Playa Norte — huésped sale mañana",
    time: "Mañana, 11:00",
  },
];

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();

  const displayName =
    profile?.full_name ??
    user.user_metadata?.full_name ??
    user.email?.split("@")[0] ??
    "Usuario";

  const firstName = displayName.split(" ")[0];

  return (
    <main className="p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">
          Bienvenido, {firstName}
        </h1>
        <p className="text-gray-500 mt-1 text-sm">
          Aquí tienes un resumen de tu actividad reciente.
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`p-2 rounded-lg ${stat.bg}`}>
                  <Icon size={18} className={stat.color} />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900 mb-1">
                {stat.value}
              </p>
              <p className="text-sm text-gray-500 mb-2">{stat.label}</p>
              <p
                className={`text-xs font-medium ${
                  stat.positive === true
                    ? "text-emerald-600"
                    : stat.positive === false
                    ? "text-red-500"
                    : "text-gray-400"
                }`}
              >
                {stat.change}
              </p>
            </div>
          );
        })}
      </div>

      {/* Recent activity */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
          <h2 className="font-semibold text-gray-900">Actividad reciente</h2>
          <a
            href="/dashboard/reservas"
            className="text-sm text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1 transition-colors"
          >
            Ver todo
            <ArrowRight size={14} />
          </a>
        </div>

        <ul className="divide-y divide-gray-50">
          {recentActivity.map((item, idx) => {
            const Icon = item.icon;
            return (
              <li
                key={idx}
                className="flex items-start gap-4 px-6 py-4 hover:bg-gray-50 transition-colors"
              >
                <div className="mt-0.5 shrink-0">
                  <Icon size={18} className={item.iconColor} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {item.title}
                  </p>
                  <p className="text-sm text-gray-500 truncate">
                    {item.description}
                  </p>
                </div>
                <span className="text-xs text-gray-400 shrink-0 mt-0.5">
                  {item.time}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </main>
  );
}
