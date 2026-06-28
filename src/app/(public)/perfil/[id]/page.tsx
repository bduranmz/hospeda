import {
  MapPin,
  Calendar,
  Users,
  UserPlus,
  Grid3X3,
  Star,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getUserProfile } from "@/lib/actions/social";
import ExperienceCard from "@/components/social/ExperienceCard";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PerfilPublicoPage({ params }: PageProps) {
  const { id } = await params;
  const profile = await getUserProfile(id);
  if (!profile) notFound();

  const joinDate = new Date(profile.created_at as string);

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Profile header */}
      <section className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Avatar */}
            <div className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 text-3xl font-bold overflow-hidden shrink-0">
              {profile.avatar_url ? (
                <Image
                  src={profile.avatar_url as string}
                  alt=""
                  width={112}
                  height={112}
                  className="object-cover"
                />
              ) : (
                ((profile.full_name as string) ?? "U")[0].toUpperCase()
              )}
            </div>

            {/* Info */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-gray-900 font-[family-name:var(--font-heading)]">
                  {(profile.full_name as string) ?? "Usuario"}
                </h1>
                {!profile.isOwnProfile && (
                  <button
                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl font-medium text-sm transition ${
                      profile.isFollowedByMe
                        ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        : "bg-teal-600 text-white hover:bg-teal-700"
                    }`}
                  >
                    <UserPlus className="w-4 h-4" />
                    {profile.isFollowedByMe ? "Siguiendo" : "Seguir"}
                  </button>
                )}
              </div>

              {profile.bio && (
                <p className="text-gray-600 mb-3">{profile.bio as string}</p>
              )}

              {/* Stats */}
              <div className="flex items-center justify-center md:justify-start gap-6 text-sm">
                <div className="text-center">
                  <span className="font-bold text-gray-900 block">
                    {(profile.experiences_count as number) ?? 0}
                  </span>
                  <span className="text-gray-500">Experiencias</span>
                </div>
                <div className="text-center">
                  <span className="font-bold text-gray-900 block">
                    {(profile.followers_count as number) ?? 0}
                  </span>
                  <span className="text-gray-500">Seguidores</span>
                </div>
                <div className="text-center">
                  <span className="font-bold text-gray-900 block">
                    {(profile.following_count as number) ?? 0}
                  </span>
                  <span className="text-gray-500">Siguiendo</span>
                </div>
              </div>

              <div className="flex items-center justify-center md:justify-start gap-4 mt-3 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Miembro desde{" "}
                  {joinDate.toLocaleDateString("es-CL", {
                    year: "numeric",
                    month: "long",
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Travel map placeholder */}
      <section className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-5 h-5 text-teal-600" />
            <h2 className="font-semibold text-gray-900">Mapa de viajes</h2>
          </div>
          <div className="h-48 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 text-sm">
            Mapa interactivo con destinos visitados (requiere Google Maps API)
          </div>
        </div>
      </section>

      {/* Experiences */}
      <section className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center gap-2 mb-6">
          <Grid3X3 className="w-5 h-5 text-teal-600" />
          <h2 className="font-semibold text-gray-900">
            Experiencias ({profile.experiences?.length ?? 0})
          </h2>
        </div>

        {(!profile.experiences || profile.experiences.length === 0) ? (
          <div className="text-center py-12 bg-white rounded-2xl border">
            <Star className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">
              {profile.isOwnProfile
                ? "Aun no has compartido experiencias"
                : "Este usuario aun no ha compartido experiencias"}
            </p>
            {profile.isOwnProfile && (
              <Link
                href="/dashboard/experiencias/nueva"
                className="inline-block mt-3 px-5 py-2.5 bg-teal-600 text-white rounded-xl font-medium hover:bg-teal-700 transition"
              >
                Compartir tu primera experiencia
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {profile.experiences.map((exp: Record<string, unknown>) => (
              <ExperienceCard key={exp.id as string} experience={exp} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
