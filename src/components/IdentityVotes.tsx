import React, { useState, useEffect, useCallback } from "react";
import { Plus, Trash2, Flame, AlertTriangle, Save, CheckCircle } from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────

interface VoteRecord {
  id: string;
  name: string;
  /** Dates (ISO "YYYY-MM-DD") when the user voted */
  history: string[];
}

interface IdentityVotesData {
  identity: string;
  votes: VoteRecord[];
}

// ── Helpers ────────────────────────────────────────────────────────

const STORAGE_KEY = "identity_votes";

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

function loadData(): IdentityVotesData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as IdentityVotesData;
  } catch { /* ignore */ }
  return { identity: "", votes: [] };
}

function saveData(data: IdentityVotesData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// ── Component ──────────────────────────────────────────────────────

export default function IdentityVotes() {
  const [data, setData] = useState<IdentityVotesData>(loadData);
  const [identityDraft, setIdentityDraft] = useState(data.identity);
  const [identitySaved, setIdentitySaved] = useState(false);
  const [newVoteName, setNewVoteName] = useState("");

  // Persist whenever data changes
  useEffect(() => {
    saveData(data);
  }, [data]);

  // ── Identity ──

  const handleSaveIdentity = useCallback(() => {
    setData((prev) => ({ ...prev, identity: identityDraft }));
    setIdentitySaved(true);
    setTimeout(() => setIdentitySaved(false), 2000);
  }, [identityDraft]);

  // ── Votes ──

  const addVote = useCallback(() => {
    const name = newVoteName.trim();
    if (!name) return;
    const vote: VoteRecord = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name,
      history: [],
    };
    setData((prev) => ({ ...prev, votes: [...prev.votes, vote] }));
    setNewVoteName("");
  }, [newVoteName]);

  const toggleToday = useCallback((id: string) => {
    const todayStr = today();
    setData((prev) => ({
      ...prev,
      votes: prev.votes.map((v) => {
        if (v.id !== id) return v;
        const has = v.history.includes(todayStr);
        return {
          ...v,
          history: has
            ? v.history.filter((d) => d !== todayStr)
            : [...v.history, todayStr],
        };
      }),
    }));
  }, []);

  const deleteVote = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      votes: prev.votes.filter((v) => v.id !== id),
    }));
  }, []);

  const todayStr = today();

  return (
    <div className="flex flex-col gap-6 md:gap-8 w-full">
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
            disabled={identityDraft === data.identity}
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
        {data.votes.length === 0 ? (
          <div className="bg-bg-paper/40 border border-secondary/25 p-6 rounded-xl text-center text-secondary/60 font-mono text-sm">
            Chưa có thói quen nào. Hãy thêm một thói quen mới!
          </div>
        ) : (
          <div className="space-y-3">
            {data.votes.map((vote) => {
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
