import { Suspense } from "react";
import { Compass, TrendingUp, MapPin, Search } from "lucide-react";
import { getFeed, getTrendingTags } from "@/lib/actions/experiences";
import ExperienceCard from "@/components/social/ExperienceCard";

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export const metadata = {
  title: "Explorar experiencias | Hospeda",
  description:
    "Descubre experiencias de viaje reales en Chile. Lee, comparte y conecta con viajeros.",
};

export default async function ExplorarPage({ searchParams }: PageProps) {
  const raw = await searchParams;
  const page = raw.pagina ? Number(raw.pagina) : 1;
  const tag = typeof raw.tag === "string" ? raw.tag : undefined;
  const region = typeof raw.region === "string" ? raw.region : undefined;

  const { experiences, total, followingIds } = await getFeed(page);
  const trending = await getTrendingTags();

  const totalPages = Math.ceil(total / 12);

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center gap-3 mb-2">
            <Compass className="w-8 h-8 text-teal-600" />
            <h1 className="text-3xl font-bold text-gray-900 font-[family-name:var(--font-heading)]">
              Explorar experiencias
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            Descubre lo que otros viajeros viven en Chile
          </p>

          {/* Search bar */}
          <div className="mt-6 flex gap-3">
            <div className="relative flex-1 max-w-lg">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar experiencias, destinos, tags..."
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Main feed */}
          <div className="flex-1">
            {/* Tab selector */}
            <div className="flex gap-4 mb-6">
              <button className="px-4 py-2 rounded-full bg-teal-600 text-white text-sm font-medium">
                Para ti
              </button>
              <button className="px-4 py-2 rounded-full bg-gray-100 text-gray-600 text-sm font-medium hover:bg-gray-200 transition">
                Siguiendo
              </button>
              <button className="px-4 py-2 rounded-full bg-gray-100 text-gray-600 text-sm font-medium hover:bg-gray-200 transition">
                Trending
              </button>
            </div>

            {experiences.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border">
                <Compass className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">
                  Aun no hay experiencias
                </h3>
                <p className="text-gray-400 mb-4">
                  Se el primero en compartir tu viaje
                </p>
                <a
                  href="/dashboard/experiencias/nueva"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition font-medium"
                >
                  Compartir experiencia
                </a>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {experiences.map((exp: Record<string, unknown>) => (
                  <ExperienceCard
                    key={exp.id as string}
                    experience={exp}
                    isFollowing={followingIds.includes(
                      (exp.profiles as Record<string, unknown>)?.id as string
                    )}
                  />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (p) => (
                    <a
                      key={p}
                      href={`/explorar?pagina=${p}${tag ? `&tag=${tag}` : ""}${region ? `&region=${region}` : ""}`}
                      className={`w-10 h-10 flex items-center justify-center rounded-lg text-sm font-medium transition ${
                        p === page
                          ? "bg-teal-600 text-white"
                          : "bg-white border text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {p}
                    </a>
                  )
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="hidden lg:block w-80 shrink-0 space-y-6">
            {/* CTA */}
            <div className="bg-gradient-to-br from-teal-500 to-teal-700 rounded-2xl p-6 text-white">
              <h3 className="text-lg font-bold mb-2">
                Comparte tu experiencia
              </h3>
              <p className="text-teal-100 text-sm mb-4">
                Inspira a otros viajeros con tus historias
              </p>
              <a
                href="/dashboard/experiencias/nueva"
                className="inline-block px-5 py-2.5 bg-white text-teal-700 rounded-xl font-medium hover:bg-teal-50 transition"
              >
                Publicar
              </a>
            </div>

            {/* Trending tags */}
            {trending.length > 0 && (
              <div className="bg-white rounded-2xl border p-6">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-5 h-5 text-teal-600" />
                  <h3 className="font-semibold text-gray-900">Trending</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {trending.map(
                    (t: { tag: string; count: number }) => (
                      <a
                        key={t.tag}
                        href={`/explorar?tag=${t.tag}`}
                        className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-teal-50 hover:text-teal-700 transition"
                      >
                        #{t.tag}
                        <span className="text-gray-400 ml-1">{t.count}</span>
                      </a>
                    )
                  )}
                </div>
              </div>
            )}

            {/* Popular destinations */}
            <div className="bg-white rounded-2xl border p-6">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-teal-600" />
                <h3 className="font-semibold text-gray-900">
                  Destinos populares
                </h3>
              </div>
              <div className="space-y-3">
                {[
                  "Pucon",
                  "Valparaiso",
                  "San Pedro de Atacama",
                  "Puerto Varas",
                  "Vina del Mar",
                  "Santiago",
                ].map((dest) => (
                  <a
                    key={dest}
                    href={`/explorar?region=${encodeURIComponent(dest)}`}
                    className="flex items-center gap-2 text-gray-600 hover:text-teal-600 transition"
                  >
                    <MapPin className="w-4 h-4" />
                    {dest}
                  </a>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
