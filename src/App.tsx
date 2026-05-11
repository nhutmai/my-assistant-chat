import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Send, Loader2, Sparkles, AlertCircle, Terminal, ClipboardList } from "lucide-react";

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
      const response = await fetch("/api/logs");
      const data = await response.json();
      if (response.ok) {
        setLogs(data.data || []);
      }
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
      const response = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await response.json();
      if (response.ok) {
        setResult(JSON.stringify(data.data, null, 2));
        fetchLogs(); // Refresh logs after generation
      } else {
        setError(data.message || "Failed to generate content");
      }
    } catch (err) {
      setError("Network error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (!appReady) return null;

  return (
    <div className="min-h-screen flex flex-col bg-[#0c0c0c] text-[#e0e0e0] font-sans overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-4 border-b border-[#2a2a2a] bg-[#111111] shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/10">
            <Sparkles className="text-white w-5 h-5" />
          </div>
          <h1 className="text-xl font-serif italic tracking-wide text-white">
            Gemini Bridge <span className="text-xs font-sans not-italic text-[#666] ml-2 font-medium uppercase tracking-[0.2em]">v2.1.0</span>
          </h1>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex gap-2 items-center">
            <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e]"></span>
            <span className="text-[10px] text-[#888] font-mono tracking-wider uppercase">Engine Status: Ready</span>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="hidden lg:flex w-72 border-r border-[#2a2a2a] bg-[#0e0e0e] flex-col shrink-0">
          <div className="p-6">
            <h2 className="text-[10px] uppercase tracking-[0.2em] text-[#555] font-bold mb-6 italic">Navigation</h2>
            <nav className="space-y-2">
              <button
                onClick={() => setActiveTab("console")}
                className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-all ${activeTab === "console" ? "bg-blue-600/10 text-blue-400 border border-blue-500/30" : "text-[#888] hover:bg-white/5"
                  }`}
              >
                <Terminal size={16} />
                Console
              </button>
              <button
                onClick={() => setActiveTab("logs")}
                className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-all ${activeTab === "logs" ? "bg-purple-600/10 text-purple-400 border border-purple-500/30" : "text-[#888] hover:bg-white/5"
                  }`}
              >
                <ClipboardList size={16} />
                Request Logs
              </button>
            </nav>
          </div>
          <div className="mt-auto p-6 border-t border-[#2a2a2a] bg-[#111]">
            <p className="text-[10px] text-[#555] uppercase tracking-widest mb-3 font-bold">Node Runtime</p>
            <div className="text-[11px] font-mono bg-black/40 p-3 rounded border border-[#222] text-dim leading-relaxed">
              <span className="text-purple-400">NODE_ENV</span>=production<br />
              <span className="text-purple-400">PORT</span>=3000<br />
              <span className="text-purple-400">AUTH</span>=DISABLED
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col bg-[#0c0c0c] overflow-hidden">
          <div className="flex items-center gap-4 px-6 py-2 bg-[#161616] border-b border-[#2a2a2a] shrink-0 text-xs">
            <div className="text-blue-400 flex items-center gap-2">
              <span className="opacity-50">✦</span> Gemini Engine Console
            </div>
            <div className="text-[#555] text-[10px] uppercase tracking-tighter">/api/{activeTab === "console" ? "ai/generate" : "logs"}</div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 md:p-10 flex flex-col items-center">
            <AnimatePresence mode="wait">
              {activeTab === "console" ? (
                <motion.div
                  key="engine-view"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-full max-w-4xl space-y-8"
                >
                  <div className="bg-[#111] border border-[#222] rounded-2xl overflow-hidden shadow-xl">
                    <div className="px-6 py-3 border-b border-[#222] flex items-center justify-between bg-[#161616]">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        <span className="text-[10px] uppercase tracking-widest text-[#888] font-mono">Active Console Session</span>
                      </div>
                      <span className="text-[11px] font-mono text-[#555]">PROMPT_READY</span>
                    </div>

                    <div className="p-8 pb-10">
                      <form onSubmit={handleGenerate} className="space-y-6">
                        <div className="space-y-3">
                          <label className="text-[10px] uppercase tracking-[0.2em] text-[#555] font-bold">Input Buffer</label>
                          <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="Type prompt here..."
                            rows={5}
                            className="w-full p-4 bg-black/40 border border-[#222] rounded-xl focus:border-blue-500/50 outline-none transition-all text-sm font-mono leading-relaxed"
                          />
                        </div>
                        {error && (
                          <div className="p-3 bg-red-950/20 border border-red-900/30 text-red-400 text-xs rounded-lg flex items-center gap-2">
                            <AlertCircle size={14} />
                            {error}
                          </div>
                        )}
                        <div className="flex justify-end">
                          <button
                            type="submit"
                            disabled={loading || !prompt}
                            className={`px-8 py-3 rounded-lg font-mono text-xs uppercase tracking-[0.2em] transition-all flex items-center gap-3 border shadow-lg ${loading || !prompt
                                ? "bg-[#111] border-[#222] text-[#444] shadow-none"
                                : "bg-blue-600/10 border-blue-500/30 text-blue-400 hover:bg-blue-600/20 shadow-blue-500/5"
                              }`}
                          >
                            {loading ? <Loader2 size={16} className="animate-spin text-blue-500" /> : <Send size={16} />}
                            Execute Query
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>

                  {(result || loading) && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-[#0e0e0e] border border-[#222] rounded-2xl overflow-hidden shadow-xl"
                    >
                      <div className="px-6 py-3 border-b border-[#222] flex items-center justify-between bg-[#131313]">
                        <div className="flex items-center gap-3">
                          <Sparkles size={14} className="text-purple-400" />
                          <span className="text-[10px] uppercase tracking-widest text-[#888] font-mono">Inference Output</span>
                        </div>
                        <div className="flex items-center gap-3 text-[10px] font-mono">
                          <span className="text-[#555]">M_STAT: OK</span>
                          <span className="text-[#555]">SYNC_COMPLETE</span>
                        </div>
                      </div>
                      <div className="p-8 bg-black/40 min-h-[120px]">
                        {loading && !result ? (
                          <div className="flex flex-col items-center justify-center p-8 text-dim space-y-4">
                            <Loader2 className="animate-spin text-blue-500" size={24} />
                            <span className="text-[10px] font-mono tracking-widest uppercase animate-pulse">Streaming Response...</span>
                          </div>
                        ) : (
                          <div className="font-mono text-sm text-[#ccc] leading-relaxed whitespace-pre-wrap">
                            {result}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="logs-view"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-full max-w-5xl space-y-6"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-lg font-serif italic text-white">System Logs (Notion DB)</h2>
                    <button
                      onClick={fetchLogs}
                      className="text-[10px] uppercase tracking-widest text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-2"
                    >
                      Refresh Logs
                    </button>
                  </div>

                  <div className="space-y-4">
                    {logs.length === 0 ? (
                      <div className="bg-[#111] border border-[#222] p-12 rounded-2xl text-center text-[#555] font-mono text-sm">
                        No records found in database.
                      </div>
                    ) : (
                      logs.map((log, index) => (
                        <div key={index} className="bg-[#111] border border-[#222] rounded-xl overflow-hidden">
                          <div className="px-4 py-2 bg-[#161616] border-b border-[#222] flex justify-between items-center text-[10px] font-mono">
                            <span className="text-blue-400">ID: {log.id?.substring(0, 8)}...</span>
                            <span className="text-[#555]">{new Date(log.created_time).toLocaleString()}</span>
                          </div>
                          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-[10px] uppercase tracking-widest text-[#444] mb-2 font-bold">Request Prompt</p>
                              <div className="bg-black/30 p-3 rounded border border-[#222] text-xs font-mono text-[#888] line-clamp-3">
                                {log.properties?.Prompt?.title?.[0]?.plain_text || "N/A"}
                              </div>
                            </div>
                            <div>
                              <p className="text-[10px] uppercase tracking-widest text-[#444] mb-2 font-bold">Extracted Data</p>
                              <div className="bg-black/30 p-3 rounded border border-[#222] text-xs font-mono text-[#aaa]">
                                {log.properties?.Category?.select?.name && (
                                  <span className={`inline-block px-2 py-0.5 rounded border text-[9px] mr-2 ${
                                    log.properties.Category.select.name === 'error' 
                                    ? "bg-red-500/10 text-red-400 border-red-500/20" 
                                    : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                                  }`}>
                                    {log.properties.Category.select.name}
                                  </span>
                                )}
                                {log.properties?.Title?.rich_text?.[0]?.plain_text || "Untitled"}
                                {log.properties?.Value?.number !== null && (
                                  <span className="ml-2 text-green-400">
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
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="shrink-0 bg-[#111111] border-t border-[#2a2a2a] px-8 py-3 flex items-center justify-between text-[10px] tracking-widest text-[#444] uppercase font-mono">
        <div className="flex gap-4 items-center">
          <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div> Senior Backend Architect</span>
          <span className="opacity-40">|</span>
          <span>Gemini Engine v2.0.4</span>
        </div>
        <div className="flex gap-6">
          <span className="flex items-center gap-1.5"><span className="text-dim">LATENCY:</span> 42ms</span>
          <span className="flex items-center gap-1.5"><span className="text-dim">MEMORY:</span> 124MB</span>
          <span className="text-blue-500/50">SSL_ENCRYPTED</span>
        </div>
      </footer>
    </div>
  );
}
