import React, { useState } from "react";
import {
  Loader2,
  Sparkles,
  AlertCircle,
  KeyRound,
  User,
  Lock,
  Send,
  CheckCircle,
} from "lucide-react";
import api from "../lib/api.js";

type OtpChannel = "facebook" | "telegram";

interface LoginPageProps {
  onLogin: (token: string) => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  const [otpChannel, setOtpChannel] = useState<OtpChannel | null>(null);
  const [otpSending, setOtpSending] = useState<OtpChannel | null>(null);
  const [otpSent, setOtpSent] = useState(false);
  const [otpSendError, setOtpSendError] = useState("");
  const [otp, setOtp] = useState("");
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [otpError, setOtpError] = useState("");

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) return;
    setLoginLoading(true);
    setLoginError("");
    try {
      const res = await api.post("/api/auth/login", { username, password });
      onLogin(res.data.token);
    } catch (err: any) {
      setLoginError(err.response?.data?.error || "Đăng nhập thất bại");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleSendOtp = async (channel: OtpChannel) => {
    if (!username.trim()) return;
    setOtpSending(channel);
    setOtpSendError("");
    setOtpSent(false);
    setOtp("");
    setOtpError("");
    try {
      await api.post("/api/auth/otp/request", { channel, username });
      setOtpChannel(channel);
      setOtpSent(true);
    } catch (err: any) {
      setOtpSendError(
        err.response?.data?.error || "Gửi OTP thất bại. Vui lòng thử lại.",
      );
    } finally {
      setOtpSending(null);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim() || !otpChannel) return;
    setOtpVerifying(true);
    setOtpError("");
    try {
      const res = await api.post("/api/auth/otp/verify", {
        username,
        otp,
        channel: otpChannel,
      });
      onLogin(res.data.token);
    } catch (err: any) {
      setOtpError(
        err.response?.data?.error || "OTP không đúng hoặc đã hết hạn",
      );
    } finally {
      setOtpVerifying(false);
    }
  };

  const usernameEmpty = !username.trim();

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-paper p-4">
      <div className="w-full max-w-md space-y-5">
        {/* Header card */}
        <div className="bg-surface border border-secondary/20 rounded-2xl p-6 shadow-bento flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-sm">
            <Sparkles className="text-text w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-text">
              My Assisstance
            </h1>
            <p className="text-[10px] font-mono text-secondary uppercase tracking-wider">
              Authentication Portal
            </p>
          </div>
        </div>

        {/* Login form card */}
        <div className="bg-surface border border-secondary/20 rounded-2xl p-6 shadow-bento space-y-5">
          <h2 className="text-sm font-bold font-mono uppercase tracking-[0.15em] text-secondary flex items-center gap-2">
            <KeyRound size={13} />
            Đăng nhập
          </h2>

          <form onSubmit={handlePasswordLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-[0.2em] text-secondary font-bold block font-mono">
                Username
              </label>
              <div className="relative">
                <User
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary/60"
                />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Nhập username"
                  autoComplete="username"
                  className="w-full pl-9 pr-4 py-2.5 bg-bg-paper/40 border border-secondary/20 rounded-xl focus:border-secondary focus:ring-2 focus:ring-secondary/20 outline-none transition-all text-sm font-mono text-text placeholder-text/30"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-[0.2em] text-secondary font-bold block font-mono">
                Password
              </label>
              <div className="relative">
                <Lock
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary/60"
                />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nhập password"
                  autoComplete="current-password"
                  className="w-full pl-9 pr-4 py-2.5 bg-bg-paper/40 border border-secondary/20 rounded-xl focus:border-secondary focus:ring-2 focus:ring-secondary/20 outline-none transition-all text-sm font-mono text-text placeholder-text/30"
                />
              </div>
            </div>

            {loginError && (
              <div className="p-3 bg-danger/10 border border-danger/30 text-danger text-xs rounded-xl flex items-center gap-2 font-mono font-semibold">
                <AlertCircle size={13} />
                {loginError}
              </div>
            )}

            <button
              type="submit"
              disabled={loginLoading || usernameEmpty || !password.trim()}
              className="w-full py-2.5 rounded-xl font-mono text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 border border-secondary/20 shadow-sm bg-primary text-text font-bold hover:bg-[#F8C6AF] focus:ring-2 focus:ring-secondary/20 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loginLoading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Send size={14} />
              )}
              Đăng nhập
            </button>
          </form>
        </div>

        {/* OTP section card */}
        <div className="bg-surface border border-secondary/20 rounded-2xl p-6 shadow-bento space-y-4">
          <div className="flex items-center gap-3 border-b border-secondary/15 pb-4">
            <div className="h-px flex-1 bg-secondary/15" />
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-secondary font-bold whitespace-nowrap">
              Hoặc xác thực qua OTP
            </span>
            <div className="h-px flex-1 bg-secondary/15" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Facebook OTP button */}
            <button
              type="button"
              onClick={() => handleSendOtp("facebook")}
              disabled={usernameEmpty || otpSending !== null}
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-mono text-xs font-bold tracking-wide transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed text-white shadow-sm focus:ring-2 focus:ring-offset-1"
              style={{ backgroundColor: "#1877F2" }}
              aria-label="Gửi OTP qua Facebook"
            >
              {otpSending === "facebook" ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.269h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
                </svg>
              )}
              <span>Gửi OTP qua Facebook</span>
            </button>

            {/* Telegram OTP button */}
            <button
              type="button"
              onClick={() => handleSendOtp("telegram")}
              disabled={usernameEmpty || otpSending !== null}
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-mono text-xs font-bold tracking-wide transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed text-white shadow-sm focus:ring-2 focus:ring-offset-1"
              style={{ backgroundColor: "#229ED9" }}
              aria-label="Gửi OTP qua Telegram"
            >
              {otpSending === "telegram" ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                </svg>
              )}
              <span>Gửi OTP qua Telegram</span>
            </button>
          </div>

          {usernameEmpty && (
            <p className="text-[10px] font-mono text-secondary/60 text-center">
              Nhập username trước để gửi OTP
            </p>
          )}

          {otpSendError && (
            <div className="p-3 bg-danger/10 border border-danger/30 text-danger text-xs rounded-xl flex items-center gap-2 font-mono font-semibold">
              <AlertCircle size={13} />
              {otpSendError}
            </div>
          )}

          {otpSent && (
            <div className="space-y-4">
              <div className="p-3 bg-success/10 border border-success/30 text-success text-xs rounded-xl flex items-center gap-2 font-mono font-semibold">
                <CheckCircle size={13} />
                OTP đã được gửi qua{" "}
                {otpChannel === "facebook" ? "Facebook" : "Telegram"}. Có hiệu
                lực trong 5 phút.
              </div>

              <form onSubmit={handleVerifyOtp} className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-[0.2em] text-secondary font-bold block font-mono">
                    Nhập OTP (6 chữ số)
                  </label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) =>
                      setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    placeholder="000000"
                    maxLength={6}
                    autoFocus
                    inputMode="numeric"
                    className="w-full px-4 py-2.5 bg-bg-paper/40 border border-secondary/20 rounded-xl focus:border-secondary focus:ring-2 focus:ring-secondary/20 outline-none transition-all text-sm font-mono text-text placeholder-text/30 text-center tracking-[0.5em]"
                  />
                </div>

                {otpError && (
                  <div className="p-3 bg-danger/10 border border-danger/30 text-danger text-xs rounded-xl flex items-center gap-2 font-mono font-semibold">
                    <AlertCircle size={13} />
                    {otpError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={otpVerifying || otp.length !== 6}
                  className="w-full py-2.5 rounded-xl font-mono text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 border border-secondary/20 shadow-sm bg-primary text-text font-bold hover:bg-[#F8C6AF] focus:ring-2 focus:ring-secondary/20 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {otpVerifying ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <CheckCircle size={14} />
                  )}
                  Xác nhận OTP
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
