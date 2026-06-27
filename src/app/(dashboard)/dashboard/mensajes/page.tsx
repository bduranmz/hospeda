import { getConversations } from "@/lib/actions/messages";
import { ConversationList } from "@/components/messages/ConversationList";

export default async function MensajesPage() {
  const conversations = await getConversations();

  return (
    <main className="p-6 lg:p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Mensajes</h1>
        <p className="text-gray-500 mt-1 text-sm">
          Conversaciones con huéspedes y anfitriones.
        </p>
      </div>
      <ConversationList conversations={conversations} />
    </main>
  );
}
