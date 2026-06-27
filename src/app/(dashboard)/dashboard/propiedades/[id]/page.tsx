"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Home,
  MapPin,
  Users,
  Sparkles,
  DollarSign,
  ScrollText,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { getPropertyForEdit, updateProperty } from "@/lib/actions/properties";
import {
  PROPERTY_TYPE_LABELS,
  SPACE_TYPE_LABELS,
  CANCELLATION_POLICY_LABELS,
  AMENITIES,
  type PropertyType,
  type SpaceType,
  type CancellationPolicy,
  type PropertyFormData,
} from "@/types/database";

const STEPS = [
  { label: "Tipo", icon: Home },
  { label: "Ubicación", icon: MapPin },
  { label: "Detalles", icon: Users },
  { label: "Servicios", icon: Sparkles },
  { label: "Precios", icon: DollarSign },
  { label: "Reglas", icon: ScrollText },
] as const;

const REGIONS = [
  "Arica y Parinacota", "Tarapacá", "Antofagasta", "Atacama", "Coquimbo",
  "Valparaíso", "Metropolitana", "O'Higgins", "Maule", "Ñuble",
  "Biobío", "Araucanía", "Los Ríos", "Los Lagos", "Aysén", "Magallanes",
];

export default function EditarPropiedad() {
  const router = useRouter();
  const params = useParams();
  const propertyId = params.id as string;
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<PropertyFormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function load() {
      const result = await getPropertyForEdit(propertyId);
      if (result.error || !result.property) {
        setError(result.error ?? "No encontrada");
        setLoading(false);
        return;
      }
      const p = result.property;
      setForm({
        title: p.title ?? "",
        description: p.description ?? "",
        property_type: p.property_type ?? "apartment",
        space_type: p.space_type ?? "entire",
        address: p.address ?? { street: "", number: "", commune: "", region: "", country: "Chile" },
        max_guests: p.max_guests ?? 2,
        bedrooms: p.bedrooms ?? 1,
        beds: p.beds ?? 1,
        bathrooms: p.bathrooms ?? 1,
        amenities: p.amenities ?? [],
        base_price: p.base_price ?? 30000,
        weekend_price: p.weekend_price ?? null,
        cleaning_fee: p.cleaning_fee ?? 0,
        security_deposit: p.security_deposit ?? 0,
        rules: p.rules ?? { no_smoking: true, no_pets: false, no_parties: true },
        cancellation_policy: p.cancellation_policy ?? "moderate",
        instant_booking: p.instant_booking ?? false,
        min_nights: p.min_nights ?? 1,
        max_nights: p.max_nights ?? null,
        check_in_time: p.check_in_time ?? "15:00",
        check_out_time: p.check_out_time ?? "11:00",
      });
      setLoading(false);
    }
    load();
  }, [propertyId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-teal-600" size={32} />
      </div>
    );
  }

  if (!form) {
    return (
      <div className="text-center py-20">
        <p className="text-red-600">{error || "Propiedad no encontrada"}</p>
        <button onClick={() => router.push("/dashboard/propiedades")} className="mt-4 text-sm text-teal-600 hover:underline">
          Volver a propiedades
        </button>
      </div>
    );
  }

  const update = <K extends keyof PropertyFormData>(key: K, value: PropertyFormData[K]) =>
    setForm((prev) => prev ? { ...prev, [key]: value } : prev);

  const updateAddress = (key: string, value: string) =>
    setForm((prev) => prev ? { ...prev, address: { ...prev.address, [key]: value } } : prev);

  const updateRules = (key: string, value: boolean | string) =>
    setForm((prev) => prev ? { ...prev, rules: { ...prev.rules, [key]: value } } : prev);

  const toggleAmenity = (id: string) =>
    setForm((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        amenities: prev.amenities.includes(id)
          ? prev.amenities.filter((a) => a !== id)
          : [...prev.amenities, id],
      };
    });

  const handleSave = async () => {
    setSaving(true);
    setError("");
    const result = await updateProperty(propertyId, form);
    if (result.error) {
      setError(result.error);
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
    setSaving(false);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <button onClick={() => router.push("/dashboard/propiedades")} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-2">
            <ArrowLeft size={14} /> Volver
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Editar propiedad</h1>
        </div>
        <div className="flex items-center gap-2">
          {saved && <span className="text-sm text-green-600 flex items-center gap-1"><Check size={14} /> Guardado</span>}
          <Button onClick={handleSave} loading={saving}>Guardar cambios</Button>
        </div>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-1 mb-8 overflow-x-auto pb-2">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          const active = i === step;
          return (
            <button
              key={i}
              onClick={() => setStep(i)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                active
                  ? "bg-teal-600 text-white"
                  : "bg-gray-50 text-gray-500 cursor-pointer hover:bg-gray-100"
              }`}
            >
              <Icon size={14} />
              {s.label}
            </button>
          );
        })}
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 min-h-[300px]">
        {/* Step 0: Type */}
        {step === 0 && (
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Titulo *</label>
              <input type="text" value={form.title} onChange={(e) => update("title", e.target.value)} maxLength={100} className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
              <p className="text-xs text-gray-400 mt-1">{form.title.length}/100</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descripcion</label>
              <textarea value={form.description} onChange={(e) => update("description", e.target.value)} rows={4} className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de propiedad</label>
                <select value={form.property_type} onChange={(e) => update("property_type", e.target.value as PropertyType)} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500">
                  {(Object.entries(PROPERTY_TYPE_LABELS) as [PropertyType, string][]).map(([val, label]) => (
                    <option key={val} value={val}>{label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de espacio</label>
                <select value={form.space_type} onChange={(e) => update("space_type", e.target.value as SpaceType)} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500">
                  {(Object.entries(SPACE_TYPE_LABELS) as [SpaceType, string][]).map(([val, label]) => (
                    <option key={val} value={val}>{label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Step 1: Location */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Ubicacion</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Calle</label>
                <input type="text" value={form.address.street} onChange={(e) => updateAddress("street", e.target.value)} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Numero</label>
                <input type="text" value={form.address.number} onChange={(e) => updateAddress("number", e.target.value)} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Comuna *</label>
                <input type="text" value={form.address.commune} onChange={(e) => updateAddress("commune", e.target.value)} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Region *</label>
                <select value={form.address.region} onChange={(e) => updateAddress("region", e.target.value)} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500">
                  <option value="">Selecciona</option>
                  {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Details */}
        {step === 2 && (
          <div className="space-y-5">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Detalles</h2>
            {([["max_guests", "Huespedes maximos", 1, 20], ["bedrooms", "Dormitorios", 0, 20], ["beds", "Camas", 1, 30], ["bathrooms", "Banos", 1, 10]] as const).map(([key, label, min, max]) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-sm text-gray-700">{label}</span>
                <div className="flex items-center gap-3">
                  <button onClick={() => update(key, Math.max(min, form[key] - 1))} className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:border-teal-300">-</button>
                  <span className="w-8 text-center font-medium text-gray-900">{form[key]}</span>
                  <button onClick={() => update(key, Math.min(max, form[key] + 1))} className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:border-teal-300">+</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Step 3: Amenities */}
        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Servicios</h2>
            {["Esenciales", "Estacionamiento", "Exterior", "Seguridad", "Mascotas"].map((group) => (
              <div key={group}>
                <h3 className="text-sm font-medium text-gray-500 mb-2">{group}</h3>
                <div className="flex flex-wrap gap-2">
                  {AMENITIES.filter((a) => a.group === group).map((a) => (
                    <button key={a.id} onClick={() => toggleAmenity(a.id)} className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${form.amenities.includes(a.id) ? "bg-teal-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                      {a.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Step 4: Pricing */}
        {step === 4 && (
          <div className="space-y-5">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Precios (CLP)</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Precio por noche *</label>
                <input type="number" value={form.base_price} onChange={(e) => update("base_price", Number(e.target.value))} min={5000} step={1000} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fin de semana</label>
                <input type="number" value={form.weekend_price ?? ""} onChange={(e) => update("weekend_price", e.target.value ? Number(e.target.value) : null)} placeholder="Opcional" min={0} step={1000} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Limpieza</label>
                <input type="number" value={form.cleaning_fee} onChange={(e) => update("cleaning_fee", Number(e.target.value))} min={0} step={1000} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deposito garantia</label>
                <input type="number" value={form.security_deposit} onChange={(e) => update("security_deposit", Number(e.target.value))} min={0} step={5000} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Rules */}
        {step === 5 && (
          <div className="space-y-5">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Reglas y politicas</h2>
            <div className="space-y-3">
              {([["no_smoking", "No fumar"], ["no_pets", "No mascotas"], ["no_parties", "No fiestas"]] as const).map(([key, label]) => (
                <label key={key} className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={form.rules[key] ?? false} onChange={(e) => updateRules(key, e.target.checked)} className="rounded border-gray-300 text-teal-600 focus:ring-teal-500" />
                  <span className="text-sm text-gray-700">{label}</span>
                </label>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Politica cancelacion</label>
                <select value={form.cancellation_policy} onChange={(e) => update("cancellation_policy", e.target.value as CancellationPolicy)} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500">
                  {(Object.entries(CANCELLATION_POLICY_LABELS) as [CancellationPolicy, string][]).map(([val, label]) => (
                    <option key={val} value={val}>{label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="flex items-center gap-3 cursor-pointer mt-6">
                  <input type="checkbox" checked={form.instant_booking} onChange={(e) => update("instant_booking", e.target.checked)} className="rounded border-gray-300 text-teal-600 focus:ring-teal-500" />
                  <span className="text-sm text-gray-700">Reserva instantanea</span>
                </label>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Min noches</label>
                <input type="number" value={form.min_nights} onChange={(e) => update("min_nights", Number(e.target.value))} min={1} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max noches</label>
                <input type="number" value={form.max_nights ?? ""} onChange={(e) => update("max_nights", e.target.value ? Number(e.target.value) : null)} placeholder="Sin limite" min={1} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Check-in</label>
                <input type="time" value={form.check_in_time} onChange={(e) => update("check_in_time", e.target.value)} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Check-out</label>
                <input type="time" value={form.check_out_time} onChange={(e) => update("check_out_time", e.target.value)} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
              </div>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">{error}</div>
      )}

      <div className="flex items-center justify-between mt-6">
        <button onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 disabled:opacity-30">
          <ArrowLeft size={16} /> Anterior
        </button>
        <div className="flex items-center gap-2">
          {step < STEPS.length - 1 && (
            <button onClick={() => setStep(step + 1)} className="flex items-center gap-1 text-sm text-teal-600 hover:text-teal-700 font-medium">
              Siguiente <ArrowRight size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
