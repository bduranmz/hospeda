"use client";

import { useState } from "react";
import { X, ChevronLeft, ChevronRight, Grid3X3 } from "lucide-react";

interface Photo {
  id: string;
  url: string;
  caption: string | null;
}

export default function PhotoGallery({ photos }: { photos: Photo[] }) {
  const [lightbox, setLightbox] = useState<number | null>(null);

  if (photos.length === 0) {
    return (
      <div className="aspect-[16/9] bg-gray-100 rounded-2xl flex items-center justify-center text-gray-300">
        Sin fotos
      </div>
    );
  }

  const main = photos[0];
  const secondary = photos.slice(1, 5);

  return (
    <>
      {/* Grid */}
      <div className="relative rounded-2xl overflow-hidden">
        <div
          className={`grid gap-2 ${
            secondary.length >= 2
              ? "grid-cols-1 sm:grid-cols-2 max-h-[480px]"
              : "grid-cols-1 max-h-[400px]"
          }`}
        >
          {/* Main photo */}
          <button
            onClick={() => setLightbox(0)}
            className={`relative overflow-hidden cursor-pointer ${
              secondary.length >= 2 ? "sm:row-span-2" : ""
            }`}
          >
            <img
              src={main.url}
              alt={main.caption ?? "Foto principal"}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              style={{ minHeight: "240px", maxHeight: "480px" }}
            />
          </button>

          {/* Secondary photos */}
          {secondary.map((photo, i) => (
            <button
              key={photo.id}
              onClick={() => setLightbox(i + 1)}
              className="relative overflow-hidden cursor-pointer hidden sm:block"
            >
              <img
                src={photo.url}
                alt={photo.caption ?? `Foto ${i + 2}`}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                style={{ maxHeight: "236px" }}
              />
            </button>
          ))}
        </div>

        {/* Show all photos button */}
        {photos.length > 1 && (
          <button
            onClick={() => setLightbox(0)}
            className="absolute bottom-4 right-4 flex items-center gap-2 bg-white/90 backdrop-blur-sm text-sm font-medium text-gray-700 px-4 py-2 rounded-lg hover:bg-white transition-colors shadow-sm"
          >
            <Grid3X3 size={14} />
            Ver {photos.length} fotos
          </button>
        )}
      </div>

      {/* Lightbox */}
      {lightbox !== null && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center">
          <button
            onClick={() => setLightbox(null)}
            className="absolute top-4 right-4 text-white/70 hover:text-white p-2"
          >
            <X size={24} />
          </button>

          <button
            onClick={() =>
              setLightbox((lightbox - 1 + photos.length) % photos.length)
            }
            className="absolute left-4 text-white/70 hover:text-white p-2"
          >
            <ChevronLeft size={32} />
          </button>

          <img
            src={photos[lightbox].url}
            alt={photos[lightbox].caption ?? ""}
            className="max-h-[85vh] max-w-[90vw] object-contain"
          />

          <button
            onClick={() => setLightbox((lightbox + 1) % photos.length)}
            className="absolute right-4 text-white/70 hover:text-white p-2"
          >
            <ChevronRight size={32} />
          </button>

          <div className="absolute bottom-4 text-white/60 text-sm">
            {lightbox + 1} / {photos.length}
          </div>
        </div>
      )}
    </>
  );
}
