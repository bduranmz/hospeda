"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, Check, Loader2 } from "lucide-react";
import { getAdminDisputes, adminResolveDispute } from "@/lib/actions/admin";

const STATUS_COLORS: Record<string, string> = {
  open: "bg-amber-100 text-amber-700",
  in_review: "bg-blue-100 text-blue-700",
  resolved: "bg-green-100 text-green-700",
  escalated: "bg-red-100 text-red-700",
};

const PRIORITY_COLORS: Record<string, string> = {
  low: "bg-gray-100 text-gray-600",
  medium: "bg-amber-50 text-amber-600",
  high: "bg-red-50 text-red-600",
};

export default function AdminDisputas() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [disputes, setDisputes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [resolveId, setResolveId] = useState<string | null>(null);
  const [resolution, setResolution] = useState("");
  const [refund, setRefund] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    const result = await getAdminDisputes();
    setDisputes(result.data);
    setLoading(false);
  }

  async function handleResolve() {
    if (!resolveId || !resolution.trim()) return;
    setSaving(true);
    await adminResolveDispute(resolveId, resolution, refund);
    setResolveId(null);
    setResolution("");
    setRefund(0);
    await load();
    setSaving(false);
  }

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-teal-600" size={32} /></div>;

  return (
    <main className="p-6 lg:p-8 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <AlertTriangle size={24} className="text-amber-500" />
        <h1 className="text-2xl font-semibold text-gray-900">Disputas</h1>
      </div>

      <div className="space-y-4">
        {disputes.map((d) => (
          <div key={d.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[d.status] || "bg-gray-100"}`}>{d.status}</span>
                  {d.priority && <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${PRIORITY_COLORS[d.priority] || ""}`}>{d.priority}</span>}
                </div>
                <p className="text-sm text-gray-900 font-medium mb-1">{d.reason}</p>
                <p className="text-xs text-gray-500">
                  {d.profiles?.full_name || "—"} — {d.reservations?.properties?.title || "—"}
                  {d.reservations && ` (${new Date(d.reservations.check_in).toLocaleDateString("es-CL")} — ${new Date(d.reservations.check_out).toLocaleDateString("es-CL")})`}
                </p>
                <p className="text-xs text-gray-400 mt-1">{new Date(d.created_at).toLocaleDateString("es-CL")}</p>
                {d.resolution && <p className="text-xs text-green-600 mt-2">Resolucion: {d.resolution}</p>}
              </div>
              {(d.status === "open" || d.status === "in_review" || d.status === "escalated") && (
                <button onClick={() => setResolveId(d.id)} className="flex items-center gap-1 text-xs bg-teal-50 text-teal-700 hover:bg-teal-100 px-3 py-2 rounded-lg shrink-0">
                  <Check size={12} /> Resolver
                </button>
              )}
            </div>
          </div>
        ))}
        {disputes.length === 0 && (
          <div className="text-center py-16 text-gray-400">Sin disputas</div>
        )}
      </div>

      {/* Resolve modal */}
      {resolveId && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
            <h3 className="font-semibold text-gray-900 mb-3">Resolver disputa</h3>
            <textarea value={resolution} onChange={(e) => setResolution(e.target.value)} rows={3} placeholder="Describe la resolucion..." className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 resize-none mb-3" />
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Reembolso (%)</label>
              <input type="number" value={refund} onChange={(e) => setRefund(Number(e.target.value))} min={0} max={100} className="w-32 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400" />
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setResolveId(null)} className="text-sm text-gray-500 hover:text-gray-700 px-3 py-2">Cancelar</button>
              <button onClick={handleResolve} disabled={!resolution.trim() || saving} className="text-sm bg-teal-600 text-white hover:bg-teal-700 px-4 py-2 rounded-lg disabled:opacity-50">
                {saving ? "Guardando..." : "Resolver"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
