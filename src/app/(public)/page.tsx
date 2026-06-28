import Link from "next/link";
import {
  Search,
  Shield,
  UserCheck,
  MapPin,
  Calendar,
  Users,
  ArrowRight,
  Star,
  Building2,
  Home,
  TreePine,
  Waves,
  Mountain,
  Dog,
  Flame,
  Umbrella,
  CheckCircle2,
  Compass,
  Heart,
  MessageCircle,
} from "lucide-react";

/* ── Data ─────────────────────────────────────────────── */

const categories = [
  { icon: Home, label: "Casas" },
  { icon: Building2, label: "Departamentos" },
  { icon: TreePine, label: "Cabanas" },
  { icon: Waves, label: "Frente al mar" },
  { icon: Mountain, label: "Montana" },
  { icon: Umbrella, label: "Piscina" },
  { icon: Dog, label: "Pet-friendly" },
  { icon: Flame, label: "Con chimenea" },
];

const destinations = [
  { name: "Santiago", region: "Region Metropolitana", count: 840, img: "https://images.unsplash.com/photo-1520637102912-2df6bb2aec6d?w=600&h=400&fit=crop" },
  { name: "Valparaiso", region: "Region de Valparaiso", count: 320, img: "https://images.unsplash.com/photo-1594498653385-d5172c532c00?w=600&h=400&fit=crop" },
  { name: "Pucon", region: "La Araucania", count: 210, img: "https://images.unsplash.com/photo-1601000938259-9e92002320b2?w=600&h=400&fit=crop" },
  { name: "Puerto Varas", region: "Los Lagos", count: 185, img: "https://images.unsplash.com/photo-1580619305218-8423a7ef79b4?w=600&h=400&fit=crop" },
  { name: "Vina del Mar", region: "Region de Valparaiso", count: 275, img: "https://images.unsplash.com/photo-1551966775-a4ddc8df052b?w=600&h=400&fit=crop" },
  { name: "San Pedro de Atacama", region: "Antofagasta", count: 95, img: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&h=400&fit=crop" },
];

const stats = [
  { value: "2.500+", label: "Propiedades verificadas" },
  { value: "15.000+", label: "Huespedes satisfechos" },
  { value: "4.8", label: "Rating promedio" },
  { value: "16", label: "Regiones de Chile" },
];

const testimonials = [
  { name: "Carolina M.", location: "Santiago", text: "Encontramos una cabana increible en Pucon. Todo el proceso fue rapido y seguro. Sin duda volvere a usar Hospeda.", rating: 5 },
  { name: "Felipe R.", location: "Concepcion", text: "Como anfitrion, la plataforma es muy facil de usar. Publique mi departamento y en una semana ya tenia reservas.", rating: 5 },
  { name: "Andrea L.", location: "Valparaiso", text: "Me encanto la transparencia. Fotos reales, resenas verificadas y pago seguro con Webpay. Muy recomendable.", rating: 5 },
];

const properties = [
  { title: "Cabana vista al lago", location: "Pucon", price: 65000, rating: 4.9, reviews: 28, badge: "Superhost", img: "https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?w=600&h=400&fit=crop" },
  { title: "Depto centro historico", location: "Valparaiso", price: 42000, rating: 4.7, reviews: 45, badge: "Nuevo", img: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&h=400&fit=crop" },
  { title: "Casa con piscina", location: "Vina del Mar", price: 89000, rating: 4.8, reviews: 12, badge: null, img: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=600&h=400&fit=crop" },
  { title: "Loft en Lastarria", location: "Santiago", price: 38000, rating: 4.6, reviews: 67, badge: "Superhost", img: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&h=400&fit=crop" },
];

/* ── Component ─────────────────────────────────────────── */

export default function HomePage() {
  return (
    <>
      {/* ── Hero ──────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=900&fit=crop')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/60" />

        <div className="relative max-w-5xl mx-auto px-4 pt-24 pb-32 sm:pt-32 sm:pb-40 text-center">
          <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight tracking-tight animate-fade-up">
            Encuentra tu lugar
            <br />
            <span className="text-teal-300">en Chile</span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed animate-fade-up animate-fade-up-delay-1">
            Arriendos temporales verificados en todo el pais.
            Desde departamentos en Santiago hasta cabanas en la Patagonia.
          </p>

          {/* Search bar */}
          <div className="mt-10 bg-white rounded-2xl shadow-2xl p-2 sm:p-3 flex flex-col sm:flex-row gap-2 max-w-3xl mx-auto animate-fade-up animate-fade-up-delay-2">
            <div className="flex items-center gap-2 flex-1 px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 hover:border-teal-200 transition-colors">
              <MapPin className="text-teal-600 shrink-0" size={18} />
              <input
                type="text"
                placeholder="Donde quieres ir?"
                className="bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none w-full"
              />
            </div>
            <div className="flex items-center gap-2 flex-1 px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 hover:border-teal-200 transition-colors">
              <Calendar className="text-teal-600 shrink-0" size={18} />
              <input
                type="text"
                placeholder="Check-in — Check-out"
                className="bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none w-full"
              />
            </div>
            <div className="flex items-center gap-2 sm:w-40 px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 hover:border-teal-200 transition-colors">
              <Users className="text-teal-600 shrink-0" size={18} />
              <input
                type="text"
                placeholder="Huespedes"
                className="bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none w-full"
              />
            </div>
            <Link
              href="/propiedades"
              className="flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm px-6 py-3 rounded-xl transition-colors shrink-0 shadow-lg shadow-teal-600/20"
            >
              <Search size={16} />
              Buscar
            </Link>
          </div>
        </div>
      </section>

      {/* ── Categories strip ──────────────────────────── */}
      <section className="border-b border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 py-5 flex gap-6 overflow-x-auto scrollbar-hide">
          {categories.map((cat) => (
            <Link
              key={cat.label}
              href={`/propiedades?type=${cat.label.toLowerCase()}`}
              className="flex flex-col items-center gap-1.5 min-w-[72px] group"
            >
              <div className="w-11 h-11 rounded-xl bg-gray-50 group-hover:bg-teal-50 flex items-center justify-center transition-colors border border-gray-100 group-hover:border-teal-200">
                <cat.icon className="text-gray-500 group-hover:text-teal-600 transition-colors" size={20} />
              </div>
              <span className="text-xs font-medium text-gray-500 group-hover:text-teal-600 transition-colors whitespace-nowrap">
                {cat.label}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Featured properties ───────────────────────── */}
      <section className="py-20 sm:py-24 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="font-heading text-2xl sm:text-3xl font-bold text-gray-900">
                Propiedades destacadas
              </h2>
              <p className="mt-2 text-gray-500">
                Alojamientos mejor evaluados por nuestros huespedes.
              </p>
            </div>
            <Link
              href="/propiedades"
              className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-teal-600 hover:text-teal-700 transition-colors"
            >
              Ver todas <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {properties.map((p) => (
              <div key={p.title} className="group cursor-pointer">
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-3">
                  <img
                    src={p.img}
                    alt={p.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {p.badge && (
                    <span className={`absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-lg ${
                      p.badge === "Superhost" ? "bg-white text-gray-900" : "bg-teal-600 text-white"
                    }`}>
                      {p.badge}
                    </span>
                  )}
                </div>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-heading font-semibold text-gray-900 group-hover:text-teal-600 transition-colors">
                      {p.title}
                    </h3>
                    <p className="text-sm text-gray-500 mt-0.5">{p.location}</p>
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <Star className="text-amber-400 fill-amber-400" size={14} />
                    <span className="font-semibold text-gray-900">{p.rating}</span>
                    <span className="text-gray-400">({p.reviews})</span>
                  </div>
                </div>
                <p className="mt-1.5 text-sm">
                  <span className="font-semibold text-gray-900">
                    ${p.price.toLocaleString("es-CL")}
                  </span>
                  <span className="text-gray-500"> / noche</span>
                </p>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center sm:hidden">
            <Link href="/propiedades" className="text-sm font-semibold text-teal-600">
              Ver todas las propiedades &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* ── Testimonials ──────────────────────────────── */}
      <section className="py-20 sm:py-24 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-gray-900">
              Lo que dicen nuestros usuarios
            </h2>
            <p className="mt-3 text-gray-500 text-lg">
              Miles de huespedes y anfitriones confian en Hospeda.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="bg-white rounded-2xl p-7 border border-gray-100 shadow-sm">
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="text-amber-400 fill-amber-400" size={16} />
                  ))}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed mb-5">
                  &ldquo;{t.text}&rdquo;
                </p>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{t.name}</p>
                  <p className="text-xs text-gray-400">{t.location}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Community experiences ────────────────────── */}
      <section className="py-20 sm:py-24 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-10">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Compass className="w-6 h-6 text-teal-600" />
                <span className="text-sm font-semibold text-teal-600 uppercase tracking-wider">
                  Comunidad
                </span>
              </div>
              <h2 className="font-heading text-2xl sm:text-3xl font-bold text-gray-900">
                Experiencias de viajeros
              </h2>
              <p className="mt-2 text-gray-500">
                Descubre lo que otros viajeros viven en Chile.
              </p>
            </div>
            <Link
              href="/explorar"
              className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-teal-600 hover:text-teal-700 transition-colors"
            >
              Ver todas <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "Amanecer en el desierto de Atacama",
                author: "Camila V.",
                location: "San Pedro de Atacama",
                text: "Ver las estrellas y despertar con el amanecer en el desierto fue una experiencia que no tiene precio. El hospedaje era sencillo pero perfecto para desconectar.",
                rating: 5,
                likes: 42,
                comments: 8,
                img: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&h=400&fit=crop",
                tags: ["desierto", "aventura", "naturaleza"],
              },
              {
                title: "Fin de semana en cabana con vista al lago",
                author: "Martin R.",
                location: "Pucon",
                text: "Escapada perfecta de fin de semana. La cabana tenia todo lo necesario, chimenea incluida. El lago Villarrica al atardecer es impresionante.",
                rating: 5,
                likes: 38,
                comments: 5,
                img: "https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?w=600&h=400&fit=crop",
                tags: ["cabana", "lago", "relax"],
              },
              {
                title: "Recorriendo los cerros de Valparaiso",
                author: "Sofia L.",
                location: "Valparaiso",
                text: "Los colores, el arte callejero, la comida... Valparaiso es una ciudad que se vive caminando. Nuestro depto estaba en el cerro Alegre, ubicacion inmejorable.",
                rating: 4,
                likes: 27,
                comments: 12,
                img: "https://images.unsplash.com/photo-1594498653385-d5172c532c00?w=600&h=400&fit=crop",
                tags: ["ciudad", "gastronomia", "pareja"],
              },
            ].map((exp) => (
              <div
                key={exp.title}
                className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={exp.img}
                    alt={exp.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span className="text-sm font-medium">{exp.rating}</span>
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 text-xs font-bold">
                      {exp.author[0]}
                    </div>
                    <span className="text-sm text-gray-600">{exp.author}</span>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {exp.location}
                    </span>
                  </div>
                  <h3 className="font-heading font-semibold text-gray-900 mb-2 line-clamp-1">
                    {exp.title}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-3">{exp.text}</p>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {exp.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-4 pt-3 border-t text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Heart className="w-4 h-4" />
                      {exp.likes}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="w-4 h-4" />
                      {exp.comments}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/explorar"
              className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-xl font-medium hover:bg-teal-700 transition shadow-lg shadow-teal-600/20"
            >
              <Compass className="w-4 h-4" />
              Explorar mas experiencias
            </Link>
          </div>
        </div>
      </section>

      {/* ── Social proof / Stats ──────────────────────── */}
      <section className="py-16 bg-teal-600">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {stats.map((s) => (
              <div key={s.label}>
                <p className="font-heading text-3xl sm:text-4xl font-extrabold text-white">
                  {s.value}
                </p>
                <p className="mt-1 text-sm text-teal-100 font-medium">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why Hospeda ───────────────────────────────── */}
      <section className="py-20 sm:py-24 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-gray-900">
              Por que elegir Hospeda
            </h2>
            <p className="mt-3 text-gray-500 text-lg max-w-xl mx-auto">
              Disenado para que anfitriones y huespedes confien en cada arriendo.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              {
                icon: Search,
                title: "Busqueda inteligente",
                desc: "Filtra por destino, fechas, precio y tipo. Encuentra exactamente lo que buscas en segundos.",
              },
              {
                icon: Shield,
                title: "Pagos seguros",
                desc: "Paga con Webpay o transferencia. Tu dinero esta protegido hasta que confirmes tu llegada.",
              },
              {
                icon: UserCheck,
                title: "Identidad verificada",
                desc: "Todos los usuarios pasan por verificacion. Arrienda con tranquilidad sabiendo con quien tratas.",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="group p-8 rounded-2xl border border-gray-100 hover:border-teal-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 bg-white"
              >
                <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center mb-5 group-hover:bg-teal-100 transition-colors">
                  <f.icon className="text-teal-600" size={24} />
                </div>
                <h3 className="font-heading text-xl font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-500 leading-relaxed text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ──────────────────────────────── */}
      <section className="py-20 sm:py-24 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-gray-900">
              Como funciona
            </h2>
            <p className="mt-3 text-gray-500 text-lg">
              Reserva tu alojamiento en tres simples pasos.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">
            {[
              { icon: Search, step: "1", title: "Busca", desc: "Ingresa tu destino y fechas. Explora cientos de propiedades verificadas en todo Chile." },
              { icon: Calendar, step: "2", title: "Reserva", desc: "Selecciona las fechas, confirma los detalles y paga de forma segura." },
              { icon: CheckCircle2, step: "3", title: "Disfruta", desc: "Llega a tu alojamiento y vive la experiencia. Nuestro equipo esta disponible ante cualquier inconveniente." },
            ].map((s) => (
              <div key={s.step} className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-teal-600 rounded-2xl flex items-center justify-center mb-5 shadow-lg shadow-teal-200 relative z-10">
                  <s.icon className="text-white" size={28} />
                </div>
                <span className="text-xs font-semibold uppercase tracking-widest text-teal-600 mb-1">
                  Paso {s.step}
                </span>
                <h3 className="font-heading text-xl font-bold text-gray-900 mb-2">{s.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Destinations ──────────────────────────────── */}
      <section className="py-20 sm:py-24 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-gray-900">
              Destinos populares
            </h2>
            <p className="mt-3 text-gray-500 text-lg">
              Descubre los lugares mas buscados por nuestros huespedes.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {destinations.map((d, i) => (
              <Link
                key={d.name}
                href={`/propiedades?location=${d.name.toLowerCase()}`}
                className={`group relative rounded-2xl overflow-hidden ${
                  i < 2 ? "aspect-[4/3]" : "aspect-[4/3] lg:aspect-[3/2]"
                }`}
              >
                <img
                  src={d.img}
                  alt={d.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 text-white">
                  <h3 className="font-heading text-lg sm:text-xl font-bold">{d.name}</h3>
                  <p className="text-sm text-white/80">{d.count} propiedades</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA anfitriones ───────────────────────────── */}
      <section className="py-20 sm:py-24 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-10 items-center bg-gradient-to-br from-teal-600 to-teal-700 rounded-3xl overflow-hidden shadow-xl shadow-teal-100">
            {/* Image */}
            <div className="aspect-[4/3] lg:aspect-auto lg:h-full">
              <img
                src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop"
                alt="Propiedad con vista"
                className="w-full h-full object-cover"
              />
            </div>
            {/* Text */}
            <div className="px-8 py-10 lg:py-14 lg:pr-12 text-white">
              <h2 className="font-heading text-3xl sm:text-4xl font-bold mb-4">
                Gana dinero compartiendo tu espacio
              </h2>
              <p className="text-teal-100 text-lg leading-relaxed mb-8">
                Unete a cientos de anfitriones que ya generan ingresos extra arrendando sus propiedades en Hospeda. Publicar es gratis.
              </p>
              <ul className="space-y-3 mb-8">
                {["Publicacion gratuita", "Pagos seguros garantizados", "Soporte dedicado 24/7"].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-teal-50">
                    <CheckCircle2 size={16} className="text-teal-300 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/dashboard/propiedades/nueva"
                className="inline-flex items-center gap-2 bg-white text-teal-700 hover:bg-teal-50 font-semibold px-8 py-3.5 rounded-xl transition-colors text-base shadow-lg"
              >
                Publica tu propiedad
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
