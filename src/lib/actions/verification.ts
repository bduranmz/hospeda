"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { IdentityDocumentType, IdentityStatus } from "@/types/database";

// ---------------------------------------------------------------------------
// RUT validation (Módulo 11)
// ---------------------------------------------------------------------------

export async function validateRUT(rut: string): Promise<boolean> {
  // Remove dots and hyphens, uppercase
  const clean = rut.replace(/[.\-]/g, "").toUpperCase().trim();
  if (clean.length < 2) return false;

  const body = clean.slice(0, -1);
  const dv = clean.slice(-1);

  if (!/^\d+$/.test(body)) return false;

  let sum = 0;
  let multiplier = 2;
  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i]) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }

  const remainder = sum % 11;
  const expectedDV =
    remainder === 0 ? "0" : remainder === 1 ? "K" : String(11 - remainder);

  return dv === expectedDV;
}

// ---------------------------------------------------------------------------
// Submit identity verification
// ---------------------------------------------------------------------------

export async function submitVerification(data: {
  documentType: IdentityDocumentType;
  documentNumber: string;
  frontImageUrl: string;
  backImageUrl: string;
  selfieUrl: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // If RUT, validate format
  if (data.documentType === "rut") {
    if (!validateRUT(data.documentNumber)) {
      return { error: "RUT inválido. Verifica el número ingresado." };
    }
  }

  // Check if there's already a pending/approved verification
  const { data: existing } = await supabase
    .from("identity_verifications")
    .select("id, status")
    .eq("user_id", user.id)
    .in("status", ["pending", "approved"])
    .maybeSingle();

  if (existing?.status === "approved") {
    return { error: "Tu identidad ya fue verificada" };
  }
  if (existing?.status === "pending") {
    return { error: "Ya tienes una verificación en revisión" };
  }

  // Get current attempt number
  const { count } = await supabase
    .from("identity_verifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  const attemptNumber = (count ?? 0) + 1;

  const { data: verification, error } = await supabase
    .from("identity_verifications")
    .insert({
      user_id: user.id,
      document_type: data.documentType,
      document_number: data.documentNumber,
      front_image_url: data.frontImageUrl,
      back_image_url: data.backImageUrl,
      selfie_url: data.selfieUrl,
      provider: "manual",
      status: "pending" as IdentityStatus,
      attempt_number: attemptNumber,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };

  return { id: verification.id };
}

// ---------------------------------------------------------------------------
// Get verification status for current user
// ---------------------------------------------------------------------------

export async function getVerificationStatus(userId?: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const targetId = userId ?? user.id;

  // Users can only see their own verification unless admin
  if (targetId !== user.id) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    if (!profile?.is_admin) return null;
  }

  const { data } = await supabase
    .from("identity_verifications")
    .select("*")
    .eq("user_id", targetId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return data ?? null;
}

// ---------------------------------------------------------------------------
// Admin review verification
// ---------------------------------------------------------------------------

export async function adminReviewVerification(
  verificationId: string,
  approved: boolean,
  rejectionReason?: string
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

  if (!profile?.is_admin) {
    return { error: "Solo administradores pueden revisar verificaciones" };
  }

  const { data: verification } = await supabase
    .from("identity_verifications")
    .select("id, user_id, status")
    .eq("id", verificationId)
    .single();

  if (!verification) return { error: "Verificación no encontrada" };
  if (verification.status !== "pending") {
    return { error: "Solo se pueden revisar verificaciones pendientes" };
  }

  if (!approved && !rejectionReason) {
    return { error: "Se requiere motivo de rechazo" };
  }

  const newStatus: IdentityStatus = approved ? "approved" : "rejected";

  const { error } = await supabase
    .from("identity_verifications")
    .update({
      status: newStatus,
      rejection_reason: approved ? null : (rejectionReason ?? null),
      verified_at: approved ? new Date().toISOString() : null,
    })
    .eq("id", verificationId);

  if (error) return { error: error.message };

  // Update user's verification_status in profiles
  if (approved) {
    await supabase
      .from("profiles")
      .update({ verification_status: "identity_verified" })
      .eq("id", verification.user_id);
  }

  return { success: true };
}
