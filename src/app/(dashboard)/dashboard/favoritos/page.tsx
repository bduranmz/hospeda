import { getFavorites } from "@/lib/actions/favorites";
import { Heart, MapPin, Users } from "lucide-react";
import Link from "next/link";

export default async function FavoritosPage() {
  const favorites = await getFavorites();

  return (
    <main className="p-6 lg:p-8 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Favoritos</h1>
        <p className="text-sm text-gray-500 mt-1">{favorites.length} propiedades guardadas</p>
      </div>

      {favorites.length === 0 ? (
        <div className="text-center py-16">
          <Heart size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 mb-4">Aun no tienes propiedades guardadas</p>
          <Link
            href="/propiedades"
            className="inline-block bg-teal-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-teal-700 transition"
          >
            Explorar propiedades
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {favorites.map((fav) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const property = fav.properties as any;
            if (!property) return null;
            const cover = property.property_photos?.find((p: { is_cover: boolean }) => p.is_cover)?.url
              || property.property_photos?.[0]?.url;
            const address = property.address;

            return (
              <Link
                key={fav.id}
                href={`/propiedades/${property.id}`}
                className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow group"
              >
                <div className="relative aspect-[4/3] bg-gray-100">
                  {cover ? (
                    <img src={cover} alt={property.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <Heart size={32} />
                    </div>
                  )}
                  <div className="absolute top-3 right-3 p-2 rounded-full bg-white/90 text-rose-500">
                    <Heart size={16} fill="currentColor" />
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-medium text-gray-900 truncate group-hover:text-teal-600 transition-colors">
                    {property.title}
                  </h3>
                  {address && (
                    <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                      <MapPin size={14} /> {address.commune}, {address.region}
                    </p>
                  )}
                  <div className="flex items-center justify-between mt-3">
                    <p className="text-sm font-semibold text-gray-900">
                      ${property.base_price?.toLocaleString("es-CL")} <span className="font-normal text-gray-500">/ noche</span>
                    </p>
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                      <Users size={12} /> {property.max_guests}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
