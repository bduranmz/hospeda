"use client";

import { useState, useTransition } from "react";
import { Save, User, CreditCard } from "lucide-react";
import { updateProfile, updateBankAccount } from "@/lib/actions/profile";
import type { Profile } from "@/types/database";

const BANKS = [
  "Banco de Chile", "Banco Estado", "Banco Santander", "BCI",
  "Banco Itaú", "Banco Scotiabank", "Banco Falabella", "Banco Ripley",
  "Banco Security", "Banco BICE", "Banco Consorcio",
];

export function ProfileForm({ profile, email }: { profile: Profile | null; email: string }) {
  const [tab, setTab] = useState<"personal" | "bank">("personal");
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [fullName, setFullName] = useState(profile?.full_name ?? "");
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const [bio, setBio] = useState(profile?.bio ?? "");
  const [dob, setDob] = useState(profile?.date_of_birth ?? "");
  const [nationality, setNationality] = useState(profile?.nationality ?? "");

  const [bank, setBank] = useState(profile?.bank_account?.bank ?? "");
  const [accountType, setAccountType] = useState(profile?.bank_account?.account_type ?? "corriente");
  const [accountNumber, setAccountNumber] = useState(profile?.bank_account?.account_number ?? "");
  const [rutHolder, setRutHolder] = useState(profile?.bank_account?.rut_holder ?? "");
  const [nameHolder, setNameHolder] = useState(profile?.bank_account?.name_holder ?? "");

  const handleSaveProfile = () => {
    startTransition(async () => {
      const result = await updateProfile({ fullName, phone, bio, dateOfBirth: dob, nationality });
      setMessage(result.error ? { type: "error", text: result.error } : { type: "success", text: "Perfil actualizado" });
      setTimeout(() => setMessage(null), 3000);
    });
  };

  const handleSaveBank = () => {
    startTransition(async () => {
      const result = await updateBankAccount({ bank, accountType, accountNumber, rutHolder, nameHolder });
      setMessage(result.error ? { type: "error", text: result.error } : { type: "success", text: "Datos bancarios actualizados" });
      setTimeout(() => setMessage(null), 3000);
    });
  };

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 rounded-lg p-1 w-fit">
        <button
          onClick={() => setTab("personal")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            tab === "personal" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <User size={14} /> Personal
        </button>
        <button
          onClick={() => setTab("bank")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            tab === "bank" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <CreditCard size={14} /> Datos bancarios
        </button>
      </div>

      {/* Message */}
      {message && (
        <div className={`mb-4 px-4 py-2 rounded-lg text-sm ${
          message.type === "success" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
        }`}>
          {message.text}
        </div>
      )}

      {tab === "personal" ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" value={email} disabled className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo</label>
            <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+56 9 1234 5678" className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de nacimiento</label>
              <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nacionalidad</label>
              <input type="text" value={nationality} onChange={(e) => setNationality(e.target.value)} placeholder="Chilena" className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
            <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} placeholder="Cuéntanos sobre ti..." className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none" />
          </div>
          <button
            onClick={handleSaveProfile}
            disabled={isPending}
            className="flex items-center gap-2 px-6 py-2.5 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors disabled:opacity-50"
          >
            <Save size={14} /> Guardar
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-5">
          <p className="text-sm text-gray-500 mb-2">
            Estos datos se usan para recibir pagos de tus reservas como anfitrión.
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Banco</label>
            <select value={bank} onChange={(e) => setBank(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
              <option value="">Seleccionar banco</option>
              {BANKS.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de cuenta</label>
              <select value={accountType} onChange={(e) => setAccountType(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
                <option value="corriente">Cuenta corriente</option>
                <option value="vista">Cuenta vista / RUT</option>
                <option value="ahorro">Cuenta de ahorro</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nro. de cuenta</label>
              <input type="text" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">RUT titular</label>
              <input type="text" value={rutHolder} onChange={(e) => setRutHolder(e.target.value)} placeholder="12.345.678-9" className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre titular</label>
              <input type="text" value={nameHolder} onChange={(e) => setNameHolder(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
            </div>
          </div>
          <button
            onClick={handleSaveBank}
            disabled={isPending}
            className="flex items-center gap-2 px-6 py-2.5 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors disabled:opacity-50"
          >
            <Save size={14} /> Guardar datos bancarios
          </button>
        </div>
      )}
    </div>
  );
}
