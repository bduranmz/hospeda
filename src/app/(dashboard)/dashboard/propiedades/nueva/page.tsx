"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { createProperty } from "@/lib/actions/properties";
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

const initialForm: PropertyFormData = {
  title: "",
  description: "",
  property_type: "apartment",
  space_type: "entire",
  address: { street: "", number: "", commune: "", region: "", country: "Chile" },
  max_guests: 2,
  bedrooms: 1,
  beds: 1,
  bathrooms: 1,
  amenities: [],
  base_price: 30000,
  weekend_price: null,
  cleaning_fee: 0,
  security_deposit: 0,
  rules: { no_smoking: true, no_pets: false, no_parties: true },
  cancellation_policy: "moderate",
  instant_booking: false,
  min_nights: 1,
  max_nights: null,
  check_in_time: "15:00",
  check_out_time: "11:00",
};

export default function NuevaPropiedad() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<PropertyFormData>(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const update = <K extends keyof PropertyFormData>(
    key: K,
    value: PropertyFormData[K]
  ) => setForm((prev) => ({ ...prev, [key]: value }));

  const updateAddress = (key: string, value: string) =>
    setForm((prev) => ({
      ...prev,
      address: { ...prev.address, [key]: value },
    }));

  const updateRules = (key: string, value: boolean | string) =>
    setForm((prev) => ({
      ...prev,
      rules: { ...prev.rules, [key]: value },
    }));

  const toggleAmenity = (id: string) =>
    setForm((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(id)
        ? prev.amenities.filter((a) => a !== id)
        : [...prev.amenities, id],
    }));

  const canNext = () => {
    switch (step) {
      case 0:
        return form.title.trim().length >= 5;
      case 1:
        return form.address.commune.trim() && form.address.region;
      case 2:
        return form.max_guests >= 1;
      case 4:
        return form.base_price >= 5000;
      default:
        return true;
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    const result = await createProperty(form);
    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      router.push(`/dashboard/propiedades`);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Publicar propiedad
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Completa la información de tu propiedad en {STEPS.length} pasos.
        </p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-1 mb-8 overflow-x-auto pb-2">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          const done = i < step;
          const active = i === step;
          return (
            <button
              key={i}
              onClick={() => i < step && setStep(i)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                active
                  ? "bg-teal-600 text-white"
                  : done
                    ? "bg-teal-50 text-teal-700 cursor-pointer hover:bg-teal-100"
                    : "bg-gray-50 text-gray-400"
              }`}
            >
              {done ? <Check size={14} /> : <Icon size={14} />}
              {s.label}
            </button>
          );
        })}
      </div>

      {/* Step content */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 min-h-[300px]">
        {/* Step 0: Type */}
        {step === 0 && (
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Título de la publicación *
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => update("title", e.target.value)}
                placeholder="Ej: Departamento con vista al mar en Viña"
                maxLength={100}
                className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <p className="text-xs text-gray-400 mt-1">
                {form.title.length}/100 caracteres
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <textarea
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                rows={4}
                placeholder="Describe tu propiedad, el barrio, qué la hace especial..."
                className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de propiedad
                </label>
                <select
                  value={form.property_type}
                  onChange={(e) =>
                    update("property_type", e.target.value as PropertyType)
                  }
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  {(
                    Object.entries(PROPERTY_TYPE_LABELS) as [
                      PropertyType,
                      string,
                    ][]
                  ).map(([val, label]) => (
                    <option key={val} value={val}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de espacio
                </label>
                <select
                  value={form.space_type}
                  onChange={(e) =>
                    update("space_type", e.target.value as SpaceType)
                  }
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  {(
                    Object.entries(SPACE_TYPE_LABELS) as [SpaceType, string][]
                  ).map(([val, label]) => (
                    <option key={val} value={val}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Step 1: Location */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Ubicación de la propiedad
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Calle
                </label>
                <input
                  type="text"
                  value={form.address.street}
                  onChange={(e) => updateAddress("street", e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Número
                </label>
                <input
                  type="text"
                  value={form.address.number}
                  onChange={(e) => updateAddress("number", e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Comuna *
                </label>
                <input
                  type="text"
                  value={form.address.commune}
                  onChange={(e) => updateAddress("commune", e.target.value)}
                  placeholder="Ej: Providencia"
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Región *
                </label>
                <select
                  value={form.address.region}
                  onChange={(e) => updateAddress("region", e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="">Selecciona</option>
                  {REGIONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Depto / Piso (opcional)
              </label>
              <input
                type="text"
                value={form.address.apt ?? ""}
                onChange={(e) => updateAddress("apt", e.target.value)}
                placeholder="Ej: Depto 405"
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>
        )}

        {/* Step 2: Details */}
        {step === 2 && (
          <div className="space-y-5">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Detalles del espacio
            </h2>
            {(
              [
                ["max_guests", "Huéspedes máximos", 1, 20],
                ["bedrooms", "Dormitorios", 0, 20],
                ["beds", "Camas", 1, 30],
                ["bathrooms", "Baños", 1, 10],
              ] as const
            ).map(([key, label, min, max]) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-sm text-gray-700">{label}</span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() =>
                      update(key, Math.max(min, form[key] - 1))
                    }
                    className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:border-teal-300 hover:text-teal-600"
                  >
                    -
                  </button>
                  <span className="w-8 text-center font-medium text-gray-900">
                    {form[key]}
                  </span>
                  <button
                    onClick={() =>
                      update(key, Math.min(max, form[key] + 1))
                    }
                    className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:border-teal-300 hover:text-teal-600"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Step 3: Amenities */}
        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Servicios y comodidades
            </h2>
            {/* Group amenities */}
            {["Esenciales", "Estacionamiento", "Exterior", "Seguridad", "Mascotas"].map(
              (group) => (
                <div key={group}>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">
                    {group}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {AMENITIES.filter((a) => a.group === group).map((a) => (
                      <button
                        key={a.id}
                        onClick={() => toggleAmenity(a.id)}
                        className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                          form.amenities.includes(a.id)
                            ? "bg-teal-600 text-white"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {a.label}
                      </button>
                    ))}
                  </div>
                </div>
              )
            )}
          </div>
        )}

        {/* Step 4: Pricing */}
        {step === 4 && (
          <div className="space-y-5">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Precios (CLP)
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Precio por noche *
                </label>
                <input
                  type="number"
                  value={form.base_price}
                  onChange={(e) =>
                    update("base_price", Number(e.target.value))
                  }
                  min={5000}
                  step={1000}
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Precio fin de semana
                </label>
                <input
                  type="number"
                  value={form.weekend_price ?? ""}
                  onChange={(e) =>
                    update(
                      "weekend_price",
                      e.target.value ? Number(e.target.value) : null
                    )
                  }
                  placeholder="Opcional"
                  min={0}
                  step={1000}
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Limpieza
                </label>
                <input
                  type="number"
                  value={form.cleaning_fee}
                  onChange={(e) =>
                    update("cleaning_fee", Number(e.target.value))
                  }
                  min={0}
                  step={1000}
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Depósito de garantía
                </label>
                <input
                  type="number"
                  value={form.security_deposit}
                  onChange={(e) =>
                    update("security_deposit", Number(e.target.value))
                  }
                  min={0}
                  step={5000}
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Rules */}
        {step === 5 && (
          <div className="space-y-5">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Reglas y políticas
            </h2>

            <div className="space-y-3">
              {(
                [
                  ["no_smoking", "No se permite fumar"],
                  ["no_pets", "No se permiten mascotas"],
                  ["no_parties", "No se permiten fiestas"],
                ] as const
              ).map(([key, label]) => (
                <label
                  key={key}
                  className="flex items-center gap-3 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={form.rules[key] ?? false}
                    onChange={(e) => updateRules(key, e.target.checked)}
                    className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                  />
                  <span className="text-sm text-gray-700">{label}</span>
                </label>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Política de cancelación
                </label>
                <select
                  value={form.cancellation_policy}
                  onChange={(e) =>
                    update(
                      "cancellation_policy",
                      e.target.value as CancellationPolicy
                    )
                  }
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  {(
                    Object.entries(CANCELLATION_POLICY_LABELS) as [
                      CancellationPolicy,
                      string,
                    ][]
                  ).map(([val, label]) => (
                    <option key={val} value={val}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="flex items-center gap-3 cursor-pointer mt-6">
                  <input
                    type="checkbox"
                    checked={form.instant_booking}
                    onChange={(e) =>
                      update("instant_booking", e.target.checked)
                    }
                    className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                  />
                  <span className="text-sm text-gray-700">
                    Reserva instantánea
                  </span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Noches mínimas
                </label>
                <input
                  type="number"
                  value={form.min_nights}
                  onChange={(e) =>
                    update("min_nights", Number(e.target.value))
                  }
                  min={1}
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Noches máximas
                </label>
                <input
                  type="number"
                  value={form.max_nights ?? ""}
                  onChange={(e) =>
                    update(
                      "max_nights",
                      e.target.value ? Number(e.target.value) : null
                    )
                  }
                  placeholder="Sin límite"
                  min={1}
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Check-in
                </label>
                <input
                  type="time"
                  value={form.check_in_time}
                  onChange={(e) => update("check_in_time", e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Check-out
                </label>
                <input
                  type="time"
                  value={form.check_out_time}
                  onChange={(e) => update("check_out_time", e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between mt-6">
        <button
          onClick={() => setStep(Math.max(0, step - 1))}
          disabled={step === 0}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ArrowLeft size={16} />
          Anterior
        </button>

        {step < STEPS.length - 1 ? (
          <Button
            onClick={() => setStep(step + 1)}
            disabled={!canNext()}
          >
            <span className="flex items-center gap-1">
              Siguiente
              <ArrowRight size={16} />
            </span>
          </Button>
        ) : (
          <Button onClick={handleSubmit} loading={loading}>
            Crear propiedad
          </Button>
        )}
      </div>
    </div>
  );
}
