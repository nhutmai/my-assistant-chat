import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Send, Loader2, Sparkles, AlertCircle, Terminal, ClipboardList, RefreshCw, Cpu, Activity, Info } from "lucide-react";
import api from "./lib/api.js"; // Import centralized Axios client

export default function App() {
  const [activeTab, setActiveTab] = useState<"console" | "logs">("console");
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [appReady, setAppReady] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);

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
      fetchLogs(); // Refresh logs after generation
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
              Gemini Bridge
            </h1>
            <p className="text-[10px] font-mono text-secondary uppercase tracking-wider">Middleware Integration Engine</p>
          </div>
        </div>
        <div className="flex items-center gap-4 flex-wrap">
          <span className="text-[10px] font-mono text-text bg-primary/30 border border-primary/40 px-3 py-1 rounded-xl font-bold">
            v2.1.0
          </span>
          <div className="flex gap-2 items-center px-3 py-1 rounded-xl bg-surface border border-secondary/30 font-mono text-[10px] uppercase text-text shadow-sm font-semibold">
            <span className="w-2 h-2 rounded-full bg-success"></span>
            <span>Engine Status: Ready</span>
          </div>
        </div>
      </header>

      {/* Main Grid Wrapper */}
      <div className="flex-1 grid grid-cols-12 gap-6 md:gap-8 items-start overflow-y-auto pr-1">
        {/* Navigation & System Info Card (col-span-12 or col-span-4 on lg) */}
        <aside className="col-span-12 lg:col-span-4 flex flex-col gap-6 md:gap-8 h-full">
          {/* Bento Navigation Block */}
          <div className="bg-surface border border-secondary/20 rounded-2xl p-6 shadow-bento space-y-4">
            <h2 className="text-[10px] uppercase tracking-[0.2em] text-secondary font-bold font-mono flex items-center gap-1.5">
              <Cpu size={12} />
              Engine Control
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
                Console Panel
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
                Request Logs
              </button>
            </nav>
          </div>

          {/* System Runtime block */}
          <div className="bg-surface border border-secondary/20 rounded-2xl p-6 shadow-bento space-y-3 flex-1">
            <h2 className="text-[10px] uppercase tracking-[0.2em] text-secondary font-bold font-mono flex items-center gap-1.5">
              <Info size={12} />
              Node Runtime Env
            </h2>
            <div className="text-[11px] font-mono bg-bg-paper/40 p-4 rounded-xl border border-secondary/20 text-text leading-relaxed space-y-2">
              <div>
                <span className="text-secondary font-bold">NODE_ENV</span>
                <span className="text-text/75 ml-2 font-semibold">= production</span>
              </div>
              <div>
                <span className="text-secondary font-bold">PORT</span>
                <span className="text-text/75 ml-2 font-semibold">= 3000</span>
              </div>
              <div>
                <span className="text-secondary font-bold">AUTH</span>
                <span className="text-text/75 ml-2 font-semibold">= DISABLED</span>
              </div>
            </div>
            <div className="text-[10px] text-secondary font-semibold font-mono flex items-center gap-1.5 pt-2">
              <Activity size={10} className="text-success" />
              <span>PID: 14208 | Uptime: 72h</span>
            </div>
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
                {/* Input Buffer Card */}
                <div className="bg-surface border border-secondary/20 rounded-2xl p-6 shadow-bento space-y-4">
                  <div className="flex justify-between items-center border-b border-secondary/15 pb-3">
                    <div className="flex items-center gap-3">
                      <span className="w-2.5 h-2.5 rounded-full bg-success"></span>
                      <span className="text-[10px] uppercase tracking-widest text-secondary font-mono font-bold">Active Inference Shell</span>
                    </div>
                    <span className="text-[10px] font-mono text-secondary bg-primary/20 px-2 py-0.5 rounded-lg border border-primary/20 font-semibold">PROMPT_READY</span>
                  </div>

                  <form onSubmit={handleGenerate} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-[0.2em] text-secondary font-bold block font-mono">Input Query</label>
                      <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Type standard payload prompt or query message..."
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
                        {loading ? <Loader2 size={16} className="animate-spin text-text" /> : <Send size={16} />}
                        Execute Query
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
                    <div className="flex justify-between items-center border-b border-secondary/15 pb-3">
                      <div className="flex items-center gap-3">
                        <Sparkles size={14} className="text-secondary" />
                        <span className="text-[10px] uppercase tracking-widest text-secondary font-mono font-bold">Inference Output</span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] font-mono text-secondary">
                        <span className="bg-bg-paper px-2 py-0.5 rounded-lg border border-secondary/15 font-semibold">M_STAT: OK</span>
                        <span className="bg-bg-paper px-2 py-0.5 rounded-lg border border-secondary/15 font-semibold">SYNC_COMPLETE</span>
                      </div>
                    </div>
                    <div className="min-h-[120px]">
                      {loading && !result ? (
                        <div className="flex flex-col items-center justify-center py-8 text-secondary space-y-3">
                          <Loader2 className="animate-spin text-secondary" size={24} />
                          <span className="text-[10px] font-mono tracking-widest uppercase animate-pulse text-secondary font-bold">Streaming Response...</span>
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
                key="logs-tab"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col gap-6 w-full"
              >
                {/* Logs Shell Container */}
                <div className="bg-surface border border-secondary/20 rounded-2xl p-6 shadow-bento space-y-6">
                  <div className="flex items-center justify-between border-b border-secondary/15 pb-3">
                    <h2 className="text-lg font-bold font-sans text-text tracking-tight uppercase">System Logs (Notion DB)</h2>
                    <button
                      onClick={fetchLogs}
                      className="text-[10px] uppercase font-mono tracking-widest text-text hover:bg-primary/20 transition-all flex items-center gap-2 border border-secondary/20 px-3 py-2 rounded-xl bg-surface shadow-sm active:scale-95 focus-visible:ring-2 focus-visible:ring-secondary/50 font-bold"
                    >
                      <RefreshCw size={12} />
                      Refresh DB
                    </button>
                  </div>

                  <div className="space-y-4">
                    {logs.length === 0 ? (
                      <div className="bg-bg-paper/40 border border-secondary/25 p-8 rounded-xl text-center text-secondary/60 font-mono text-sm">
                        No records found in Notion database.
                      </div>
                    ) : (
                      logs.map((log, index) => (
                        <div key={index} className="bg-bg-paper/30 border border-secondary/15 rounded-xl overflow-hidden shadow-sm hover:border-secondary/35 transition-all">
                          <div className="px-4 py-2 bg-surface border-b border-secondary/15 flex justify-between items-center text-[10px] font-mono">
                            <span className="text-secondary font-bold">ID: {log.id?.substring(0, 8)}...</span>
                            <span className="text-secondary/60 font-semibold">{new Date(log.created_time).toLocaleString()}</span>
                          </div>
                          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <p className="text-[10px] font-mono uppercase tracking-widest text-secondary font-bold">Request Prompt</p>
                              <div className="bg-surface p-3 rounded-lg border border-secondary/10 text-xs font-mono text-text/80 line-clamp-3 leading-relaxed">
                                {log.properties?.Prompt?.title?.[0]?.plain_text || "N/A"}
                              </div>
                            </div>
                            <div className="space-y-1">
                              <p className="text-[10px] font-mono uppercase tracking-widest text-secondary font-bold">Extracted Data</p>
                              <div className="bg-surface p-3 rounded-lg border border-secondary/10 text-xs font-mono text-text flex items-center flex-wrap gap-2 leading-relaxed">
                                {log.properties?.Category?.select?.name && (
                                  <span className={`px-2 py-0.5 rounded-lg border text-[9px] uppercase font-bold font-mono ${
                                    log.properties.Category.select.name === 'error' 
                                      ? "bg-danger/10 text-danger border-danger/35" 
                                      : "bg-secondary/10 text-secondary border-secondary/35"
                                  }`}>
                                    {log.properties.Category.select.name}
                                  </span>
                                )}
                                <span className="text-text font-bold font-sans">
                                  {log.properties?.Title?.rich_text?.[0]?.plain_text || "Untitled"}
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
      <footer className="bg-surface border border-secondary/20 rounded-2xl p-4 shadow-bento flex flex-col sm:flex-row items-center justify-between text-[10px] tracking-widest text-secondary uppercase font-mono gap-2">
        <div className="flex gap-4 items-center flex-wrap justify-center">
          <span className="flex items-center gap-1.5 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span> Senior Backend Architect
          </span>
          <span className="opacity-40">|</span>
          <span className="font-semibold">Gemini Engine v2.0.4</span>
        </div>
        <div className="flex gap-6 flex-wrap justify-center font-bold">
          <span className="flex items-center gap-1.5">
            <span className="text-secondary/60">LATENCY:</span> 42ms
          </span>
          <span className="flex items-center gap-1.5">
            <span className="text-secondary/60">MEMORY:</span> 124MB
          </span>
          <span className="text-text bg-primary/20 px-2 py-0.5 rounded-lg border border-primary/25 text-[9px]">SSL_ENCRYPTED</span>
        </div>
      </footer>
    </div>
  );
}
