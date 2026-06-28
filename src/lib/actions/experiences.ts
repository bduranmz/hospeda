"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

// ---------------------------------------------------------------------------
// Create experience
// ---------------------------------------------------------------------------

export async function createExperience(formData: {
  title: string;
  content: string;
  rating?: number;
  locationName?: string;
  region?: string;
  latitude?: number;
  longitude?: number;
  photos?: string[];
  tags?: string[];
  propertyId?: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data, error } = await supabase
    .from("experiences")
    .insert({
      user_id: user.id,
      title: formData.title,
      content: formData.content,
      rating: formData.rating,
      location_name: formData.locationName,
      region: formData.region,
      latitude: formData.latitude,
      longitude: formData.longitude,
      photos: formData.photos ?? [],
      tags: (formData.tags ?? []).map((t) => t.toLowerCase().trim()),
      property_id: formData.propertyId,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };
  return { id: data.id };
}

// ---------------------------------------------------------------------------
// Update experience
// ---------------------------------------------------------------------------

export async function updateExperience(
  id: string,
  formData: {
    title?: string;
    content?: string;
    rating?: number;
    locationName?: string;
    region?: string;
    photos?: string[];
    tags?: string[];
  }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (formData.title !== undefined) updates.title = formData.title;
  if (formData.content !== undefined) updates.content = formData.content;
  if (formData.rating !== undefined) updates.rating = formData.rating;
  if (formData.locationName !== undefined) updates.location_name = formData.locationName;
  if (formData.region !== undefined) updates.region = formData.region;
  if (formData.photos !== undefined) updates.photos = formData.photos;
  if (formData.tags !== undefined) updates.tags = formData.tags.map((t) => t.toLowerCase().trim());

  const { error } = await supabase
    .from("experiences")
    .update(updates)
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  return { success: true };
}

// ---------------------------------------------------------------------------
// Delete experience
// ---------------------------------------------------------------------------

export async function deleteExperience(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase
    .from("experiences")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  return { success: true };
}

// ---------------------------------------------------------------------------
// Get feed (following + trending)
// ---------------------------------------------------------------------------

export async function getFeed(page = 1, perPage = 12) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  // If logged in, get following IDs for personalized feed
  let followingIds: string[] = [];
  if (user) {
    const { data: follows } = await supabase
      .from("follows")
      .select("following_id")
      .eq("follower_id", user.id);
    followingIds = (follows ?? []).map((f) => f.following_id);
  }

  // Get all experiences ordered by recency, with author info
  const { data, error, count } = await supabase
    .from("experiences")
    .select(
      `
      id, title, content, rating, location_name, region, photos, tags,
      likes_count, comments_count, is_featured, created_at,
      profiles!experiences_user_id_fkey ( id, full_name, avatar_url ),
      properties ( id, title, address )
    `,
      { count: "exact" }
    )
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) return { experiences: [], total: 0, followingIds };
  return { experiences: data ?? [], total: count ?? 0, followingIds };
}

// ---------------------------------------------------------------------------
// Get experiences by region/tag
// ---------------------------------------------------------------------------

export async function getExperiencesByFilter(filters: {
  region?: string;
  tag?: string;
  userId?: string;
  page?: number;
  perPage?: number;
}) {
  const supabase = await createClient();
  const page = filters.page ?? 1;
  const perPage = filters.perPage ?? 12;
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  let query = supabase
    .from("experiences")
    .select(
      `
      id, title, content, rating, location_name, region, photos, tags,
      likes_count, comments_count, is_featured, created_at,
      profiles!experiences_user_id_fkey ( id, full_name, avatar_url ),
      properties ( id, title, address )
    `,
      { count: "exact" }
    )
    .order("created_at", { ascending: false })
    .range(from, to);

  if (filters.region) query = query.eq("region", filters.region);
  if (filters.tag) query = query.contains("tags", [filters.tag]);
  if (filters.userId) query = query.eq("user_id", filters.userId);

  const { data, error, count } = await query;
  if (error) return { experiences: [], total: 0 };
  return { experiences: data ?? [], total: count ?? 0 };
}

// ---------------------------------------------------------------------------
// Get single experience
// ---------------------------------------------------------------------------

export async function getExperience(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("experiences")
    .select(
      `
      id, title, content, rating, location_name, region, latitude, longitude,
      photos, tags, likes_count, comments_count, is_featured, created_at, user_id,
      profiles!experiences_user_id_fkey ( id, full_name, avatar_url, experiences_count, followers_count ),
      properties ( id, title, address, base_price, property_photos ( url, is_cover ) )
    `
    )
    .eq("id", id)
    .single();

  if (error) return null;

  // Check if current user liked it
  let isLiked = false;
  let isBookmarked = false;
  if (user) {
    const { data: like } = await supabase
      .from("experience_likes")
      .select("id")
      .eq("experience_id", id)
      .eq("user_id", user.id)
      .limit(1)
      .single();
    isLiked = !!like;

    const { data: bm } = await supabase
      .from("experience_bookmarks")
      .select("id")
      .eq("experience_id", id)
      .eq("user_id", user.id)
      .limit(1)
      .single();
    isBookmarked = !!bm;
  }

  return { ...data, isLiked, isBookmarked };
}

// ---------------------------------------------------------------------------
// Get trending tags
// ---------------------------------------------------------------------------

export async function getTrendingTags(limit = 10) {
  const supabase = await createClient();

  const { data } = await supabase
    .from("experiences")
    .select("tags")
    .order("created_at", { ascending: false })
    .limit(100);

  if (!data) return [];

  // Count tag frequency
  const counts: Record<string, number> = {};
  data.forEach((exp) => {
    (exp.tags ?? []).forEach((tag: string) => {
      counts[tag] = (counts[tag] || 0) + 1;
    });
  });

  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([tag, count]) => ({ tag, count }));
}
