"use client";

import { useState, useEffect, useTransition } from "react";
import { ChevronLeft, ChevronRight, Lock, Unlock } from "lucide-react";
import { getAvailability, createCalendarBlock, deleteCalendarBlock } from "@/lib/actions/reservations";

interface CalendarViewProps {
  properties: { id: string; title: string }[];
}

const DAYS = ["Lu", "Ma", "Mi", "Ju", "Vi", "Sa", "Do"];
const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

export function CalendarView({ properties }: CalendarViewProps) {
  const [selectedProperty, setSelectedProperty] = useState(properties[0]?.id ?? "");
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth());
  const [unavailable, setUnavailable] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();

  const monthStr = `${year}-${String(month + 1).padStart(2, "0")}`;

  useEffect(() => {
    if (!selectedProperty) return;
    startTransition(async () => {
      const dates = await getAvailability(selectedProperty, monthStr);
      setUnavailable(dates);
    });
  }, [selectedProperty, monthStr]);

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(year - 1); }
    else setMonth(month - 1);
  };

  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(year + 1); }
    else setMonth(month + 1);
  };

  const handleBlock = (date: string) => {
    if (!selectedProperty) return;
    startTransition(async () => {
      await createCalendarBlock({
        propertyId: selectedProperty,
        startDate: date,
        endDate: new Date(new Date(date).getTime() + 86400000).toISOString().split("T")[0],
        reason: "Bloqueado manualmente",
      });
      const dates = await getAvailability(selectedProperty, monthStr);
      setUnavailable(dates);
    });
  };

  // Build calendar grid
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDayOfWeek = (firstDay.getDay() + 6) % 7; // Monday = 0
  const totalDays = lastDay.getDate();
  const today = new Date().toISOString().split("T")[0];

  const cells: { date: string; day: number; isCurrentMonth: boolean }[] = [];
  // Previous month padding
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const d = new Date(year, month, -i);
    cells.push({ date: d.toISOString().split("T")[0], day: d.getDate(), isCurrentMonth: false });
  }
  // Current month
  for (let d = 1; d <= totalDays; d++) {
    const date = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    cells.push({ date, day: d, isCurrentMonth: true });
  }
  // Next month padding
  const remaining = 7 - (cells.length % 7);
  if (remaining < 7) {
    for (let d = 1; d <= remaining; d++) {
      const dt = new Date(year, month + 1, d);
      cells.push({ date: dt.toISOString().split("T")[0], day: d, isCurrentMonth: false });
    }
  }

  if (properties.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
        <p className="text-gray-500">Publica una propiedad para usar el calendario.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
      {/* Property selector */}
      <div className="mb-6">
        <select
          value={selectedProperty}
          onChange={(e) => setSelectedProperty(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
        >
          {properties.map((p) => (
            <option key={p.id} value={p.id}>{p.title}</option>
          ))}
        </select>
      </div>

      {/* Month navigation */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ChevronLeft size={20} />
        </button>
        <h2 className="text-lg font-semibold text-gray-900">
          {MONTHS[month]} {year}
        </h2>
        <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-2">
        {DAYS.map((d) => (
          <div key={d} className="text-center text-xs font-medium text-gray-500 py-2">{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((cell) => {
          const isUnavailable = unavailable.includes(cell.date);
          const isToday = cell.date === today;
          const isPast = cell.date < today;

          return (
            <button
              key={cell.date}
              onClick={() => !isPast && !isUnavailable && cell.isCurrentMonth && handleBlock(cell.date)}
              disabled={isPast || !cell.isCurrentMonth || isPending}
              className={`
                relative aspect-square flex items-center justify-center rounded-lg text-sm transition-colors
                ${!cell.isCurrentMonth ? "text-gray-300" : ""}
                ${isToday ? "ring-2 ring-teal-500" : ""}
                ${isUnavailable && cell.isCurrentMonth ? "bg-red-50 text-red-400" : ""}
                ${!isUnavailable && cell.isCurrentMonth && !isPast ? "hover:bg-teal-50 text-gray-700 cursor-pointer" : ""}
                ${isPast && cell.isCurrentMonth ? "text-gray-300" : ""}
              `}
            >
              {cell.day}
              {isUnavailable && cell.isCurrentMonth && (
                <Lock size={10} className="absolute bottom-1 right-1 text-red-300" />
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex gap-6 mt-4 pt-4 border-t border-gray-50 text-xs text-gray-500">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-red-50 border border-red-200" /> No disponible
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-white border border-gray-200" /> Disponible
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded ring-2 ring-teal-500" /> Hoy
        </span>
      </div>
    </div>
  );
}
