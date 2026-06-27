"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

// ---------------------------------------------------------------------------
// Toggle favorite
// ---------------------------------------------------------------------------

export async function toggleFavorite(propertyId: string, listName = "default") {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Check if already favorited
  const { data: existing } = await supabase
    .from("favorites")
    .select("id")
    .eq("user_id", user.id)
    .eq("property_id", propertyId)
    .eq("list_name", listName)
    .single();

  if (existing) {
    const { error } = await supabase
      .from("favorites")
      .delete()
      .eq("id", existing.id);
    if (error) return { error: error.message };
    return { favorited: false };
  }

  const { error } = await supabase.from("favorites").insert({
    user_id: user.id,
    property_id: propertyId,
    list_name: listName,
  });

  if (error) return { error: error.message };
  return { favorited: true };
}

// ---------------------------------------------------------------------------
// Get user favorites
// ---------------------------------------------------------------------------

export async function getFavorites(listName?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  let query = supabase
    .from("favorites")
    .select(`
      id, list_name, created_at,
      properties (
        id, title, base_price, address, property_type, space_type, max_guests,
        property_photos ( url, is_cover )
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (listName) {
    query = query.eq("list_name", listName);
  }

  const { data, error } = await query;
  if (error) return [];
  return data ?? [];
}

// ---------------------------------------------------------------------------
// Check if property is favorited
// ---------------------------------------------------------------------------

export async function isFavorited(propertyId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data } = await supabase
    .from("favorites")
    .select("id")
    .eq("user_id", user.id)
    .eq("property_id", propertyId)
    .limit(1)
    .single();

  return !!data;
}

// ---------------------------------------------------------------------------
// Get favorite lists
// ---------------------------------------------------------------------------

export async function getFavoriteLists() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data } = await supabase
    .from("favorites")
    .select("list_name")
    .eq("user_id", user.id);

  if (!data) return [];

  // Count per list
  const counts: Record<string, number> = {};
  data.forEach((f) => {
    counts[f.list_name] = (counts[f.list_name] || 0) + 1;
  });

  return Object.entries(counts).map(([name, count]) => ({ name, count }));
}
