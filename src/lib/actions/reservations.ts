"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { ReservationStatus } from "@/types/database";

// ---------------------------------------------------------------------------
// Price calculation helpers
// ---------------------------------------------------------------------------

function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 5 || day === 6; // Fri, Sat
}

function calculateNights(checkIn: string, checkOut: string): number {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}

function calculatePriceBreakdown(
  checkIn: string,
  checkOut: string,
  basePrice: number,
  weekendPrice: number | null,
  cleaningFee: number,
  securityDeposit: number
) {
  const nights = calculateNights(checkIn, checkOut);
  let basePriceTotal = 0;
  const current = new Date(checkIn);

  for (let i = 0; i < nights; i++) {
    if (weekendPrice && isWeekend(current)) {
      basePriceTotal += weekendPrice;
    } else {
      basePriceTotal += basePrice;
    }
    current.setDate(current.getDate() + 1);
  }

  const serviceFeeGuest = Math.round(basePriceTotal * 0.08); // 8% guest fee
  const serviceFeeHost = Math.round(basePriceTotal * 0.05); // 5% host fee
  const totalCharged = basePriceTotal + cleaningFee + serviceFeeGuest;
  const hostPayout = basePriceTotal + cleaningFee - serviceFeeHost;

  return {
    nights,
    base_price_per_night: basePrice,
    base_price_total: basePriceTotal,
    cleaning_fee: cleaningFee,
    security_deposit: securityDeposit,
    service_fee_guest: serviceFeeGuest,
    service_fee_host: serviceFeeHost,
    total_charged: totalCharged,
    host_payout: hostPayout,
    currency: "CLP",
  };
}

// ---------------------------------------------------------------------------
// Create reservation
// ---------------------------------------------------------------------------

export async function createReservation(data: {
  propertyId: string;
  checkIn: string;
  checkOut: string;
  guestsCount: number;
  specialRequests?: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Fetch property details
  const { data: property, error: propError } = await supabase
    .from("properties")
    .select("id, host_id, base_price, weekend_price, cleaning_fee, security_deposit, instant_booking, min_nights, max_nights, max_guests, status")
    .eq("id", data.propertyId)
    .eq("status", "published")
    .is("deleted_at", null)
    .single();

  if (propError || !property) return { error: "Propiedad no encontrada" };
  if (property.host_id === user.id) return { error: "No puedes reservar tu propia propiedad" };

  const nights = calculateNights(data.checkIn, data.checkOut);
  if (nights < 1) return { error: "Fechas inválidas" };
  if (nights < property.min_nights) return { error: `Mínimo ${property.min_nights} noches` };
  if (property.max_nights && nights > property.max_nights) return { error: `Máximo ${property.max_nights} noches` };
  if (data.guestsCount > property.max_guests) return { error: `Máximo ${property.max_guests} huéspedes` };

  // Check availability (no overlapping confirmed reservations or calendar blocks)
  const { data: conflicts } = await supabase
    .from("reservations")
    .select("id")
    .eq("property_id", data.propertyId)
    .in("status", ["pending_approval", "approved", "confirmed", "checked_in"])
    .lt("check_in", data.checkOut)
    .gt("check_out", data.checkIn);

  if (conflicts && conflicts.length > 0) return { error: "Fechas no disponibles" };

  const { data: blocks } = await supabase
    .from("calendar_blocks")
    .select("id")
    .eq("property_id", data.propertyId)
    .is("reservation_id", null)
    .lt("start_date", data.checkOut)
    .gt("end_date", data.checkIn);

  if (blocks && blocks.length > 0) return { error: "Fechas bloqueadas por el anfitrión" };

  const pricing = calculatePriceBreakdown(
    data.checkIn, data.checkOut,
    property.base_price, property.weekend_price,
    property.cleaning_fee, property.security_deposit
  );

  const initialStatus: ReservationStatus = property.instant_booking
    ? "payment_pending"
    : "pending_approval";

  const { data: reservation, error } = await supabase
    .from("reservations")
    .insert({
      property_id: data.propertyId,
      guest_id: user.id,
      host_id: property.host_id,
      status: initialStatus,
      check_in: data.checkIn,
      check_out: data.checkOut,
      guests_count: data.guestsCount,
      special_requests: data.specialRequests || null,
      ...pricing,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };
  return { id: reservation.id, status: initialStatus };
}

// ---------------------------------------------------------------------------
// Host actions
// ---------------------------------------------------------------------------

export async function updateReservationStatus(
  reservationId: string,
  action: "approve" | "reject" | "cancel",
  reason?: string
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "No autenticado" };

  const { data: reservation } = await supabase
    .from("reservations")
    .select("id, host_id, guest_id, status")
    .eq("id", reservationId)
    .single();

  if (!reservation) return { error: "Reserva no encontrada" };

  const isHost = reservation.host_id === user.id;
  const isGuest = reservation.guest_id === user.id;

  let newStatus: ReservationStatus;
  const updates: Record<string, unknown> = {};

  switch (action) {
    case "approve":
      if (!isHost) return { error: "Solo el anfitrión puede aprobar" };
      if (reservation.status !== "pending_approval") return { error: "Estado inválido" };
      newStatus = "payment_pending";
      break;
    case "reject":
      if (!isHost) return { error: "Solo el anfitrión puede rechazar" };
      if (reservation.status !== "pending_approval") return { error: "Estado inválido" };
      newStatus = "rejected";
      updates.rejection_reason = reason || null;
      break;
    case "cancel":
      if (!isHost && !isGuest) return { error: "No autorizado" };
      if (!["pending_approval", "approved", "payment_pending", "confirmed"].includes(reservation.status)) {
        return { error: "No se puede cancelar en este estado" };
      }
      newStatus = isGuest ? "cancelled_by_guest" : "cancelled_by_host";
      updates.cancelled_at = new Date().toISOString();
      updates.cancellation_reason = reason || null;
      break;
    default:
      return { error: "Acción inválida" };
  }

  updates.status = newStatus;

  const { error } = await supabase
    .from("reservations")
    .update(updates)
    .eq("id", reservationId);

  if (error) return { error: error.message };
  return { success: true, status: newStatus };
}

// ---------------------------------------------------------------------------
// Check-in / Check-out
// ---------------------------------------------------------------------------

export async function confirmCheckIn(reservationId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const { data: reservation } = await supabase
    .from("reservations")
    .select("id, host_id, status")
    .eq("id", reservationId)
    .single();

  if (!reservation || reservation.host_id !== user.id) return { error: "No autorizado" };
  if (reservation.status !== "confirmed") return { error: "La reserva debe estar confirmada" };

  const { error } = await supabase
    .from("reservations")
    .update({
      status: "checked_in",
      check_in_confirmed_at: new Date().toISOString(),
    })
    .eq("id", reservationId);

  if (error) return { error: error.message };
  return { success: true };
}

export async function confirmCheckOut(reservationId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const { data: reservation } = await supabase
    .from("reservations")
    .select("id, host_id, status")
    .eq("id", reservationId)
    .single();

  if (!reservation || reservation.host_id !== user.id) return { error: "No autorizado" };
  if (reservation.status !== "checked_in") return { error: "Debe tener check-in" };

  const { error } = await supabase
    .from("reservations")
    .update({
      status: "completed",
      check_out_confirmed_at: new Date().toISOString(),
    })
    .eq("id", reservationId);

  if (error) return { error: error.message };
  return { success: true };
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

export async function getReservationsForHost(filter?: ReservationStatus) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  let query = supabase
    .from("reservations")
    .select(`
      *,
      properties ( id, title, address, property_photos ( url, is_cover ) ),
      profiles!reservations_guest_id_fkey ( full_name, avatar_url )
    `)
    .eq("host_id", user.id)
    .order("created_at", { ascending: false });

  if (filter) {
    query = query.eq("status", filter);
  }

  const { data, error } = await query;
  if (error) return [];
  return data ?? [];
}

export async function getReservationsForGuest() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data, error } = await supabase
    .from("reservations")
    .select(`
      *,
      properties ( id, title, address, property_photos ( url, is_cover ) ),
      profiles!reservations_host_id_fkey ( full_name, avatar_url )
    `)
    .eq("guest_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return [];
  return data ?? [];
}

