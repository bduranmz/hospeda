"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { PropertyFormData } from "@/types/database";

export async function createProperty(formData: PropertyFormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Ensure user is marked as host
  await supabase
    .from("profiles")
    .update({ is_host: true })
    .eq("id", user.id);

  const { data, error } = await supabase
    .from("properties")
    .insert({
      host_id: user.id,
      title: formData.title,
      description: formData.description,
      property_type: formData.property_type,
      space_type: formData.space_type,
      status: "draft",
      address: formData.address,
      max_guests: formData.max_guests,
      bedrooms: formData.bedrooms,
      beds: formData.beds,
      bathrooms: formData.bathrooms,
      amenities: formData.amenities,
      base_price: formData.base_price,
      weekend_price: formData.weekend_price,
      cleaning_fee: formData.cleaning_fee,
      security_deposit: formData.security_deposit,
      rules: formData.rules,
      cancellation_policy: formData.cancellation_policy,
      instant_booking: formData.instant_booking,
      min_nights: formData.min_nights,
      max_nights: formData.max_nights,
      check_in_time: formData.check_in_time,
      check_out_time: formData.check_out_time,
    })
    .select("id")
    .single();

  if (error) {
    return { error: error.message };
  }

  return { id: data.id };
}

export async function publishProperty(propertyId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "No autenticado" };

  // Verify ownership
  const { data: property } = await supabase
    .from("properties")
    .select("host_id, status")
    .eq("id", propertyId)
    .single();

  if (!property || property.host_id !== user.id) {
    return { error: "No autorizado" };
  }

  const { error } = await supabase
    .from("properties")
    .update({
      status: "published",
      published_at: new Date().toISOString(),
    })
    .eq("id", propertyId);

  if (error) return { error: error.message };
  return { success: true };
}

export async function updatePropertyStatus(
  propertyId: string,
  status: "published" | "paused" | "archived"
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "No autenticado" };

  const { data: property } = await supabase
    .from("properties")
    .select("host_id")
    .eq("id", propertyId)
    .single();

  if (!property || property.host_id !== user.id) {
    return { error: "No autorizado" };
  }

  const updates: Record<string, unknown> = { status };
  if (status === "published") {
    updates.published_at = new Date().toISOString();
  }

  const { error } = await supabase
    .from("properties")
    .update(updates)
    .eq("id", propertyId);

  if (error) return { error: error.message };
  return { success: true };
}

export async function deleteProperty(propertyId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "No autenticado" };

  const { data: property } = await supabase
    .from("properties")
    .select("host_id")
    .eq("id", propertyId)
    .single();

  if (!property || property.host_id !== user.id) {
    return { error: "No autorizado" };
  }

  // Soft delete
  const { error } = await supabase
    .from("properties")
    .update({ deleted_at: new Date().toISOString(), status: "archived" })
    .eq("id", propertyId);

  if (error) return { error: error.message };
  return { success: true };
}
