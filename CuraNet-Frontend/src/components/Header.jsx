import { BookOpen, Droplet, FileText, HeartPulse, Home, LayoutDashboard, LogOut, Menu, ShieldCheck, Stethoscope, X } from "lucide-react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import VerificationModal from "./VerificationModal";

export default function Header() {
  const [open, setOpen] = useState(false);
  const [showVerify, setShowVerify] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const close = () => setOpen(false);

  const handleLogout = () => {
    logout();
    close();
    navigate("/");
  };

  return (
    <>
      <header className="site-header">
        <div className="container nav-wrap">
          <Link to="/" className="brand" onClick={close}>
            <span className="brand-mark"><HeartPulse size={21} /></span>
            <span>Cura<span>Net</span></span>
          </Link>

          <button className="mobile-menu" onClick={() => setOpen(!open)} aria-label="Toggle navigation">
            {open ? <X /> : <Menu />}
          </button>

          <nav className={`main-nav ${open ? "open" : ""}`}>
            <NavLink to="/" end onClick={close}><Home size={17}/> Home</NavLink>
            <NavLink to="/doctors" onClick={close}><Stethoscope size={17}/> Doctors</NavLink>
            <NavLink to="/blood" onClick={close}><Droplet size={17}/> Blood</NavLink>
            <NavLink to="/courses" onClick={close}><BookOpen size={17}/> Courses</NavLink>
            <NavLink to="/first-aid" onClick={close}><HeartPulse size={17}/> First Aid</NavLink>
            <NavLink to="/articles" onClick={close}><FileText size={17}/> Articles</NavLink>
            {user && (
              <NavLink to="/dashboard" onClick={close}><LayoutDashboard size={17}/> Dashboard</NavLink>
            )}
          </nav>

          {user ? (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {user.isVerified ? (
                <span
                  title="Verified CuraNet Account"
                  className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200"
                >
                  <ShieldCheck size={14} className="text-emerald-600" />
                  Verified
                </span>
              ) : (
                <button
                  onClick={() => setShowVerify(true)}
                  className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition cursor-pointer"
                  title="Click to verify your account"
                >
                  Verify Now
                </button>
              )}

              <Link to="/dashboard" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{
                  width: 34,
                  height: 34,
                  borderRadius: "50%",
                  background: "var(--mint)",
                  color: "var(--teal)",
                  display: "grid",
                  placeItems: "center",
                  fontWeight: 800,
                  fontSize: 13,
                }}>
                  {user.name?.charAt(0)?.toUpperCase() || "U"}
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, maxWidth: 100, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {user.name?.split(" ")[0]}
                </span>
              </Link>
              <button
                onClick={handleLogout}
                style={{
                  border: "1px solid var(--line)",
                  background: "transparent",
                  borderRadius: 8,
                  padding: "7px 10px",
                  display: "grid",
                  placeItems: "center",
                  color: "var(--muted)",
                  cursor: "pointer",
                }}
                title="Sign out"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", gap: 8 }}>
              <Link to="/login" className="btn btn-secondary" style={{ padding: "9px 16px", fontSize: 13 }}>
                Sign in
              </Link>
              <Link to="/register" className="header-cta" style={{ fontSize: 13 }}>
                Register
              </Link>
            </div>
          )}
        </div>
      </header>

      <VerificationModal isOpen={showVerify} onClose={() => setShowVerify(false)} />
    </>
  );
}
