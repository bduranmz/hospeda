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
  sortBy?: "price_asc" | "price_desc" | "newest" | "rating" | "relevance";
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
  quality_score: number;
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
      id, title, description, property_type, space_type,
      base_price, cleaning_fee, max_guests, bedrooms, beds, bathrooms,
      amenities, instant_booking, address, host_verified,
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

    // Quality score (0-100): determines visibility ranking
    // Higher score = appears higher in results
    const hasPhotos = p.property_photos?.length > 0;
    const photoCount = p.property_photos?.length ?? 0;
    const hasDescription = (p.description?.length ?? 0) > 50;
    const amenityCount = p.amenities?.length ?? 0;
    const reviewCount = reviews.length;
    const rating = avgRating ?? 0;

    const qualityScore =
      (hasPhotos ? 15 : 0) +                          // Has at least 1 photo
      Math.min(photoCount, 5) * 3 +                    // Up to 5 photos = 15pts
      (hasDescription ? 10 : 0) +                      // Has description
      Math.min(amenityCount, 10) * 1 +                  // Up to 10 amenities = 10pts
      Math.min(reviewCount, 20) * 1 +                   // Up to 20 reviews = 20pts
      (rating >= 4.5 ? 20 : rating >= 4.0 ? 15 : rating >= 3.5 ? 10 : rating > 0 ? 5 : 0) + // Rating tier
      (p.instant_booking ? 5 : 0) +                     // Instant booking bonus
      (p.host_verified ? 5 : 0);                        // Verified host bonus

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
      quality_score: qualityScore,
    };
  });

  // When sorting by rating or default (newest), apply quality score as tiebreaker
  // This pushes low-quality listings down without hiding them
  if (params.sortBy === "rating" || params.sortBy === "relevance" || !params.sortBy) {
    properties.sort((a, b) => {
      if (params.sortBy === "rating") {
        // Primary: rating desc, secondary: quality score
        const ratingDiff = (b.avg_rating ?? 0) - (a.avg_rating ?? 0);
        return ratingDiff !== 0 ? ratingDiff : b.quality_score - a.quality_score;
      }
      // For newest (default), use quality score as secondary sort
      // DB already sorted by published_at, so we just boost high-quality ones slightly
      return b.quality_score - a.quality_score;
    });
  }

  return {
    properties,
    total: count ?? 0,
    page,
    perPage,
  };
}
