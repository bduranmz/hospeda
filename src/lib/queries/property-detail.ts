import { createClient } from "@/lib/supabase/server";

export interface PropertyDetail {
  id: string;
  host_id: string;
  title: string;
  description: string | null;
  property_type: string;
  space_type: string;
  status: string;
  address: { commune: string; region: string; country: string };
  max_guests: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  amenities: string[];
  rules: {
    no_smoking?: boolean;
    no_pets?: boolean;
    no_parties?: boolean;
    check_in_instructions?: string;
    additional_rules?: string;
  } | null;
  check_in_time: string | null;
  check_out_time: string | null;
  cancellation_policy: string;
  instant_booking: boolean;
  min_nights: number;
  max_nights: number | null;
  base_price: number;
  weekend_price: number | null;
  cleaning_fee: number;
  security_deposit: number;
  photos: { id: string; url: string; caption: string | null; is_cover: boolean }[];
  host: {
    id: string;
    full_name: string;
    avatar_url: string | null;
    bio: string | null;
    superhost: boolean;
    total_reviews: number;
    avg_rating: number | null;
    created_at: string;
  };
  reviews: {
    id: string;
    rating: number;
    comment: string | null;
    created_at: string;
    reviewer: { full_name: string; avatar_url: string | null };
  }[];
  avg_rating: number | null;
  total_reviews: number;
}

export async function getPropertyById(id: string): Promise<PropertyDetail | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("properties")
    .select(
      `
      id, host_id, title, description, property_type, space_type, status,
      address, max_guests, bedrooms, beds, bathrooms, amenities, rules,
      check_in_time, check_out_time, cancellation_policy, instant_booking,
      min_nights, max_nights, base_price, weekend_price, cleaning_fee, security_deposit,
      property_photos ( id, url, caption, is_cover ),
      profiles!properties_host_id_fkey (
        id, full_name, avatar_url, bio, superhost, total_reviews, avg_rating, created_at
      ),
      reviews ( id, rating, comment, created_at,
        profiles!reviews_reviewer_id_fkey ( full_name, avatar_url )
      )
    `
    )
    .eq("id", id)
    .eq("status", "published")
    .is("deleted_at", null)
    .single();

  if (error || !data) return null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const d = data as any;
  const reviews = (d.reviews ?? []).map((r: any) => ({
    id: r.id,
    rating: r.rating,
    comment: r.comment,
    created_at: r.created_at,
    reviewer: {
      full_name: r.profiles?.full_name ?? "Usuario",
      avatar_url: r.profiles?.avatar_url ?? null,
    },
  }));

  const avgRating =
    reviews.length > 0
      ? Math.round(
          (reviews.reduce((s: number, r: { rating: number }) => s + r.rating, 0) /
            reviews.length) *
            10
        ) / 10
      : null;

  const photos = (d.property_photos ?? [])
    .sort((a: any, b: any) => (b.is_cover ? 1 : 0) - (a.is_cover ? 1 : 0))
    .map((p: any) => ({
      id: p.id,
      url: p.url,
      caption: p.caption,
      is_cover: p.is_cover,
    }));

  return {
    id: d.id,
    host_id: d.host_id,
    title: d.title,
    description: d.description,
    property_type: d.property_type,
    space_type: d.space_type,
    status: d.status,
    address: {
      commune: d.address?.commune ?? "",
      region: d.address?.region ?? "",
      country: d.address?.country ?? "Chile",
    },
    max_guests: d.max_guests,
    bedrooms: d.bedrooms,
    beds: d.beds,
    bathrooms: d.bathrooms,
    amenities: d.amenities ?? [],
    rules: d.rules,
    check_in_time: d.check_in_time,
    check_out_time: d.check_out_time,
    cancellation_policy: d.cancellation_policy,
    instant_booking: d.instant_booking,
    min_nights: d.min_nights,
    max_nights: d.max_nights,
    base_price: d.base_price,
    weekend_price: d.weekend_price,
    cleaning_fee: d.cleaning_fee,
    security_deposit: d.security_deposit,
    photos,
    host: {
      id: d.profiles?.id ?? d.host_id,
      full_name: d.profiles?.full_name ?? "Anfitrión",
      avatar_url: d.profiles?.avatar_url ?? null,
      bio: d.profiles?.bio ?? null,
      superhost: d.profiles?.superhost ?? false,
      total_reviews: d.profiles?.total_reviews ?? 0,
      avg_rating: d.profiles?.avg_rating ?? null,
      created_at: d.profiles?.created_at ?? "",
    },
    reviews,
    avg_rating: avgRating,
    total_reviews: reviews.length,
  };
}
