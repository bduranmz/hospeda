import { getMessagesWithUser } from "@/lib/actions/messages";
import { ChatWindow } from "@/components/messages/ChatWindow";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function ChatPage({
  params,
  searchParams,
}: {
  params: Promise<{ partnerId: string }>;
  searchParams: Promise<{ reservationId?: string }>;
}) {
  const { partnerId } = await params;
  const { reservationId } = await searchParams;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Get partner info
  const { data: partner } = await supabase
    .from("profiles")
    .select("full_name, avatar_url")
    .eq("id", partnerId)
    .single();

  const messages = await getMessagesWithUser(partnerId, reservationId);

  return (
    <main className="p-6 lg:p-8 max-w-4xl mx-auto">
      <ChatWindow
        messages={messages}
        currentUserId={user.id}
        partnerId={partnerId}
        partnerName={partner?.full_name ?? "Usuario"}
        partnerAvatar={partner?.avatar_url ?? null}
        reservationId={reservationId}
      />
    </main>
  );
}
