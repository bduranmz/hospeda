"use client";

import { useState, useEffect } from "react";
import { Shield, Check, X, Loader2 } from "lucide-react";
import { getAdminVerifications, adminReviewVerification } from "@/lib/actions/admin";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

export default function AdminVerificaciones() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [verifications, setVerifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [reason, setReason] = useState("");

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const result = await getAdminVerifications();
    setVerifications(result.data);
    setLoading(false);
  }

  async function handleAction(id: string, action: "approve" | "reject") {
    setActing(id);
    await adminReviewVerification(id, action, action === "reject" ? reason : undefined);
    setRejectId(null);
    setReason("");
    await load();
    setActing(null);
  }

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-teal-600" size={32} /></div>;

  return (
    <main className="p-6 lg:p-8 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Shield size={24} className="text-teal-600" />
        <h1 className="text-2xl font-semibold text-gray-900">Verificaciones de identidad</h1>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-left">
              <tr>
                <th className="px-6 py-3 font-medium">Usuario</th>
                <th className="px-6 py-3 font-medium">Documento</th>
                <th className="px-6 py-3 font-medium">Estado</th>
                <th className="px-6 py-3 font-medium">Fecha</th>
                <th className="px-6 py-3 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {verifications.map((v) => (
                <tr key={v.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3 font-medium text-gray-900">{v.profiles?.full_name || "—"}</td>
                  <td className="px-6 py-3 text-gray-500">{v.document_type} — {v.document_number}</td>
                  <td className="px-6 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[v.status] || "bg-gray-100"}`}>
                      {v.status}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-gray-500 text-xs">
                    {v.submitted_at ? new Date(v.submitted_at).toLocaleDateString("es-CL") : "—"}
                  </td>
                  <td className="px-6 py-3">
                    {v.status === "pending" && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleAction(v.id, "approve")}
                          disabled={acting === v.id}
                          className="flex items-center gap-1 text-xs bg-green-50 text-green-700 hover:bg-green-100 px-2.5 py-1.5 rounded-lg transition-colors"
                        >
                          <Check size={12} /> Aprobar
                        </button>
                        <button
                          onClick={() => setRejectId(v.id)}
                          disabled={acting === v.id}
                          className="flex items-center gap-1 text-xs bg-red-50 text-red-700 hover:bg-red-100 px-2.5 py-1.5 rounded-lg transition-colors"
                        >
                          <X size={12} /> Rechazar
                        </button>
                      </div>
                    )}
                    {v.status === "rejected" && v.rejection_reason && (
                      <span className="text-xs text-red-500">{v.rejection_reason}</span>
                    )}
                  </td>
                </tr>
              ))}
              {verifications.length === 0 && (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-400">Sin verificaciones pendientes</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reject modal */}
      {rejectId && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
            <h3 className="font-semibold text-gray-900 mb-3">Razon del rechazo</h3>
            <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} placeholder="Explica por que se rechaza..." className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 resize-none mb-4" />
            <div className="flex gap-2 justify-end">
              <button onClick={() => { setRejectId(null); setReason(""); }} className="text-sm text-gray-500 hover:text-gray-700 px-3 py-2">Cancelar</button>
              <button onClick={() => handleAction(rejectId, "reject")} disabled={!reason.trim()} className="text-sm bg-red-600 text-white hover:bg-red-700 px-4 py-2 rounded-lg disabled:opacity-50">Rechazar</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
