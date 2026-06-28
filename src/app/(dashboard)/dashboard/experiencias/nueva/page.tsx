"use client";

import { useState } from "react";
import {
  Camera,
  MapPin,
  Star,
  Tag,
  X,
  ArrowLeft,
  Send,
  Plus,
  Home,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createExperience } from "@/lib/actions/experiences";

const REGIONES = [
  "Arica y Parinacota",
  "Tarapaca",
  "Antofagasta",
  "Atacama",
  "Coquimbo",
  "Valparaiso",
  "Metropolitana",
  "O'Higgins",
  "Maule",
  "Nuble",
  "Biobio",
  "Araucania",
  "Los Rios",
  "Los Lagos",
  "Aysen",
  "Magallanes",
];

const SUGGESTED_TAGS = [
  "playa",
  "montaña",
  "lago",
  "desierto",
  "campo",
  "ciudad",
  "cabaña",
  "camping",
  "trekking",
  "familia",
  "pareja",
  "amigos",
  "relax",
  "aventura",
  "gastronomia",
  "naturaleza",
];

export default function NuevaExperienciaPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [locationName, setLocationName] = useState("");
  const [region, setRegion] = useState("");
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [newPhotoUrl, setNewPhotoUrl] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [error, setError] = useState("");

  const addPhoto = () => {
    if (newPhotoUrl.trim() && photoUrls.length < 10) {
      setPhotoUrls([...photoUrls, newPhotoUrl.trim()]);
      setNewPhotoUrl("");
    }
  };

  const removePhoto = (idx: number) => {
    setPhotoUrls(photoUrls.filter((_, i) => i !== idx));
  };

  const addTag = (tag: string) => {
    const clean = tag.toLowerCase().trim().replace(/^#/, "");
    if (clean && !tags.includes(clean) && tags.length < 10) {
      setTags([...tags, clean]);
    }
    setNewTag("");
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      setError("Titulo y contenido son obligatorios");
      return;
    }

    setLoading(true);
    setError("");

    const result = await createExperience({
      title: title.trim(),
      content: content.trim(),
      rating: rating || undefined,
      locationName: locationName.trim() || undefined,
      region: region || undefined,
      photos: photoUrls,
      tags,
    });

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    router.push(`/explorar/${result.id}`);
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Link
            href="/explorar"
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 font-[family-name:var(--font-heading)]">
              Compartir experiencia
            </h1>
            <p className="text-gray-500 text-sm">
              Cuenta tu experiencia de viaje
            </p>
          </div>
        </div>
        <button
          onClick={handleSubmit}
          disabled={loading || !title.trim() || !content.trim()}
          className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 text-white rounded-xl font-medium hover:bg-teal-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="w-4 h-4" />
          {loading ? "Publicando..." : "Publicar"}
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">
          {error}
        </div>
      )}

      <div className="space-y-6">
        {/* Title */}
        <div>
          <input
            type="text"
            placeholder="Titulo de tu experiencia"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-2xl font-bold placeholder:text-gray-300 border-0 border-b-2 border-gray-100 focus:border-teal-500 focus:outline-none pb-2 bg-transparent"
            maxLength={120}
          />
          <p className="text-xs text-gray-400 mt-1">{title.length}/120</p>
        </div>

        {/* Content */}
        <div>
          <textarea
            placeholder="Cuenta tu experiencia... Que hiciste? Como fue? Que te gusto mas?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={8}
            className="w-full resize-none rounded-xl border border-gray-200 p-4 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-700"
          />
        </div>

        {/* Rating */}
        <div className="bg-white rounded-xl border p-5">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-500" />
            Calificacion
          </h3>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star === rating ? 0 : star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="transition-transform hover:scale-110"
              >
                <Star
                  className={`w-8 h-8 transition ${
                    star <= (hoverRating || rating)
                      ? "text-amber-400 fill-amber-400"
                      : "text-gray-300"
                  }`}
                />
              </button>
            ))}
            {rating > 0 && (
              <span className="ml-2 text-sm text-gray-500 self-center">
                {rating}/5
              </span>
            )}
          </div>
        </div>

        {/* Location */}
        <div className="bg-white rounded-xl border p-5">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-teal-600" />
            Ubicacion
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Ej: Pucon, Araucania"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              className="px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-700"
            >
              <option value="">Seleccionar region</option>
              {REGIONES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Photos */}
        <div className="bg-white rounded-xl border p-5">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Camera className="w-5 h-5 text-teal-600" />
            Fotos ({photoUrls.length}/10)
          </h3>

          {/* Photo grid */}
          {photoUrls.length > 0 && (
            <div className="grid grid-cols-3 md:grid-cols-5 gap-2 mb-3">
              {photoUrls.map((url, i) => (
                <div
                  key={i}
                  className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 group"
                >
                  <img
                    src={url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => removePhoto(i)}
                    className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <input
              type="url"
              placeholder="URL de la foto"
              value={newPhotoUrl}
              onChange={(e) => setNewPhotoUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addPhoto()}
              className="flex-1 px-4 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
            <button
              onClick={addPhoto}
              disabled={!newPhotoUrl.trim() || photoUrls.length >= 10}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition disabled:opacity-50 text-sm"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Pega URLs de imagenes. Con Supabase Storage podras subir directamente.
          </p>
        </div>

        {/* Tags */}
        <div className="bg-white rounded-xl border p-5">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Tag className="w-5 h-5 text-teal-600" />
            Tags ({tags.length}/10)
          </h3>

          {/* Selected tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-teal-50 text-teal-700 rounded-full text-sm"
                >
                  #{tag}
                  <button
                    onClick={() => removeTag(tag)}
                    className="text-teal-400 hover:text-teal-700 transition"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Tag input */}
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              placeholder="Agregar tag..."
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addTag(newTag);
                }
              }}
              className="flex-1 px-4 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
            <button
              onClick={() => addTag(newTag)}
              disabled={!newTag.trim() || tags.length >= 10}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition disabled:opacity-50 text-sm"
            >
              Agregar
            </button>
          </div>

          {/* Suggested tags */}
          <div className="flex flex-wrap gap-1.5">
            {SUGGESTED_TAGS.filter((t) => !tags.includes(t)).map((tag) => (
              <button
                key={tag}
                onClick={() => addTag(tag)}
                className="px-2.5 py-1 text-xs text-gray-500 bg-gray-100 rounded-full hover:bg-teal-50 hover:text-teal-600 transition"
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
