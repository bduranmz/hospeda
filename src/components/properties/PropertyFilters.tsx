"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState, useTransition } from "react";
import {
  Search,
  SlidersHorizontal,
  X,
  ChevronDown,
} from "lucide-react";
import {
  PROPERTY_TYPE_LABELS,
  SPACE_TYPE_LABELS,
  type PropertyType,
  type SpaceType,
} from "@/types/database";

const SORT_OPTIONS = [
  { value: "newest", label: "Más recientes" },
  { value: "price_asc", label: "Menor precio" },
  { value: "price_desc", label: "Mayor precio" },
  { value: "rating", label: "Mejor evaluados" },
] as const;

const REGIONS = [
  "Arica y Parinacota",
  "Tarapacá",
  "Antofagasta",
  "Atacama",
  "Coquimbo",
  "Valparaíso",
  "Metropolitana",
  "O'Higgins",
  "Maule",
  "Ñuble",
  "Biobío",
  "Araucanía",
  "Los Ríos",
  "Los Lagos",
  "Aysén",
  "Magallanes",
];

export default function PropertyFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [showFilters, setShowFilters] = useState(false);

  const current = {
    query: searchParams.get("q") ?? "",
    propertyType: searchParams.get("tipo") ?? "",
    spaceType: searchParams.get("espacio") ?? "",
    region: searchParams.get("region") ?? "",
    guests: searchParams.get("huespedes") ?? "",
    minPrice: searchParams.get("min") ?? "",
    maxPrice: searchParams.get("max") ?? "",
    sortBy: searchParams.get("orden") ?? "newest",
    instantBooking: searchParams.get("instantanea") === "1",
  };

  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, val] of Object.entries(updates)) {
        if (val) {
          params.set(key, val);
        } else {
          params.delete(key);
        }
      }
      // Reset page on filter change
      params.delete("pagina");
      startTransition(() => {
        router.push(`/propiedades?${params.toString()}`);
      });
    },
    [router, searchParams]
  );

  const clearAll = useCallback(() => {
    startTransition(() => {
      router.push("/propiedades");
    });
  }, [router]);

  const hasFilters =
    current.propertyType ||
    current.spaceType ||
    current.region ||
    current.guests ||
    current.minPrice ||
    current.maxPrice ||
    current.instantBooking;

  return (
    <div className="space-y-4">
      {/* Search bar + sort */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Buscar por nombre o ubicación..."
            defaultValue={current.query}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                updateParams({ q: (e.target as HTMLInputElement).value });
              }
            }}
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>

        {/* Sort */}
        <div className="relative">
          <select
            value={current.sortBy}
            onChange={(e) => updateParams({ orden: e.target.value })}
            className="appearance-none pl-4 pr-9 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown
            size={14}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
        </div>

        {/* Toggle filters */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm border rounded-xl transition-colors ${
            showFilters || hasFilters
              ? "border-teal-300 bg-teal-50 text-teal-700"
              : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
          }`}
        >
          <SlidersHorizontal size={14} />
          Filtros
          {hasFilters && (
            <span className="w-2 h-2 bg-teal-500 rounded-full" />
          )}
        </button>
      </div>

      {/* Expandable filters */}
      {showFilters && (
        <div className="bg-white border border-gray-200 rounded-2xl p-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {/* Property type */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">
              Tipo de propiedad
            </label>
            <select
              value={current.propertyType}
              onChange={(e) => updateParams({ tipo: e.target.value })}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="">Todas</option>
              {(Object.entries(PROPERTY_TYPE_LABELS) as [PropertyType, string][]).map(
                ([val, label]) => (
                  <option key={val} value={val}>
                    {label}
                  </option>
                )
              )}
            </select>
          </div>

          {/* Space type */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">
              Tipo de espacio
            </label>
            <select
              value={current.spaceType}
              onChange={(e) => updateParams({ espacio: e.target.value })}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="">Todos</option>
              {(Object.entries(SPACE_TYPE_LABELS) as [SpaceType, string][]).map(
                ([val, label]) => (
                  <option key={val} value={val}>
                    {label}
                  </option>
                )
              )}
            </select>
          </div>

          {/* Region */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">
              Región
            </label>
            <select
              value={current.region}
              onChange={(e) => updateParams({ region: e.target.value })}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="">Todas</option>
              {REGIONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {/* Guests */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">
              Huéspedes
            </label>
            <select
              value={current.guests}
              onChange={(e) => updateParams({ huespedes: e.target.value })}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="">Cualquier</option>
              {[1, 2, 3, 4, 5, 6, 8, 10, 12].map((n) => (
                <option key={n} value={n}>
                  {n}+
                </option>
              ))}
            </select>
          </div>

          {/* Price min */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">
              Precio mínimo
            </label>
            <input
              type="number"
              placeholder="$"
              defaultValue={current.minPrice}
              onBlur={(e) => updateParams({ min: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === "Enter")
                  updateParams({ min: (e.target as HTMLInputElement).value });
              }}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Price max */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">
              Precio máximo
            </label>
            <input
              type="number"
              placeholder="$"
              defaultValue={current.maxPrice}
              onBlur={(e) => updateParams({ max: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === "Enter")
                  updateParams({ max: (e.target as HTMLInputElement).value });
              }}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Instant booking toggle + clear */}
          <div className="col-span-2 sm:col-span-3 lg:col-span-6 flex items-center justify-between pt-2 border-t border-gray-100">
            <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-600">
              <input
                type="checkbox"
                checked={current.instantBooking}
                onChange={(e) =>
                  updateParams({ instantanea: e.target.checked ? "1" : "" })
                }
                className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
              />
              Solo reserva instantánea
            </label>

            {hasFilters && (
              <button
                onClick={clearAll}
                className="flex items-center gap-1 text-sm text-gray-500 hover:text-red-500 transition-colors"
              >
                <X size={14} />
                Limpiar filtros
              </button>
            )}
          </div>
        </div>
      )}

      {/* Loading indicator */}
      {isPending && (
        <div className="text-center text-sm text-teal-600">Buscando...</div>
      )}
    </div>
  );
}
