"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, Zap, Crown, Search, X, Check,
  ChevronUp, ChevronDown, Ban, PlusCircle,
  Settings, LogOut, Trash2, Download, Mail, Copy,
} from "lucide-react";
import toast from "react-hot-toast";
import { useI18n } from "@/lib/i18n";

type Plan = "free" | "essentiel" | "pro" | "ultra";

interface User {
  id: string;
  email: string;
  credits: number;
  plan: Plan | null;
  plan_started_at: string | null;
  created_at: string;
  notes: string | null;
  is_banned: boolean | null;
}

const PLAN_COLORS: Record<string, string> = {
  free: "text-white/40 bg-white/5 border-white/10",
  essentiel: "text-blue-400 bg-blue-400/10 border-blue-400/30",
  pro: "text-accent-violet bg-accent-violet/10 border-accent-violet/30",
  ultra: "text-yellow-400 bg-yellow-400/10 border-yellow-400/30",
};

export default function AdminPage() {
  const { t } = useI18n();
  const PLAN_LABELS: Record<string, string> = {
    free: t("dash.set.free"), essentiel: "Essentiel", pro: "Pro", ultra: "Ultra",
  };
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [sortField, setSortField] = useState<keyof User>("created_at");
  const [sortAsc, setSortAsc] = useState(false);

  // Edit state
  const [editCredits, setEditCredits] = useState("");
  const [addCreditsVal, setAddCreditsVal] = useState("");
  const [editPlan, setEditPlan] = useState<Plan>("free");
  const [editNotes, setEditNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Export des adresses e-mail (par formule / abonnement)
  const ALL_PLANS: Plan[] = ["free", "essentiel", "pro", "ultra"];
  const [exportPlans, setExportPlans] = useState<Set<Plan>>(new Set(ALL_PLANS));

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async (): Promise<User[]> => {
    setLoading(true);
    let list: User[] = [];
    const res = await fetch("/api/admin/users");
    if (res.ok) {
      list = await res.json();
      setUsers(list);
    } else {
      const err = await res.json().catch(() => ({}));
      toast.error(`${t("admin.error")} ${res.status} : ${err.error ?? t("admin.denied")}`);
    }
    setLoading(false);
    return list;
  };

  const callAction = async (userId: string, action: string, value: unknown) => {
    setSaving(true);
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, action, value }),
    });
    setSaving(false);
    if (res.ok) {
      toast.success(t("admin.saved"));
      const fresh = await fetchUsers();
      const updated = fresh.find(u => u.id === userId);
      if (updated) {
        setSelectedUser(prev => (prev && prev.id === userId ? updated : prev));
        setEditCredits(String(updated.credits));
      }
    } else {
      const err = await res.json().catch(() => ({}));
      toast.error(err.error ?? t("admin.saveError"));
    }
  };

  const openUser = (u: User) => {
    setSelectedUser(u);
    setEditCredits(String(u.credits));
    setEditPlan((u.plan as Plan) ?? "free");
    setEditNotes(u.notes ?? "");
    setAddCreditsVal("");
    setConfirmDelete(false);
  };

  /* Supprime définitivement l'utilisateur (compte + générations + transactions) */
  const deleteUser = async (userId: string) => {
    setSaving(true);
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, action: "delete_user", value: true }),
    });
    setSaving(false);
    if (res.ok) {
      toast.success(t("admin.userDeleted"));
      setSelectedUser(null);
      setConfirmDelete(false);
      await fetchUsers();
    } else {
      const err = await res.json().catch(() => ({}));
      toast.error(err.error ?? t("dash.toast.deleteError"));
    }
  };

  const toggleSort = (field: keyof User) => {
    if (sortField === field) setSortAsc(!sortAsc);
    else { setSortField(field); setSortAsc(true); }
  };

  const filtered = users
    .filter(u => u.email?.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      const av = a[sortField] ?? "";
      const bv = b[sortField] ?? "";
      return sortAsc ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
    });

  // Stats
  const totalCredits = users.reduce((s, u) => s + (u.credits ?? 0), 0);
  const proUsers = users.filter(u => u.plan === "pro" || u.plan === "ultra").length;

  /* ── Export des adresses e-mail ─────────────────────────── */
  const togglePlanFilter = (p: Plan) => {
    setExportPlans(prev => {
      const next = new Set(prev);
      if (next.has(p)) next.delete(p); else next.add(p);
      return next;
    });
  };

  // E-mails correspondant aux formules sélectionnées (dédupliqués)
  const exportEmails = (plans: Set<Plan> | "all"): string[] => {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const u of users) {
      if (!u.email) continue;
      const plan = (u.plan as Plan) ?? "free";
      if (plans !== "all" && !plans.has(plan)) continue;
      const email = u.email.trim().toLowerCase();
      if (seen.has(email)) continue;
      seen.add(email);
      out.push(u.email.trim());
    }
    return out;
  };

  const downloadEmails = (plans: Set<Plan> | "all", filename: string) => {
    const emails = exportEmails(plans);
    if (emails.length === 0) { toast.error(t("admin.export.none")); return; }
    const blob = new Blob([emails.join("\n") + "\n"], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`${emails.length} ${t("admin.export.done")}`);
  };

  const copyEmails = async (plans: Set<Plan> | "all") => {
    const emails = exportEmails(plans);
    if (emails.length === 0) { toast.error(t("admin.export.none")); return; }
    try {
      await navigator.clipboard.writeText(emails.join(", "));
      toast.success(`${emails.length} ${t("admin.export.copied")}`);
    } catch {
      toast.error(t("admin.saveError"));
    }
  };

  const selectedCount = exportEmails(exportPlans).length;

  return (
    <div className="min-h-screen text-white">
      {/* Header */}
      <div className="border-b border-surface-border bg-surface/50 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-violet-neon rounded-lg flex items-center justify-center">
              <Settings className="w-4 h-4 text-white" />
            </div>
            <span className="font-black text-lg">High Like It <span className="gradient-text">Admin</span></span>
          </div>
          <a href="/" className="flex items-center gap-2 text-white/50 hover:text-white text-sm transition-colors">
            <LogOut className="w-4 h-4" />
            {t("admin.backToSite")}
          </a>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: t("admin.users"), value: users.length, icon: <Users className="w-5 h-5" />, color: "text-blue-400" },
            { label: t("admin.paidSubs"), value: proUsers, icon: <Crown className="w-5 h-5" />, color: "text-yellow-400" },
            { label: t("admin.creditsGiven"), value: totalCredits.toLocaleString(), icon: <Zap className="w-5 h-5" />, color: "text-accent-violet" },
            { label: t("admin.banned"), value: users.filter(u => u.is_banned).length, icon: <Ban className="w-5 h-5" />, color: "text-red-400" },
          ].map((stat) => (
            <div key={stat.label} className="card border-surface-border">
              <div className={`${stat.color} mb-2`}>{stat.icon}</div>
              <div className="text-2xl font-black">{stat.value}</div>
              <div className="text-white/40 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Export des adresses e-mail */}
        <div className="card border-surface-border mb-8">
          <div className="flex items-center gap-2 mb-1">
            <Mail className="w-5 h-5 text-accent-violet" />
            <h2 className="font-bold text-lg">{t("admin.export.title")}</h2>
          </div>
          <p className="text-white/40 text-sm mb-5">{t("admin.export.subtitle")}</p>

          {/* Tout exporter */}
          <div className="flex flex-wrap items-center gap-2 mb-5 pb-5 border-b border-surface-border">
            <button
              onClick={() => downloadEmails("all", "emails-tous.csv")}
              className="btn-primary text-sm px-4 py-2 flex items-center gap-2"
            >
              <Download className="w-4 h-4" /> {t("admin.export.all")}
            </button>
            <button
              onClick={() => copyEmails("all")}
              className="btn-secondary text-sm px-4 py-2 flex items-center gap-2"
            >
              <Copy className="w-4 h-4" /> {t("admin.export.copyAll")}
            </button>
            <span className="text-white/30 text-xs ml-auto">
              {users.length} {t("admin.export.total")}
            </span>
          </div>

          {/* Par formule / abonnement */}
          <p className="text-sm font-medium text-white/70 mb-3">{t("admin.export.byPlan")}</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {ALL_PLANS.map(p => {
              const active = exportPlans.has(p);
              const count = users.filter(u => ((u.plan as Plan) ?? "free") === p).length;
              return (
                <button
                  key={p}
                  onClick={() => togglePlanFilter(p)}
                  className={`px-3 py-1.5 rounded-lg text-sm border transition-all flex items-center gap-1.5 ${
                    active
                      ? "bg-accent-violet border-accent-violet text-white"
                      : "border-surface-border text-white/50 hover:text-white"
                  }`}
                >
                  {active && <Check className="w-3.5 h-3.5" />}
                  {PLAN_LABELS[p]}
                  <span className={active ? "text-white/70" : "text-white/30"}>({count})</span>
                </button>
              );
            })}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => downloadEmails(exportPlans, `emails-${Array.from(exportPlans).join("-") || "aucun"}.csv`)}
              disabled={exportPlans.size === 0}
              className="btn-primary text-sm px-4 py-2 flex items-center gap-2 disabled:opacity-40"
            >
              <Download className="w-4 h-4" /> {t("admin.export.selection")}
            </button>
            <button
              onClick={() => copyEmails(exportPlans)}
              disabled={exportPlans.size === 0}
              className="btn-secondary text-sm px-4 py-2 flex items-center gap-2 disabled:opacity-40"
            >
              <Copy className="w-4 h-4" /> {t("admin.export.copySelection")}
            </button>
            <span className="text-white/30 text-xs ml-auto">
              {selectedCount} {t("admin.export.selected")}
            </span>
          </div>
        </div>

        {/* Tableau */}
        <div className="card border-surface-border">
          <div className="flex items-center gap-4 mb-6">
            <h2 className="font-bold text-lg flex-1">{t("admin.users")}</h2>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={t("admin.searchEmail")}
                className="pl-9 pr-4 py-2 bg-surface border border-surface-border rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:border-accent-violet/60 w-64"
              />
            </div>
          </div>

          {loading ? (
            <div className="text-center py-16 text-white/30">{t("admin.loading")}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-surface-border">
                    {[
                      { key: "email", label: t("login.email") },
                      { key: "plan", label: t("admin.plan") },
                      { key: "credits", label: t("pricing.credits") },
                      { key: "created_at", label: t("admin.signup") },
                      { key: "is_banned", label: t("admin.status") },
                    ].map(col => (
                      <th
                        key={col.key}
                        onClick={() => toggleSort(col.key as keyof User)}
                        className="text-left py-3 px-4 text-white/40 font-medium cursor-pointer hover:text-white transition-colors select-none"
                      >
                        <span className="flex items-center gap-1">
                          {col.label}
                          {sortField === col.key
                            ? sortAsc ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                            : <ChevronDown className="w-3 h-3 opacity-20" />}
                        </span>
                      </th>
                    ))}
                    <th className="text-left py-3 px-4 text-white/40 font-medium">{t("admin.action")}</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(u => (
                    <tr key={u.id} className="border-b border-surface-border/50 hover:bg-surface-hover transition-colors">
                      <td className="py-3 px-4 font-medium">{u.email}</td>
                      <td className="py-3 px-4">
                        <span className={`text-xs px-2 py-1 rounded-full border ${PLAN_COLORS[u.plan ?? "free"]}`}>
                          {PLAN_LABELS[u.plan ?? "free"]}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-accent-violet font-semibold">{u.credits?.toLocaleString()}</span>
                      </td>
                      <td className="py-3 px-4 text-white/50">
                        {new Date(u.created_at).toLocaleDateString(undefined)}
                      </td>
                      <td className="py-3 px-4">
                        {u.is_banned
                          ? <span className="text-xs text-red-400 bg-red-400/10 border border-red-400/30 px-2 py-1 rounded-full">{t("admin.bannedStatus")}</span>
                          : <span className="text-xs text-green-400 bg-green-400/10 border border-green-400/30 px-2 py-1 rounded-full">{t("admin.activeStatus")}</span>
                        }
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => openUser(u)}
                          className="text-xs text-accent-violet border border-accent-violet/30 px-3 py-1.5 rounded-lg hover:bg-accent-violet/10 transition-colors"
                        >
                          {t("admin.manage")}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length === 0 && (
                <div className="text-center py-12 text-white/30">{t("admin.noUsers")}</div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal utilisateur */}
      <AnimatePresence>
        {selectedUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={e => e.target === e.currentTarget && setSelectedUser(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-surface border border-surface-border rounded-2xl w-full max-w-lg p-6"
            >
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="font-bold text-lg">{selectedUser.email}</h3>
                  <p className="text-white/40 text-sm">
{t("admin.signedUpOn")} {new Date(selectedUser.created_at).toLocaleDateString(undefined)}
                  </p>
                </div>
                <button onClick={() => setSelectedUser(null)} className="text-white/40 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-5">
                {/* Plan */}
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">{t("admin.plan")}</label>
                  <div className="flex gap-2 flex-wrap">
                    {(["free", "essentiel", "pro", "ultra"] as Plan[]).map(p => (
                      <button
                        key={p}
                        onClick={() => setEditPlan(p)}
                        className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${
                          editPlan === p ? "bg-accent-violet border-accent-violet text-white" : "border-surface-border text-white/50 hover:text-white"
                        }`}
                      >
                        {PLAN_LABELS[p]}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => callAction(selectedUser.id, "set_plan", editPlan)}
                    disabled={saving}
                    className="mt-2 btn-primary text-sm px-4 py-2 flex items-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5" /> {t("admin.applyPlan")}
                  </button>
                </div>

                {/* Crédits actuels */}
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    {t("admin.currentCredits")} <span className="text-accent-violet font-bold">{selectedUser.credits?.toLocaleString()}</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={editCredits}
                      onChange={e => setEditCredits(e.target.value)}
                      className="input-field flex-1 text-sm py-2"
                      placeholder={t("admin.newTotal")}
                    />
                    <button
                      onClick={() => callAction(selectedUser.id, "set_credits", editCredits)}
                      disabled={saving}
                      className="btn-secondary text-sm px-4 py-2 whitespace-nowrap"
                    >
                      {t("admin.set")}
                    </button>
                  </div>
                </div>

                {/* Ajouter des crédits */}
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">{t("admin.addCredits")}</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={addCreditsVal}
                      onChange={e => setAddCreditsVal(e.target.value)}
                      className="input-field flex-1 text-sm py-2"
                      placeholder="Ex: 500"
                    />
                    <button
                      onClick={() => callAction(selectedUser.id, "add_credits", addCreditsVal)}
                      disabled={saving || !addCreditsVal}
                      className="btn-primary text-sm px-4 py-2 flex items-center gap-1 whitespace-nowrap"
                    >
                      <PlusCircle className="w-3.5 h-3.5" /> {t("admin.add")}
                    </button>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">{t("admin.internalNotes")}</label>
                  <textarea
                    value={editNotes}
                    onChange={e => setEditNotes(e.target.value)}
                    rows={3}
                    placeholder={t("admin.notesPlaceholder")}
                    className="input-field text-sm resize-none"
                  />
                  <button
                    onClick={() => callAction(selectedUser.id, "set_notes", editNotes)}
                    disabled={saving}
                    className="mt-2 btn-secondary text-sm px-4 py-2"
                  >
                    {t("admin.saveNotes")}
                  </button>
                </div>

                {/* Bannir */}
                <div className="border-t border-surface-border pt-4 space-y-3">
                  <button
                    onClick={() => callAction(selectedUser.id, "toggle_ban", !selectedUser.is_banned)}
                    disabled={saving}
                    className={`w-full py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                      selectedUser.is_banned
                        ? "border-green-500/40 text-green-400 hover:bg-green-500/10"
                        : "border-red-500/40 text-red-400 hover:bg-red-500/10"
                    }`}
                  >
                    <Ban className="w-4 h-4 inline mr-2" />
                    {selectedUser.is_banned ? t("admin.unban") : t("admin.ban")}
                  </button>

                  {/* Supprimer définitivement — confirmation en 2 temps */}
                  {!confirmDelete ? (
                    <button
                      onClick={() => setConfirmDelete(true)}
                      disabled={saving}
                      className="w-full py-2.5 rounded-xl text-sm font-semibold bg-red-500/15 border border-red-500 text-red-400 hover:bg-red-500/30 hover:text-white transition-all"
                    >
                      <Trash2 className="w-4 h-4 inline mr-2" />
                      {t("admin.deleteUser")}
                    </button>
                  ) : (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 space-y-2">
                      <p className="text-red-400 text-xs font-medium leading-relaxed">
                        {t("admin.deleteWarn1")} <strong>{selectedUser.email}</strong> {t("admin.deleteWarn2")}
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => deleteUser(selectedUser.id)}
                          disabled={saving}
                          className="px-3 py-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white text-xs font-bold transition-all disabled:opacity-50"
                        >
                          {saving ? "…" : t("admin.confirmDelete")}
                        </button>
                        <button
                          onClick={() => setConfirmDelete(false)}
                          disabled={saving}
                          className="px-3 py-1.5 rounded-lg border border-surface-border text-white/50 hover:text-white text-xs transition-all"
                        >
                          {t("dash.hist.cancel")}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
