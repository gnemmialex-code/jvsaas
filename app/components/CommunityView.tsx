"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import {
  Crown, Lock, Loader2, MessageCircle, Megaphone, Gift, Plus,
  Send, ImagePlus, X, Users, ShieldCheck,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useI18n } from "@/lib/i18n";

/* ─── Types ──────────────────────────────────────────────── */
interface Topic {
  id: string;
  title: string;
  description: string;
  author_name: string;
  admin_only: boolean;
  is_default: boolean;
  created_at: string;
}
interface Message {
  id: string;
  topic_id: string;
  user_id: string | null;
  author_name: string;
  is_admin: boolean;
  content: string;
  image_url: string | null;
  text_size: "small" | "normal" | "large" | "title";
  created_at: string;
}

/* Tailles de texte (réservées à l'admin à l'écriture) */
const SIZE_CLASSES: Record<Message["text_size"], string> = {
  small:  "text-xs",
  normal: "text-sm",
  large:  "text-lg font-semibold",
  title:  "text-2xl font-black",
};
const SIZE_OPTIONS: { id: Message["text_size"]; label: string }[] = [
  { id: "small",  label: "small"  },
  { id: "normal", label: "Normal" },
  { id: "large",  label: "large"  },
  { id: "title",  label: "title"  },
];

/* Icône des 3 discussions par défaut */
function topicIcon(topic: Topic) {
  if (!topic.is_default) return MessageCircle;
  if (topic.title === "Mise à jour") return Megaphone;
  if (topic.title === "Cadeau") return Gift;
  return Users;
}

const POLL_MS = 5_000;

/* ─── Écran verrouillé (non connecté / pas Ultimate) ─────── */
function LockedPanel({ isAuthed, onUpgrade }: { isAuthed: boolean | null; onUpgrade: () => void }) {
  const { t } = useI18n();
  return (
    <div className="max-w-lg mx-auto card text-center py-14 px-8 mt-4">
      <div className="w-16 h-16 rounded-2xl bg-amber-400/15 border border-amber-400/30 flex items-center justify-center mx-auto mb-5">
        <Crown className="w-8 h-8 text-amber-400" />
      </div>
      <h2 className="text-2xl font-black mb-2">
        {t("dash.nav.community")} <span className="gradient-text-orange-subtle">Ultimate</span>
      </h2>
      <p className="text-white/50 text-sm leading-relaxed mb-6">
        {t("comm.locked.desc1")} <strong className="text-amber-400">Ultimate</strong> {t("comm.locked.desc2")}
      </p>
      <ul className="text-left space-y-2 mb-8 max-w-xs mx-auto">
        {[
          t("comm.locked.f1"),
          t("comm.locked.f2"),
          t("comm.locked.f3"),
          t("comm.locked.f4"),
        ].map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm text-white/60">
            <ShieldCheck className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />{f}
          </li>
        ))}
      </ul>
      <button onClick={onUpgrade} className="btn-primary-orange inline-flex items-center gap-2 px-6 py-3 text-sm font-bold">
        <Crown className="w-4 h-4" />
        {isAuthed === false ? t("comm.discoverUlt") : t("dash.gta6.upgradeUlt")}
      </button>
    </div>
  );
}

