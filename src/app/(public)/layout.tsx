"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Home, Menu, X } from "lucide-react";

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/90 backdrop-blur-md border-b border-gray-200/60 shadow-sm"
          : "bg-white border-b border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[68px] flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center group-hover:bg-teal-700 transition-colors">
            <Home className="text-white" size={18} />
          </div>
          <span className="text-xl font-heading font-bold text-gray-900 tracking-tight">
            Hospeda
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          <Link
            href="/propiedades"
            className="text-sm font-medium text-gray-600 hover:text-teal-600 transition-colors px-4 py-2 rounded-xl hover:bg-teal-50"
          >
            Explorar
          </Link>
          <Link
            href="/dashboard/propiedades/nueva"
            className="text-sm font-medium text-gray-600 hover:text-teal-600 transition-colors px-4 py-2 rounded-xl hover:bg-teal-50"
          >
            Publicar
          </Link>
          <div className="w-px h-6 bg-gray-200 mx-2" />
          <Link
            href="/login"
            className="text-sm font-medium text-gray-700 hover:text-teal-600 transition-colors px-4 py-2 rounded-xl hover:bg-gray-50"
          >
            Inicia sesion
          </Link>
          <Link
            href="/registro"
            className="text-sm font-semibold bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-xl transition-colors shadow-sm shadow-teal-200"
          >
            Registrate
          </Link>
        </nav>

        {/* Mobile toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 pb-4 pt-2 space-y-1">
          <Link href="/propiedades" className="block text-sm font-medium text-gray-700 px-3 py-2.5 rounded-xl hover:bg-teal-50">Explorar</Link>
          <Link href="/dashboard/propiedades/nueva" className="block text-sm font-medium text-gray-700 px-3 py-2.5 rounded-xl hover:bg-teal-50">Publicar</Link>
          <div className="border-t border-gray-100 my-2" />
          <Link href="/login" className="block text-sm font-medium text-gray-700 px-3 py-2.5 rounded-xl hover:bg-gray-50">Inicia sesion</Link>
          <Link href="/registro" className="block text-sm font-semibold bg-teal-600 text-white text-center px-3 py-2.5 rounded-xl">Registrate</Link>
        </div>
      )}
    </header>
  );
}

function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 bg-teal-600 rounded-lg flex items-center justify-center">
                <Home className="text-white" size={14} />
              </div>
              <span className="text-lg font-heading font-bold text-gray-900">Hospeda</span>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed">
              Arriendos temporales y vacacionales verificados en todo Chile.
            </p>
          </div>

          {/* Explorar */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Explorar</h3>
            <ul className="space-y-2.5 text-sm text-gray-500">
              <li><Link href="/propiedades" className="hover:text-teal-600 transition-colors">Propiedades</Link></li>
              <li><Link href="/propiedades?type=cabana" className="hover:text-teal-600 transition-colors">Cabanas</Link></li>
              <li><Link href="/propiedades?type=departamento" className="hover:text-teal-600 transition-colors">Departamentos</Link></li>
            </ul>
          </div>

          {/* Anfitriones */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Anfitriones</h3>
            <ul className="space-y-2.5 text-sm text-gray-500">
              <li><Link href="/dashboard/propiedades/nueva" className="hover:text-teal-600 transition-colors">Publicar propiedad</Link></li>
              <li><Link href="/login" className="hover:text-teal-600 transition-colors">Mi cuenta</Link></li>
            </ul>
          </div>

          {/* Soporte */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Soporte</h3>
            <ul className="space-y-2.5 text-sm text-gray-500">
              <li><Link href="/privacidad" className="hover:text-teal-600 transition-colors">Privacidad</Link></li>
              <li><Link href="/terminos" className="hover:text-teal-600 transition-colors">Terminos de uso</Link></li>
              <li><Link href="/eliminacion-datos" className="hover:text-teal-600 transition-colors">Eliminar datos</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-200 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} Hospeda. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <span className="px-2.5 py-1 bg-gray-100 rounded-md font-medium">Webpay</span>
            <span className="px-2.5 py-1 bg-gray-100 rounded-md font-medium">Flow</span>
            <span className="px-2.5 py-1 bg-gray-100 rounded-md font-medium">SSL</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
