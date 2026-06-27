"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { DisputeStatus } from "@/types/database";

// ---------------------------------------------------------------------------
// Create dispute
// ---------------------------------------------------------------------------

export async function createDispute(
  reservationId: string,
  reason: string,
  description: string,
  evidenceUrls: string[] = []
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Verify the user is host or guest of this reservation
  const { data: reservation } = await supabase
    .from("reservations")
    .select("id, host_id, guest_id, status")
    .eq("id", reservationId)
    .single();

  if (!reservation) return { error: "Reserva no encontrada" };

  const isHost = reservation.host_id === user.id;
  const isGuest = reservation.guest_id === user.id;

  if (!isHost && !isGuest) return { error: "No autorizado para disputar esta reserva" };

  // Only allow disputes on certain statuses
  const disputeableStatuses = ["confirmed", "checked_in", "completed", "cancelled_by_guest", "cancelled_by_host"];
  if (!disputeableStatuses.includes(reservation.status)) {
    return { error: "No se puede iniciar una disputa en el estado actual de la reserva" };
  }

  // Check if there's already an open dispute for this reservation
  const { data: existing } = await supabase
    .from("disputes")
    .select("id, status")
    .eq("reservation_id", reservationId)
    .not("status", "in", '("resolved_guest_favor","resolved_host_favor","resolved_partial","closed")')
    .maybeSingle();

  if (existing) return { error: "Ya existe una disputa activa para esta reserva" };

  const { data: dispute, error } = await supabase
    .from("disputes")
    .insert({
      reservation_id: reservationId,
      complainant_id: user.id,
      respondent_id: isHost ? reservation.guest_id : reservation.host_id,
      reason,
      description,
      evidence_urls: evidenceUrls,
      status: "open" as DisputeStatus,
      escalate_after: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(),
    })
    .select("id")
    .single();

  if (error) return { error: error.message };

  // Update reservation status to disputed
  await supabase
    .from("reservations")
    .update({ status: "disputed" })
    .eq("id", reservationId);

  return { id: dispute.id };
}

// ---------------------------------------------------------------------------
// Get disputes for user (as host or guest)
// ---------------------------------------------------------------------------

export async function getDisputes(userId?: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const targetId = userId ?? user.id;

  const { data, error } = await supabase
    .from("disputes")
    .select(`
      *,
      reservations (
        id, check_in, check_out,
        properties ( id, title )
      ),
      complainant:profiles!disputes_complainant_id_fkey ( full_name, avatar_url ),
      respondent:profiles!disputes_respondent_id_fkey ( full_name, avatar_url )
    `)
    .or(`complainant_id.eq.${targetId},respondent_id.eq.${targetId}`)
    .order("created_at", { ascending: false });

  if (error) return [];
  return data ?? [];
}

// ---------------------------------------------------------------------------
// Get single dispute by ID
// ---------------------------------------------------------------------------

export async function getDisputeById(disputeId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: dispute, error } = await supabase
    .from("disputes")
    .select(`
      *,
      reservations (
        id, check_in, check_out, total_charged, status,
        properties ( id, title, address )
      ),
      complainant:profiles!disputes_complainant_id_fkey ( full_name, avatar_url ),
      respondent:profiles!disputes_respondent_id_fkey ( full_name, avatar_url )
    `)
    .eq("id", disputeId)
    .single();

  if (error || !dispute) return null;

  // Check access: must be complainant, respondent, or admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  const isAdmin = profile?.is_admin ?? false;
  const isParty =
    dispute.complainant_id === user.id || dispute.respondent_id === user.id;

  if (!isParty && !isAdmin) return null;

  // Also fetch messages
  const { data: messages } = await supabase
    .from("dispute_messages")
    .select(`
      *,
      sender:profiles!dispute_messages_sender_id_fkey ( full_name, avatar_url )
    `)
    .eq("dispute_id", disputeId)
    .order("created_at", { ascending: true });

  return { ...dispute, messages: messages ?? [] };
}