export async function getAvailability(propertyId: string, month: string) {
  // month format: "2026-07"
  const supabase = await createClient();
  const startDate = `${month}-01`;
  const endDate = new Date(parseInt(month.split("-")[0]), parseInt(month.split("-")[1]), 0)
    .toISOString()
    .split("T")[0];

  const [reservations, blocks] = await Promise.all([
    supabase
      .from("reservations")
      .select("check_in, check_out")
      .eq("property_id", propertyId)
      .in("status", ["pending_approval", "approved", "confirmed", "checked_in"])
      .lt("check_in", endDate)
      .gt("check_out", startDate),
    supabase
      .from("calendar_blocks")
      .select("start_date, end_date")
      .eq("property_id", propertyId)
      .is("reservation_id", null)
      .lt("start_date", endDate)
      .gt("end_date", startDate),
  ]);

  // Build set of unavailable dates
  const unavailable = new Set<string>();
  const addRange = (start: string, end: string) => {
    const cur = new Date(start);
    const endD = new Date(end);
    while (cur < endD) {
      unavailable.add(cur.toISOString().split("T")[0]);
      cur.setDate(cur.getDate() + 1);
    }
  };

  (reservations.data ?? []).forEach((r) => addRange(r.check_in, r.check_out));
  (blocks.data ?? []).forEach((b) => addRange(b.start_date, b.end_date));

  return Array.from(unavailable);
}

// ---------------------------------------------------------------------------
// Calendar blocks (host)
// ---------------------------------------------------------------------------

export async function createCalendarBlock(data: {
  propertyId: string;
  startDate: string;
  endDate: string;
  reason?: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const { data: property } = await supabase
    .from("properties")
    .select("host_id")
    .eq("id", data.propertyId)
    .single();

  if (!property || property.host_id !== user.id) return { error: "No autorizado" };

  const { error } = await supabase
    .from("calendar_blocks")
    .insert({
      property_id: data.propertyId,
      start_date: data.startDate,
      end_date: data.endDate,
      reason: data.reason || null,
    });

  if (error) return { error: error.message };
  return { success: true };
}

export async function deleteCalendarBlock(blockId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const { data: block } = await supabase
    .from("calendar_blocks")
    .select("id, property_id, properties!inner(host_id)")
    .eq("id", blockId)
    .single();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (!block || (block.properties as any).host_id !== user.id) {
    return { error: "No autorizado" };
  }

  const { error } = await supabase
    .from("calendar_blocks")
    .delete()
    .eq("id", blockId);

  if (error) return { error: error.message };
  return { success: true };
}
