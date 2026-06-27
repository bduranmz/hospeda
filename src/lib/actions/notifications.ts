"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

// ---------------------------------------------------------------------------
// Create notification (internal helper)
// ---------------------------------------------------------------------------

export async function createNotification(data: {
  userId: string;
  type: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
}) {
  const supabase = await createClient();

  const { error } = await supabase.from("notifications").insert({
    user_id: data.userId,
    type: data.type,
    title: data.title,
    body: data.body,
    data: data.data || null,
    read: false,
  });

  return { error: error?.message };
}

// ---------------------------------------------------------------------------
// Get notifications for current user
// ---------------------------------------------------------------------------

export async function getNotifications(limit = 20, unreadOnly = false) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  let query = supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (unreadOnly) {
    query = query.eq("read", false);
  }

  const { data, error } = await query;
  if (error) return [];
  return data ?? [];
}

// ---------------------------------------------------------------------------
// Get unread count
// ---------------------------------------------------------------------------

export async function getUnreadNotificationCount() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return 0;

  const { count } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("read", false);

  return count ?? 0;
}

// ---------------------------------------------------------------------------
// Mark as read
// ---------------------------------------------------------------------------

export async function markNotificationRead(notificationId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const { error } = await supabase
    .from("notifications")
    .update({ read: true, read_at: new Date().toISOString() })
    .eq("id", notificationId)
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  return { success: true };
}

export async function markAllNotificationsRead() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const { error } = await supabase
    .from("notifications")
    .update({ read: true, read_at: new Date().toISOString() })
    .eq("user_id", user.id)
    .eq("read", false);

  if (error) return { error: error.message };
  return { success: true };
}

// ---------------------------------------------------------------------------
// Delete notification
// ---------------------------------------------------------------------------

export async function deleteNotification(notificationId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const { error } = await supabase
    .from("notifications")
    .delete()
    .eq("id", notificationId)
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  return { success: true };
}

// ---------------------------------------------------------------------------
// Notification dispatchers (convenience functions)
// ---------------------------------------------------------------------------

export async function notifyReservationRequest(
  hostId: string,
  guestName: string,
  propertyTitle: string,
  reservationId: string
) {
  return createNotification({
    userId: hostId,
    type: "reservation_request",
    title: "Nueva solicitud de reserva",
    body: `${guestName} quiere reservar "${propertyTitle}"`,
    data: { reservationId },
  });
}

export async function notifyReservationConfirmed(
  guestId: string,
  propertyTitle: string,
  reservationId: string
) {
  return createNotification({
    userId: guestId,
    type: "reservation_confirmed",
    title: "Reserva confirmada",
    body: `Tu reserva en "${propertyTitle}" ha sido confirmada`,
    data: { reservationId },
  });
}

export async function notifyPaymentReceived(
  hostId: string,
  amount: number,
  reservationId: string
) {
  return createNotification({
    userId: hostId,
    type: "payment_received",
    title: "Pago recibido",
    body: `Has recibido un pago de $${amount.toLocaleString("es-CL")}`,
    data: { reservationId, amount },
  });
}

export async function notifyReservationCancelled(
  userId: string,
  propertyTitle: string,
  cancelledBy: "guest" | "host",
  reservationId: string
) {
  return createNotification({
    userId,
    type: "reservation_cancelled",
    title: "Reserva cancelada",
    body: `La reserva en "${propertyTitle}" fue cancelada por el ${cancelledBy === "guest" ? "huésped" : "anfitrión"}`,
    data: { reservationId, cancelledBy },
  });
}

export async function notifyNewReview(
  userId: string,
  reviewerName: string,
  rating: number,
  reservationId: string
) {
  return createNotification({
    userId,
    type: "new_review",
    title: "Nueva reseña",
    body: `${reviewerName} te dejó una reseña (${rating}/5)`,
    data: { reservationId, rating },
  });
}

export async function notifyCheckInReminder(
  guestId: string,
  propertyTitle: string,
  checkInDate: string,
  reservationId: string
) {
  return createNotification({
    userId: guestId,
    type: "check_in_reminder",
    title: "Recordatorio de check-in",
    body: `Tu check-in en "${propertyTitle}" es el ${checkInDate}`,
    data: { reservationId, checkInDate },
  });
}
