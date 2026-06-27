"use client";

import { useState } from "react";
import { Zap, Calendar } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface BookingCardProps {
  basePrice: number;
  weekendPrice: number | null;
  cleaningFee: number;
  securityDeposit: number;
  minNights: number;
  maxNights: number | null;
  instantBooking: boolean;
}

function formatCLP(amount: number): string {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    minimumFractionDigits: 0,
  }).format(amount);
}

export default function BookingCard({
  basePrice,
  cleaningFee,
  securityDeposit,
  minNights,
  maxNights,
  instantBooking,
}: BookingCardProps) {
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);

  // Calculate nights
  let nights = 0;
  if (checkIn && checkOut) {
    const diff =
      new Date(checkOut).getTime() - new Date(checkIn).getTime();
    nights = Math.max(0, Math.round(diff / (1000 * 60 * 60 * 24)));
  }

  const subtotal = basePrice * nights;
  const serviceFee = Math.round(subtotal * 0.08);
  const total = subtotal + cleaningFee + serviceFee;

  return (
    <div className="border border-gray-200 rounded-2xl p-6 shadow-sm bg-white sticky top-24">
      {/* Price */}
      <div className="flex items-baseline gap-1.5 mb-6">
        <span className="text-2xl font-bold text-gray-900">
          {formatCLP(basePrice)}
        </span>
        <span className="text-sm text-gray-500">/ noche</span>
      </div>

      {/* Date inputs */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Check-in
          </label>
          <div className="relative">
            <Calendar
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="date"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Check-out
          </label>
          <div className="relative">
            <Calendar
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="date"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              min={checkIn || new Date().toISOString().split("T")[0]}
              className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>
      </div>

      {/* Guests */}
      <div className="mb-5">
        <label className="block text-xs font-medium text-gray-500 mb-1">
          Huéspedes
        </label>
        <select
          value={guests}
          onChange={(e) => setGuests(Number(e.target.value))}
          className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
        >
          {Array.from({ length: 16 }, (_, i) => i + 1).map((n) => (
            <option key={n} value={n}>
              {n} huésped{n > 1 ? "es" : ""}
            </option>
          ))}
        </select>
      </div>

      {/* CTA */}
      <Button fullWidth size="lg">
        {instantBooking ? (
          <span className="flex items-center gap-2">
            <Zap size={16} />
            Reservar ahora
          </span>
        ) : (
          "Solicitar reserva"
        )}
      </Button>

      {/* Min nights */}
      <p className="text-center text-xs text-gray-400 mt-2">
        Mínimo {minNights} noche{minNights > 1 ? "s" : ""}
        {maxNights ? ` · Máximo ${maxNights} noches` : ""}
      </p>

      {/* Price breakdown */}
      {nights > 0 && (
        <div className="mt-5 pt-5 border-t border-gray-100 space-y-2 text-sm">
          <div className="flex justify-between text-gray-600">
            <span>
              {formatCLP(basePrice)} x {nights} noche{nights > 1 ? "s" : ""}
            </span>
            <span>{formatCLP(subtotal)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Limpieza</span>
            <span>{formatCLP(cleaningFee)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Tarifa de servicio</span>
            <span>{formatCLP(serviceFee)}</span>
          </div>
          {securityDeposit > 0 && (
            <div className="flex justify-between text-gray-400 text-xs">
              <span>Depósito de garantía (reembolsable)</span>
              <span>{formatCLP(securityDeposit)}</span>
            </div>
          )}
          <div className="flex justify-between font-semibold text-gray-900 pt-2 border-t border-gray-100">
            <span>Total</span>
            <span>{formatCLP(total)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
