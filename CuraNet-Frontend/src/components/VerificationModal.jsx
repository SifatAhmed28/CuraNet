import { useState, useEffect } from "react";
import { CheckCircle, ShieldCheck, Mail, Smartphone, ArrowRight, X, Sparkles, RefreshCw } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function VerificationModal({ isOpen, onClose }) {
  const { user, sendVerification, verifyAccount } = useAuth();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [demoCode, setDemoCode] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    if (isOpen) {
      handleSendCode();
    }
  }, [isOpen]);

  useEffect(() => {
    if (countdown > 0 && isOpen) {
      const t = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [countdown, isOpen]);

  const handleSendCode = async () => {
    setError("");
    setSending(true);
    try {
      const res = await sendVerification();
      if (res.demoCode) {
        setDemoCode(res.demoCode);
      }
      setCountdown(60);
    } catch (err) {
      setError(err.message || "Failed to send verification code");
    } finally {
      setSending(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!code) return;
    setError("");
    setLoading(true);
    try {
      await verifyAccount(code);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1800);
    } catch (err) {
      setError(err.message || "Invalid verification code");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden transform transition-all">
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-teal-700 via-teal-600 to-emerald-600 p-6 text-white text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition"
          >
            <X size={20} />
          </button>
          <div className="w-16 h-16 mx-auto mb-3 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-inner">
            <ShieldCheck size={36} className="text-white" />
          </div>
          <h3 className="text-2xl font-extrabold tracking-tight">Verify Your Account</h3>
          <p className="text-teal-100 text-sm mt-1">Unlock verified health records & trusted bookings</p>
        </div>

        {/* Content */}
        <div className="p-6">
          {success ? (
            <div className="py-8 text-center space-y-3">
              <div className="w-16 h-16 mx-auto bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                <CheckCircle size={38} />
              </div>
              <h4 className="text-xl font-bold text-slate-800">Account Verified!</h4>
              <p className="text-slate-500 text-sm">Your CuraNet identity has been verified.</p>
            </div>
          ) : (
            <form onSubmit={handleVerify} className="space-y-4">
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center gap-3">
                <div className="p-2.5 bg-teal-50 text-teal-700 rounded-xl">
                  <Mail size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Sending code to</p>
                  <p className="text-sm font-bold text-slate-800 truncate">{user?.email || "your registered email"}</p>
                </div>
              </div>

              {demoCode && (
                <div className="bg-amber-50 border border-amber-200/70 rounded-xl p-3 flex items-center justify-between text-xs text-amber-900">
                  <div className="flex items-center gap-2">
                    <Sparkles size={16} className="text-amber-600 shrink-0" />
                    <span>Demo OTP Code: <strong className="font-mono text-sm tracking-wider">{demoCode}</strong></span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCode(demoCode)}
                    className="font-bold text-amber-700 hover:text-amber-900 underline ml-2"
                  >
                    Auto-Fill
                  </button>
                </div>
              )}

              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl font-medium">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Enter 6-Digit Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="• • • • • •"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  className="w-full text-center text-2xl font-mono tracking-[0.4em] modern-input py-3 font-bold text-teal-800 placeholder:text-slate-300"
                  autoFocus
                  required
                />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                <span>Didn't receive code?</span>
                <button
                  type="button"
                  disabled={countdown > 0 || sending}
                  onClick={handleSendCode}
                  className="font-semibold text-teal-700 hover:text-teal-900 disabled:text-slate-400 disabled:no-underline flex items-center gap-1"
                >
                  <RefreshCw size={12} className={sending ? "animate-spin" : ""} />
                  {countdown > 0 ? `Resend in ${countdown}s` : "Resend Code"}
                </button>
              </div>

              <button
                type="submit"
                disabled={loading || code.length < 4}
                className="w-full py-3.5 px-4 btn-gradient flex items-center justify-center gap-2 text-white font-bold text-sm rounded-xl shadow-glow disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? "Verifying..." : "Verify & Activate Badge"}
                <ArrowRight size={16} />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
