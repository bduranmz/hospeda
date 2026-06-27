import { getReservationsForGuest } from "@/lib/actions/reservations";
import { ReservationsList } from "@/components/reservations/ReservationsList";

export default async function ViajesPage() {
  const reservations = await getReservationsForGuest();

  return (
    <main className="p-6 lg:p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Mis viajes</h1>
        <p className="text-gray-500 mt-1 text-sm">
          Tus reservas pasadas y futuras.
        </p>
      </div>
      <ReservationsList reservations={reservations} role="guest" />
    </main>
  );
}
