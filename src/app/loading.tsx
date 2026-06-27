export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-4">
        {/* Spinner */}
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-4 border-teal-100" />
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-teal-600 animate-spin" />
        </div>
        <p className="text-sm text-gray-500 font-medium">Cargando...</p>
      </div>
    </div>
  );
}
