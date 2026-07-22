"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, MessageSquare, Send, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import { api } from "@/lib/api";
import { getSocket } from "@/lib/socket";
import { useAuthStore } from "@/stores/auth";
import { cn } from "@/lib/cn";

interface Conversation {
  id: string;
  customer: { id: string; name: string | null };
  seller: { id: string; name: string | null };
  product: { id: string; title: string } | null;
  lastMessageAt: string | null;
  messages: { body: string }[];
}

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
  createdAt: string;
}

export default function ChatPage() {
  const userId = useAuthStore((s) => s.user?.id);
  const qc = useQueryClient();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [presence, setPresence] = useState<Record<string, boolean>>({});
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: convs, isLoading: convsLoading } = useQuery({
    queryKey: ["chat.conversations"],
    queryFn: async () => {
      const { data } = await api.get<{ items: Conversation[] }>("/chat/conversations");
      return data;
    },
  });

  useEffect(() => {
    if (!activeId && convs?.items[0]) setActiveId(convs.items[0].id);
  }, [convs, activeId]);

  const active = useMemo(
    () => convs?.items.find((c) => c.id === activeId) ?? null,
    [convs, activeId],
  );

  const { data: messages, isLoading: msgsLoading } = useQuery({
    queryKey: ["chat.messages", activeId],
    queryFn: async () => {
      if (!activeId) return { items: [] as Message[] };
      const { data } = await api.get<{ items: Message[] }>(`/chat/conversations/${activeId}/messages`);
      return data;
    },
    enabled: !!activeId,
  });

  // Wire socket once we know which conversation we're viewing.
  useEffect(() => {
    if (!activeId) return;
    const s = getSocket();
    s.emit("conversation:join", activeId);

    const onNew = (m: Message) => {
      qc.setQueryData<{ items: Message[] }>(["chat.messages", activeId], (old) =>
        old ? { items: [...old.items, m] } : { items: [m] },
      );
    };
    const onPresence = (p: { userId: string; online: boolean }) => {
      setPresence((prev) => ({ ...prev, [p.userId]: p.online }));
    };
    s.on("message:new", onNew);
    s.on("presence", onPresence);

    return () => {
      s.off("message:new", onNew);
      s.off("presence", onPresence);
      s.emit("conversation:leave", activeId);
    };
  }, [activeId, qc]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.trim() || !activeId) return;
    const s = getSocket();
    s.emit("message:send", { conversationId: activeId, body: draft });
    setDraft("");
  };

  // On mobile, only show one column at a time. Pick by whether a conversation
  // is selected; the back arrow inside the active pane returns to the list.
  const showListOnMobile = !activeId;

  return (
    <div className="px-4 md:px-8 pb-4">
      {/* Page header */}
      <div className="flex items-center justify-between gap-3 py-3">
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-border hover:bg-surface2"
            aria-label="Back to dashboard"
          >
            <ArrowLeft size={16} />
          </Link>
          <h1 className="cc-h2">Messages</h1>
        </div>
        <span className="text-xs text-muted hidden sm:block">
          {convs?.items.length ?? 0} conversation{(convs?.items.length ?? 0) === 1 ? "" : "s"}
        </span>
      </div>

      <div className="grid md:grid-cols-[300px_1fr] gap-4 h-[calc(100vh-160px)]">
      <Card className={cn("overflow-y-auto", !showListOnMobile && "hidden md:block")}>
        <div className="cc-eyebrow p-4">Conversations</div>
        {convsLoading ? (
          <div className="p-4 space-y-2">
            <Skeleton className="h-12" />
            <Skeleton className="h-12" />
          </div>
        ) : (
          <ul>
            {convs?.items.map((c) => {
              const counterpart = c.customer.id === userId ? c.seller : c.customer;
              const online = presence[counterpart.id];
              return (
                <li key={c.id}>
                  <button
                    onClick={() => setActiveId(c.id)}
                    className={cn(
                      "w-full text-left flex items-start gap-3 p-3 hover:bg-surface2/60 border-l-2",
                      activeId === c.id ? "border-brand bg-surface2/40" : "border-transparent",
                    )}
                  >
                    <div className="relative">
                      <Avatar name={counterpart.name ?? "??"} size={36} />
                      {online && (
                        <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-surface" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium truncate">{counterpart.name ?? "Unknown"}</div>
                      <div className="text-xs text-muted truncate">
                        {c.messages[0]?.body ?? c.product?.title ?? "—"}
                      </div>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      <Card className={cn("flex flex-col", showListOnMobile && "hidden md:flex")}>
        {active ? (
          <>
            <div className="border-b border-border p-3 flex items-center gap-3">
              <button
                onClick={() => setActiveId(null)}
                className="md:hidden inline-flex items-center justify-center w-9 h-9 rounded-full border border-border hover:bg-surface2"
                aria-label="Back to conversation list"
              >
                <ArrowLeft size={16} />
              </button>
              <Avatar
                name={(active.customer.id === userId ? active.seller : active.customer).name ?? "??"}
                size={36}
              />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">
                  {(active.customer.id === userId ? active.seller : active.customer).name}
                </div>
                <div className="text-xs text-muted truncate">
                  {presence[(active.customer.id === userId ? active.seller : active.customer).id]
                    ? "Online"
                    : active.product?.title ?? "Direct conversation"}
                </div>
              </div>
              <button
                onClick={() => setActiveId(null)}
                className="hidden md:inline-flex items-center justify-center w-9 h-9 rounded-full border border-border hover:bg-surface2"
                aria-label="Close conversation"
              >
                <X size={16} />
              </button>
            </div>
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-3">
              {msgsLoading ? (
                <Skeleton className="h-10" />
              ) : (
                messages?.items.map((m) => (
                  <div
                    key={m.id}
                    className={cn(
                      "max-w-[75%] px-3.5 py-2 rounded-2xl text-sm",
                      m.senderId === userId
                        ? "ml-auto bg-brand text-white rounded-br-md"
                        : "bg-surface2 rounded-bl-md",
                    )}
                  >
                    {m.body}
                  </div>
                ))
              )}
            </div>
            <form onSubmit={send} className="border-t border-border p-3 flex gap-2">
              <Input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Type a message…"
              />
              <Button type="submit" variant="brand" className="rounded-full" disabled={!draft.trim()}>
                <Send size={14} />
              </Button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-10 text-fg2">
            <div className="w-12 h-12 rounded-2xl bg-surface2 flex items-center justify-center mb-3 text-muted">
              <MessageSquare size={20} />
            </div>
            <div className="text-sm font-medium text-fg">Pick a conversation</div>
            <div className="text-xs text-muted mt-1 max-w-xs">
              Start one from any product page using the "Message seller" button.
            </div>
          </div>
        )}
      </Card>
      </div>
    </div>
  );
}
