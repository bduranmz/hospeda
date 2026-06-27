import Link from "next/link";
import { MapPin, Home } from "lucide-react";

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-6">
      {/* Illustration */}
      <div className="relative mb-8">
        {/* Outer ring */}
        <div className="w-40 h-40 rounded-full bg-teal-50 flex items-center justify-center">
          {/* Inner ring */}
          <div className="w-24 h-24 rounded-full bg-teal-100 flex items-center justify-center">
            <MapPin size={40} className="text-teal-500" strokeWidth={1.5} />
          </div>
        </div>
        {/* Floating badge */}
        <div className="absolute -top-2 -right-2 w-10 h-10 bg-amber-400 rounded-full flex items-center justify-center shadow-md">
          <span className="text-white font-bold text-sm leading-none">?</span>
        </div>
      </div>

      {/* Text */}
      <h1 className="text-6xl font-bold text-teal-600 mb-2">404</h1>
      <h2 className="text-xl font-semibold text-gray-900 mb-3">
        Página no encontrada
      </h2>
      <p className="text-gray-500 text-sm text-center max-w-xs mb-8">
        La página que buscas no existe o fue movida. Puede que la URL esté
        incorrecta.
      </p>

      {/* CTA */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 text-white font-medium rounded-xl hover:bg-teal-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 shadow-sm"
      >
        <Home size={18} />
        Volver al inicio
      </Link>

      {/* Secondary link */}
      <Link
        href="/propiedades"
        className="mt-3 text-sm text-teal-600 hover:text-teal-700 hover:underline transition-colors"
      >
        Ver propiedades disponibles
      </Link>
    </main>
  );
}
