import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserPlus, Eye, EyeOff, HeartPulse, User, Mail, Lock, Phone, Stethoscope, Droplet, ShieldCheck } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { getRecaptchaToken } from "../../utils/recaptcha";

const ROLES = [
  { value: "patient", label: "Patient", desc: "Consultations & records", icon: User },
  { value: "doctor", label: "Doctor", desc: "Manage appointments", icon: Stethoscope },
  { value: "donor", label: "Donor", desc: "Donate blood & organs", icon: Droplet },
];

export default function RegisterPage() {
  const { register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "", role: "patient" });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      // 1. Generate Google reCAPTCHA Enterprise token
      const recaptchaToken = await getRecaptchaToken("REGISTER");

      // 2. Register user with recaptchaToken
      await register({ ...form, recaptchaToken });
      navigate("/");
    } catch (err) {
      setError(err.message || "Registration failed. Please check all fields.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setError("");
    setGoogleLoading(true);
    try {
      await loginWithGoogle(form.role);
      navigate("/");
    } catch (err) {
      setError(err.message || "Google sign-up was cancelled or failed");
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-container" style={{ maxWidth: 520 }}>
        {/* Header */}
        <div className="auth-header">
          <div className="pill" style={{ display: "inline-flex", marginBottom: 12 }}>
            <HeartPulse size={15} style={{ color: "var(--teal)" }} />
            <span>Join CuraNet Network</span>
          </div>
          <h1>Create your account</h1>
          <p>One unified account for consultations, blood requests &amp; literacy</p>
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

          {/* Google Sign-Up Button */}
          <button
            type="button"
            onClick={handleGoogleSignUp}
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
            <span>{googleLoading ? "Connecting with Google..." : "Fast Sign Up with Google"}</span>
          </button>

          <div className="auth-divider">
            <span>or enter your details</span>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="auth-field">
              <label>Full Name</label>
              <div className="auth-input-wrapper">
                <User size={18} className="input-icon-left" />
                <input
                  type="text"
                  style={{ paddingLeft: "46px" }}
                  className="modern-input"
                  placeholder="Dr. / Mr. / Ms. Full Name"
                  value={form.name}
                  onChange={set("name")}
                  required
                  autoFocus
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div className="auth-field">
                <label>Email</label>
                <div className="auth-input-wrapper">
                  <Mail size={18} className="input-icon-left" />
                  <input
                    type="email"
                    style={{ paddingLeft: "46px" }}
                    className="modern-input"
                    placeholder="you@email.com"
                    value={form.email}
                    onChange={set("email")}
                    required
                  />
                </div>
              </div>

              <div className="auth-field">
                <label>Phone (optional)</label>
                <div className="auth-input-wrapper">
                  <Phone size={18} className="input-icon-left" />
                  <input
                    type="tel"
                    style={{ paddingLeft: "46px" }}
                    className="modern-input"
                    placeholder="+8801700000000"
                    value={form.phone}
                    onChange={set("phone")}
                  />
                </div>
              </div>
            </div>

            <div className="auth-field">
              <label>Create Password</label>
              <div className="auth-input-wrapper">
                <Lock size={18} className="input-icon-left" />
                <input
                  type={showPw ? "text" : "password"}
                  className="modern-input"
                  style={{ paddingLeft: "46px", paddingRight: "44px" }}
                  placeholder="Min 6 characters"
                  value={form.password}
                  onChange={set("password")}
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

            {/* Role selection */}
            <div className="auth-field" style={{ marginTop: 18 }}>
              <label>Select Your Role</label>
              <div className="auth-role-grid">
                {ROLES.map((r) => {
                  const selected = form.role === r.value;
                  const Icon = r.icon;
                  return (
                    <div
                      key={r.value}
                      onClick={() => setForm({ ...form, role: r.value })}
                      className={`auth-role-card ${selected ? "active" : ""}`}
                    >
                      <div className="role-icon">
                        <Icon size={18} />
                      </div>
                      <div className="role-title">{r.label}</div>
                      <div className="role-desc">{r.desc}</div>
                    </div>
                  );
                })}
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
                marginTop: 22,
                opacity: loading ? 0.6 : 1,
              }}
            >
              <UserPlus size={18} />
              <span>{loading ? "Verifying & Creating..." : "Complete Registration"}</span>
            </button>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 5, marginTop: 12, fontSize: 11, color: "#94a3b8" }}>
              <ShieldCheck size={13} style={{ color: "#0f766e" }} />
              <span>Protected by Google reCAPTCHA Enterprise</span>
            </div>
          </form>

          {/* Sign in prompt */}
          <p style={{ textAlign: "center", fontSize: 13, color: "#64748b", marginTop: 22, marginBottom: 0 }}>
            Already have an account?{" "}
            <Link to="/login" style={{ color: "var(--teal)", fontWeight: 800 }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
