import { type EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendEmail, welcomeEmail } from "@/lib/email";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/";

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const redirectTo = new URL(next, siteUrl);

  if (!token_hash || !type) {
    redirectTo.pathname = "/auth/error";
    redirectTo.searchParams.set("error", "missing_params");
    return NextResponse.redirect(redirectTo);
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.verifyOtp({
    type,
    token_hash,
  });

  if (error || !data.user) {
    console.error("[auth/confirm] OTP verification failed:", error?.message);
    redirectTo.pathname = "/auth/error";
    redirectTo.searchParams.set("error", error?.message ?? "verification_failed");
    return NextResponse.redirect(redirectTo);
  }

  // Send welcome email on signup confirmation
  if (type === "signup") {
    try {
      const user = data.user;
      const name =
        (user.user_metadata?.full_name as string | undefined) ??
        (user.email?.split("@")[0] ?? "usuario");

      await sendEmail({
        to: user.email!,
        subject: "¡Bienvenido/a a Hospeda!",
        html: welcomeEmail(name),
      });
    } catch (emailError) {
      // Non-fatal — log and continue. User is already confirmed.
      console.error("[auth/confirm] Failed to send welcome email:", emailError);
    }
  }

  return NextResponse.redirect(redirectTo);
}
