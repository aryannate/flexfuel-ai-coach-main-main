import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/authContext";

export interface ChatMessage {
  id: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  created_at: string;
  sender_name?: string;
}

export function useChat(partnerId?: string) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [partnerName, setPartnerName] = useState("Coach");

  const fetchMessages = useCallback(async () => {
    if (!user || !partnerId) { setLoading(false); return; }
    
    const { data } = await supabase
      .from("chat_messages")
      .select("*")
      .or(`and(sender_id.eq.${user.id},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${user.id})`)
      .order("created_at", { ascending: true });

    if (data) setMessages(data as ChatMessage[]);
    setLoading(false);
  }, [user, partnerId]);

  // Get partner name
  useEffect(() => {
    if (!partnerId) return;
    supabase
      .from("profiles")
      .select("display_name")
      .eq("user_id", partnerId)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.display_name) setPartnerName(data.display_name);
      });
  }, [partnerId]);

  useEffect(() => {
    fetchMessages();

    if (!user || !partnerId) return;

    const channel = supabase
      .channel(`chat-${user.id}-${partnerId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chat_messages" },
        (payload) => {
          const msg = payload.new as ChatMessage;
          // Only add if relevant to this conversation
          if (
            (msg.sender_id === user.id && msg.receiver_id === partnerId) ||
            (msg.sender_id === partnerId && msg.receiver_id === user.id)
          ) {
            setMessages((prev) => {
              if (prev.some((m) => m.id === msg.id)) return prev;
              return [...prev, msg];
            });
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchMessages, user, partnerId]);

  const sendMessage = useCallback(async (text: string) => {
    if (!user || !partnerId || !text.trim()) return;
    await supabase.from("chat_messages").insert({
      sender_id: user.id,
      receiver_id: partnerId,
      message: text.trim(),
    } as any);
  }, [user, partnerId]);

  return { messages, loading, sendMessage, partnerName };
}

// Hook to get the chat partner (trainer gets list of athletes, athlete gets their trainer)
export function useChatPartners() {
  const { user, role } = useAuth();
  const [partners, setPartners] = useState<{ id: string; name: string; avatar: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }

    const fetch = async () => {
      if (role === "trainer") {
        // Get all athletes assigned to this trainer
        const { data } = await supabase
          .from("profiles")
          .select("user_id, display_name")
          .eq("trainer_id", user.id);
        if (data) {
          setPartners(data.map((p) => ({
            id: p.user_id,
            name: p.display_name || "Athlete",
            avatar: (p.display_name || "A").slice(0, 2).toUpperCase(),
          })));
        }
      } else {
        // Get trainer
        const { data: profile } = await supabase
          .from("profiles")
          .select("trainer_id")
          .eq("user_id", user.id)
          .maybeSingle();
        
        if (profile?.trainer_id) {
          const { data: trainerProfile } = await supabase
            .from("profiles")
            .select("user_id, display_name")
            .eq("user_id", profile.trainer_id)
            .maybeSingle();
          if (trainerProfile) {
            setPartners([{
              id: trainerProfile.user_id,
              name: trainerProfile.display_name || "Coach",
              avatar: (trainerProfile.display_name || "C").slice(0, 2).toUpperCase(),
            }]);
          }
        }
      }
      setLoading(false);
    };
    fetch();
  }, [user, role]);

  return { partners, loading };
}
