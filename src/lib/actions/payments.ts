"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { PaymentProvider } from "@/types/database";
import crypto from "crypto";

// ---------------------------------------------------------------------------
// Webpay Integration (Transbank)
// ---------------------------------------------------------------------------

const WEBPAY_API_URL =
  process.env.WEBPAY_ENVIRONMENT === "production"
    ? "https://webpay3g.transbank.cl"
    : "https://webpay3gint.transbank.cl";

async function webpayRequest(endpoint: string, body: Record<string, unknown>) {
  const res = await fetch(`${WEBPAY_API_URL}/rswebpaytransaction/api/webpay/v1.2${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Tbk-Api-Key-Id": process.env.WEBPAY_COMMERCE_CODE!,
      "Tbk-Api-Key-Secret": process.env.WEBPAY_API_KEY!,
    },
    body: JSON.stringify(body),
  });
  return res.json();
}

async function webpayGet(endpoint: string) {
  const res = await fetch(`${WEBPAY_API_URL}/rswebpaytransaction/api/webpay/v1.2${endpoint}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Tbk-Api-Key-Id": process.env.WEBPAY_COMMERCE_CODE!,
      "Tbk-Api-Key-Secret": process.env.WEBPAY_API_KEY!,
    },
  });
  return res.json();
}

// ---------------------------------------------------------------------------
// Flow.cl Integration
// ---------------------------------------------------------------------------

const FLOW_API_URL =
  process.env.FLOW_ENV === "production"
    ? "https://www.flow.cl/api"
    : "https://sandbox.flow.cl/api";

function flowSign(params: Record<string, string>): string {
  const sorted = Object.keys(params).sort();
  const toSign = sorted.map((k) => `${k}${params[k]}`).join("");
  return crypto.createHmac("sha256", process.env.FLOW_SECRET_KEY!).update(toSign).digest("hex");
}

async function flowRequest(endpoint: string, params: Record<string, string>) {
  params.apiKey = process.env.FLOW_API_KEY!;
  params.s = flowSign(params);

  const body = new URLSearchParams(params);
  const res = await fetch(`${FLOW_API_URL}${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });
  return res.json();
}

// ---------------------------------------------------------------------------
// Initiate Payment — creates transaction and returns redirect URL
// ---------------------------------------------------------------------------

export async function initiatePayment(
  reservationId: string,
  provider: PaymentProvider
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Fetch reservation
  const { data: reservation } = await supabase
    .from("reservations")
    .select("id, guest_id, total_charged, status, currency")
    .eq("id", reservationId)
    .single();

  if (!reservation) return { error: "Reserva no encontrada" };
  if (reservation.guest_id !== user.id) return { error: "No autorizado" };
  if (reservation.status !== "payment_pending") return { error: "Estado inválido para pago" };

  // Idempotency key
  const idempotencyKey = `${reservationId}-${provider}-${Date.now()}`;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  // Create payment record
  const { data: payment, error: paymentError } = await supabase
    .from("payment_transactions")
    .insert({
      reservation_id: reservationId,
      provider,
      payment_type: "charge",
      status: "pending",
      amount: reservation.total_charged,
      currency: reservation.currency || "CLP",
      idempotency_key: idempotencyKey,
    })
    .select("id")
    .single();

  if (paymentError) return { error: paymentError.message };

  // Create transaction with provider
  if (provider === "webpay") {
    const result = await webpayRequest("/transactions", {
      buy_order: payment.id.substring(0, 26),
      session_id: user.id.substring(0, 36),
      amount: reservation.total_charged,
      return_url: `${siteUrl}/pagos/webpay-return?payment_id=${payment.id}`,
    });

    if (!result.token) {
      await supabase
        .from("payment_transactions")
        .update({ status: "failed", provider_response: result })
        .eq("id", payment.id);
      return { error: "Error al crear transacción Webpay" };
    }

    await supabase
      .from("payment_transactions")
      .update({ provider_transaction_id: result.token, provider_response: result })
      .eq("id", payment.id);

    return { redirectUrl: `${result.url}?token_ws=${result.token}` };
  }

  // Flow.cl
  const result = await flowRequest("/payment/create", {
    commerceOrder: payment.id,
    subject: `Reserva Hospeda #${reservationId.substring(0, 8)}`,
    currency: "CLP",
    amount: String(reservation.total_charged),
    email: user.email || "",
    urlConfirmation: `${siteUrl}/api/payments/flow-confirm`,
    urlReturn: `${siteUrl}/pagos/flow-return?payment_id=${payment.id}`,
  });

  if (!result.url || !result.token) {
    await supabase
      .from("payment_transactions")
      .update({ status: "failed", provider_response: result })
      .eq("id", payment.id);
    return { error: "Error al crear transacción Flow" };
  }

  await supabase
    .from("payment_transactions")
    .update({ provider_transaction_id: result.token, provider_response: result })
    .eq("id", payment.id);

  return { redirectUrl: `${result.url}?token=${result.token}` };
}

