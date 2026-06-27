import { createClient } from "@/lib/supabase/server";
import type { PropertyType, SpaceType } from "@/types/database";

export interface PropertySearchParams {
  query?: string;
  propertyType?: PropertyType;
  spaceType?: SpaceType;
  minPrice?: number;
  maxPrice?: number;
  guests?: number;
  bedrooms?: number;
  bathrooms?: number;
  amenities?: string[];
  commune?: string;
  region?: string;
  instantBooking?: boolean;
  page?: number;
  perPage?: number;
  sortBy?: "price_asc" | "price_desc" | "newest" | "rating";
}

export interface PropertySearchResult {
  id: string;
  title: string;
  property_type: PropertyType;
  space_type: SpaceType;
  base_price: number;
  cleaning_fee: number;
  max_guests: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  amenities: string[];
  instant_booking: boolean;
  address: { commune: string; region: string };
  cover_photo: string | null;
  host_name: string;
  host_avatar: string | null;
  avg_rating: number | null;
  total_reviews: number;
}

const PER_PAGE = 20;

export async function searchProperties(params: PropertySearchParams) {
  const supabase = await createClient();
  const page = params.page ?? 1;
  const perPage = params.perPage ?? PER_PAGE;
  const offset = (page - 1) * perPage;

  let query = supabase
    .from("properties")
    .select(
      `
      id, title, property_type, space_type,
      base_price, cleaning_fee, max_guests, bedrooms, beds, bathrooms,
      amenities, instant_booking, address,
      property_photos!inner ( url ),
      profiles!properties_host_id_fkey ( full_name, avatar_url ),
      reviews ( rating )
    `,
      { count: "exact" }
    )
    .eq("status", "published")
    .is("deleted_at", null);

  // Text search on title
  if (params.query) {
    query = query.ilike("title", `%${params.query}%`);
  }

  // Filters
  if (params.propertyType) {
    query = query.eq("property_type", params.propertyType);
  }
  if (params.spaceType) {
    query = query.eq("space_type", params.spaceType);
  }
  if (params.minPrice) {
    query = query.gte("base_price", params.minPrice);
  }
  if (params.maxPrice) {
    query = query.lte("base_price", params.maxPrice);
  }
  if (params.guests) {
    query = query.gte("max_guests", params.guests);
  }
  if (params.bedrooms) {
    query = query.gte("bedrooms", params.bedrooms);
  }
  if (params.bathrooms) {
    query = query.gte("bathrooms", params.bathrooms);
  }
  if (params.instantBooking) {
    query = query.eq("instant_booking", true);
  }
  if (params.amenities?.length) {
    query = query.contains("amenities", params.amenities);
  }

  // Sort
  switch (params.sortBy) {
    case "price_asc":
      query = query.order("base_price", { ascending: true });
      break;
    case "price_desc":
      query = query.order("base_price", { ascending: false });
      break;
    case "newest":
      query = query.order("published_at", { ascending: false });
      break;
    default:
      query = query.order("published_at", { ascending: false });
  }

  query = query.range(offset, offset + perPage - 1);

  const { data, error, count } = await query;

  if (error) {
    console.error("searchProperties error:", error);
    return { properties: [], total: 0, page, perPage };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const properties: PropertySearchResult[] = (data ?? []).map((p: any) => {
    const reviews = p.reviews ?? [];
    const avgRating =
      reviews.length > 0
        ? reviews.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / reviews.length
        : null;

    const coverPhoto = p.property_photos?.[0]?.url ?? null;
    const host = p.profiles;

    return {
      id: p.id,
      title: p.title,
      property_type: p.property_type,
      space_type: p.space_type,
      base_price: p.base_price,
      cleaning_fee: p.cleaning_fee,
      max_guests: p.max_guests,
      bedrooms: p.bedrooms,
      beds: p.beds,
      bathrooms: p.bathrooms,
      amenities: p.amenities,
      instant_booking: p.instant_booking,
      address: {
        commune: p.address?.commune ?? "",
        region: p.address?.region ?? "",
      },
      cover_photo: coverPhoto,
      host_name: host?.full_name ?? "Anfitrión",
      host_avatar: host?.avatar_url ?? null,
      avg_rating: avgRating ? Math.round(avgRating * 10) / 10 : null,
      total_reviews: reviews.length,
    };
  });

  return {
    properties,
    total: count ?? 0,
    page,
    perPage,
  };
}
