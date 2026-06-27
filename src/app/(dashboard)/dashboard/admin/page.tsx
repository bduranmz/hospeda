import { getAdminStats, getAdminUsers, getAdminProperties, getAdminReservations } from "@/lib/actions/admin";
import Link from "next/link";
import { Users, Building2, CalendarDays, DollarSign, Shield, ShieldCheck, AlertTriangle } from "lucide-react";
import { redirect } from "next/navigation";

const VERIFICATION_LABELS: Record<string, { label: string; color: string }> = {
  unverified: { label: "Sin verificar", color: "bg-gray-100 text-gray-600" },
  phone_verified: { label: "Telefono", color: "bg-blue-100 text-blue-600" },
  identity_verified: { label: "Identidad", color: "bg-green-100 text-green-600" },
  host_verified: { label: "Host", color: "bg-teal-100 text-teal-600" },
  suspended: { label: "Suspendido", color: "bg-red-100 text-red-600" },
};

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-100 text-gray-600",
  pending_review: "bg-amber-100 text-amber-600",
  published: "bg-green-100 text-green-600",
  paused: "bg-yellow-100 text-yellow-600",
  suspended: "bg-red-100 text-red-600",
  archived: "bg-gray-100 text-gray-500",
};

export default async function AdminPage() {
  const stats = await getAdminStats();
  if (!stats) redirect("/dashboard");

  const [usersResult, propertiesResult, reservationsResult] = await Promise.all([
    getAdminUsers(),
    getAdminProperties(),
    getAdminReservations(),
  ]);

  const statCards = [
    { label: "Usuarios", value: stats.totalUsers, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Propiedades", value: stats.totalProperties, icon: Building2, color: "text-teal-600", bg: "bg-teal-50" },
    { label: "Reservas", value: stats.totalReservations, icon: CalendarDays, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Ingresos plataforma", value: `$${stats.platformRevenue.toLocaleString("es-CL")}`, icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50" },
  ];

  return (
    <main className="p-6 lg:p-8 max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Shield size={24} className="text-teal-600" />
        <h1 className="text-2xl font-semibold text-gray-900">Panel de Administracion</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {statCards.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
              <div className={`p-2 rounded-lg ${s.bg} w-fit mb-3`}><Icon size={18} className={s.color} /></div>
              <p className="text-2xl font-bold text-gray-900 mb-1">{s.value}</p>
              <p className="text-sm text-gray-500">{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* Quick links */}
      <div className="flex gap-3 mb-8">
        <Link href="/dashboard/admin/verificaciones" className="flex items-center gap-2 bg-white border border-gray-100 rounded-xl px-4 py-3 shadow-sm hover:border-teal-200 transition-colors text-sm font-medium text-gray-700">
          <ShieldCheck size={16} className="text-teal-600" /> Verificaciones
        </Link>
        <Link href="/dashboard/admin/disputas" className="flex items-center gap-2 bg-white border border-gray-100 rounded-xl px-4 py-3 shadow-sm hover:border-amber-200 transition-colors text-sm font-medium text-gray-700">
          <AlertTriangle size={16} className="text-amber-500" /> Disputas
        </Link>
      </div>

      {/* Users table */}
      <section className="bg-white rounded-xl border border-gray-100 shadow-sm mb-8 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50">
          <h2 className="font-semibold text-gray-900">Usuarios ({usersResult.count})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-left">
              <tr>
                <th className="px-6 py-3 font-medium">Nombre</th>
                <th className="px-6 py-3 font-medium">Verificacion</th>
                <th className="px-6 py-3 font-medium">Host</th>
                <th className="px-6 py-3 font-medium">Rating</th>
                <th className="px-6 py-3 font-medium">Registro</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {usersResult.data.map((u) => {
                const v = VERIFICATION_LABELS[u.verification_status] || VERIFICATION_LABELS.unverified;
                return (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-3 font-medium text-gray-900">{u.full_name || "—"}</td>
                    <td className="px-6 py-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${v.color}`}>{v.label}</span>
                    </td>
                    <td className="px-6 py-3">{u.is_host ? "Si" : "No"}</td>
                    <td className="px-6 py-3">{u.avg_rating ? `${u.avg_rating.toFixed(1)} (${u.total_reviews})` : "—"}</td>
                    <td className="px-6 py-3 text-gray-500">
                      {new Date(u.created_at).toLocaleDateString("es-CL", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Properties table */}
      <section className="bg-white rounded-xl border border-gray-100 shadow-sm mb-8 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50">
          <h2 className="font-semibold text-gray-900">Propiedades ({propertiesResult.count})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-left">
              <tr>
                <th className="px-6 py-3 font-medium">Titulo</th>
                <th className="px-6 py-3 font-medium">Host</th>
                <th className="px-6 py-3 font-medium">Estado</th>
                <th className="px-6 py-3 font-medium">Precio</th>
                <th className="px-6 py-3 font-medium">Creada</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {propertiesResult.data.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-3 font-medium text-gray-900 truncate max-w-[200px]">{p.title}</td>
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  <td className="px-6 py-3 text-gray-500">{(p.profiles as any)?.full_name || "—"}</td>
                  <td className="px-6 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[p.status] || "bg-gray-100 text-gray-600"}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-6 py-3">${p.base_price?.toLocaleString("es-CL")}</td>
                  <td className="px-6 py-3 text-gray-500">
                    {new Date(p.created_at).toLocaleDateString("es-CL", { day: "numeric", month: "short" })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Reservations table */}
      <section className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50">
          <h2 className="font-semibold text-gray-900">Reservas recientes ({reservationsResult.count})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-left">
              <tr>
                <th className="px-6 py-3 font-medium">Propiedad</th>
                <th className="px-6 py-3 font-medium">Huesped</th>
                <th className="px-6 py-3 font-medium">Estado</th>
                <th className="px-6 py-3 font-medium">Fechas</th>
                <th className="px-6 py-3 font-medium">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {reservationsResult.data.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  <td className="px-6 py-3 font-medium text-gray-900 truncate max-w-[200px]">{(r.properties as any)?.title || "—"}</td>
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  <td className="px-6 py-3 text-gray-500">{(r.profiles as any)?.full_name || "—"}</td>
                  <td className="px-6 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[r.status] || "bg-gray-100 text-gray-600"}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-gray-500 text-xs">
                    {new Date(r.check_in).toLocaleDateString("es-CL", { day: "numeric", month: "short" })}
                    {" — "}
                    {new Date(r.check_out).toLocaleDateString("es-CL", { day: "numeric", month: "short" })}
                  </td>
                  <td className="px-6 py-3 font-medium">${r.total_charged?.toLocaleString("es-CL")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