/* ─── Vue principale ─────────────────────────────────────── */
export default function CommunityView({
  tier, isAdmin, isAuthed, onUpgrade,
}: {
  tier: "essentiel" | "pro" | "elite";
  isAdmin: boolean;
  isAuthed: boolean | null;
  onUpgrade: () => void;
}) {
  const canAccess = isAdmin || (isAuthed === true && tier === "elite");
  const { t } = useI18n();

  const [userId, setUserId] = useState<string | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [topicsLoading, setTopicsLoading] = useState(true);
  const [topicsError, setTopicsError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);

  /* création de discussion */
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [savingTopic, setSavingTopic] = useState(false);

  /* composer */
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [textSize, setTextSize] = useState<Message["text_size"]>("normal");
  const [sending, setSending] = useState(false);

  const listRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const lastCountRef = useRef(0);

  const selectedTopic = topics.find((t) => t.id === selectedId) ?? null;
  const canWrite = selectedTopic ? (!selectedTopic.admin_only || isAdmin) : false;

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
  }, []);

  /* Charge les discussions à l'ouverture */
  useEffect(() => {
    if (!canAccess) return;
    let cancelled = false;
    fetch("/api/community/topics")
      .then((res) => res.json().then((d) => ({ ok: res.ok, d })))
      .then(({ ok, d }) => {
        if (cancelled) return;
        if (!ok) { setTopicsError(d.error ?? t("comm.loadError")); return; }
        setTopics(d.topics ?? []);
        if (d.topics?.length) setSelectedId((prev) => prev ?? d.topics[0].id);
      })
      .catch(() => { if (!cancelled) setTopicsError(t("login.errorGeneric")); })
      .finally(() => { if (!cancelled) setTopicsLoading(false); });
    return () => { cancelled = true; };
  }, [canAccess]);

  /* Charge + rafraîchit les messages de la discussion ouverte (toutes les 5 s) */
  const fetchMessages = useCallback(async (topicId: string, silent: boolean) => {
    if (!silent) setMessagesLoading(true);
    try {
      const res = await fetch(`/api/community/messages?topic_id=${topicId}`);
      const d = await res.json();
      if (res.ok) setMessages(d.messages ?? []);
    } catch { /* silent */ }
    finally { if (!silent) setMessagesLoading(false); }
  }, []);

  useEffect(() => {
    if (!canAccess || !selectedId) return;
    setMessages([]);
    lastCountRef.current = 0;
    fetchMessages(selectedId, false);
    const iv = setInterval(() => fetchMessages(selectedId, true), POLL_MS);
    return () => clearInterval(iv);
  }, [canAccess, selectedId, fetchMessages]);

  /* Défile en bas quand de nouveaux messages arrivent */
  useEffect(() => {
    if (messages.length !== lastCountRef.current) {
      lastCountRef.current = messages.length;
      const el = listRef.current;
      if (el) el.scrollTop = el.scrollHeight;
    }
  }, [messages]);

  if (!canAccess) return <LockedPanel isAuthed={isAuthed} onUpgrade={onUpgrade} />;

  const handleCreateTopic = async () => {
    if (newTitle.trim().length < 3) { toast.error(t("comm.titleTooShort")); return; }
    setSavingTopic(true);
    try {
      const res = await fetch("/api/community/topics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle.trim(), description: newDesc.trim() }),
      });
      const d = await res.json();
      if (!res.ok) { toast.error(d.error ?? t("comm.createError")); return; }
      // La nouvelle discussion apparaît juste après les 3 par défaut
      setTopics((prev) => {
        const defaults = prev.filter((t) => t.is_default);
        const others = prev.filter((t) => !t.is_default);
        return [...defaults, d.topic, ...others];
      });
      setSelectedId(d.topic.id);
      setCreating(false);
      setNewTitle("");
      setNewDesc("");
      toast.success(t("comm.created"));
    } catch {
      toast.error(t("login.errorGeneric"));
    } finally {
      setSavingTopic(false);
    }
  };

  const handlePickImage = (f: File | null) => {
    if (!f) return;
    if (!f.type.startsWith("image/")) { toast.error(t("comm.imagesOnly")); return; }
    if (f.size > 5 * 1024 * 1024) { toast.error(t("comm.imageTooBig")); return; }
    setImageFile(f);
    setImagePreview(URL.createObjectURL(f));
  };

  const clearImage = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSend = async () => {
    if (!selectedId || sending) return;
    if (!content.trim() && !imageFile) return;
    setSending(true);
    try {
      const form = new FormData();
      form.append("topic_id", selectedId);
      form.append("content", content.trim());
      form.append("text_size", textSize);
      if (imageFile) form.append("image", imageFile);
      const res = await fetch("/api/community/messages", { method: "POST", body: form });
      const d = await res.json();
      if (!res.ok) { toast.error(d.error ?? t("comm.sendError")); return; }
      setMessages((prev) => [...prev, d.message]);
      setContent("");
      clearImage();
    } catch {
      toast.error(t("login.errorGeneric"));
    } finally {
      setSending(false);
    }
  };

  return (
    <div>
      <div className="mb-6 pt-8">
        <h1 className="text-3xl font-black mb-1 flex items-center gap-3">
          <Users className="w-7 h-7 text-amber-400" />
          {t("dash.nav.community")}
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border text-amber-400 border-amber-400/40 bg-amber-400/10">
            {t("dash.badge.ultimate")}
          </span>
        </h1>
        <p className="text-white/40">{t("comm.subtitle")}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[300px,1fr] gap-4 pb-10">

        {/* ── Colonne gauche : discussions ── */}
        <div className="space-y-3">
          <button
            onClick={() => setCreating((c) => !c)}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-amber-400/40 text-amber-400 hover:bg-amber-400/10 text-sm font-bold transition-all"
          >
            <Plus className="w-4 h-4" />
            {t("comm.newTopic")}
          </button>

          <AnimatePresence>
            {creating && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="card !bg-black/85 space-y-2.5 !p-4">
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder={t("comm.topicTitle")}
                    maxLength={80}
                    className="w-full bg-surface border border-surface-border rounded-xl px-3 py-2 text-white text-sm placeholder-white/25 focus:outline-none focus:border-amber-400/60"
                  />
                  <textarea
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    placeholder={t("comm.topicDesc")}
                    rows={3}
                    maxLength={500}
                    className="w-full bg-surface border border-surface-border rounded-xl px-3 py-2 text-white text-sm placeholder-white/25 focus:outline-none focus:border-amber-400/60 resize-none"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCreateTopic}
                      disabled={savingTopic || newTitle.trim().length < 3}
                      className="btn-primary-orange flex-1 py-2 text-sm font-bold disabled:opacity-50"
                    >
                      {savingTopic ? t("comm.creating") : t("comm.create")}
                    </button>
                    <button
                      onClick={() => setCreating(false)}
                      className="px-3 py-2 rounded-xl border border-surface-border text-white/50 hover:text-white text-sm transition-all"
                    >
                      {t("dash.hist.cancel")}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {topicsLoading ? (
            <div className="card flex items-center justify-center py-10">
              <Loader2 className="w-6 h-6 text-amber-400 animate-spin" />
            </div>
          ) : topicsError ? (
            <div className="card !bg-black/85 text-center py-8 px-4">
              <p className="text-white/50 text-sm">{topicsError}</p>
            </div>
          ) : (
            <div className="space-y-2 lg:max-h-[62vh] lg:overflow-y-auto lg:pr-1">
              {topics.map((topic) => {
                const Icon = topicIcon(topic);
                const active = topic.id === selectedId;
                return (
                  <button
                    key={topic.id}
                    onClick={() => setSelectedId(topic.id)}
                    className={`w-full flex items-start gap-3 p-3 rounded-xl border text-left transition-all ${
                      active
                        ? "border-amber-400/60 bg-amber-400/10"
                        : "border-surface-border bg-black/60 hover:border-amber-400/30 hover:bg-surface-hover"
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      active ? "bg-amber-400/20 text-amber-400" : "bg-surface-hover text-white/40"
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className={`text-sm font-bold truncate flex items-center gap-1.5 ${active ? "text-white" : "text-white/75"}`}>
                        {topic.title}
                        {topic.admin_only && <Lock className="w-3 h-3 text-amber-400/70 flex-shrink-0" />}
                      </p>
                      <p className="text-white/35 text-[11px] truncate">{topic.description || t("comm.by").replace("{name}", topic.author_name)}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Colonne droite : fil de discussion ── */}
        <div className="card !bg-black/85 !p-0 overflow-hidden flex flex-col" style={{ minHeight: "60vh" }}>
          {selectedTopic ? (
            <>
              {/* En-tête */}
              <div className="px-5 py-4 border-b border-surface-border">
                <h2 className="font-bold text-lg flex items-center gap-2">
                  {selectedTopic.title}
                  {selectedTopic.admin_only && (
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full border text-amber-400 border-amber-400/40 bg-amber-400/10 flex items-center gap-1">
                      <Lock className="w-2.5 h-2.5" />{t("comm.adminAnnounce")}
                    </span>
                  )}
                </h2>
                {selectedTopic.description && (
                  <p className="text-white/40 text-xs mt-0.5">{selectedTopic.description}</p>
                )}
              </div>

              {/* Messages */}
              <div ref={listRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-4" style={{ maxHeight: "55vh" }}>
                {messagesLoading ? (
                  <div className="flex items-center justify-center py-16">
                    <Loader2 className="w-6 h-6 text-amber-400 animate-spin" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-16">
                    <MessageCircle className="w-9 h-9 text-white/15 mx-auto mb-3" />
                    <p className="text-white/40 text-sm font-medium">{t("comm.noMessages")}</p>
                    {canWrite && <p className="text-white/25 text-xs mt-1">{t("comm.beFirst")}</p>}
                  </div>
                ) : (
                  messages.map((msg) => {
                    const mine = !!userId && msg.user_id === userId;
                    return (
                      <div key={msg.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 border ${
                          msg.is_admin
                            ? "bg-amber-400/10 border-amber-400/30"
                            : mine
                              ? "bg-accent-orange/15 border-accent-orange/30"
                              : "bg-surface-hover border-surface-border"
                        }`}>
                          <p className="flex items-center gap-1.5 mb-1">
                            <span className={`text-[11px] font-bold ${msg.is_admin ? "text-amber-400" : mine ? "text-accent-orange" : "text-white/60"}`}>
                              {msg.is_admin ? "High Like It" : msg.author_name}
                            </span>
                            {msg.is_admin && (
                              <span className="text-[8px] font-bold px-1.5 py-px rounded-full bg-amber-400 text-black uppercase">Admin</span>
                            )}
                            <span className="text-white/25 text-[10px]">
                              {new Date(msg.created_at).toLocaleDateString(undefined, { day: "numeric", month: "short" })}{" "}
                              {new Date(msg.created_at).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </p>
                          {msg.content && (
                            <p className={`text-white/85 whitespace-pre-wrap break-words leading-relaxed ${SIZE_CLASSES[msg.text_size] ?? "text-sm"}`}>
                              {msg.content}
                            </p>
                          )}
                          {msg.image_url && (
                            <div className="relative mt-2 rounded-xl overflow-hidden border border-white/10" style={{ maxWidth: 360 }}>
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={msg.image_url} alt="" className="w-full h-auto max-h-72 object-contain bg-black/40" />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Composer */}
              <div className="border-t border-surface-border px-4 py-3">
                {canWrite ? (
                  <div className="space-y-2">
                    {imagePreview && (
                      <div className="relative inline-block">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={imagePreview} alt="" className="h-20 rounded-lg border border-white/10 object-cover" />
                        <button
                          onClick={clearImage}
                          className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center"
                          aria-label={t("comm.removeImage")}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                    {isAdmin && selectedTopic.admin_only && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-white/35 text-[10px] uppercase tracking-wide font-bold mr-1">{t("comm.size")}</span>
                        {SIZE_OPTIONS.map((s) => (
                          <button
                            key={s.id}
                            onClick={() => setTextSize(s.id)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all ${
                              textSize === s.id
                                ? "border-amber-400 bg-amber-400/15 text-amber-400"
                                : "border-surface-border text-white/40 hover:text-white"
                            }`}
                          >
                            {t(`comm.size.${s.id}`)}
                          </button>
                        ))}
                      </div>
                    )}
                    <div className="flex items-end gap-2">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handlePickImage(e.target.files?.[0] ?? null)}
                      />
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-10 h-10 rounded-xl border border-surface-border text-white/40 hover:text-amber-400 hover:border-amber-400/40 flex items-center justify-center transition-all flex-shrink-0"
                        aria-label={t("comm.attachImage")}
                      >
                        <ImagePlus className="w-4 h-4" />
                      </button>
                      <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
                        }}
                        placeholder={t("comm.messagePlaceholder")}
                        rows={1}
                        maxLength={2000}
                        className="flex-1 bg-surface border border-surface-border rounded-xl px-3 py-2.5 text-white text-sm placeholder-white/25 focus:outline-none focus:border-amber-400/60 resize-none"
                      />
                      <button
                        onClick={handleSend}
                        disabled={sending || (!content.trim() && !imageFile)}
                        className="btn-primary-orange w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 disabled:opacity-40"
                        aria-label={t("comm.send")}
                      >
                        {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="flex items-center justify-center gap-2 text-white/35 text-xs py-1.5">
                    <Lock className="w-3.5 h-3.5 text-amber-400/60" />
                    {t("comm.readOnly")}
                  </p>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 py-20">
              <Users className="w-10 h-10 text-white/15" />
              <p className="text-white/40 text-sm">{t("comm.selectTopic")}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
