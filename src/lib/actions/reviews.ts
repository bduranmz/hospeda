"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { ReviewType } from "@/types/database";

// ---------------------------------------------------------------------------
// Create review
// ---------------------------------------------------------------------------

export async function createReview(data: {
  reservationId: string;
  rating: number;
  cleanlinessRating?: number;
  communicationRating?: number;
  checkinRating?: number;
  accuracyRating?: number;
  locationRating?: number;
  valueRating?: number;
  comment?: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  if (data.rating < 1 || data.rating > 5) return { error: "Rating debe ser entre 1 y 5" };

  // Get reservation details
  const { data: reservation } = await supabase
    .from("reservations")
    .select("id, guest_id, host_id, property_id, status")
    .eq("id", data.reservationId)
    .single();

  if (!reservation) return { error: "Reserva no encontrada" };
  if (reservation.status !== "completed") return { error: "Solo puedes reseñar reservas completadas" };

  const isGuest = reservation.guest_id === user.id;
  const isHost = reservation.host_id === user.id;
  if (!isGuest && !isHost) return { error: "No autorizado" };

  const reviewType: ReviewType = isGuest ? "guest_to_host" : "host_to_guest";
  const revieweeId = isGuest ? reservation.host_id : reservation.guest_id;

  // Check if already reviewed
  const { data: existing } = await supabase
    .from("reviews")
    .select("id")
    .eq("reservation_id", data.reservationId)
    .eq("reviewer_id", user.id)
    .single();

  if (existing) return { error: "Ya dejaste una reseña para esta reserva" };

  const { error } = await supabase.from("reviews").insert({
    reservation_id: data.reservationId,
    reviewer_id: user.id,
    reviewee_id: revieweeId,
    property_id: isGuest ? reservation.property_id : null,
    review_type: reviewType,
    rating: data.rating,
    cleanliness_rating: data.cleanlinessRating ?? null,
    communication_rating: data.communicationRating ?? null,
    checkin_rating: data.checkinRating ?? null,
    accuracy_rating: data.accuracyRating ?? null,
    location_rating: data.locationRating ?? null,
    value_rating: data.valueRating ?? null,
    comment: data.comment?.trim() || null,
  });

  if (error) return { error: error.message };
  return { success: true };
}

// ---------------------------------------------------------------------------
// Host response
// ---------------------------------------------------------------------------

export async function respondToReview(reviewId: string, response: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  if (!response.trim()) return { error: "Respuesta vacía" };

  const { data: review } = await supabase
    .from("reviews")
    .select("id, reviewee_id, host_response")
    .eq("id", reviewId)
    .single();

  if (!review) return { error: "Reseña no encontrada" };
  if (review.reviewee_id !== user.id) return { error: "Solo el reseñado puede responder" };
  if (review.host_response) return { error: "Ya respondiste a esta reseña" };

  const { error } = await supabase
    .from("reviews")
    .update({
      host_response: response.trim(),
      host_response_at: new Date().toISOString(),
    })
    .eq("id", reviewId);

  if (error) return { error: error.message };
  return { success: true };
}

// ---------------------------------------------------------------------------
// Get reviews for a property
// ---------------------------------------------------------------------------

export async function getPropertyReviews(propertyId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("reviews")
    .select(`
      *,
      reviewer:profiles!reviews_reviewer_id_fkey ( full_name, avatar_url )
    `)
    .eq("property_id", propertyId)
    .eq("review_type", "guest_to_host")
    .eq("is_visible", true)
    .order("created_at", { ascending: false });

  if (error) return [];
  return data ?? [];
}
