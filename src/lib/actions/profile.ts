"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function updateProfile(data: {
  fullName: string;
  phone?: string;
  bio?: string;
  dateOfBirth?: string;
  nationality?: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: data.fullName,
      phone: data.phone || null,
      bio: data.bio || null,
      date_of_birth: data.dateOfBirth || null,
      nationality: data.nationality || null,
    })
    .eq("id", user.id);

  if (error) return { error: error.message };
  return { success: true };
}

export async function updateBankAccount(data: {
  bank: string;
  accountType: string;
  accountNumber: string;
  rutHolder: string;
  nameHolder: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase
    .from("profiles")
    .update({
      bank_account: {
        bank: data.bank,
        account_type: data.accountType,
        account_number: data.accountNumber,
        rut_holder: data.rutHolder,
        name_holder: data.nameHolder,
      },
    })
    .eq("id", user.id);

  if (error) return { error: error.message };
  return { success: true };
}
