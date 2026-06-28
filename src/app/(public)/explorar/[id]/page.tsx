import {
  Heart,
  MessageCircle,
  MapPin,
  Star,
  Bookmark,
  Share2,
  ArrowLeft,
  Calendar,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getExperience } from "@/lib/actions/experiences";
import { getComments } from "@/lib/actions/social";
import CommentSection from "@/components/social/CommentSection";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ExperienceDetailPage({ params }: PageProps) {
  const { id } = await params;
  const experience = await getExperience(id);
  if (!experience) notFound();

  const comments = await getComments(id);
  const profile = experience.profiles as unknown as Record<string, unknown> | null;
  const property = experience.properties as unknown as Record<string, unknown> | null;
  const photos = (experience.photos as string[]) ?? [];
  const tags = (experience.tags as string[]) ?? [];
  const createdAt = new Date(experience.created_at as string);

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Back nav */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <Link
            href="/explorar"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-teal-600 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a explorar
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <article className="bg-white rounded-2xl border overflow-hidden">
          {/* Photos */}
          {photos.length > 0 && (
            <div
              className={`grid gap-1 ${
                photos.length === 1
                  ? "grid-cols-1"
                  : photos.length === 2
                    ? "grid-cols-2"
                    : "grid-cols-2 grid-rows-2"
              }`}
            >
              {photos.slice(0, 4).map((photo, i) => (
                <div
                  key={i}
                  className={`relative aspect-[4/3] ${
                    i === 0 && photos.length > 2 ? "row-span-2" : ""
                  }`}
                >
                  <Image
                    src={photo}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority={i === 0}
                  />
                </div>
              ))}
            </div>
          )}

          <div className="p-6 md:p-8">
            {/* Author */}
            <div className="flex items-center justify-between mb-4">
              <Link
                href={`/perfil/${profile?.id}`}
                className="flex items-center gap-3 group"
              >
                <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold overflow-hidden">
                  {profile?.avatar_url ? (
                    <Image
                      src={profile.avatar_url as string}
                      alt=""
                      width={40}
                      height={40}
                      className="object-cover"
                    />
                  ) : (
                    ((profile?.full_name as string) ?? "U")[0].toUpperCase()
                  )}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 group-hover:text-teal-600 transition">
                    {(profile?.full_name as string) ?? "Usuario"}
                  </p>
                  <p className="text-sm text-gray-500">
                    {(profile?.experiences_count as number) ?? 0} experiencias
                    &middot;{" "}
                    {(profile?.followers_count as number) ?? 0} seguidores
                  </p>
                </div>
              </Link>

              <div className="flex items-center gap-2">
                <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition">
                  <Share2 className="w-5 h-5" />
                </button>
                <button
                  className={`p-2 rounded-lg hover:bg-gray-100 transition ${
                    experience.isBookmarked
                      ? "text-teal-600"
                      : "text-gray-500"
                  }`}
                >
                  <Bookmark
                    className={`w-5 h-5 ${
                      experience.isBookmarked ? "fill-teal-600" : ""
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 font-[family-name:var(--font-heading)] mb-2">
              {experience.title}
            </h1>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-6">
              {experience.location_name && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {experience.location_name}
                </span>
              )}
              {experience.rating && (
                <span className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  {experience.rating}/5
                </span>
              )}
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {createdAt.toLocaleDateString("es-CL", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>

            {/* Content */}
            <div className="prose prose-gray max-w-none mb-6">
              {(experience.content as string).split("\n").map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>

            {/* Tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/explorar?tag=${tag}`}
                    className="px-3 py-1.5 bg-teal-50 text-teal-700 rounded-full text-sm hover:bg-teal-100 transition"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            )}

            {/* Linked property */}
            {property && (
              <Link
                href={`/propiedades/${property.id}`}
                className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition mb-6 border"
              >
                <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-teal-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">
                    Se hospedo en
                  </p>
                  <p className="font-medium text-gray-900">
                    {String(property.title ?? "")}
                  </p>
                  {property.address ? (
                    <p className="text-sm text-gray-500">
                      {String(property.address)}
                    </p>
                  ) : null}
                </div>
              </Link>
            )}

            {/* Actions bar */}
            <div className="flex items-center gap-6 py-4 border-y">
              <button
                className={`flex items-center gap-2 font-medium transition ${
                  experience.isLiked
                    ? "text-red-500"
                    : "text-gray-600 hover:text-red-500"
                }`}
              >
                <Heart
                  className={`w-5 h-5 ${
                    experience.isLiked ? "fill-red-500" : ""
                  }`}
                />
                {(experience.likes_count as number) ?? 0} Me gusta
              </button>
              <span className="flex items-center gap-2 text-gray-600">
                <MessageCircle className="w-5 h-5" />
                {(experience.comments_count as number) ?? 0} Comentarios
              </span>
            </div>

            {/* Comments */}
            <CommentSection
              experienceId={id}
              initialComments={comments as never[]}
            />
          </div>
        </article>
      </div>
    </main>
  );
}
