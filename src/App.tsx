import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Send,
  Loader2,
  Sparkles,
  AlertCircle,
  Terminal,
  ClipboardList,
  RefreshCw,
  Sun,
  Moon,
  LogOut,
  Zap,
  Vote,
} from "lucide-react";
import IdentityVotes from "./components/IdentityVotes.js";
import api from "./lib/api.js";
import LoginPage from "./pages/LoginPage.js";

function Dashboard({ onLogout }: { onLogout: () => void }) {
  const [activeTab, setActiveTab] = useState<"console" | "logs">("console");
  const [consoleMode, setConsoleMode] = useState<"classify" | "identity">(
    "classify",
  );
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [appReady, setAppReady] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("theme");
    if (saved) return saved === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  useEffect(() => {
    setAppReady(true);
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const response = await api.get("/api/logs");
      setLogs(response.data?.data || []);
    } catch (err) {
      console.error("Failed to fetch logs", err);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    setLoading(true);
    setError("");
    try {
      const response = await api.post("/api/ai/generate", { prompt });
      setResult(JSON.stringify(response.data?.data, null, 2));
      fetchLogs();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to generate content");
    } finally {
      setLoading(false);
    }
  };

  if (!appReady) return null;

  return (
    <div className="min-h-screen flex flex-col bg-bg-paper text-text font-sans overflow-hidden p-6 md:p-8 gap-6 md:gap-8">
      {/* Header Bento Card */}
      <header className="bg-surface border border-secondary/20 rounded-2xl p-6 shadow-bento flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shadow-sm">
            <Sparkles className="text-text w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-text">
              My Assisstance
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-4 flex-wrap">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="flex items-center justify-center p-2 rounded-xl bg-surface border border-secondary/30 text-text hover:bg-primary/20 hover:border-primary/20 active:scale-95 transition-all shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-secondary/50 cursor-pointer"
            aria-label="Toggle theme"
          >
            {darkMode ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 p-2 rounded-xl bg-surface border border-secondary/30 text-text hover:bg-danger/10 hover:border-danger/30 hover:text-danger active:scale-95 transition-all shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-secondary/50 cursor-pointer"
            aria-label="Logout"
            title="Đăng xuất"
          >
            <LogOut size={16} />
          </button>
          <span className="text-[10px] font-mono text-text bg-primary/30 border border-primary/40 px-3 py-1 rounded-xl font-bold">
            v2.1.0
          </span>
        </div>
      </header>

      {/* Main Grid Wrapper */}
      <div className="flex-1 grid grid-cols-12 gap-6 md:gap-8 items-start overflow-y-auto pr-1">
        {/* Navigation & System Info Card (col-span-12 or col-span-4 on lg) */}
        <aside className="col-span-12 lg:col-span-4 flex flex-col gap-6 md:gap-8">
          {/* Navigation Block */}
          <div className="bg-surface border border-secondary/20 rounded-2xl p-6 shadow-bento space-y-4">
            <h2 className="text-[10px] uppercase tracking-[0.2em] text-secondary font-bold font-mono">
              Navigation
            </h2>
            <nav className="space-y-3">
              <button
                onClick={() => setActiveTab("console")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all outline-none focus-visible:ring-2 focus-visible:ring-secondary/50 active:scale-98 text-sm font-semibold ${
                  activeTab === "console"
                    ? "bg-primary border-primary/50 text-text shadow-sm"
                    : "bg-surface border-secondary/20 text-text hover:bg-primary/20 hover:border-primary/20"
                }`}
              >
                <Terminal size={16} />
                Console
              </button>
              <button
                onClick={() => setActiveTab("logs")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all outline-none focus-visible:ring-2 focus-visible:ring-secondary/50 active:scale-98 text-sm font-semibold ${
                  activeTab === "logs"
                    ? "bg-primary border-primary/50 text-text shadow-sm"
                    : "bg-surface border-secondary/20 text-text hover:bg-primary/20 hover:border-primary/20"
                }`}
              >
                <ClipboardList size={16} />
                Lịch sử
              </button>
            </nav>
          </div>
        </aside>

        {/* Console / Output area or Logs area (col-span-12 or col-span-8 on lg) */}
        <main className="col-span-12 lg:col-span-8 flex flex-col gap-6 md:gap-8 min-h-[400px]">
          <AnimatePresence mode="wait">
            {activeTab === "console" ? (
              <motion.div
                key="console-tab"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col gap-6 md:gap-8 w-full"
              >
                {/* Segmented Control */}
                <div className="bg-surface border border-secondary/20 rounded-2xl p-2 shadow-bento flex gap-2">
                  <button
                    onClick={() => setConsoleMode("classify")}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-mono text-xs uppercase tracking-[0.15em] font-bold transition-all active:scale-98 focus-visible:ring-2 focus-visible:ring-secondary/50 ${
                      consoleMode === "classify"
                        ? "bg-primary border border-primary/50 text-text shadow-sm"
                        : "text-text/60 hover:text-text hover:bg-primary/10"
                    }`}
                  >
                    <Zap size={14} />
                    Phân loại
                  </button>
                  <button
                    onClick={() => setConsoleMode("identity")}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-mono text-xs uppercase tracking-[0.15em] font-bold transition-all active:scale-98 focus-visible:ring-2 focus-visible:ring-secondary/50 ${
                      consoleMode === "identity"
                        ? "bg-primary border border-primary/50 text-text shadow-sm"
                        : "text-text/60 hover:text-text hover:bg-primary/10"
                    }`}
                  >
                    <Vote size={14} />
                    Identity & Votes
                  </button>
                </div>

                {/* Sub-view: Classify or Identity */}
                <AnimatePresence mode="wait">
                  {consoleMode === "classify" ? (
                    <motion.div
                      key="classify-mode"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col gap-6 md:gap-8 w-full"
                    >
                      {/* Input Buffer Card */}
                      <div className="bg-surface border border-secondary/20 rounded-2xl p-6 shadow-bento space-y-4">
                        <h2 className="text-[10px] uppercase tracking-[0.2em] text-secondary font-bold font-mono border-b border-secondary/15 pb-3">
                          Nhập nội dung
                        </h2>

                        <form onSubmit={handleGenerate} className="space-y-4">
                          <div>
                            <textarea
                              value={prompt}
                              onChange={(e) => setPrompt(e.target.value)}
                              placeholder="Nhập nội dung cần phân loại, ví dụ: cà phê 50k, họp team 2h..."
                              rows={5}
                              className="w-full p-4 bg-bg-paper/40 border border-secondary/20 rounded-xl focus:border-secondary focus:ring-2 focus:ring-secondary/20 outline-none transition-all text-sm font-mono text-text leading-relaxed placeholder-text/30"
                            />
                          </div>
                          {error && (
                            <div className="p-3 bg-danger/10 border border-danger/30 text-danger text-xs rounded-xl flex items-center gap-2 font-mono font-semibold">
                              <AlertCircle size={14} />
                              {error}
                            </div>
                          )}
                          <div className="flex justify-end">
                            <button
                              type="submit"
                              disabled={loading || !prompt}
                              className="px-6 py-3 rounded-xl font-mono text-xs uppercase tracking-[0.2em] transition-all flex items-center gap-2 border border-secondary/20 shadow-sm bg-primary text-text font-bold hover:bg-[#F8C6AF] focus:ring-2 focus:ring-secondary/20 active:scale-95 disabled:bg-surface disabled:text-text/30 disabled:border-secondary/10 disabled:shadow-none"
                            >
                              {loading ? (
                                <Loader2
                                  size={16}
                                  className="animate-spin text-text"
                                />
                              ) : (
                                <Send size={16} />
                              )}
                              Gửi
                            </button>
                          </div>
                        </form>
                      </div>

                      {/* Inference Output Card */}
                      {(result || loading) && (
                        <motion.div
                          initial={{ opacity: 0, y: 16 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-surface border border-secondary/20 rounded-2xl p-6 shadow-bento space-y-4"
                        >
                          <div className="flex items-center gap-3 border-b border-secondary/15 pb-3">
                            <Sparkles size={14} className="text-secondary" />
                            <span className="text-[10px] uppercase tracking-widest text-secondary font-mono font-bold">
                              Kết quả
                            </span>
                          </div>
                          <div className="min-h-[120px]">
                            {loading && !result ? (
                              <div className="flex flex-col items-center justify-center py-8 text-secondary space-y-3">
                                <Loader2
                                  className="animate-spin text-secondary"
                                  size={24}
                                />
                                <span className="text-[10px] font-mono tracking-widest uppercase animate-pulse text-secondary font-bold">
                                  Đang xử lý...
                                </span>
                              </div>
                            ) : (
                              <div className="font-mono text-sm text-text bg-bg-paper/40 p-4 border border-secondary/20 rounded-xl leading-relaxed whitespace-pre-wrap shadow-sm">
                                {result}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="identity-mode"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <IdentityVotes />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ) : (
              <motion.div
                key="logs-tab"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col gap-6 w-full"
              >
                {/* Logs Shell Container */}
                <div className="bg-surface border border-secondary/20 rounded-2xl p-6 shadow-bento space-y-6">
                  <div className="flex items-center justify-between border-b border-secondary/15 pb-3">
                    <h2 className="text-lg font-bold font-sans text-text tracking-tight">
                      Lịch sử
                    </h2>
                    <button
                      onClick={fetchLogs}
                      className="text-[10px] uppercase font-mono tracking-widest text-text hover:bg-primary/20 transition-all flex items-center gap-2 border border-secondary/20 px-3 py-2 rounded-xl bg-surface shadow-sm active:scale-95 focus-visible:ring-2 focus-visible:ring-secondary/50 font-bold"
                    >
                      <RefreshCw size={12} />
                      Làm mới
                    </button>
                  </div>

                  <div className="space-y-4">
                    {logs.length === 0 ? (
                      <div className="bg-bg-paper/40 border border-secondary/25 p-8 rounded-xl text-center text-secondary/60 font-mono text-sm">
                        Chưa có dữ liệu nào.
                      </div>
                    ) : (
                      logs.map((log, index) => (
                        <div
                          key={index}
                          className="bg-bg-paper/30 border border-secondary/15 rounded-xl overflow-hidden shadow-sm hover:border-secondary/35 transition-all"
                        >
                          <div className="px-4 py-2 bg-surface border-b border-secondary/15 flex justify-between items-center text-[10px] font-mono">
                            <span className="text-secondary font-bold">
                              ID: {log.id?.substring(0, 8)}...
                            </span>
                            <span className="text-secondary/60 font-semibold">
                              {new Date(log.created_time).toLocaleString()}
                            </span>
                          </div>
                          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <p className="text-[10px] font-mono uppercase tracking-widest text-secondary font-bold">
                                Nội dung gốc
                              </p>
                              <div className="bg-surface p-3 rounded-lg border border-secondary/10 text-xs font-mono text-text/80 line-clamp-3 leading-relaxed">
                                {log.properties?.Prompt?.title?.[0]
                                  ?.plain_text || "N/A"}
                              </div>
                            </div>
                            <div className="space-y-1">
                              <p className="text-[10px] font-mono uppercase tracking-widest text-secondary font-bold">
                                Kết quả phân loại
                              </p>
                              <div className="bg-surface p-3 rounded-lg border border-secondary/10 text-xs font-mono text-text flex items-center flex-wrap gap-2 leading-relaxed">
                                {log.properties?.Category?.select?.name && (
                                  <span
                                    className={`px-2 py-0.5 rounded-lg border text-[9px] uppercase font-bold font-mono ${
                                      log.properties.Category.select.name ===
                                      "error"
                                        ? "bg-danger/10 text-danger border-danger/35"
                                        : "bg-secondary/10 text-secondary border-secondary/35"
                                    }`}
                                  >
                                    {log.properties.Category.select.name}
                                  </span>
                                )}
                                <span className="text-text font-bold font-sans">
                                  {log.properties?.Title?.rich_text?.[0]
                                    ?.plain_text || "Untitled"}
                                </span>
                                {log.properties?.Value?.number !== null && (
                                  <span className="text-success font-bold font-mono">
                                    ({log.properties.Value.number})
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-surface border border-secondary/20 rounded-2xl p-4 shadow-bento flex items-center justify-center text-[10px] tracking-widest text-secondary uppercase font-mono gap-3">
        <span className="flex items-center gap-1.5 font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>{" "}
          My Assisstance
        </span>
        <span className="opacity-40">|</span>
        <span className="font-semibold">v2.1.0</span>
      </footer>
    </div>
  );
}

export default function App() {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("auth_token"),
  );

  const handleLogin = (newToken: string) => {
    localStorage.setItem("auth_token", newToken);
    setToken(newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    setToken(null);
  };

  if (!token) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return <Dashboard onLogout={handleLogout} />;
}
