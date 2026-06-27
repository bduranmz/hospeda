"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Pause, Play, Trash2 } from "lucide-react";
import { updatePropertyStatus, deleteProperty } from "@/lib/actions/properties";

interface Props {
  propertyId: string;
  currentStatus: string;
}

export default function PropertyStatusActions({
  propertyId,
  currentStatus,
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    setLoading(true);
    const newStatus = currentStatus === "published" ? "paused" : "published";
    await updatePropertyStatus(propertyId, newStatus);
    router.refresh();
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!confirm("¿Estás seguro de que quieres eliminar esta propiedad?")) return;
    setLoading(true);
    await deleteProperty(propertyId);
    router.refresh();
    setLoading(false);
  };

  return (
    <>
      {(currentStatus === "published" || currentStatus === "paused" || currentStatus === "draft") && (
        <button
          onClick={handleToggle}
          disabled={loading}
          className="flex items-center gap-1 text-xs text-gray-500 hover:text-teal-600 transition-colors disabled:opacity-50"
        >
          {currentStatus === "published" ? (
            <>
              <Pause size={13} /> Pausar
            </>
          ) : (
            <>
              <Play size={13} /> Publicar
            </>
          )}
        </button>
      )}

      <button
        onClick={handleDelete}
        disabled={loading}
        className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-500 transition-colors disabled:opacity-50"
      >
        <Trash2 size={13} />
        Eliminar
      </button>
    </>
  );
}
