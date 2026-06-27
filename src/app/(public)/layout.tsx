import Link from "next/link";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="text-xl font-bold text-teal-600 tracking-tight hover:text-teal-700 transition-colors"
          >
            Hospeda
          </Link>

          {/* Nav links */}
          <nav className="flex items-center gap-2 sm:gap-4">
            <Link
              href="/publicar"
              className="hidden sm:inline text-sm font-medium text-gray-600 hover:text-teal-600 transition-colors px-3 py-2 rounded-lg hover:bg-teal-50"
            >
              Publica tu propiedad
            </Link>
            <Link
              href="/login"
              className="text-sm font-medium text-gray-700 hover:text-teal-600 transition-colors px-3 py-2 rounded-lg hover:bg-gray-50"
            >
              Inicia sesión
            </Link>
            <Link
              href="/registro"
              className="text-sm font-semibold bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Regístrate
            </Link>
          </nav>
        </div>
      </header>

      {/* Page content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-10">
            <div className="col-span-2 sm:col-span-1">
              <span className="text-lg font-bold text-teal-600">Hospeda</span>
              <p className="mt-2 text-sm text-gray-500 leading-relaxed">
                Arriendos temporales y vacacionales en todo Chile.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Plataforma</h3>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><Link href="/propiedades" className="hover:text-teal-600 transition-colors">Explorar propiedades</Link></li>
                <li><Link href="/publicar" className="hover:text-teal-600 transition-colors">Publicar propiedad</Link></li>
                <li><Link href="/como-funciona" className="hover:text-teal-600 transition-colors">Cómo funciona</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Cuenta</h3>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><Link href="/login" className="hover:text-teal-600 transition-colors">Inicia sesión</Link></li>
                <li><Link href="/registro" className="hover:text-teal-600 transition-colors">Regístrate</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Legal</h3>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><Link href="/privacidad" className="hover:text-teal-600 transition-colors">Privacidad</Link></li>
                <li><Link href="/terminos" className="hover:text-teal-600 transition-colors">Términos de uso</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 pt-6 text-center text-sm text-gray-400">
            &copy; {new Date().getFullYear()} Hospeda. Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}
