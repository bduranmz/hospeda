import { getReservationsForHost } from "@/lib/actions/reservations";
import { ReservationsList } from "@/components/reservations/ReservationsList";

export default async function ReservasHostPage() {
  const reservations = await getReservationsForHost();

  return (
    <main className="p-6 lg:p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Reservas</h1>
        <p className="text-gray-500 mt-1 text-sm">
          Gestiona las reservas de tus propiedades.
        </p>
      </div>
      <ReservationsList reservations={reservations} role="host" />
    </main>
  );
}
