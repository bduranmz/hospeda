import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { CalendarView } from "@/components/calendar/CalendarView";

export default async function CalendarioPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Get host properties
  const { data: properties } = await supabase
    .from("properties")
    .select("id, title")
    .eq("host_id", user.id)
    .is("deleted_at", null)
    .in("status", ["published", "paused", "draft"]);

  return (
    <main className="p-6 lg:p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Calendario</h1>
        <p className="text-gray-500 mt-1 text-sm">
          Gestiona la disponibilidad de tus propiedades.
        </p>
      </div>
      <CalendarView properties={properties ?? []} />
    </main>
  );
}
