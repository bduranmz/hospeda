"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

// ---------------------------------------------------------------------------
// Send message
// ---------------------------------------------------------------------------

export async function sendMessage(data: {
  receiverId: string;
  reservationId?: string;
  content: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  if (!data.content.trim()) return { error: "Mensaje vacío" };
  if (data.content.length > 2000) return { error: "Mensaje muy largo (máx. 2000 caracteres)" };

  const { data: message, error } = await supabase
    .from("messages")
    .insert({
      sender_id: user.id,
      receiver_id: data.receiverId,
      reservation_id: data.reservationId || null,
      message_type: "text",
      content: data.content.trim(),
    })
    .select("id, created_at")
    .single();

  if (error) return { error: error.message };
  return { id: message.id, created_at: message.created_at };
}

// ---------------------------------------------------------------------------
// Get conversations list
// ---------------------------------------------------------------------------

export async function getConversations() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Get distinct conversations — messages where user is sender or receiver
  const { data: messages, error } = await supabase
    .from("messages")
    .select(`
      id, content, created_at, read_at,
      sender_id, receiver_id, reservation_id,
      sender:profiles!messages_sender_id_fkey ( full_name, avatar_url ),
      receiver:profiles!messages_receiver_id_fkey ( full_name, avatar_url )
    `)
    .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
    .order("created_at", { ascending: false });

  if (error) return [];

  // Group by conversation partner
  const conversationMap = new Map<string, {
    partnerId: string;
    partnerName: string;
    partnerAvatar: string | null;
    lastMessage: string;
    lastMessageAt: string;
    reservationId: string | null;
    unreadCount: number;
  }>();

  for (const msg of messages ?? []) {
    const isMyMessage = msg.sender_id === user.id;
    const partnerId = isMyMessage ? msg.receiver_id : msg.sender_id;

    if (!conversationMap.has(partnerId)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const partner = isMyMessage ? msg.receiver : msg.sender;
      conversationMap.set(partnerId, {
        partnerId,
        partnerName: (partner as any)?.full_name ?? "Usuario",
        partnerAvatar: (partner as any)?.avatar_url ?? null,
        lastMessage: msg.content ?? "",
        lastMessageAt: msg.created_at,
        reservationId: msg.reservation_id,
        unreadCount: 0,
      });
    }

    // Count unread (messages TO me that I haven't read)
    if (!isMyMessage && !msg.read_at) {
      const conv = conversationMap.get(partnerId)!;
      conv.unreadCount++;
    }
  }

  return Array.from(conversationMap.values());
}

// ---------------------------------------------------------------------------
// Get messages for a conversation
// ---------------------------------------------------------------------------

export async function getMessagesWithUser(partnerId: string, reservationId?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  let query = supabase
    .from("messages")
    .select("id, sender_id, receiver_id, content, message_type, media_url, read_at, created_at")
    .or(
      `and(sender_id.eq.${user.id},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${user.id})`
    )
    .order("created_at", { ascending: true });

  if (reservationId) {
    query = query.eq("reservation_id", reservationId);
  }

  const { data, error } = await query;
  if (error) return [];

  // Mark received messages as read
  const unreadIds = (data ?? [])
    .filter((m) => m.receiver_id === user.id && !m.read_at)
    .map((m) => m.id);

  if (unreadIds.length > 0) {
    await supabase
      .from("messages")
      .update({ read_at: new Date().toISOString() })
      .in("id", unreadIds);
  }

  return data ?? [];
}

// ---------------------------------------------------------------------------
// Unread count
// ---------------------------------------------------------------------------

export async function getUnreadCount() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return 0;

  const { count } = await supabase
    .from("messages")
    .select("id", { count: "exact", head: true })
    .eq("receiver_id", user.id)
    .is("read_at", null);

  return count ?? 0;
}
