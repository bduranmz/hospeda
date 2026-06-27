"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

// ---------------------------------------------------------------------------
// Admin guard — checks user_metadata for admin role
// ---------------------------------------------------------------------------

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const isAdmin = user.user_metadata?.role === "admin" || user.app_metadata?.role === "admin";
  if (!isAdmin) return { error: "No autorizado", supabase: null, user: null };

  return { error: null, supabase, user };
}

// ---------------------------------------------------------------------------
// Dashboard stats
// ---------------------------------------------------------------------------

export async function getAdminStats() {
  const { error, supabase } = await requireAdmin();
  if (error || !supabase) return null;

  const [users, properties, reservations, revenue] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("properties").select("id", { count: "exact", head: true }).is("deleted_at", null),
    supabase.from("reservations").select("id", { count: "exact", head: true }),
    supabase
      .from("reservations")
      .select("service_fee_guest, service_fee_host")
      .in("status", ["confirmed", "checked_in", "completed"]),
  ]);

  const totalRevenue = (revenue.data || []).reduce(
    (sum, r) => sum + (r.service_fee_guest || 0) + (r.service_fee_host || 0),
    0
  );

  return {
    totalUsers: users.count ?? 0,
    totalProperties: properties.count ?? 0,
    totalReservations: reservations.count ?? 0,
    platformRevenue: totalRevenue,
  };
}

// ---------------------------------------------------------------------------
// Users management
// ---------------------------------------------------------------------------

export async function getAdminUsers(page = 1, perPage = 20) {
  const { error, supabase } = await requireAdmin();
  if (error || !supabase) return { data: [], count: 0 };

  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  const { data, count } = await supabase
    .from("profiles")
    .select("id, full_name, phone, is_host, verification_status, superhost, total_reviews, avg_rating, created_at", { count: "exact" })
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .range(from, to);

  return { data: data ?? [], count: count ?? 0 };
}

// ---------------------------------------------------------------------------
// Properties management
// ---------------------------------------------------------------------------

export async function getAdminProperties(page = 1, perPage = 20) {
  const { error, supabase } = await requireAdmin();
  if (error || !supabase) return { data: [], count: 0 };

  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  const { data, count } = await supabase
    .from("properties")
    .select("id, title, status, property_type, base_price, address, created_at, profiles!properties_host_id_fkey(full_name)", { count: "exact" })
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .range(from, to);

  return { data: data ?? [], count: count ?? 0 };
}

// ---------------------------------------------------------------------------
// Reservations management
// ---------------------------------------------------------------------------

