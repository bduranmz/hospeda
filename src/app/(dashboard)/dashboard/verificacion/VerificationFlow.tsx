"use client";

import { useState, useTransition } from "react";
import { submitVerification, validateRUT } from "@/lib/actions/verification";
import type { IdentityDocumentType } from "@/types/database";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Step = 1 | 2 | 3 | 4;

interface FormData {
  documentType: IdentityDocumentType;
  documentNumber: string;
  fullName: string;
  dateOfBirth: string;
  frontImageUrl: string;
  backImageUrl: string;
  selfieUrl: string;
}

// ---------------------------------------------------------------------------
// Step labels
// ---------------------------------------------------------------------------

const STEPS: { number: Step; label: string }[] = [
  { number: 1, label: "Datos personales" },
  { number: 2, label: "Documento" },
  { number: 3, label: "Selfie" },
  { number: 4, label: "Revisión" },
];

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function StepIndicator({
  current,
  total,
}: {
  current: Step;
  total: number;
}) {
  return (
    <nav aria-label="Pasos de verificación" className="mb-8">
      <ol className="flex items-center">
        {STEPS.map((step, idx) => {
          const done = step.number < current;
          const active = step.number === current;
          return (
            <li
              key={step.number}
              className={`flex items-center ${idx < total - 1 ? "flex-1" : ""}`}
            >
              <div className="flex flex-col items-center gap-1">
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-colors
                    ${done ? "bg-teal-600 text-white" : active ? "bg-teal-600 text-white ring-4 ring-teal-100" : "bg-gray-100 text-gray-400"}`}
                >
                  {done ? "✓" : step.number}
                </span>
                <span
                  className={`text-xs hidden sm:block ${active ? "text-teal-700 font-medium" : done ? "text-teal-600" : "text-gray-400"}`}
                >
                  {step.label}
                </span>
              </div>
              {idx < total - 1 && (
                <div
                  className={`h-0.5 flex-1 mx-2 transition-colors ${done ? "bg-teal-600" : "bg-gray-200"}`}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function UploadPlaceholder({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <div className="relative rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-6 text-center hover:border-teal-400 transition-colors">
        <svg
          className="mx-auto h-10 w-10 text-gray-300 mb-2"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
          />
        </svg>
        <p className="text-sm text-gray-500">{hint}</p>
        <p className="mt-1 text-xs text-gray-400">
          JPG, PNG o PDF — máx. 5 MB
        </p>
        {/* URL input for placeholder — real upload uses Supabase Storage */}
        <input
          type="url"
          placeholder="URL del archivo (provisional)"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="mt-3 w-full rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-600 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function VerificationFlow() {
  const [step, setStep] = useState<Step>(1);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [rutError, setRutError] = useState<string | null>(null);

  const [form, setForm] = useState<FormData>({
    documentType: "rut",
    documentNumber: "",
    fullName: "",
    dateOfBirth: "",
    frontImageUrl: "",
    backImageUrl: "",
    selfieUrl: "",
  });

  const update = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (field === "documentNumber") setRutError(null);
  };

  // ---- Step 1 validation ----
  const validateStep1 = () => {
    if (!form.fullName.trim()) {
      setError("Ingresa tu nombre completo");
      return false;
    }
    if (!form.dateOfBirth) {
      setError("Ingresa tu fecha de nacimiento");
      return false;
    }
    if (form.documentType === "rut") {
      const valid = validateRUT(form.documentNumber);
      if (!valid) {
        setRutError("RUT inválido. Formato: 12.345.678-9");
        return false;
      }
    } else if (!form.documentNumber.trim()) {
      setError("Ingresa el número de documento");
      return false;
    }
    return true;
  };

  // ---- Step 2 validation ----
  const validateStep2 = () => {
    if (!form.frontImageUrl) {
      setError("Debes subir la imagen frontal del documento");
      return false;
    }
    if (!form.backImageUrl) {
      setError("Debes subir la imagen trasera del documento");
      return false;
    }
    return true;
  };

  // ---- Step 3 validation ----
  const validateStep3 = () => {
    if (!form.selfieUrl) {
      setError("Debes subir una selfie");
      return false;
    }
    return true;
  };

  const next = () => {
    setError(null);
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    if (step === 3 && !validateStep3()) return;
    setStep((s) => (s < 4 ? ((s + 1) as Step) : s));
  };

  const back = () => {
    setError(null);
    setStep((s) => (s > 1 ? ((s - 1) as Step) : s));
  };

  const handleSubmit = () => {
    setError(null);
    startTransition(async () => {
      const result = await submitVerification({
        documentType: form.documentType,
        documentNumber: form.documentNumber,
        frontImageUrl: form.frontImageUrl,
        backImageUrl: form.backImageUrl,
        selfieUrl: form.selfieUrl,
      });

      if (result?.error) {
        setError(result.error);
      } else {
        setSuccess(true);
      }
    });
  };

  // ---- Success state ----
  if (success) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-8 text-center">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
          <span className="text-2xl">✓</span>
        </div>
        <h2 className="text-lg font-semibold text-green-800">
          Solicitud enviada
        </h2>
        <p className="mt-2 text-sm text-green-700">
          Hemos recibido tus documentos. Revisaremos tu solicitud en 1-2 días
          hábiles y te notificaremos por correo electrónico.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <StepIndicator current={step} total={STEPS.length} />

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* ---- STEP 1: Personal data ---- */}
      {step === 1 && (
        <div className="space-y-5">
          <div>
            <h2 className="text-base font-semibold text-gray-900">
              Datos personales
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Ingresa tus datos tal como aparecen en tu documento de identidad.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre completo
            </label>
            <input
              type="text"
              value={form.fullName}
              onChange={(e) => update("fullName", e.target.value)}
              placeholder="Nombre y apellidos"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha de nacimiento
            </label>
            <input
              type="date"
              value={form.dateOfBirth}
              onChange={(e) => update("dateOfBirth", e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de documento
            </label>
            <select
              value={form.documentType}
              onChange={(e) =>
                update("documentType", e.target.value as IdentityDocumentType)
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
            >
              <option value="rut">Cédula de Identidad (RUT)</option>
              <option value="passport">Pasaporte</option>
              <option value="foreign_id">Documento extranjero</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {form.documentType === "rut"
                ? "RUT"
                : form.documentType === "passport"
                ? "Número de pasaporte"
                : "Número de documento"}
            </label>
            <input
              type="text"
              value={form.documentNumber}
              onChange={(e) => update("documentNumber", e.target.value)}
              placeholder={
                form.documentType === "rut" ? "12.345.678-9" : "Ej: A12345678"
              }
              className={`w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none focus:ring-1 ${
                rutError
                  ? "border-red-400 focus:border-red-500 focus:ring-red-400"
                  : "border-gray-300 focus:border-teal-500 focus:ring-teal-500"
              }`}
            />
            {rutError && (
              <p className="mt-1 text-xs text-red-600">{rutError}</p>
            )}
            {form.documentType === "rut" && (
              <p className="mt-1 text-xs text-gray-400">
                Ingresa el RUT con puntos y guión. Ej: 12.345.678-9
              </p>
            )}
          </div>
        </div>
      )}

      {/* ---- STEP 2: Document images ---- */}
      {step === 2 && (
        <div className="space-y-5">
          <div>
            <h2 className="text-base font-semibold text-gray-900">
              Fotografía del documento
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Sube fotos claras de ambos lados de tu{" "}
              {form.documentType === "rut"
                ? "cédula de identidad"
                : form.documentType === "passport"
                ? "pasaporte"
                : "documento"}
              . Asegúrate de que todos los datos sean legibles.
            </p>
          </div>

          <UploadPlaceholder
            label="Parte frontal"
            hint="Foto del frente de tu documento"
            value={form.frontImageUrl}
            onChange={(v) => update("frontImageUrl", v)}
          />

          <UploadPlaceholder
            label="Parte trasera"
            hint="Foto del reverso de tu documento"
            value={form.backImageUrl}
            onChange={(v) => update("backImageUrl", v)}
          />

          <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-3 text-xs text-yellow-800">
            Asegúrate de que las fotos sean nítidas, con buena iluminación y
            sin brillos. Los datos deben ser claramente legibles.
          </div>
        </div>
      )}

      {/* ---- STEP 3: Selfie ---- */}
      {step === 3 && (
        <div className="space-y-5">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Selfie</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Sube una selfie reciente sosteniendo tu documento de identidad
              junto a tu rostro. Ambos deben ser claramente visibles.
            </p>
          </div>

          <UploadPlaceholder
            label="Selfie con documento"
            hint="Foto tuya sosteniendo tu documento"
            value={form.selfieUrl}
            onChange={(v) => update("selfieUrl", v)}
          />

          <ul className="space-y-1.5 text-sm text-gray-600">
            {[
              "Mira directamente a la cámara",
              "Iluminación frontal, sin sombras",
              "Sin gorra ni gafas de sol",
              "Muestra el frente de tu documento junto a tu cara",
            ].map((tip) => (
              <li key={tip} className="flex items-start gap-2">
                <span className="flex-shrink-0 mt-0.5 text-teal-500">✓</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ---- STEP 4: Review ---- */}
      {step === 4 && (
        <div className="space-y-5">
          <div>
            <h2 className="text-base font-semibold text-gray-900">
              Resumen de tu solicitud
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Revisa la información antes de enviar. Puedes volver atrás para
              corregir cualquier dato.
            </p>
          </div>

          <div className="rounded-xl border border-gray-100 bg-gray-50 divide-y divide-gray-100">
            {[
              { label: "Nombre completo", value: form.fullName },
              { label: "Fecha de nacimiento", value: form.dateOfBirth },
              {
                label: "Tipo de documento",
                value:
                  form.documentType === "rut"
                    ? "Cédula de Identidad (RUT)"
                    : form.documentType === "passport"
                    ? "Pasaporte"
                    : "Documento extranjero",
              },
              {
                label:
                  form.documentType === "rut" ? "RUT" : "Número de documento",
                value: form.documentNumber,
              },
              {
                label: "Frontal documento",
                value: form.frontImageUrl ? "Cargado ✓" : "—",
              },
              {
                label: "Trasera documento",
                value: form.backImageUrl ? "Cargado ✓" : "—",
              },
              {
                label: "Selfie",
                value: form.selfieUrl ? "Cargada ✓" : "—",
              },
            ].map((row) => (
              <div
                key={row.label}
                className="flex justify-between px-4 py-3 text-sm"
              >
                <span className="text-gray-500">{row.label}</span>
                <span className="text-gray-900 font-medium">{row.value}</span>
              </div>
            ))}
          </div>

          <div className="rounded-lg bg-blue-50 border border-blue-200 p-4 text-sm text-blue-800">
            Al enviar esta solicitud, confirmo que la información y los
            documentos proporcionados son verdaderos y corresponden a mi
            identidad. Entiendo que proporcionar información falsa puede resultar
            en la suspensión de mi cuenta.
          </div>
        </div>
      )}

      {/* Navigation buttons */}
      <div className="mt-8 flex justify-between gap-3">
        <button
          type="button"
          onClick={back}
          disabled={step === 1 || isPending}
          className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Atrás
        </button>

        {step < 4 ? (
          <button
            type="button"
            onClick={next}
            className="rounded-lg bg-teal-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-teal-700 transition-colors"
          >
            Continuar
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isPending}
            className="rounded-lg bg-teal-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {isPending ? "Enviando…" : "Enviar solicitud"}
          </button>
        )}
      </div>
    </div>
  );
}
