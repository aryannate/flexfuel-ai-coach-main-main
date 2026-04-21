import { useState, useRef, useEffect } from "react";
import { Send, Image } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/authContext";
import { useChat, useChatPartners } from "@/hooks/useChat";

export default function Chat() {
  const { user, role } = useAuth();
  const { partners, loading: partnersLoading } = useChatPartners();
  const [selectedPartner, setSelectedPartner] = useState<string | null>(null);
  const { messages, loading, sendMessage, partnerName } = useChat(selectedPartner || undefined);
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  // Auto-select first partner
  useEffect(() => {
    if (!selectedPartner && partners.length > 0) {
      setSelectedPartner(partners[0].id);
    }
  }, [partners, selectedPartner]);

  const send = async () => {
    if (!input.trim()) return;
    await sendMessage(input);
    setInput("");
  };

  const myId = user?.id;

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto flex flex-col h-[calc(100vh-10rem)]">
        <div className="mb-4">
          <h1 className="text-2xl font-bold font-heading">
            {role === "trainer" ? "Chat with Athletes" : "Chat with Coach"}
          </h1>
        </div>

        {/* Partner selector for trainer */}
        {role === "trainer" && partners.length > 1 && (
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
            {partners.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedPartner(p.id)}
                className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-medium transition-all ${
                  selectedPartner === p.id ? "bg-primary text-primary-foreground" : "bg-card border border-border"
                }`}
              >
                <div className="w-7 h-7 rounded-full bg-pastel-lavender flex items-center justify-center text-xs font-bold">
                  {p.avatar}
                </div>
                {p.name}
              </button>
            ))}
          </div>
        )}

        {!selectedPartner && !partnersLoading && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <p className="text-lg font-heading font-bold mb-2">No chat partner found</p>
              <p className="text-sm">
                {role === "athlete"
                  ? "Your trainer hasn't been assigned yet. Ask your coach to add you."
                  : "No athletes assigned to you yet."}
              </p>
            </div>
          </div>
        )}

        {selectedPartner && (
          <>
            <div className="flex-1 overflow-auto space-y-4 mb-4 pr-2">
              {loading ? (
                <div className="text-center text-muted-foreground py-10">Loading messages...</div>
              ) : messages.length === 0 ? (
                <div className="text-center text-muted-foreground py-10">
                  <p>No messages yet. Say hello! 👋</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.sender_id === myId ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[80%]`}>
                      <div className={`rounded-3xl px-5 py-3 ${
                        msg.sender_id === myId ? "bg-primary text-primary-foreground" : "bg-card border border-border"
                      }`}>
                        <p className="text-sm">{msg.message}</p>
                      </div>
                      <p className={`text-[10px] text-muted-foreground mt-1 ${msg.sender_id === myId ? "text-right" : ""}`}>
                        {msg.sender_id === myId ? user?.name : partnerName} · {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <div ref={endRef} />
            </div>

            <div className="flex gap-2 bg-card rounded-3xl p-2 border border-border">
              <Button variant="ghost" size="icon" className="rounded-2xl flex-shrink-0">
                <Image className="w-5 h-5" />
              </Button>
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder="Type a message..."
                className="border-0 focus-visible:ring-0 h-10"
              />
              <Button onClick={send} size="icon" className="rounded-2xl flex-shrink-0">
                <Send className="w-5 h-5" />
              </Button>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
