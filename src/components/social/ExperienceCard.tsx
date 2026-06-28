"use client";

import { Heart, MessageCircle, MapPin, Star, Bookmark } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

interface ExperienceCardProps {
  experience: Record<string, unknown>;
  isFollowing?: boolean;
}

export default function ExperienceCard({
  experience,
  isFollowing,
}: ExperienceCardProps) {
  const [imgIdx, setImgIdx] = useState(0);
  const photos = (experience.photos as string[]) ?? [];
  const profile = experience.profiles as Record<string, unknown> | null;
  const tags = (experience.tags as string[]) ?? [];
  const property = experience.properties as Record<string, unknown> | null;

  return (
    <article className="bg-white rounded-2xl border overflow-hidden group hover:shadow-lg transition-shadow duration-300">
      {/* Photo */}
      <Link href={`/explorar/${experience.id}`} className="block relative">
        <div className="aspect-[4/3] relative overflow-hidden bg-gray-100">
          {photos.length > 0 ? (
            <Image
              src={photos[imgIdx]}
              alt={(experience.title as string) ?? ""}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300">
              <MapPin className="w-12 h-12" />
            </div>
          )}

          {/* Photo dots */}
          {photos.length > 1 ? (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {photos.slice(0, 5).map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => {
                    e.preventDefault();
                    setImgIdx(i);
                  }}
                  className={`w-1.5 h-1.5 rounded-full transition ${
                    i === imgIdx ? "bg-white" : "bg-white/50"
                  }`}
                />
              ))}
            </div>
          ) : null}

          {/* Rating badge */}
          {experience.rating ? (
            <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1">
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span className="text-sm font-medium">
                {experience.rating as number}
              </span>
            </div>
          ) : null}
        </div>
      </Link>

      {/* Content */}
      <div className="p-4">
        {/* Author */}
        <div className="flex items-center gap-2 mb-2">
          <div className="w-7 h-7 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 text-xs font-bold overflow-hidden">
            {profile?.avatar_url ? (
              <Image
                src={profile.avatar_url as string}
                alt=""
                width={28}
                height={28}
                className="object-cover"
              />
            ) : (
              ((profile?.full_name as string) ?? "U")[0].toUpperCase()
            )}
          </div>
          <Link
            href={`/perfil/${profile?.id}`}
            className="text-sm font-medium text-gray-700 hover:text-teal-600 transition"
          >
            {(profile?.full_name as string) ?? "Usuario"}
          </Link>
          {isFollowing && (
            <span className="text-xs text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full">
              Siguiendo
            </span>
          )}
        </div>

        {/* Title + location */}
        <Link href={`/explorar/${experience.id}`}>
          <h3 className="font-semibold text-gray-900 line-clamp-1 hover:text-teal-600 transition">
            {experience.title as string}
          </h3>
        </Link>

        {experience.location_name ? (
          <div className="flex items-center gap-1 mt-1 text-gray-500 text-sm">
            <MapPin className="w-3.5 h-3.5" />
            {String(experience.location_name)}
          </div>
        ) : null}

        {/* Content preview */}
        <p className="text-gray-600 text-sm mt-2 line-clamp-2">
          {experience.content as string}
        </p>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {tags.slice(0, 3).map((tag) => (
              <Link
                key={tag}
                href={`/explorar?tag=${tag}`}
                className="text-xs text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full hover:bg-teal-100 transition"
              >
                #{tag}
              </Link>
            ))}
            {tags.length > 3 && (
              <span className="text-xs text-gray-400">+{tags.length - 3}</span>
            )}
          </div>
        )}

        {/* Linked property */}
        {property ? (
          <Link
            href={`/propiedades/${property.id}`}
            className="flex items-center gap-2 mt-3 p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
          >
            <div className="w-4 h-4 text-teal-600">
              <MapPin className="w-4 h-4" />
            </div>
            <span className="text-xs text-gray-600 truncate">
              Se hospedo en:{" "}
              <span className="font-medium text-gray-800">
                {String(property.title ?? "")}
              </span>
            </span>
          </Link>
        ) : null}

        {/* Actions */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t">
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-1.5 text-gray-500 hover:text-red-500 transition">
              <Heart className="w-4.5 h-4.5" />
              <span className="text-sm">
                {(experience.likes_count as number) ?? 0}
              </span>
            </button>
            <Link
              href={`/explorar/${experience.id}`}
              className="flex items-center gap-1.5 text-gray-500 hover:text-teal-600 transition"
            >
              <MessageCircle className="w-4.5 h-4.5" />
              <span className="text-sm">
                {(experience.comments_count as number) ?? 0}
              </span>
            </Link>
          </div>
          <button className="text-gray-400 hover:text-teal-600 transition">
            <Bookmark className="w-4.5 h-4.5" />
          </button>
        </div>
      </div>
    </article>
  );
}
