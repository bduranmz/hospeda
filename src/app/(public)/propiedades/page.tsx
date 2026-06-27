import { Suspense } from "react";
import { Home } from "lucide-react";
import { searchProperties, type PropertySearchParams } from "@/lib/queries/properties";
import type { PropertyType, SpaceType } from "@/types/database";
import PropertyCard from "@/components/properties/PropertyCard";
import PropertyFilters from "@/components/properties/PropertyFilters";
import Pagination from "@/components/properties/Pagination";

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function parseSearchParams(
  raw: Record<string, string | string[] | undefined>
): PropertySearchParams {
  const str = (key: string) => {
    const v = raw[key];
    return typeof v === "string" ? v : undefined;
  };
  const num = (key: string) => {
    const v = str(key);
    return v ? Number(v) : undefined;
  };

  return {
    query: str("q"),
    propertyType: str("tipo") as PropertyType | undefined,
    spaceType: str("espacio") as SpaceType | undefined,
    minPrice: num("min"),
    maxPrice: num("max"),
    guests: num("huespedes"),
    region: str("region"),
    instantBooking: str("instantanea") === "1",
    sortBy: (str("orden") as PropertySearchParams["sortBy"]) ?? "newest",
    page: num("pagina") ?? 1,
  };
}

export const metadata = {
  title: "Explorar propiedades | Hospeda",
  description:
    "Encuentra arriendos temporales y vacacionales en todo Chile. Casas, departamentos, cabañas y más.",
};

export default async function PropiedadesPage({ searchParams }: PageProps) {
  const raw = await searchParams;
  const params = parseSearchParams(raw);
  const { properties, total, page, perPage } = await searchProperties(params);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Explorar propiedades
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          {total > 0
            ? `${total} propiedad${total !== 1 ? "es" : ""} encontrada${total !== 1 ? "s" : ""}`
            : "Busca tu próximo arriendo en Chile"}
        </p>
      </div>

      {/* Filters */}
      <Suspense fallback={null}>
        <PropertyFilters />
      </Suspense>

      {/* Results grid */}
      {properties.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
            {properties.map((p) => (
              <PropertyCard key={p.id} property={p} />
            ))}
          </div>

          <Suspense fallback={null}>
            <Pagination total={total} page={page} perPage={perPage} />
          </Suspense>
        </>
      ) : (
        <div className="text-center py-24">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Home className="text-gray-300" size={32} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            No se encontraron propiedades
          </h3>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            Intenta ajustar los filtros o busca en otra ubicación. Nuevas
            propiedades se publican todos los días.
          </p>
        </div>
      )}
    </section>
  );
}
