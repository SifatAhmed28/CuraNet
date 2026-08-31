import { BookOpen, HeartPulse, Home, Menu, X } from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import { useState } from "react";

export default function Header() {
  const [open, setOpen] = useState(false);

  const close = () => setOpen(false);

  return (
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
          <NavLink to="/courses" onClick={close}><BookOpen size={17}/> Courses</NavLink>
          <NavLink to="/first-aid" onClick={close}><HeartPulse size={17}/> First Aid & Remedies</NavLink>
        </nav>

        <button className="header-cta" onClick={() => alert("Login will connect to the shared CuraNet authentication module.")}>
          Sign in
        </button>
      </div>
    </header>
  );
}
