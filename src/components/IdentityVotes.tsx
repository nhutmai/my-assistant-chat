import React, { useState, useEffect, useCallback } from "react";
import { Plus, Trash2, Flame, AlertTriangle, Save, CheckCircle, Loader2 } from "lucide-react";
import api from "../lib/api.js";

// ── Types ──────────────────────────────────────────────────────────

interface VoteRecord {
  id: string;
  name: string;
  /** Dates (ISO "YYYY-MM-DD") when the user voted */
  history: string[];
}

// ── Helpers ────────────────────────────────────────────────────────

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function dateKey(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().slice(0, 10);
}

function calcStreak(history: string[]): number {
  const set = new Set(history);
  let streak = 0;
  for (let i = 0; ; i++) {
    if (set.has(dateKey(i))) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

function shouldWarnNeverMissTwice(history: string[]): boolean {
  const set = new Set(history);
  const twoDaysAgo = dateKey(2);
  const yesterday = dateKey(1);
  const todayStr = today();
  return set.has(twoDaysAgo) && !set.has(yesterday) && !set.has(todayStr);
}

// ── Component ──────────────────────────────────────────────────────

export default function IdentityVotes() {
  const [identity, setIdentity] = useState("");
  const [identityDraft, setIdentityDraft] = useState("");
  const [votes, setVotes] = useState<VoteRecord[]>([]);
  const [identitySaved, setIdentitySaved] = useState(false);
  const [newVoteName, setNewVoteName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── Fetch data on mount ──

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        const [identityRes, votesRes] = await Promise.all([
          api.get("/api/identity"),
          api.get("/api/votes"),
        ]);

        if (cancelled) return;

        setIdentity(identityRes.data.data.identity ?? "");
        setIdentityDraft(identityRes.data.data.identity ?? "");
        setVotes(votesRes.data.data ?? []);
      } catch (err: any) {
        if (!cancelled) {
          setError("Không thể tải dữ liệu. Vui lòng thử lại.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();
    return () => { cancelled = true; };
  }, []);

  // ── Identity ──

  const handleSaveIdentity = useCallback(async () => {
    try {
      await api.put("/api/identity", { identity: identityDraft });
      setIdentity(identityDraft);
      setIdentitySaved(true);
      setTimeout(() => setIdentitySaved(false), 2000);
    } catch {
      setError("Lưu identity thất bại.");
    }
  }, [identityDraft]);

  // ── Votes ──

  const addVote = useCallback(async () => {
    const name = newVoteName.trim();
    if (!name) return;

    try {
      const res = await api.post("/api/votes", { name });
      setVotes((prev) => [...prev, res.data.data]);
      setNewVoteName("");
    } catch {
      setError("Thêm thói quen thất bại.");
    }
  }, [newVoteName]);

  const toggleToday = useCallback(async (id: string) => {
    try {
      const res = await api.post(`/api/votes/${id}/toggle`);
      const { voted } = res.data.data;
      const todayStr = today();

      setVotes((prev) =>
        prev.map((v) => {
          if (v.id !== id) return v;
          return {
            ...v,
            history: voted
              ? [...v.history, todayStr]
              : v.history.filter((d) => d !== todayStr),
          };
        })
      );
    } catch {
      setError("Toggle thất bại.");
    }
  }, []);

  const deleteVote = useCallback(async (id: string) => {
    try {
      await api.delete(`/api/votes/${id}`);
      setVotes((prev) => prev.filter((v) => v.id !== id));
    } catch {
      setError("Xoá thói quen thất bại.");
    }
  }, []);

  const todayStr = today();

  // ── Loading state ──

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16">
        <Loader2 size={24} className="animate-spin text-secondary" />
        <span className="text-xs font-mono text-secondary/60">Đang tải...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 md:gap-8 w-full">
      {/* Error Banner */}
      {error && (
        <div className="flex items-center gap-2 text-[11px] font-mono text-danger bg-danger/10 border border-danger/25 px-4 py-3 rounded-xl font-semibold">
          <AlertTriangle size={12} />
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-auto text-danger/60 hover:text-danger transition-colors focus-visible:ring-2 focus-visible:ring-secondary/50 rounded-lg px-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Identity Card */}
      <div className="bg-surface border border-secondary/20 rounded-2xl p-6 shadow-bento space-y-4">
        <h2 className="text-[10px] uppercase tracking-[0.2em] text-secondary font-bold font-mono border-b border-secondary/15 pb-3">
          Tuyên ngôn Identity
        </h2>
        <textarea
          value={identityDraft}
          onChange={(e) => setIdentityDraft(e.target.value)}
          placeholder="Tôi là người học sâu, đều đặn..."
          rows={3}
          className="w-full p-4 bg-bg-paper/40 border border-secondary/20 rounded-xl focus:border-secondary focus:ring-2 focus:ring-secondary/20 outline-none transition-all text-sm font-mono text-text leading-relaxed placeholder-text/30"
        />
        <div className="flex items-center justify-between">
          {identitySaved && (
            <span className="flex items-center gap-1.5 text-success text-xs font-mono font-semibold">
              <CheckCircle size={12} />
              Đã lưu
            </span>
          )}
          <div className="flex-1" />
          <button
            onClick={handleSaveIdentity}
            disabled={identityDraft === identity}
            className="px-4 py-2 rounded-xl font-mono text-xs uppercase tracking-[0.2em] transition-all flex items-center gap-2 border border-secondary/20 shadow-sm bg-primary text-text font-bold hover:bg-[#F8C6AF] focus:ring-2 focus:ring-secondary/20 active:scale-95 disabled:bg-surface disabled:text-text/30 disabled:border-secondary/10 disabled:shadow-none"
          >
            <Save size={14} />
            Lưu
          </button>
        </div>
      </div>

      {/* Votes Card */}
      <div className="bg-surface border border-secondary/20 rounded-2xl p-6 shadow-bento space-y-4">
        <h2 className="text-[10px] uppercase tracking-[0.2em] text-secondary font-bold font-mono border-b border-secondary/15 pb-3">
          Votes — Thói quen hàng ngày
        </h2>

        {/* Add new vote */}
        <div className="flex gap-3">
          <input
            type="text"
            value={newVoteName}
            onChange={(e) => setNewVoteName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addVote()}
            placeholder="Tên thói quen mới..."
            className="flex-1 px-4 py-2.5 bg-bg-paper/40 border border-secondary/20 rounded-xl focus:border-secondary focus:ring-2 focus:ring-secondary/20 outline-none transition-all text-sm font-mono text-text placeholder-text/30"
          />
          <button
            onClick={addVote}
            disabled={!newVoteName.trim()}
            className="px-4 py-2.5 rounded-xl font-mono text-xs uppercase tracking-[0.15em] transition-all flex items-center gap-2 border border-secondary/20 shadow-sm bg-primary text-text font-bold hover:bg-[#F8C6AF] focus:ring-2 focus:ring-secondary/20 active:scale-95 disabled:bg-surface disabled:text-text/30 disabled:border-secondary/10 disabled:shadow-none"
          >
            <Plus size={14} />
            Thêm
          </button>
        </div>

        {/* Vote List */}
        {votes.length === 0 ? (
          <div className="bg-bg-paper/40 border border-secondary/25 p-6 rounded-xl text-center text-secondary/60 font-mono text-sm">
            Chưa có thói quen nào. Hãy thêm một thói quen mới!
          </div>
        ) : (
          <div className="space-y-3">
            {votes.map((vote) => {
              const streak = calcStreak(vote.history);
              const votedToday = vote.history.includes(todayStr);
              const warn = shouldWarnNeverMissTwice(vote.history);

              return (
                <div
                  key={vote.id}
                  className="bg-bg-paper/30 border border-secondary/15 rounded-xl p-4 space-y-3 hover:border-secondary/35 transition-all"
                >
                  {/* Top row: name + streak + delete */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-sm font-semibold text-text truncate">
                        {vote.name}
                      </span>
                      {streak > 0 && (
                        <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-warning bg-warning/10 border border-warning/25 px-2 py-0.5 rounded-lg shrink-0">
                          <Flame size={10} />
                          {streak}d
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => toggleToday(vote.id)}
                        className={`px-3 py-1.5 rounded-xl font-mono text-[10px] uppercase tracking-[0.15em] transition-all flex items-center gap-1.5 border font-bold active:scale-95 focus-visible:ring-2 focus-visible:ring-secondary/50 ${
                          votedToday
                            ? "bg-success/15 text-success border-success/30 hover:bg-success/25"
                            : "bg-surface text-text border-secondary/20 hover:bg-primary/20 hover:border-primary/20"
                        }`}
                      >
                        <CheckCircle size={12} />
                        {votedToday ? "Đã làm" : "Hôm nay"}
                      </button>
                      <button
                        onClick={() => deleteVote(vote.id)}
                        className="p-1.5 rounded-xl text-secondary/40 hover:text-danger hover:bg-danger/10 transition-all active:scale-95 focus-visible:ring-2 focus-visible:ring-secondary/50"
                        aria-label={`Xoá ${vote.name}`}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* 7-day dots */}
                  <div className="flex items-center gap-1.5">
                    {Array.from({ length: 7 }, (_, i) => {
                      const dk = dateKey(6 - i);
                      const active = vote.history.includes(dk);
                      return (
                        <div
                          key={dk}
                          title={dk}
                          className={`w-5 h-5 rounded-full border transition-all ${
                            active
                              ? "bg-primary border-primary/60"
                              : "bg-bg-paper/40 border-secondary/20"
                          }`}
                        />
                      );
                    })}
                    <span className="text-[9px] font-mono text-secondary/50 ml-1">
                      7 ngày
                    </span>
                  </div>

                  {/* Never miss twice warning */}
                  {warn && (
                    <div className="flex items-center gap-2 text-[11px] font-mono text-warning bg-warning/10 border border-warning/25 px-3 py-2 rounded-xl font-semibold">
                      <AlertTriangle size={12} />
                      Đừng bỏ lỡ 2 ngày liên tiếp — hãy bỏ phiếu hôm nay!
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