// ---------------------------------------------------------------------------
// Add message to dispute
// ---------------------------------------------------------------------------

export async function addDisputeMessage(
  disputeId: string,
  message: string,
  evidenceUrls: string[] = []
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "No autenticado" };

  const { data: dispute } = await supabase
    .from("disputes")
    .select("id, complainant_id, respondent_id, status")
    .eq("id", disputeId)
    .single();

  if (!dispute) return { error: "Disputa no encontrada" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  const isAdmin = profile?.is_admin ?? false;
  const isParty =
    dispute.complainant_id === user.id || dispute.respondent_id === user.id;

  if (!isParty && !isAdmin) return { error: "No autorizado" };

  const closedStatuses = [
    "resolved_guest_favor",
    "resolved_host_favor",
    "resolved_partial",
    "closed",
  ];
  if (closedStatuses.includes(dispute.status)) {
    return { error: "La disputa ya está cerrada" };
  }

  const { error } = await supabase.from("dispute_messages").insert({
    dispute_id: disputeId,
    sender_id: user.id,
    message,
    evidence_urls: evidenceUrls,
    is_admin_message: isAdmin,
  });

  if (error) return { error: error.message };

  // Update dispute status to under_review if it was open
  if (dispute.status === "open") {
    await supabase
      .from("disputes")
      .update({ status: "under_review" as DisputeStatus })
      .eq("id", disputeId);
  }

  return { success: true };
}

// ---------------------------------------------------------------------------
// Resolve dispute — admin only
// ---------------------------------------------------------------------------

export async function resolveDispute(
  disputeId: string,
  resolution: DisputeStatus,
  refundPercentage: number,
  adminNotes: string
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "No autenticado" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) return { error: "Solo administradores pueden resolver disputas" };

  const validResolutions: DisputeStatus[] = [
    "resolved_guest_favor",
    "resolved_host_favor",
    "resolved_partial",
    "closed",
  ];
  if (!validResolutions.includes(resolution)) {
    return { error: "Resolución inválida" };
  }

  if (refundPercentage < 0 || refundPercentage > 100) {
    return { error: "El porcentaje de reembolso debe ser entre 0 y 100" };
  }

  const { data: dispute } = await supabase
    .from("disputes")
    .select("id, reservation_id")
    .eq("id", disputeId)
    .single();

  if (!dispute) return { error: "Disputa no encontrada" };

  const { error } = await supabase
    .from("disputes")
    .update({
      status: resolution,
      refund_percentage: refundPercentage,
      admin_notes: adminNotes,
      resolved_by: user.id,
      resolved_at: new Date().toISOString(),
    })
    .eq("id", disputeId);

  if (error) return { error: error.message };

  return { success: true };
}

// ---------------------------------------------------------------------------
// Escalate dispute (auto-escalate after 72h unresolved)
// ---------------------------------------------------------------------------

export async function escalateDispute(disputeId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "No autenticado" };

  const { data: dispute } = await supabase
    .from("disputes")
    .select("id, status, escalate_after, complainant_id, respondent_id")
    .eq("id", disputeId)
    .single();

  if (!dispute) return { error: "Disputa no encontrada" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  const isAdmin = profile?.is_admin ?? false;
  const isParty =
    dispute.complainant_id === user.id || dispute.respondent_id === user.id;

  if (!isAdmin && !isParty) return { error: "No autorizado" };

  // Check if 72h have passed
  if (dispute.escalate_after && new Date() < new Date(dispute.escalate_after)) {
    return { error: "La disputa aún no puede ser escalada (esperando 72h)" };
  }

  if (!["open", "under_review"].includes(dispute.status)) {
    return { error: "Solo se pueden escalar disputas abiertas o en revisión" };
  }

  const { error } = await supabase
    .from("disputes")
    .update({
      status: "under_review" as DisputeStatus,
      escalated_at: new Date().toISOString(),
    })
    .eq("id", disputeId);

  if (error) return { error: error.message };

  return { success: true };
}
