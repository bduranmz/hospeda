import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/dashboard/Sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch extended profile if available
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, avatar_url")
    .eq("id", user.id)
    .single();

  const sidebarUser = {
    email: user.email ?? "",
    full_name: profile?.full_name ?? user.user_metadata?.full_name ?? null,
    avatar_url: profile?.avatar_url ?? user.user_metadata?.avatar_url ?? null,
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar user={sidebarUser} />
      <div className="flex-1 min-w-0">
        {/* Mobile top padding so hamburger button doesn't overlap content */}
        <div className="lg:hidden h-14" />
        {children}
      </div>
    </div>
  );
}
