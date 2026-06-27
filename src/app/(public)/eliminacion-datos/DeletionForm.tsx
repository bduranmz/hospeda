"use client";

import { useState } from "react";

export default function DeletionForm() {
  const [form, setForm] = useState({ name: "", email: "", rut: "", reason: "", type: "elimination" });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In production this would call an API endpoint
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-6 text-center">
        <p className="text-green-800 font-semibold mb-1">Solicitud recibida</p>
        <p className="text-sm text-green-700">Te contactaremos a {form.email} dentro de 30 dias habiles.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-gray-50 border border-gray-200 rounded-xl p-6">
      <h2 className="font-semibold text-gray-900 mb-2">Formulario de solicitud</h2>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de solicitud</label>
        <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500">
          <option value="elimination">Eliminacion de datos</option>
          <option value="access">Acceso a datos</option>
          <option value="rectification">Rectificacion</option>
          <option value="portability">Portabilidad</option>
          <option value="opposition">Oposicion</option>
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo *</label>
          <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
          <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">RUT (para verificacion de identidad)</label>
        <input type="text" value={form.rut} onChange={(e) => setForm({ ...form, rut: e.target.value })} placeholder="12.345.678-9" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Detalle de la solicitud</label>
        <textarea value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} rows={3} placeholder="Describe que datos deseas eliminar o cualquier detalle relevante..." className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none" />
      </div>

      <button type="submit" className="bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-colors">
        Enviar solicitud
      </button>
    </form>
  );
}
