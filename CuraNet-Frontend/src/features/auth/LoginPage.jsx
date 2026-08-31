import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogIn, Eye, EyeOff, HeartPulse, Mail, Lock, Sparkles, ShieldCheck } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { getRecaptchaToken } from "../../utils/recaptcha";

export default function LoginPage() {
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      // 1. Generate Google reCAPTCHA Enterprise token
      const recaptchaToken = await getRecaptchaToken("LOGIN");

      // 2. Submit login with recaptchaToken
      await login(email, password, recaptchaToken);
      navigate("/");
    } catch (err) {
      setError(err.message || "Invalid credentials. Please check your email and password.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
      navigate("/");
    } catch (err) {
      setError(err.message || "Google authentication was cancelled or failed");
    } finally {
      setGoogleLoading(false);
    }
  };

  const fillDemo = (demoEmail, demoPw) => {
    setEmail(demoEmail);
    setPassword(demoPw);
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-container">
        {/* Header */}
        <div className="auth-header">
          <div className="pill" style={{ display: "inline-flex", marginBottom: 12 }}>
            <HeartPulse size={15} style={{ color: "var(--teal)" }} />
            <span>CuraNet Health Identity</span>
          </div>
          <h1>Welcome back</h1>
          <p>Sign in to manage consultations, blood alerts &amp; health records</p>
        </div>

        {/* Card */}
        <div className="modern-card" style={{ padding: "32px 28px" }}>
          {error && (
            <div
              style={{
                marginBottom: 20,
                padding: "12px 16px",
                background: "#fef2f2",
                border: "1px solid #fecaca",
                color: "#991b1b",
                fontSize: 13,
                fontWeight: 600,
                borderRadius: 12,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#ef4444", shrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {/* Google Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={googleLoading || loading}
            className="google-btn"
          >
            <svg
              className="google-icon"
              viewBox="0 0 24 24"
              style={{ width: 20, height: 20, flexShrink: 0 }}
            >
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.04 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span>{googleLoading ? "Connecting to Firebase..." : "Sign in with Google"}</span>
          </button>

          <div className="auth-divider">
            <span>or with email</span>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="auth-field">
              <label>Email address</label>
              <div className="auth-input-wrapper">
                <Mail size={18} className="input-icon-left" />
                <input
                  type="email"
                  className="modern-input"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>
            </div>

            <div className="auth-field">
              <label>Password</label>
              <div className="auth-input-wrapper">
                <Lock size={18} className="input-icon-left" />
                <input
                  type={showPw ? "text" : "password"}
                  className="modern-input"
                  style={{ paddingRight: 40 }}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="input-icon-right"
                  aria-label={showPw ? "Hide password" : "Show password"}
                >
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || googleLoading}
              className="btn-gradient"
              style={{
                width: "100%",
                padding: "14px 20px",
                fontSize: 14,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                marginTop: 8,
                opacity: loading ? 0.6 : 1,
              }}
            >
              <LogIn size={18} />
              <span>{loading ? "Verifying & Signing in..." : "Sign in to CuraNet"}</span>
            </button>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 5, marginTop: 12, fontSize: 11, color: "#94a3b8" }}>
              <ShieldCheck size={13} style={{ color: "#0f766e" }} />
              <span>Protected by Google reCAPTCHA Enterprise</span>
            </div>
          </form>

          {/* Prompt */}
          <p style={{ textAlign: "center", fontSize: 13, color: "#64748b", marginTop: 22, marginBottom: 0 }}>
            Don't have an account?{" "}
            <Link to="/register" style={{ color: "var(--teal)", fontWeight: 800 }}>
              Create an account
            </Link>
          </p>

          {/* Demo Quick Accounts */}
          <div style={{ marginTop: 24, paddingTop: 20, borderTop: "1px solid #f1f5f9" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 700, color: "#64748b", marginBottom: 10 }}>
              <Sparkles size={14} style={{ color: "var(--teal)" }} />
              <span>One-Click Demo Accounts:</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <button
                type="button"
                onClick={() => fillDemo("karim.ahmed@example.com", "CuraNet@123")}
                style={{
                  padding: "8px 12px",
                  background: "#f0fdf9",
                  border: "1px solid #ccfbf1",
                  borderRadius: 12,
                  textAlign: "left",
                  cursor: "pointer",
                }}
              >
                <div style={{ fontWeight: 800, fontSize: 12, color: "#0f766e" }}>👤 Patient</div>
                <div style={{ fontSize: 10, color: "#0d9488", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  karim.ahmed
                </div>
              </button>

              <button
                type="button"
                onClick={() => fillDemo("ayesha.rahman@curanet.health", "CuraNet@123")}
                style={{
                  padding: "8px 12px",
                  background: "#f0fdf9",
                  border: "1px solid #ccfbf1",
                  borderRadius: 12,
                  textAlign: "left",
                  cursor: "pointer",
                }}
              >
                <div style={{ fontWeight: 800, fontSize: 12, color: "#0f766e" }}>🩺 Doctor</div>
                <div style={{ fontSize: 10, color: "#0d9488", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  ayesha.rahman
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
