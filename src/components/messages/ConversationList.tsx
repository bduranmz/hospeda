"use client";

import Link from "next/link";
import { MessageSquare } from "lucide-react";

interface Conversation {
  partnerId: string;
  partnerName: string;
  partnerAvatar: string | null;
  lastMessage: string;
  lastMessageAt: string;
  reservationId: string | null;
  unreadCount: number;
}

export function ConversationList({ conversations }: { conversations: Conversation[] }) {
  const formatTime = (d: string) => {
    const date = new Date(d);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = diff / (1000 * 60 * 60);

    if (hours < 1) return "Hace un momento";
    if (hours < 24) return `Hace ${Math.floor(hours)}h`;
    if (hours < 48) return "Ayer";
    return date.toLocaleDateString("es-CL", { day: "numeric", month: "short" });
  };

  if (conversations.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
        <MessageSquare size={40} className="mx-auto text-gray-300 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-1">Sin mensajes</h3>
        <p className="text-gray-500 text-sm">
          Tus conversaciones con huéspedes y anfitriones aparecerán aquí.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm divide-y divide-gray-50">
      {conversations.map((conv) => (
        <Link
          key={conv.partnerId}
          href={`/dashboard/mensajes/${conv.partnerId}${conv.reservationId ? `?reservationId=${conv.reservationId}` : ""}`}
          className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors"
        >
          {/* Avatar */}
          <div className="shrink-0">
            {conv.partnerAvatar ? (
              <img src={conv.partnerAvatar} alt="" className="w-10 h-10 rounded-full object-cover" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center">
                <span className="text-teal-700 font-semibold text-sm">
                  {conv.partnerName.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className={`text-sm font-medium ${conv.unreadCount > 0 ? "text-gray-900" : "text-gray-700"}`}>
                {conv.partnerName}
              </span>
              <span className="text-xs text-gray-400 shrink-0 ml-2">
                {formatTime(conv.lastMessageAt)}
              </span>
            </div>
            <p className={`text-sm truncate mt-0.5 ${conv.unreadCount > 0 ? "text-gray-900 font-medium" : "text-gray-500"}`}>
              {conv.lastMessage}
            </p>
          </div>

          {/* Unread badge */}
          {conv.unreadCount > 0 && (
            <div className="shrink-0 w-5 h-5 bg-teal-600 rounded-full flex items-center justify-center">
              <span className="text-xs text-white font-bold">{conv.unreadCount}</span>
            </div>
          )}
        </Link>
      ))}
    </div>
  );
}
