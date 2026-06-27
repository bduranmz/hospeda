"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log to error reporting service in production
    console.error(error);
  }, [error]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-6">
      {/* Illustration */}
      <div className="relative mb-8">
        <div className="w-40 h-40 rounded-full bg-red-50 flex items-center justify-center">
          <div className="w-24 h-24 rounded-full bg-red-100 flex items-center justify-center">
            <AlertTriangle size={40} className="text-red-400" strokeWidth={1.5} />
          </div>
        </div>
      </div>

      {/* Text */}
      <h1 className="text-xl font-semibold text-gray-900 mb-3">
        Algo salió mal
      </h1>
      <p className="text-gray-500 text-sm text-center max-w-xs mb-8">
        Ocurrió un error inesperado. Puedes intentar de nuevo o volver al
        inicio.
      </p>

      {/* Error digest for debugging */}
      {error.digest && (
        <p className="text-xs text-gray-400 mb-6 font-mono">
          Código: {error.digest}
        </p>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 text-white font-medium rounded-xl hover:bg-teal-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 shadow-sm cursor-pointer"
        >
          <RefreshCw size={18} />
          Reintentar
        </button>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 shadow-sm"
        >
          <Home size={18} />
          Volver al inicio
        </Link>
      </div>
    </main>
  );
}
