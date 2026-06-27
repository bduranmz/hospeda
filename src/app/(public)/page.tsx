import Link from "next/link";
import {
  Search,
  Shield,
  UserCheck,
  MapPin,
  Calendar,
  Home,
  ArrowRight,
} from "lucide-react";

export default function HomePage() {
  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative bg-gradient-to-br from-teal-50 via-white to-cyan-50 pt-20 pb-28 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight tracking-tight">
            Encuentra tu lugar{" "}
            <span className="text-teal-600">en Chile</span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Arriendos temporales y vacacionales verificados en todo el país.
            Desde apartamentos en Santiago hasta cabañas en la Patagonia.
          </p>

          {/* Search bar */}
          <div className="mt-10 bg-white rounded-2xl shadow-lg border border-gray-100 p-3 flex flex-col sm:flex-row gap-3 max-w-3xl mx-auto">
            <div className="flex items-center gap-2 flex-1 px-3 py-2 rounded-xl bg-gray-50 border border-gray-200">
              <MapPin className="text-teal-600 shrink-0" size={18} />
              <input
                type="text"
                placeholder="¿A dónde vas?"
                className="bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none w-full"
              />
            </div>
            <div className="flex items-center gap-2 flex-1 px-3 py-2 rounded-xl bg-gray-50 border border-gray-200">
              <Calendar className="text-teal-600 shrink-0" size={18} />
              <input
                type="text"
                placeholder="Fechas de arriendo"
                className="bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none w-full"
              />
            </div>
            <div className="flex items-center gap-2 flex-1 px-3 py-2 rounded-xl bg-gray-50 border border-gray-200">
              <Home className="text-teal-600 shrink-0" size={18} />
              <input
                type="text"
                placeholder="Huéspedes"
                className="bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none w-full"
              />
            </div>
            <button className="flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm px-6 py-3 rounded-xl transition-colors shrink-0">
              <Search size={16} />
              Buscar
            </button>
          </div>

          {/* CTA buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/propiedades"
              className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold px-8 py-3.5 rounded-xl transition-colors text-base"
            >
              Explorar propiedades
              <ArrowRight size={18} />
            </Link>
            <Link
              href="/publicar"
              className="inline-flex items-center gap-2 border border-teal-600 text-teal-600 hover:bg-teal-50 font-semibold px-8 py-3.5 rounded-xl transition-colors text-base"
            >
              Publica tu propiedad
            </Link>
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────── */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Por qué elegir Hospeda
            </h2>
            <p className="mt-3 text-gray-500 text-lg max-w-xl mx-auto">
              Diseñado para que anfitriones y huéspedes confíen en cada arriendo.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="group p-8 rounded-2xl border border-gray-100 hover:border-teal-200 hover:shadow-md transition-all bg-white">
              <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center mb-5 group-hover:bg-teal-100 transition-colors">
                <Search className="text-teal-600" size={24} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Búsqueda fácil
              </h3>
              <p className="text-gray-500 leading-relaxed text-sm">
                Filtra por destino, fechas, precio y tipo de propiedad. Encuentra
                exactamente lo que buscas en segundos.
              </p>
            </div>

            {/* Card 2 */}
            <div className="group p-8 rounded-2xl border border-gray-100 hover:border-teal-200 hover:shadow-md transition-all bg-white">
              <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center mb-5 group-hover:bg-teal-100 transition-colors">
                <Shield className="text-teal-600" size={24} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Pagos seguros
              </h3>
              <p className="text-gray-500 leading-relaxed text-sm">
                Paga con Webpay o transferencia. Tu dinero está protegido hasta
                que confirmes tu llegada a la propiedad.
              </p>
            </div>

            {/* Card 3 */}
            <div className="group p-8 rounded-2xl border border-gray-100 hover:border-teal-200 hover:shadow-md transition-all bg-white">
              <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center mb-5 group-hover:bg-teal-100 transition-colors">
                <UserCheck className="text-teal-600" size={24} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Verificación de identidad
              </h3>
              <p className="text-gray-500 leading-relaxed text-sm">
                Todos los usuarios pasan por un proceso de verificación. Arrienda
                con tranquilidad sabiendo con quién tratas.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────── */}
      <section className="py-24 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Cómo funciona
            </h2>
            <p className="mt-3 text-gray-500 text-lg">
              Reserva tu alojamiento en tres simples pasos.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 relative">
            {/* Connector line (desktop) */}
            <div className="hidden sm:block absolute top-9 left-1/6 right-1/6 h-0.5 bg-teal-100" />

            {/* Step 1 */}
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-teal-600 rounded-2xl flex items-center justify-center mb-5 shadow-lg shadow-teal-100 relative z-10">
                <Search className="text-white" size={28} />
              </div>
              <span className="text-xs font-semibold uppercase tracking-widest text-teal-600 mb-1">
                Paso 1
              </span>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Busca</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Ingresa tu destino y fechas. Explora cientos de propiedades
                verificadas en todo Chile.
              </p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-teal-600 rounded-2xl flex items-center justify-center mb-5 shadow-lg shadow-teal-100 relative z-10">
                <Calendar className="text-white" size={28} />
              </div>
              <span className="text-xs font-semibold uppercase tracking-widest text-teal-600 mb-1">
                Paso 2
              </span>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Reserva</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Selecciona las fechas, confirma los detalles y paga de forma
                segura con Webpay o transferencia.
              </p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-teal-600 rounded-2xl flex items-center justify-center mb-5 shadow-lg shadow-teal-100 relative z-10">
                <Home className="text-white" size={28} />
              </div>
              <span className="text-xs font-semibold uppercase tracking-widest text-teal-600 mb-1">
                Paso 3
              </span>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Disfruta</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Llega a tu alojamiento y vive la experiencia. Nuestro equipo
                está disponible ante cualquier inconveniente.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA anfitriones ──────────────────────────────────── */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-teal-600 to-teal-700 rounded-3xl px-8 py-14 text-center text-white shadow-xl shadow-teal-100">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              ¿Tienes una propiedad?
            </h2>
            <p className="text-teal-100 text-lg max-w-xl mx-auto leading-relaxed mb-8">
              Únete a cientos de anfitriones que ya generan ingresos extra
              arrendando sus propiedades en Hospeda.
            </p>
            <Link
              href="/publicar"
              className="inline-flex items-center gap-2 bg-white text-teal-700 hover:bg-teal-50 font-semibold px-8 py-3.5 rounded-xl transition-colors text-base"
            >
              Publica tu propiedad gratis
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
