"use client";

import { useState, useEffect } from "react";
import { Building2, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { updateBankAccount } from "@/lib/actions/profile";
import { createBrowserClient } from "@supabase/ssr";

const BANKS = [
  "Banco de Chile", "Banco Estado", "Banco Santander", "BCI", "BICE",
  "Banco Falabella", "Banco Ripley", "Banco Security", "Scotiabank",
  "Banco Internacional", "Banco Itau", "HSBC", "Banco Consorcio",
];

const ACCOUNT_TYPES = [
  { value: "corriente", label: "Cuenta Corriente" },
  { value: "vista", label: "Cuenta Vista / RUT" },
  { value: "ahorro", label: "Cuenta de Ahorro" },
];

export default function BancoPage() {
  const [form, setForm] = useState({
    bank: "",
    accountType: "corriente",
    accountNumber: "",
    rutHolder: "",
    nameHolder: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("bank_account")
        .eq("id", user.id)
        .single();

      if (profile?.bank_account) {
        const ba = profile.bank_account as Record<string, string>;
        setForm({
          bank: ba.bank || "",
          accountType: ba.account_type || "corriente",
          accountNumber: ba.account_number || "",
          rutHolder: ba.rut_holder || "",
          nameHolder: ba.name_holder || "",
        });
      }
      setLoading(false);
    }
    load();
  }, []);

  const handleSave = async () => {
    if (!form.bank || !form.accountNumber || !form.rutHolder || !form.nameHolder) {
      setError("Completa todos los campos");
      return;
    }
    setSaving(true);
    setError("");
    const result = await updateBankAccount(form);
    if (result.error) {
      setError(result.error);
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
    setSaving(false);
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-teal-600" size={32} /></div>;

  return (
    <div className="max-w-xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Building2 size={24} className="text-teal-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Datos bancarios</h1>
          <p className="text-sm text-gray-500">Para recibir tus pagos como anfitrion</p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Banco</label>
          <select value={form.bank} onChange={(e) => setForm({ ...form, bank: e.target.value })} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500">
            <option value="">Selecciona</option>
            {BANKS.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de cuenta</label>
          <select value={form.accountType} onChange={(e) => setForm({ ...form, accountType: e.target.value })} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500">
            {ACCOUNT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Numero de cuenta</label>
          <input type="text" value={form.accountNumber} onChange={(e) => setForm({ ...form, accountNumber: e.target.value })} placeholder="Ej: 00-123-45678-90" className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">RUT del titular</label>
          <input type="text" value={form.rutHolder} onChange={(e) => setForm({ ...form, rutHolder: e.target.value })} placeholder="12.345.678-9" className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del titular</label>
          <input type="text" value={form.nameHolder} onChange={(e) => setForm({ ...form, nameHolder: e.target.value })} placeholder="Nombre completo" className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex items-center gap-3 pt-2">
          <Button onClick={handleSave} loading={saving}>Guardar</Button>
          {saved && <span className="text-sm text-green-600 flex items-center gap-1"><Check size={14} /> Guardado</span>}
        </div>
      </div>
    </div>
  );
}
