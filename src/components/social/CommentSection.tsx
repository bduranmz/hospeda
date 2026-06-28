"use client";

import { useState } from "react";
import { Heart, Reply, Trash2, Send } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface Comment {
  id: string;
  content: string;
  created_at: string;
  likes_count: number;
  parent_id: string | null;
  profiles: {
    id: string;
    full_name: string;
    avatar_url: string | null;
  };
}

interface CommentSectionProps {
  experienceId: string;
  initialComments: Comment[];
}

export default function CommentSection({
  experienceId,
  initialComments,
}: CommentSectionProps) {
  const [comments] = useState<Comment[]>(initialComments);
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);

  // Separate root comments and replies
  const rootComments = comments.filter((c) => !c.parent_id);
  const replies = comments.filter((c) => c.parent_id);

  const getReplies = (parentId: string) =>
    replies.filter((r) => r.parent_id === parentId);

  const timeAgo = (date: string) => {
    const now = new Date();
    const d = new Date(date);
    const diff = Math.floor((now.getTime() - d.getTime()) / 1000);
    if (diff < 60) return "ahora";
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    if (diff < 2592000) return `${Math.floor(diff / 86400)}d`;
    return d.toLocaleDateString("es-CL", { day: "numeric", month: "short" });
  };

  const renderComment = (comment: Comment, isReply = false) => (
    <div
      key={comment.id}
      className={`flex gap-3 ${isReply ? "ml-10 mt-3" : "mt-4"}`}
    >
      <Link
        href={`/perfil/${comment.profiles?.id}`}
        className="shrink-0"
      >
        <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 text-xs font-bold overflow-hidden">
          {comment.profiles?.avatar_url ? (
            <Image
              src={comment.profiles.avatar_url}
              alt=""
              width={32}
              height={32}
              className="object-cover"
            />
          ) : (
            (comment.profiles?.full_name ?? "U")[0].toUpperCase()
          )}
        </div>
      </Link>
      <div className="flex-1 min-w-0">
        <div className="bg-gray-50 rounded-xl px-4 py-2.5">
          <div className="flex items-center gap-2 mb-0.5">
            <Link
              href={`/perfil/${comment.profiles?.id}`}
              className="text-sm font-semibold text-gray-900 hover:text-teal-600 transition"
            >
              {comment.profiles?.full_name ?? "Usuario"}
            </Link>
            <span className="text-xs text-gray-400">
              {timeAgo(comment.created_at)}
            </span>
          </div>
          <p className="text-sm text-gray-700">{comment.content}</p>
        </div>
        <div className="flex items-center gap-4 mt-1 ml-2">
          <button className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-500 transition">
            <Heart className="w-3.5 h-3.5" />
            {comment.likes_count > 0 && comment.likes_count}
          </button>
          <button
            onClick={() =>
              setReplyTo(replyTo === comment.id ? null : comment.id)
            }
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-teal-600 transition"
          >
            <Reply className="w-3.5 h-3.5" />
            Responder
          </button>
        </div>

        {/* Reply input */}
        {replyTo === comment.id && (
          <div className="flex gap-2 mt-2 ml-2">
            <input
              type="text"
              placeholder="Escribe una respuesta..."
              className="flex-1 text-sm px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              autoFocus
            />
            <button className="p-2 text-teal-600 hover:bg-teal-50 rounded-lg transition">
              <Send className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Nested replies */}
        {getReplies(comment.id).map((reply) =>
          renderComment(reply as Comment, true)
        )}
      </div>
    </div>
  );

  return (
    <div className="mt-6">
      <h3 className="font-semibold text-gray-900 mb-1">
        Comentarios ({comments.length})
      </h3>

      {/* New comment input */}
      <div className="flex gap-3 mt-4">
        <div className="w-8 h-8 rounded-full bg-gray-200 shrink-0" />
        <div className="flex-1 flex gap-2">
          <input
            type="text"
            placeholder="Escribe un comentario..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
          <button
            disabled={!newComment.trim()}
            className="p-2.5 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Comments list */}
      {rootComments.length === 0 ? (
        <p className="text-center text-gray-400 text-sm py-8">
          Se el primero en comentar
        </p>
      ) : (
        rootComments.map((c) => renderComment(c as Comment))
      )}
    </div>
  );
}
