import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Send, LogIn, LogOut, Loader2, Sparkles, User, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [appReady, setAppReady] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Check if session exists (simplified)
  useEffect(() => {
    setAppReady(true);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (response.ok) {
        setIsLoggedIn(true);
        setUsername("");
        setPassword("");
      } else {
        setError(data.message || "Login failed");
      }
    } catch (err) {
      setError("Network error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setIsLoggedIn(false);
    setResult("");
    setPrompt("");
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
        setResult(data.data);
      } else {
        setError(data.message || "Failed to generate content");
        if (response.status === 401) setIsLoggedIn(false);
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
          {isLoggedIn && (
            <button 
              onClick={handleLogout}
              className="px-4 py-1.5 rounded bg-[#1a1a1a] border border-[#333] text-[10px] uppercase tracking-widest hover:bg-[#222] text-white transition-colors"
            >
              Terminate Session
            </button>
          )}
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="hidden lg:flex w-72 border-r border-[#2a2a2a] bg-[#0e0e0e] flex-col shrink-0">
          <div className="p-6">
            <h2 className="text-[10px] uppercase tracking-[0.2em] text-[#555] font-bold mb-6 italic">Architecture Stack</h2>
            <ul className="space-y-3 font-mono text-[12px]">
              <li className="text-[#888] flex items-center gap-2"><span className="opacity-40">📁</span> node_modules/</li>
              <li className="text-[#888] flex items-center gap-2"><span className="opacity-40">📁</span> src/</li>
              <li className="text-[#aaa] pl-4 flex items-center gap-2"><span className="opacity-40">📁</span> backend/</li>
              <li className="text-blue-400 pl-8 flex items-center gap-2 italic"><span className="opacity-60 text-xs text-white">↳</span> gemini.service.ts</li>
              <li className="text-[#888] flex items-center gap-2 mt-4"><span className="opacity-40">📄</span> server.ts</li>
              <li className="text-blue-400 flex items-center gap-2"><span className="opacity-40">📄</span> .env</li>
            </ul>
          </div>
          <div className="mt-auto p-6 border-t border-[#2a2a2a] bg-[#111]">
            <p className="text-[10px] text-[#555] uppercase tracking-widest mb-3 font-bold">Node Runtime</p>
            <div className="text-[11px] font-mono bg-black/40 p-3 rounded border border-[#222] text-dim leading-relaxed">
              <span className="text-purple-400">NODE_ENV</span>=production<br/>
              <span className="text-purple-400">PORT</span>=3000<br/>
              <span className="text-purple-400">AUTH</span>=JWT_COOKIE
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col bg-[#0c0c0c] overflow-hidden">
          <div className="flex items-center gap-4 px-6 py-2 bg-[#161616] border-b border-[#2a2a2a] shrink-0 text-xs">
            <div className="text-blue-400 flex items-center gap-2">
              <span className="opacity-50">✦</span> Gemini Engine Console
            </div>
            <div className="text-[#555] text-[10px] uppercase tracking-tighter">/api/ai/generate</div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 md:p-10 flex flex-col items-center">
            <AnimatePresence mode="wait">
              {!isLoggedIn ? (
                <motion.div
                  key="login-view"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="w-full max-w-md bg-[#111] p-8 rounded-2xl border border-[#222] shadow-2xl relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-600"></div>
                  <h2 className="text-lg font-serif italic mb-8 text-center text-white">Authentication Required</h2>
                  
                  <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-[#555] font-bold">Identity</label>
                      <div className="relative group">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-[#444] transition-colors group-focus-within:text-blue-500" size={16} />
                        <input
                          type="text"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          placeholder="admin"
                          className="w-full pl-10 pr-4 py-3 bg-black/40 border border-[#222] rounded-lg focus:border-blue-500/50 outline-none transition-all text-sm font-mono"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-[#555] font-bold">Access Token</label>
                      <div className="relative group">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#444] transition-colors group-focus-within:text-blue-500" size={16} />
                        <input
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full pl-10 pr-12 py-3 bg-black/40 border border-[#222] rounded-lg focus:border-blue-500/50 outline-none transition-all text-sm font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#444] hover:text-blue-500 transition-colors"
                        >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    {error && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="p-3 bg-red-950/20 border border-red-900/30 text-red-400 text-xs rounded-lg flex items-center gap-2"
                      >
                        <AlertCircle size={14} />
                        {error}
                      </motion.div>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-[#1a1a1a] hover:bg-[#222] border border-[#333] text-white py-3 rounded-lg font-mono text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
                    >
                      {loading ? <Loader2 size={16} className="animate-spin" /> : <LogIn size={16} />}
                      Establishing Uplink
                    </button>
                    <p className="text-center text-[10px] text-[#444] font-mono">CREDENTIALS_RETAINED: NO</p>
                  </form>
                </motion.div>
              ) : (
                <motion.div
                  key="engine-view"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
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
                        <div className="flex justify-end">
                          <button
                            type="submit"
                            disabled={loading || !prompt}
                            className={`px-8 py-3 rounded-lg font-mono text-xs uppercase tracking-[0.2em] transition-all flex items-center gap-3 border shadow-lg ${
                              loading || !prompt 
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
