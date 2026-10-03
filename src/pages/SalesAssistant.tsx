import { useEffect, useMemo, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { Bot, BrainCircuit, Clock3, Eraser, Target, Users } from "lucide-react";
import { toast } from "sonner";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
} from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const quickQuestions = [
  { icon: Target, text: "Which opportunities need attention first?" },
  { icon: Clock3, text: "Who needs a follow-up today?" },
  { icon: Users, text: "Summarize my current pipeline." },
];

function ChatSurface({ initialMessages }: { initialMessages: UIMessage[] }) {
  const { session } = useAuth();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const transport = useMemo(
    () => new DefaultChatTransport({
      api: `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sales-chat`,
      headers: {
        apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        Authorization: `Bearer ${session?.access_token ?? ""}`,
      },
    }),
    [session?.access_token],
  );

  const { messages, sendMessage, status, stop, setMessages } = useChat({
    id: "sales-assistant",
    messages: initialMessages,
    transport,
    onError: (error) => toast.error(error.message || "The assistant could not answer right now."),
    onFinish: () => window.setTimeout(() => inputRef.current?.focus(), 0),
  });

  const busy = status === "submitted" || status === "streaming";

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const submit = ({ text }: { text: string }) => {
    const value = text.trim();
    if (!value || busy) return;
    sendMessage({ text: value });
    window.setTimeout(() => inputRef.current?.focus(), 0);
  };

  const clearHistory = async () => {
    if (busy) await stop();
    const { error } = await supabase.from("sales_chat_messages").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    if (error) {
      toast.error("Conversation could not be cleared.");
      return;
    }
    setMessages([]);
    toast.success("Conversation cleared");
    inputRef.current?.focus();
  };

  return (
    <div className="flex min-h-[calc(100vh-9rem)] flex-col overflow-hidden rounded-xl border border-border/70 bg-card/60 shadow-elevated backdrop-blur-xl">
      <header className="flex items-center justify-between gap-4 border-b border-border/70 px-4 py-3 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg gradient-primary shadow-glow">
            <BrainCircuit className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="min-w-0">
            <h1 className="truncate font-display text-lg font-semibold text-foreground sm:text-xl">Sales Assistant</h1>
            <p className="truncate text-xs text-muted-foreground sm:text-sm">Connected to your customer workspace</p>
          </div>
        </div>
        {messages.length > 0 && (
          <Button variant="ghost" size="sm" onClick={clearHistory} className="shrink-0 text-muted-foreground" title="Clear conversation">
            <Eraser className="h-4 w-4" />
            <span className="hidden sm:inline">Clear</span>
          </Button>
        )}
      </header>

      <Conversation className="min-h-0 flex-1">
        <ConversationContent className="mx-auto w-full max-w-3xl gap-6 px-4 py-6 sm:px-6">
          {messages.length === 0 ? (
            <ConversationEmptyState className="min-h-[420px] p-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 shadow-glow">
                <Bot className="h-8 w-8 text-primary" />
              </div>
              <div className="max-w-md space-y-2">
                <h2 className="font-display text-2xl font-semibold text-foreground">Ask about your pipeline</h2>
                <p className="text-sm leading-6 text-muted-foreground">Get customer summaries, opportunity status, follow-up priorities, and practical next steps from your CRM data.</p>
              </div>
              <div className="mt-4 grid w-full max-w-xl gap-2 sm:grid-cols-3">
                {quickQuestions.map(({ icon: Icon, text }) => (
                  <Button key={text} variant="outline" className="h-auto min-h-20 whitespace-normal p-3 text-left" onClick={() => sendMessage({ text })}>
                    <Icon className="h-4 w-4 shrink-0 text-primary" />
                    <span className="text-xs leading-5">{text}</span>
                  </Button>
                ))}
              </div>
            </ConversationEmptyState>
          ) : (
            messages.map((message) => (
              <Message key={message.id} from={message.role}>
                <MessageContent className={message.role === "user" ? "bg-primary text-primary-foreground" : "max-w-full"}>
                  {message.parts.map((part, index) =>
                    part.type === "text" ? <MessageResponse key={`${message.id}-${index}`}>{part.text}</MessageResponse> : null,
                  )}
                </MessageContent>
              </Message>
            ))
          )}
          {status === "submitted" && (
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <BrainCircuit className="h-4 w-4 text-primary" />
              <Shimmer>Reviewing your customer records...</Shimmer>
            </div>
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      <div className="border-t border-border/70 bg-background/50 p-3 sm:p-4">
        <PromptInput onSubmit={submit} className="mx-auto max-w-3xl">
          <PromptInputTextarea ref={inputRef} placeholder="Ask about a customer, deal status, or next action..." disabled={busy} className="min-h-20" />
          <PromptInputFooter className="justify-between">
            <span className="px-1 text-xs text-muted-foreground">Answers use your saved CRM records</span>
            <PromptInputSubmit status={status} onStop={stop} disabled={!session} />
          </PromptInputFooter>
        </PromptInput>
      </div>
    </div>
  );
}

export default function SalesAssistant() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<UIMessage[] | null>(null);

  useEffect(() => {
    if (!user) return;
    let active = true;
    supabase
      .from("sales_chat_messages")
      .select("message")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true })
      .then(({ data, error }) => {
        if (!active) return;
        if (error) toast.error("Saved conversation could not be loaded.");
        setMessages((data ?? []).map((row) => row.message as unknown as UIMessage));
      });
    return () => { active = false; };
  }, [user]);

  return (
    <AppLayout>
      {messages ? <ChatSurface initialMessages={messages} /> : <div className="flex min-h-[calc(100vh-9rem)] items-center justify-center"><Shimmer>Loading your sales assistant...</Shimmer></div>}
    </AppLayout>
  );
}