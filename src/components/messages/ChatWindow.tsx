"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { Send, ArrowLeft } from "lucide-react";
import { sendMessage } from "@/lib/actions/messages";
import Link from "next/link";

interface Message {
  id: string;
  sender_id: string;
  content: string;
  message_type: string;
  created_at: string;
  read_at: string | null;
}

interface ChatWindowProps {
  messages: Message[];
  currentUserId: string;
  partnerId: string;
  partnerName: string;
  partnerAvatar: string | null;
  reservationId?: string;
}

export function ChatWindow({
  messages: initialMessages,
  currentUserId,
  partnerId,
  partnerName,
  partnerAvatar,
  reservationId,
}: ChatWindowProps) {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");
  const [isPending, startTransition] = useTransition();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    const content = input.trim();
    if (!content) return;

    setInput("");

    // Optimistic update
    const optimistic: Message = {
      id: `temp-${Date.now()}`,
      sender_id: currentUserId,
      content,
      message_type: "text",
      created_at: new Date().toISOString(),
      read_at: null,
    };
    setMessages((prev) => [...prev, optimistic]);

    startTransition(async () => {
      const result = await sendMessage({
        receiverId: partnerId,
        reservationId,
        content,
      });
      if (result.error) {
        setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
        alert(result.error);
      }
    });

    inputRef.current?.focus();
  };

  const formatTime = (d: string) =>
    new Date(d).toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" });

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("es-CL", { weekday: "long", day: "numeric", month: "long" });

  // Group messages by date
  const grouped: { date: string; messages: Message[] }[] = [];
  for (const msg of messages) {
    const dateKey = msg.created_at.split("T")[0];
    const last = grouped[grouped.length - 1];
    if (last?.date === dateKey) {
      last.messages.push(msg);
    } else {
      grouped.push({ date: dateKey, messages: [msg] });
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-3 border-b border-gray-100">
        <Link href="/dashboard/mensajes" className="text-gray-400 hover:text-gray-600 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        {partnerAvatar ? (
          <img src={partnerAvatar} alt="" className="w-8 h-8 rounded-full object-cover" />
        ) : (
          <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center">
            <span className="text-teal-700 font-semibold text-xs">{partnerName.charAt(0).toUpperCase()}</span>
          </div>
        )}
        <span className="font-medium text-gray-900 text-sm">{partnerName}</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-1">
        {grouped.map((group) => (
          <div key={group.date}>
            <div className="flex items-center justify-center my-4">
              <span className="text-xs text-gray-400 bg-gray-50 px-3 py-1 rounded-full">
                {formatDate(group.date)}
              </span>
            </div>
            {group.messages.map((msg) => {
              const isMine = msg.sender_id === currentUserId;
              return (
                <div
                  key={msg.id}
                  className={`flex mb-2 ${isMine ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm ${
                      isMine
                        ? "bg-teal-600 text-white rounded-br-md"
                        : "bg-gray-100 text-gray-900 rounded-bl-md"
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                    <p className={`text-[10px] mt-1 ${isMine ? "text-teal-200" : "text-gray-400"}`}>
                      {formatTime(msg.created_at)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-100 px-4 py-3">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder="Escribe un mensaje..."
            className="flex-1 px-4 py-2.5 bg-gray-50 rounded-full text-sm border-0 focus:outline-none focus:ring-2 focus:ring-teal-500"
            maxLength={2000}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isPending}
            className="p-2.5 bg-teal-600 text-white rounded-full hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