// ---------------------------------------------------------------------------
// Confirm Webpay Payment (called from return page)
// ---------------------------------------------------------------------------

export async function confirmWebpayPayment(paymentId: string, tokenWs: string) {
  const supabase = await createClient();

  const { data: payment } = await supabase
    .from("payment_transactions")
    .select("id, reservation_id, status, amount")
    .eq("id", paymentId)
    .single();

  if (!payment) return { error: "Pago no encontrado" };
  if (payment.status !== "pending") return { error: "Pago ya procesado" };

  const result = await webpayGet(`/transactions/${tokenWs}`);

  const success = result.status === "AUTHORIZED" && result.response_code === 0;

  await supabase
    .from("payment_transactions")
    .update({
      status: success ? "success" : "failed",
      provider_response: result,
      completed_at: success ? new Date().toISOString() : null,
    })
    .eq("id", paymentId);

  if (success) {
    await supabase
      .from("reservations")
      .update({ status: "confirmed" })
      .eq("id", payment.reservation_id);

    // Update host balance
    const { data: reservation } = await supabase
      .from("reservations")
      .select("host_id, host_payout")
      .eq("id", payment.reservation_id)
      .single();

    if (reservation) {
      await supabase.rpc("increment_host_pending_balance", {
        p_host_id: reservation.host_id,
        p_amount: reservation.host_payout,
      });
    }
  } else {
    await supabase
      .from("reservations")
      .update({ status: "payment_failed" })
      .eq("id", payment.reservation_id);
  }

  return { success, reservationId: payment.reservation_id };
}

// ---------------------------------------------------------------------------
// Get payment status for a reservation
// ---------------------------------------------------------------------------

export async function getPaymentForReservation(reservationId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data } = await supabase
    .from("payment_transactions")
    .select("*")
    .eq("reservation_id", reservationId)
    .eq("payment_type", "charge")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  return data;
}

// ---------------------------------------------------------------------------
// Request refund
// ---------------------------------------------------------------------------

export async function requestRefund(reservationId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const { data: reservation } = await supabase
    .from("reservations")
    .select("id, guest_id, host_id, status, total_charged, cancellation_policy")
    .eq("id", reservationId)
    .single();

  if (!reservation) return { error: "Reserva no encontrada" };
  if (reservation.guest_id !== user.id && reservation.host_id !== user.id) {
    return { error: "No autorizado" };
  }

  if (!["cancelled_by_guest", "cancelled_by_host"].includes(reservation.status)) {
    return { error: "Solo se puede reembolsar reservas canceladas" };
  }

  // Calculate refund based on cancellation policy
  let refundPercentage = 0;
  if (reservation.status === "cancelled_by_host") {
    refundPercentage = 100; // Host cancels = full refund
  } else {
    switch (reservation.cancellation_policy) {
      case "flexible":
        refundPercentage = 100;
        break;
      case "moderate":
        refundPercentage = 50;
        break;
      case "strict":
        refundPercentage = 0;
        break;
      case "non_refundable":
        refundPercentage = 0;
        break;
    }
  }

  if (refundPercentage === 0) return { error: "Esta reserva no es reembolsable" };

  const refundAmount = Math.round(reservation.total_charged * (refundPercentage / 100));

  // Get original payment
  const { data: originalPayment } = await supabase
    .from("payment_transactions")
    .select("id, provider, provider_transaction_id")
    .eq("reservation_id", reservationId)
    .eq("payment_type", "charge")
    .eq("status", "success")
    .single();

  if (!originalPayment) return { error: "Pago original no encontrado" };

  // Create refund record
  await supabase.from("payment_transactions").insert({
    reservation_id: reservationId,
    provider: originalPayment.provider,
    payment_type: "refund",
    status: "pending",
    amount: refundAmount,
    currency: "CLP",
  });

  // Update reservation with refund amount
  await supabase
    .from("reservations")
    .update({ refund_amount: refundAmount })
    .eq("id", reservationId);

  return { success: true, refundAmount, refundPercentage };
}
