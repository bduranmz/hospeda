import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const FLOW_API_URL =
  process.env.FLOW_ENV === "production"
    ? "https://www.flow.cl/api"
    : "https://sandbox.flow.cl/api";

function flowSign(params: Record<string, string>): string {
  const sorted = Object.keys(params).sort();
  const toSign = sorted.map((k) => `${k}${params[k]}`).join("");
  return crypto.createHmac("sha256", process.env.FLOW_SECRET_KEY!).update(toSign).digest("hex");
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const token = formData.get("token") as string;

  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }

  // Get payment status from Flow
  const params: Record<string, string> = {
    apiKey: process.env.FLOW_API_KEY!,
    token,
  };
  params.s = flowSign(params);

  const statusUrl = `${FLOW_API_URL}/payment/getStatus?${new URLSearchParams(params)}`;
  const res = await fetch(statusUrl);
  const result = await res.json();

  // Use service role for webhook (no user session)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const paymentId = result.commerceOrder;
  const success = result.status === 2; // Flow status 2 = paid

  await supabase
    .from("payment_transactions")
    .update({
      status: success ? "success" : "failed",
      provider_response: result,
      completed_at: success ? new Date().toISOString() : null,
    })
    .eq("id", paymentId);

  if (success) {
    const { data: payment } = await supabase
      .from("payment_transactions")
      .select("reservation_id")
      .eq("id", paymentId)
      .single();

    if (payment) {
      await supabase
        .from("reservations")
        .update({ status: "confirmed" })
        .eq("id", payment.reservation_id);

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
    }
  }

  return NextResponse.json({ status: "ok" });
}