export async function getAdminReservations(page = 1, perPage = 20) {
  const { error, supabase } = await requireAdmin();
  if (error || !supabase) return { data: [], count: 0 };

  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  const { data, count } = await supabase
    .from("reservations")
    .select(`
      id, status, check_in, check_out, total_charged, host_payout, created_at,
      properties(title),
      profiles!reservations_guest_id_fkey(full_name)
    `, { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  return { data: data ?? [], count: count ?? 0 };
}

// ---------------------------------------------------------------------------
// Suspend / unsuspend user
// ---------------------------------------------------------------------------

export async function toggleUserSuspension(userId: string) {
  const { error, supabase } = await requireAdmin();
  if (error || !supabase) return { error: "No autorizado" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("verification_status")
    .eq("id", userId)
    .single();

  if (!profile) return { error: "Usuario no encontrado" };

  const newStatus = profile.verification_status === "suspended" ? "unverified" : "suspended";

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ verification_status: newStatus })
    .eq("id", userId);

  if (updateError) return { error: updateError.message };
  return { success: true, status: newStatus };
}

// ---------------------------------------------------------------------------
// Update property status (admin override)
// ---------------------------------------------------------------------------

export async function adminUpdatePropertyStatus(propertyId: string, status: string) {
  const { error, supabase } = await requireAdmin();
  if (error || !supabase) return { error: "No autorizado" };

  const { error: updateError } = await supabase
    .from("properties")
    .update({ status })
    .eq("id", propertyId);

  if (updateError) return { error: updateError.message };
  return { success: true };
}

// ---------------------------------------------------------------------------
// Platform settings
// ---------------------------------------------------------------------------

export async function getPlatformSettings() {
  const { error, supabase } = await requireAdmin();
  if (error || !supabase) return {};

  const { data } = await supabase.from("platform_settings").select("key, value");
  if (!data) return {};

  const settings: Record<string, unknown> = {};
  data.forEach((s) => { settings[s.key] = s.value; });
  return settings;
}

// ---------------------------------------------------------------------------
// Admin verifications
// ---------------------------------------------------------------------------

export async function getAdminVerifications(page = 1, perPage = 20) {
  const { error, supabase } = await requireAdmin();
  if (error || !supabase) return { data: [], count: 0 };

  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  const { data, count } = await supabase
    .from("identity_verifications")
    .select(`
      id, document_type, document_number, status, submitted_at, reviewed_at, rejection_reason,
      profiles!identity_verifications_user_id_fkey(full_name, verification_status)
    `, { count: "exact" })
    .order("submitted_at", { ascending: false })
    .range(from, to);

  return { data: data ?? [], count: count ?? 0 };
}

export async function adminReviewVerification(
  verificationId: string,
  action: "approve" | "reject",
  rejectionReason?: string
) {
  const { error, supabase, user } = await requireAdmin();
  if (error || !supabase || !user) return { error: "No autorizado" };

  const { data: verification } = await supabase
    .from("identity_verifications")
    .select("user_id")
    .eq("id", verificationId)
    .single();

  if (!verification) return { error: "Verificacion no encontrada" };

  const { error: updateError } = await supabase
    .from("identity_verifications")
    .update({
      status: action === "approve" ? "approved" : "rejected",
      reviewed_at: new Date().toISOString(),
      reviewed_by: user.id,
      rejection_reason: action === "reject" ? rejectionReason : null,
    })
    .eq("id", verificationId);

  if (updateError) return { error: updateError.message };

  if (action === "approve") {
    await supabase
      .from("profiles")
      .update({ verification_status: "identity_verified" })
      .eq("id", verification.user_id);
  }

  return { success: true };
}

// ---------------------------------------------------------------------------
// Admin disputes
// ---------------------------------------------------------------------------

export async function getAdminDisputes(page = 1, perPage = 20) {
  const { error, supabase } = await requireAdmin();
  if (error || !supabase) return { data: [], count: 0 };

  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  const { data, count } = await supabase
    .from("disputes")
    .select(`
      id, reason, status, priority, created_at, resolved_at, resolution,
      reservations(id, check_in, check_out, properties(title)),
      profiles!disputes_complainant_id_fkey(full_name)
    `, { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  return { data: data ?? [], count: count ?? 0 };
}

export async function adminResolveDispute(
  disputeId: string,
  resolution: string,
  refundPercent: number
) {
  const { error, supabase, user } = await requireAdmin();
  if (error || !supabase || !user) return { error: "No autorizado" };

  const { error: updateError } = await supabase
    .from("disputes")
    .update({
      status: "resolved",
      resolution,
      refund_amount: refundPercent,
      resolved_at: new Date().toISOString(),
      resolved_by: user.id,
    })
    .eq("id", disputeId);

  if (updateError) return { error: updateError.message };
  return { success: true };
}

export async function updatePlatformSetting(key: string, value: unknown) {
  const { error, supabase, user } = await requireAdmin();
  if (error || !supabase || !user) return { error: "No autorizado" };

  const { error: upsertError } = await supabase
    .from("platform_settings")
    .upsert({
      key,
      value,
      updated_by: user.id,
      updated_at: new Date().toISOString(),
    }, { onConflict: "key" });

  if (upsertError) return { error: upsertError.message };
  return { success: true };
}
