import React, { useState, useMemo } from "react";
import {
  Activity, Stethoscope, Droplet, BookOpen, User, Menu, X,
  Star, MapPin, CheckCircle2, ChevronRight,
  Clock, ArrowRight, LogOut, Heart,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* Design tokens — see inline <style> for the full system              */
/* ------------------------------------------------------------------ */

const FONTS = (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,500&family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');

    .cn-root{
      --ink:#12211C; --ink-soft:#4B5A55;
      --teal-900:#0E3B2E; --teal-800:#12503F;
      --green-600:#1E9E6B; --green-500:#2BB57D; --green-100:#DCEEE4;
      --paper:#F6F7F3; --sand:#ECEAE1; --line:#DCE1DA;
      --coral:#E1502B; --coral-100:#FBE3DA;
      --gold:#B98A22;
      --display: 'Fraunces', serif;
      --body: 'Inter', sans-serif;
      --mono: 'JetBrains Mono', monospace;
      background:var(--paper); color:var(--ink); font-family:var(--body);
    }
    .cn-display{ font-family:var(--display); }
    .cn-mono{ font-family:var(--mono); letter-spacing:.02em; }

    .cn-btn{ font-family:var(--body); font-weight:600; border-radius:3px; transition:transform .15s ease, background .15s ease, box-shadow .15s ease; }
    .cn-btn:active{ transform:translateY(1px); }
    .cn-btn-primary{ background:var(--teal-900); color:#fff; }
    .cn-btn-primary:hover{ background:var(--green-600); }
    .cn-btn-outline{ background:transparent; color:var(--teal-900); border:1.5px solid var(--teal-900); }
    .cn-btn-outline:hover{ background:var(--teal-900); color:#fff; }
    .cn-btn-coral{ background:var(--coral); color:#fff; }
    .cn-btn-coral:hover{ filter:brightness(1.08); }

    .cn-card{ background:#fff; border:1px solid var(--line); border-radius:4px; }
    .cn-pill{ border-radius:999px; font-size:.72rem; font-weight:600; letter-spacing:.03em; }
    .cn-eyebrow{ font-family:var(--mono); font-size:.68rem; letter-spacing:.14em; text-transform:uppercase; color:var(--green-600); }

    .cn-link{ position:relative; color:var(--ink-soft); font-weight:500; }
    .cn-link:hover{ color:var(--teal-900); }
    .cn-link.active{ color:var(--teal-900); font-weight:700; }

    .cn-pulse-path{ stroke-dasharray: 6 5; animation: cn-dash 2.4s linear infinite; }
    @keyframes cn-dash{ to{ stroke-dashoffset:-220; } }
    @media (prefers-reduced-motion: reduce){ .cn-pulse-path{ animation:none; } }

    .cn-scrollbar::-webkit-scrollbar{ width:6px; }
    .cn-scrollbar::-webkit-scrollbar-thumb{ background:var(--line); border-radius:3px; }

    .cn-input{
      width:100%; border:1.5px solid var(--line); border-radius:3px; padding:.65rem .8rem;
      font-family:var(--body); font-size:.9rem; background:#fff; outline:none;
      transition:border-color .15s ease;
    }
    .cn-input:focus{ border-color:var(--green-600); }
    .cn-input:focus-visible, .cn-btn:focus-visible, .cn-link:focus-visible{
      outline:2px solid var(--green-600); outline-offset:2px;
    }
  `}</style>
);

/* ------------------------------------------------------------------ */
/* Mock data                                                           */
/* ------------------------------------------------------------------ */

/* Every specialty a general hospital would route patients to, each
   with its own symptom keyword set so matching always resolves somewhere. */
const SPECIALTIES = [
  { id: "cardio", name: "Cardiology", keywords: ["chest pain", "shortness of breath", "palpitation", "heart", "breath", "high blood pressure"] },
  { id: "derma", name: "Dermatology", keywords: ["rash", "acne", "skin", "itching", "itchy", "eczema", "hives"] },
  { id: "neuro", name: "Neurology", keywords: ["headache", "migraine", "dizziness", "numbness", "dizzy", "seizure", "tremor"] },
  { id: "gastro", name: "Gastroenterology", keywords: ["stomach", "nausea", "vomiting", "diarrhea", "abdominal", "acidity", "constipation"] },
  { id: "ortho", name: "Orthopedics", keywords: ["joint pain", "fracture", "back pain", "knee", "bone", "sprain", "arthritis"] },
  { id: "pediatric", name: "Pediatrics", keywords: ["child fever", "kids", "child cough", "baby", "infant", "growth"] },
  { id: "general", name: "General Medicine", keywords: ["fever", "cold", "fatigue", "weakness", "flu", "cough", "body ache"] },
  { id: "gyno", name: "Gynecology", keywords: ["pregnancy", "period", "menstrual", "pcos", "pelvic pain"] },
  { id: "ent", name: "ENT (Otolaryngology)", keywords: ["ear pain", "sore throat", "sinus", "hearing loss", "nose bleed", "tonsil"] },
  { id: "psych", name: "Psychiatry", keywords: ["anxiety", "depression", "insomnia", "stress", "panic", "mood"] },
  { id: "pulmo", name: "Pulmonology", keywords: ["asthma", "wheezing", "chronic cough", "chest congestion", "breathing difficulty"] },
  { id: "endo", name: "Endocrinology", keywords: ["diabetes", "thyroid", "hormonal", "weight gain", "weight loss", "blood sugar"] },
  { id: "uro", name: "Urology", keywords: ["urinary", "kidney stone", "urination pain", "bladder", "prostate"] },
  { id: "eye", name: "Ophthalmology", keywords: ["blurry vision", "eye pain", "red eye", "vision loss", "eye strain"] },
  { id: "dental", name: "Dentistry", keywords: ["tooth pain", "cavity", "gum bleeding", "toothache", "wisdom tooth"] },
  { id: "onco", name: "Oncology", keywords: ["lump", "unexplained weight loss", "tumor", "cancer screening"] },
  { id: "nephro", name: "Nephrology", keywords: ["kidney", "swelling", "creatinine", "dialysis"] },
  { id: "rheum", name: "Rheumatology", keywords: ["joint stiffness", "autoimmune", "lupus", "gout"] },
];

const DOCTORS = [
  { id: 1, name: "Dr. Farhana Rahman", specialty: "Cardiology", rating: 4.8, fee: 900, location: "Dhanmondi, Dhaka", color: "#1E9E6B" },
  { id: 2, name: "Dr. Kamrul Hasan", specialty: "Cardiology", rating: 4.6, fee: 700, location: "Uttara, Dhaka", color: "#0E3B2E" },
  { id: 3, name: "Dr. Nusrat Jahan", specialty: "Dermatology", rating: 4.9, fee: 600, location: "Gulshan, Dhaka", color: "#E1502B" },
  { id: 4, name: "Dr. Imtiaz Alam", specialty: "Neurology", rating: 4.7, fee: 1000, location: "Banani, Dhaka", color: "#B98A22" },
  { id: 5, name: "Dr. Shirin Akter", specialty: "Gastroenterology", rating: 4.5, fee: 650, location: "Mirpur, Dhaka", color: "#12503F" },
  { id: 6, name: "Dr. Rafiqul Islam", specialty: "Orthopedics", rating: 4.6, fee: 800, location: "Mohammadpur, Dhaka", color: "#1E9E6B" },
  { id: 7, name: "Dr. Tasnim Chowdhury", specialty: "Pediatrics", rating: 4.9, fee: 500, location: "Bashundhara, Dhaka", color: "#E1502B" },
  { id: 8, name: "Dr. Mahbub Karim", specialty: "General Medicine", rating: 4.4, fee: 400, location: "Dhanmondi, Dhaka", color: "#0E3B2E" },
  { id: 9, name: "Dr. Salma Begum", specialty: "Gynecology", rating: 4.8, fee: 750, location: "Gulshan, Dhaka", color: "#B98A22" },
  { id: 10, name: "Dr. Zahid Hossain", specialty: "ENT (Otolaryngology)", rating: 4.5, fee: 600, location: "Uttara, Dhaka", color: "#1E9E6B" },
  { id: 11, name: "Dr. Ruksana Parvin", specialty: "Psychiatry", rating: 4.7, fee: 900, location: "Banani, Dhaka", color: "#E1502B" },
  { id: 12, name: "Dr. Anwar Kabir", specialty: "Pulmonology", rating: 4.6, fee: 700, location: "Mirpur, Dhaka", color: "#0E3B2E" },
  { id: 13, name: "Dr. Sabrina Yasmin", specialty: "Endocrinology", rating: 4.7, fee: 800, location: "Dhanmondi, Dhaka", color: "#12503F" },
  { id: 14, name: "Dr. Jashim Uddin", specialty: "Urology", rating: 4.5, fee: 750, location: "Mohammadpur, Dhaka", color: "#B98A22" },
  { id: 15, name: "Dr. Farida Yeasmin", specialty: "Ophthalmology", rating: 4.8, fee: 550, location: "Bashundhara, Dhaka", color: "#1E9E6B" },
  { id: 16, name: "Dr. Nayeem Chowdhury", specialty: "Dentistry", rating: 4.6, fee: 500, location: "Uttara, Dhaka", color: "#E1502B" },
  { id: 17, name: "Dr. Selina Haque", specialty: "Oncology", rating: 4.9, fee: 1200, location: "Gulshan, Dhaka", color: "#0E3B2E" },
  { id: 18, name: "Dr. Moinul Islam", specialty: "Nephrology", rating: 4.6, fee: 850, location: "Dhanmondi, Dhaka", color: "#12503F" },
  { id: 19, name: "Dr. Tania Ferdous", specialty: "Rheumatology", rating: 4.5, fee: 700, location: "Banani, Dhaka", color: "#B98A22" },
];

/* At least one donor for every one of the eight blood types so a
   request of any type always finds a compatible match. */
const DONORS = [
  { id: 1, name: "Rakib Hossain", bloodType: "O+", location: "Dhanmondi", lastDonation: "2026-04-12" },
  { id: 2, name: "Anika Tabassum", bloodType: "O-", location: "Uttara", lastDonation: "2026-02-03" },
  { id: 3, name: "Shakil Ahmed", bloodType: "A+", location: "Mirpur", lastDonation: "2026-05-20" },
  { id: 4, name: "Farzana Yeasmin", bloodType: "B+", location: "Gulshan", lastDonation: "2026-03-15" },
  { id: 5, name: "Tanvir Hasan", bloodType: "AB+", location: "Banani", lastDonation: "2026-01-28" },
  { id: 6, name: "Mim Akter", bloodType: "O-", location: "Bashundhara", lastDonation: "2026-06-01" },
  { id: 7, name: "Sadia Islam", bloodType: "A-", location: "Dhanmondi", lastDonation: "2026-04-30" },
  { id: 8, name: "Rezaul Karim", bloodType: "B-", location: "Mohammadpur", lastDonation: "2026-02-19" },
  { id: 9, name: "Nabila Hossain", bloodType: "AB-", location: "Uttara", lastDonation: "2026-05-05" },
  { id: 10, name: "Imran Kabir", bloodType: "O+", location: "Mirpur", lastDonation: "2026-03-22" },
  { id: 11, name: "Sultana Razia", bloodType: "A+", location: "Gulshan", lastDonation: "2026-06-10" },
  { id: 12, name: "Habibur Rahman", bloodType: "B+", location: "Banani", lastDonation: "2026-01-15" },
];

const COURSES = [
  { id: 1, title: "Reading Your Prescription", category: "Prescriptions", free: true, price: 0 },
  { id: 2, title: "Choosing the Right Specialist", category: "Choosing Doctors", free: true, price: 0 },
  { id: 3, title: "Understanding Blood Test Reports", category: "Prescriptions", free: false, price: 250 },
  { id: 4, title: "First Aid for Home Emergencies", category: "Choosing Doctors", free: false, price: 300 },
  { id: 5, title: "Medicine Storage & Expiry Basics", category: "Prescriptions", free: true, price: 0 },
  { id: 6, title: "Talking to Your Doctor Effectively", category: "Choosing Doctors", free: false, price: 200 },
];

const NAV_ITEMS = [
  { id: "doctors", label: "Doctors", icon: Stethoscope },
  { id: "blood", label: "Blood", icon: Droplet },
  { id: "courses", label: "Learn", icon: BookOpen },
];

/* ------------------------------------------------------------------ */
/* Small shared pieces                                                 */
/* ------------------------------------------------------------------ */

function PulseMark({ size = 22, color = "var(--green-600)" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <path d="M2 20h7l3-9 5 18 4-13 3 9h6l3-5 3 5h2" stroke={color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Toast({ message, onClose }) {
  if (!message) return null;
  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 cn-card px-4 py-3 shadow-lg" style={{ borderColor: "var(--green-600)" }}>
      <CheckCircle2 size={18} color="var(--green-600)" />
      <span className="text-sm">{message}</span>
      <button onClick={onClose} className="ml-2 opacity-50 hover:opacity-100"><X size={14} /></button>
    </div>
  );
}

function StarRating({ value }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs cn-mono">
      <Star size={12} fill="var(--gold)" color="var(--gold)" />
      {value.toFixed(1)}
    </span>
  );
}

function SectionEyebrow({ children }) {
  return <div className="cn-eyebrow mb-2">{children}</div>;
}

/* ------------------------------------------------------------------ */
/* Nav + Footer                                                        */
/* ------------------------------------------------------------------ */

function NavBar({ view, setView, user, setUser }) {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 bg-white border-b" style={{ borderColor: "var(--line)" }}>
      <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
        <button onClick={() => { setView("home"); setOpen(false); }} className="flex items-center gap-2">
          <PulseMark />
          <span className="cn-display text-xl" style={{ color: "var(--teal-900)" }}>CuraNet</span>
        </button>

        <nav className="hidden md:flex items-center gap-7">
          {NAV_ITEMS.map((n) => (
            <button key={n.id} onClick={() => setView(n.id)} className={`cn-link text-sm ${view === n.id ? "active" : ""}`}>
              {n.label}
            </button>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <button onClick={() => setView("dashboard")} className="cn-link text-sm flex items-center gap-1">
                <User size={15} /> {user.name.split(" ")[0]}
              </button>
              <button onClick={() => { setUser(null); setView("home"); }} className="p-2 hover:opacity-70" title="Log out">
                <LogOut size={17} />
              </button>
            </>
          ) : (
            <>
              <button onClick={() => setView("auth")} className="cn-btn px-4 py-2 text-sm cn-btn-outline">Login</button>
              <button onClick={() => setView("auth")} className="cn-btn px-4 py-2 text-sm cn-btn-primary">Sign Up</button>
            </>
          )}
        </div>

        <button className="md:hidden p-2" onClick={() => setOpen(!open)}>{open ? <X size={22} /> : <Menu size={22} />}</button>
      </div>

      {open && (
        <div className="md:hidden border-t px-5 py-4 flex flex-col gap-3" style={{ borderColor: "var(--line)" }}>
          {NAV_ITEMS.map((n) => (
            <button key={n.id} onClick={() => { setView(n.id); setOpen(false); }} className="text-left text-sm py-1">{n.label}</button>
          ))}
          {user ? (
            <>
              <button onClick={() => { setView("dashboard"); setOpen(false); }} className="text-left text-sm py-1">Dashboard</button>
              <button onClick={() => { setUser(null); setView("home"); setOpen(false); }} className="text-left text-sm py-1">Log out</button>
            </>
          ) : (
            <button onClick={() => { setView("auth"); setOpen(false); }} className="cn-btn cn-btn-primary px-4 py-2 text-sm w-max">Login / Sign Up</button>
          )}
        </div>
      )}
    </header>
  );
}

function Footer() {
  return (
    <footer className="mt-24 py-10 border-t" style={{ borderColor: "var(--line)", background: "var(--teal-900)" }}>
      <div className="max-w-6xl mx-auto px-5 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-white">
          <PulseMark color="#fff" size={18} />
          <span className="cn-display text-lg">CuraNet</span>
        </div>
        <div className="flex gap-6 text-sm" style={{ color: "#B9CFC5" }}>
          <span>About</span><span>Contact</span><span>Privacy</span><span>Terms</span>
        </div>
        <div className="cn-mono text-xs" style={{ color: "#7FA294" }}>© 2026 CuraNet · NSU CSE482L</div>
      </div>
    </footer>
  );
}

/* ------------------------------------------------------------------ */
/* Home                                                                 */
/* ------------------------------------------------------------------ */

function HomePage({ setView }) {
  const modules = [
    { id: "doctors", title: "Doctor Matchmaking", desc: "Describe your symptoms in plain language and get matched to the right specialist — from cardiology to dentistry.", icon: Stethoscope },
    { id: "blood", title: "Blood Exchange Network", desc: "Post an urgent request or register as a donor — matched by type and location, across all eight blood types.", icon: Droplet },
    { id: "courses", title: "Healthcare Literacy Hub", desc: "Short, practical mini-courses so you can make informed health decisions.", icon: BookOpen },
  ];

  return (
    <div>
      {/* HERO */}
      <section className="max-w-6xl mx-auto px-5 pt-14 pb-16 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <SectionEyebrow>One account · Every vital sign of care</SectionEyebrow>
          <h1 className="cn-display text-4xl md:text-5xl leading-tight" style={{ color: "var(--teal-900)" }}>
            One website for every health decision.
          </h1>
          <p className="mt-5 text-base leading-relaxed max-w-md" style={{ color: "var(--ink-soft)" }}>
            Find the right specialist for any condition, reach a compatible blood donor in
            minutes regardless of blood type, and learn to read your own prescriptions —
            all under a single CuraNet profile.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button onClick={() => setView("doctors")} className="cn-btn cn-btn-primary px-6 py-3 text-sm flex items-center gap-2">
              Find a Doctor <ArrowRight size={16} />
            </button>
            <button onClick={() => setView("blood")} className="cn-btn cn-btn-outline px-6 py-3 text-sm">
              Request Blood
            </button>
          </div>
        </div>

        <div className="cn-card p-6 relative overflow-hidden">
          <div className="cn-eyebrow mb-3">Live readout</div>
          <svg viewBox="0 0 400 90" className="w-full h-20">
            <path d="M0 45 H120 L135 15 L155 75 L175 45 H230 L245 25 L262 65 L280 45 H400"
              fill="none" stroke="var(--green-600)" strokeWidth="2.5" className="cn-pulse-path" />
          </svg>
          <div className="grid grid-cols-3 gap-3 mt-5">
            {modules.map((m) => (
              <button key={m.id} onClick={() => setView(m.id)} className="flex flex-col items-center gap-2 py-3 rounded hover:bg-[var(--green-100)]" style={{ background: "var(--paper)" }}>
                <m.icon size={18} color="var(--teal-900)" />
                <span className="text-[0.65rem] text-center leading-tight" style={{ color: "var(--ink-soft)" }}>{m.title.split(" ")[0]}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* MODULE CARDS */}
      <section className="max-w-6xl mx-auto px-5 pb-16">
        <div className="grid sm:grid-cols-1 lg:grid-cols-3 gap-5">
          {modules.map((m) => (
            <div key={m.id} className="cn-card p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div>
                <div className="w-10 h-10 rounded-full flex items-center justify-center mb-4" style={{ background: "var(--green-100)" }}>
                  <m.icon size={18} color="var(--teal-900)" />
                </div>
                <h3 className="cn-display text-lg" style={{ color: "var(--teal-900)" }}>{m.title}</h3>
                <p className="text-sm mt-2 leading-relaxed" style={{ color: "var(--ink-soft)" }}>{m.desc}</p>
              </div>
              <button onClick={() => setView(m.id)} className="mt-5 text-sm font-semibold flex items-center gap-1" style={{ color: "var(--green-600)" }}>
                Open <ChevronRight size={14} />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURED STRIP */}
      <section className="max-w-6xl mx-auto px-5 pb-6">
        <SectionEyebrow>On the platform right now</SectionEyebrow>
        <div className="grid md:grid-cols-2 gap-5">
          <div className="cn-card p-5">
            <div className="flex items-center gap-2 mb-3"><Star size={14} color="var(--gold)" /><span className="text-xs font-semibold">Top-Rated Specialists</span></div>
            {[...DOCTORS].sort((a, b) => b.rating - a.rating).slice(0, 4).map((d) => (
              <div key={d.id} className="flex items-center justify-between py-1.5 text-sm">
                <span>{d.name} <span className="text-xs" style={{ color: "var(--ink-soft)" }}>· {d.specialty}</span></span>
                <StarRating value={d.rating} />
              </div>
            ))}
          </div>
          <div className="cn-card p-5" style={{ borderColor: "var(--coral)" }}>
            <div className="flex items-center gap-2 mb-3"><Droplet size={14} color="var(--coral)" /><span className="text-xs font-semibold">Urgent Blood Requests</span></div>
            <div className="flex items-center justify-between py-1.5 text-sm"><span>O- needed, Dhanmondi</span><span className="cn-pill px-2 py-0.5" style={{ background: "var(--coral-100)", color: "var(--coral)" }}>Critical</span></div>
            <div className="flex items-center justify-between py-1.5 text-sm"><span>AB- needed, Uttara</span><span className="cn-pill px-2 py-0.5" style={{ background: "var(--coral-100)", color: "var(--coral)" }}>Urgent</span></div>
            <div className="flex items-center justify-between py-1.5 text-sm"><span>B+ needed, Mirpur</span><span className="cn-pill px-2 py-0.5" style={{ background: "var(--green-100)", color: "var(--green-600)" }}>Normal</span></div>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Auth                                                                 */
/* ------------------------------------------------------------------ */

function AuthPage({ setView, setUser, notify }) {
  const [reg, setReg] = useState({ name: "", email: "", phone: "", password: "", role: "patient" });
  const [login, setLogin] = useState({ email: "", password: "" });

  const handleLogin = (e) => {
    e.preventDefault();
    setUser({ name: login.email.split("@")[0] || "Guest User", email: login.email, role: "patient" });
    notify("Welcome back to CuraNet.");
    setView("dashboard");
  };
  const handleRegister = (e) => {
    e.preventDefault();
    setUser({ name: reg.name || "New User", email: reg.email, role: reg.role });
    notify("Account created — welcome to CuraNet.");
    setView("dashboard");
  };

  return (
    <section className="max-w-4xl mx-auto px-5 py-14">
      <div className="cn-card grid md:grid-cols-2 overflow-hidden">
        <form onSubmit={handleLogin} className="p-8 border-b md:border-b-0 md:border-r" style={{ borderColor: "var(--line)" }}>
          <h2 className="cn-display text-2xl mb-6" style={{ color: "var(--teal-900)" }}>Log in</h2>
          <div className="flex flex-col gap-3">
            <input required type="email" placeholder="Email address" className="cn-input" value={login.email} onChange={(e) => setLogin({ ...login, email: e.target.value })} />
            <input required type="password" placeholder="Password" className="cn-input" value={login.password} onChange={(e) => setLogin({ ...login, password: e.target.value })} />
            <button type="button" className="text-xs text-left" style={{ color: "var(--green-600)" }}>Forgot password?</button>
            <button type="submit" className="cn-btn cn-btn-primary py-3 text-sm mt-2">Log In</button>
            <button type="button" onClick={() => { setUser(null); setView("home"); }} className="text-xs" style={{ color: "var(--ink-soft)" }}>or continue as guest</button>
          </div>
        </form>

        <form onSubmit={handleRegister} className="p-8">
          <h2 className="cn-display text-2xl mb-6" style={{ color: "var(--teal-900)" }}>Register</h2>
          <div className="flex flex-col gap-3">
            <input required placeholder="Full name" className="cn-input" value={reg.name} onChange={(e) => setReg({ ...reg, name: e.target.value })} />
            <input required type="email" placeholder="Email address" className="cn-input" value={reg.email} onChange={(e) => setReg({ ...reg, email: e.target.value })} />
            <input placeholder="Phone number" className="cn-input" value={reg.phone} onChange={(e) => setReg({ ...reg, phone: e.target.value })} />
            <input required type="password" placeholder="Password" className="cn-input" value={reg.password} onChange={(e) => setReg({ ...reg, password: e.target.value })} />
            <select className="cn-input" value={reg.role} onChange={(e) => setReg({ ...reg, role: e.target.value })}>
              <option value="patient">Patient</option>
              <option value="doctor">Doctor</option>
              <option value="donor">Donor</option>
              <option value="admin">Admin (demo)</option>
            </select>
            <button type="submit" className="cn-btn cn-btn-primary py-3 text-sm mt-2">Create Account</button>
          </div>
        </form>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Doctor matchmaking                                                   */
/* ------------------------------------------------------------------ */

function DoctorsPage({ notify }) {
  const [symptoms, setSymptoms] = useState("");
  const [matchedSpecialties, setMatchedSpecialties] = useState(null);
  const [filters, setFilters] = useState({ location: "", maxFee: "", specialty: "All" });

  const matchSymptoms = (e) => {
    e.preventDefault();
    const text = symptoms.toLowerCase();
    const scored = SPECIALTIES
      .map((s) => ({ ...s, score: s.keywords.filter((k) => text.includes(k)).length }))
      .filter((s) => s.score > 0)
      .sort((a, b) => b.score - a.score);
    setMatchedSpecialties(scored.length ? scored.map((s) => s.name) : ["General Medicine"]);
  };

  const visibleDoctors = useMemo(() => {
    let list = DOCTORS;
    if (matchedSpecialties) list = list.filter((d) => matchedSpecialties.includes(d.specialty));
    if (filters.specialty !== "All") list = list.filter((d) => d.specialty === filters.specialty);
    if (filters.location) list = list.filter((d) => d.location.toLowerCase().includes(filters.location.toLowerCase()));
    if (filters.maxFee) list = list.filter((d) => d.fee <= Number(filters.maxFee));
    return [...list].sort((a, b) => b.rating - a.rating);
  }, [matchedSpecialties, filters]);

  return (
    <section className="max-w-6xl mx-auto px-5 py-10">
      <SectionEyebrow>AI Doctor Matchmaking</SectionEyebrow>
      <h1 className="cn-display text-3xl mb-2" style={{ color: "var(--teal-900)" }}>Tell us what's wrong. We'll point you to a specialist.</h1>
      <p className="text-sm mb-6" style={{ color: "var(--ink-soft)" }}>
        CuraNet covers {SPECIALTIES.length} specialties end to end — every common condition routes to a verified doctor.
      </p>

      <form onSubmit={matchSymptoms} className="cn-card p-5 flex flex-col sm:flex-row gap-3 mb-8">
        <input
          className="cn-input flex-1"
          placeholder="e.g. chest pain, shortness of breath"
          value={symptoms}
          onChange={(e) => setSymptoms(e.target.value)}
        />
        <button type="submit" className="cn-btn cn-btn-primary px-6 py-3 text-sm">Match Me</button>
      </form>

      <div className="grid md:grid-cols-4 gap-6">
        <aside className="cn-card p-5 h-max">
          <h3 className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: "var(--ink-soft)" }}>Filters</h3>
          <label className="text-xs block mb-1" style={{ color: "var(--ink-soft)" }}>Specialty</label>
          <select className="cn-input mb-3" value={filters.specialty} onChange={(e) => setFilters({ ...filters, specialty: e.target.value })}>
            <option>All</option>
            {SPECIALTIES.map((s) => <option key={s.id}>{s.name}</option>)}
          </select>
          <label className="text-xs block mb-1" style={{ color: "var(--ink-soft)" }}>Location</label>
          <input className="cn-input mb-3" placeholder="e.g. Dhanmondi" value={filters.location} onChange={(e) => setFilters({ ...filters, location: e.target.value })} />
          <label className="text-xs block mb-1" style={{ color: "var(--ink-soft)" }}>Max fee (৳)</label>
          <input type="number" className="cn-input mb-3" placeholder="e.g. 800" value={filters.maxFee} onChange={(e) => setFilters({ ...filters, maxFee: e.target.value })} />
          {matchedSpecialties && (
            <button onClick={() => setMatchedSpecialties(null)} className="text-xs mt-2" style={{ color: "var(--green-600)" }}>Clear symptom match</button>
          )}
        </aside>

        <div className="md:col-span-3">
          {matchedSpecialties && (
            <p className="text-sm mb-4" style={{ color: "var(--ink-soft)" }}>
              Matched specialties: <strong style={{ color: "var(--teal-900)" }}>{matchedSpecialties.join(", ")}</strong> — sorted by rating.
            </p>
          )}
          <div className="flex flex-col gap-4">
            {visibleDoctors.map((d) => (
              <div key={d.id} className="cn-card p-5 flex items-center gap-4">
                <div className="w-14 h-14 rounded-full flex items-center justify-center text-white cn-display text-lg shrink-0" style={{ background: d.color }}>
                  {d.name.split(" ")[1]?.[0] || "D"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-semibold">{d.name}</h4>
                    <span className="cn-pill px-2 py-0.5" style={{ background: "var(--green-100)", color: "var(--teal-900)" }}>{d.specialty}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs mt-1.5 flex-wrap" style={{ color: "var(--ink-soft)" }}>
                    <StarRating value={d.rating} />
                    <span className="flex items-center gap-1"><MapPin size={12} />{d.location}</span>
                    <span className="cn-mono">৳{d.fee}</span>
                  </div>
                </div>
                <button onClick={() => notify(`Appointment booked with ${d.name}.`)} className="cn-btn cn-btn-primary px-4 py-2 text-xs shrink-0">Book Now</button>
              </div>
            ))}
            {visibleDoctors.length === 0 && <p className="text-sm" style={{ color: "var(--ink-soft)" }}>No doctors match these filters yet.</p>}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Blood exchange                                                       */
/* ------------------------------------------------------------------ */

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

function BloodPage({ notify }) {
  const [requestType, setRequestType] = useState("O+");
  const [showMatches, setShowMatches] = useState(false);

  /* Simplified donor compatibility: same type always matches; O- is the
     universal donor and is always shown as compatible for every type. */
  const compatibleDonors = useMemo(() => {
    if (requestType === "O-") return DONORS.filter((d) => d.bloodType === "O-");
    return DONORS.filter((d) => d.bloodType === requestType || d.bloodType === "O-");
  }, [requestType]);

  const donorCountByType = useMemo(() => {
    const counts = {};
    BLOOD_TYPES.forEach((t) => { counts[t] = DONORS.filter((d) => d.bloodType === t).length; });
    return counts;
  }, []);

  return (
    <section className="max-w-6xl mx-auto px-5 py-10">
      <SectionEyebrow>Blood Exchange Network</SectionEyebrow>
      <h1 className="cn-display text-3xl mb-2" style={{ color: "var(--teal-900)" }}>Every unit matters. Every minute matters.</h1>
      <p className="text-sm mb-6" style={{ color: "var(--ink-soft)" }}>Registered donors across all eight blood types, matched by type and location.</p>

      <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 mb-8">
        {BLOOD_TYPES.map((t) => (
          <div key={t} className="cn-card p-3 text-center">
            <div className="cn-display text-lg" style={{ color: "var(--coral)" }}>{t}</div>
            <div className="text-xs cn-mono" style={{ color: "var(--ink-soft)" }}>{donorCountByType[t]} donor{donorCountByType[t] === 1 ? "" : "s"}</div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <form
          onSubmit={(e) => { e.preventDefault(); setShowMatches(true); notify("Blood request posted and matched to nearby donors."); }}
          className="cn-card p-6"
          style={{ borderColor: "var(--coral)" }}
        >
          <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: "var(--coral)" }}><Droplet size={16} />Request Blood</h3>
          <div className="flex flex-col gap-3">
            <select className="cn-input" value={requestType} onChange={(e) => setRequestType(e.target.value)}>
              {BLOOD_TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
            <input className="cn-input" placeholder="Units needed" type="number" required />
            <input className="cn-input" placeholder="Hospital / location" required />
            <button type="submit" className="cn-btn cn-btn-coral py-3 text-sm">Post Request</button>
          </div>
        </form>

        <form onSubmit={(e) => { e.preventDefault(); notify("Thanks — you're registered as a donor."); }} className="cn-card p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: "var(--teal-900)" }}><Heart size={16} />Become a Donor</h3>
          <div className="flex flex-col gap-3">
            <select className="cn-input" defaultValue="O+">
              {BLOOD_TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
            <input className="cn-input" placeholder="Location" required />
            <input className="cn-input" type="date" placeholder="Last donation date" />
            <button type="submit" className="cn-btn cn-btn-primary py-3 text-sm">Register as Donor</button>
          </div>
        </form>
      </div>

      {showMatches && (
        <div className="cn-card overflow-x-auto">
          <h3 className="font-semibold px-5 pt-5">Compatible Donors Nearby ({requestType})</h3>
          <table className="w-full text-sm mt-3">
            <thead>
              <tr className="text-left border-t border-b" style={{ borderColor: "var(--line)", color: "var(--ink-soft)" }}>
                <th className="py-2 px-5 font-medium">Name</th>
                <th className="py-2 px-5 font-medium">Blood Type</th>
                <th className="py-2 px-5 font-medium">Location</th>
                <th className="py-2 px-5 font-medium">Last Donation</th>
                <th className="py-2 px-5 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {compatibleDonors.map((d) => (
                <tr key={d.id} className="border-b" style={{ borderColor: "var(--line)" }}>
                  <td className="py-3 px-5">{d.name}</td>
                  <td className="py-3 px-5 font-semibold" style={{ color: "var(--coral)" }}>{d.bloodType}</td>
                  <td className="py-3 px-5">{d.location}</td>
                  <td className="py-3 px-5 cn-mono text-xs">{d.lastDonation}</td>
                  <td className="py-3 px-5"><button onClick={() => notify(`Message sent to ${d.name}.`)} className="cn-btn cn-btn-outline text-xs px-3 py-1.5">Contact</button></td>
                </tr>
              ))}
              {compatibleDonors.length === 0 && (
                <tr><td colSpan={5} className="py-4 px-5 text-center" style={{ color: "var(--ink-soft)" }}>No compatible donors found nearby yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Literacy hub                                                         */
/* ------------------------------------------------------------------ */

function CoursesPage({ notify, enrolled, setEnrolled }) {
  const [filter, setFilter] = useState("All");
  const filters = ["All", "Free", "Paid", "Prescriptions", "Choosing Doctors"];

  const visible = COURSES.filter((c) => {
    if (filter === "All") return true;
    if (filter === "Free") return c.free;
    if (filter === "Paid") return !c.free;
    return c.category === filter;
  });

  const enroll = (c) => {
    if (!enrolled.includes(c.id)) setEnrolled((prev) => [...prev, c.id]);
    notify(`Enrolled in "${c.title}".`);
  };

  return (
    <section className="max-w-6xl mx-auto px-5 py-10">
      <SectionEyebrow>Healthcare Literacy Hub</SectionEyebrow>
      <h1 className="cn-display text-3xl mb-2" style={{ color: "var(--teal-900)" }}>Learn to make better health decisions.</h1>
      <p className="text-sm mb-6" style={{ color: "var(--ink-soft)" }}>Free and paid mini-courses on prescriptions, specialists, and everyday care.</p>

      <div className="flex flex-wrap gap-2 mb-8">
        {filters.map((f) => (
          <button key={f} onClick={() => setFilter(f)} className="cn-pill px-3 py-1.5" style={{ background: filter === f ? "var(--teal-900)" : "var(--sand)", color: filter === f ? "#fff" : "var(--ink-soft)" }}>
            {f}
          </button>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {visible.map((c) => (
          <div key={c.id} className="cn-card p-5 flex flex-col">
            <div className="h-28 rounded mb-4 flex items-center justify-center" style={{ background: "var(--green-100)" }}>
              <BookOpen size={26} color="var(--teal-900)" opacity={0.5} />
            </div>
            <span className="cn-pill self-start px-2 py-0.5 mb-2" style={{ background: "var(--sand)", color: "var(--ink-soft)" }}>{c.category}</span>
            <h4 className="font-semibold mb-3 flex-1">{c.title}</h4>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold" style={{ color: c.free ? "var(--green-600)" : "var(--ink)" }}>{c.free ? "FREE" : `৳${c.price}`}</span>
              <button onClick={() => enroll(c)} className="cn-btn cn-btn-primary text-xs px-4 py-2">
                {enrolled.includes(c.id) ? "Enrolled ✓" : "Enroll"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Dashboard (+ lightweight admin view)                                 */
/* ------------------------------------------------------------------ */

function DashboardPage({ user, enrolled }) {
  const [tab, setTab] = useState("overview");
  const isAdmin = user?.role === "admin";

  const stats = [
    { label: "Upcoming Appointments", value: 1 },
    { label: "Courses in Progress", value: enrolled.length },
    { label: "Blood Requests", value: 1 },
    { label: "Specialties Covered", value: SPECIALTIES.length },
  ];

  const activity = [
    "Booked appointment with Dr. Farhana Rahman",
    "Enrolled in Reading Your Prescription",
    "Posted a blood request for O+",
    "Registered as a blood donor (A+)",
  ];

  if (isAdmin) {
    return (
      <section className="max-w-6xl mx-auto px-5 py-10">
        <SectionEyebrow>Admin Panel</SectionEyebrow>
        <h1 className="cn-display text-3xl mb-6" style={{ color: "var(--teal-900)" }}>Platform overview</h1>
        <div className="grid sm:grid-cols-4 gap-4 mb-8">
          {[["Total Users", 1240], ["Pending Doctors", 6], ["Registered Donors", DONORS.length], ["Open Requests", 3]].map(([label, val]) => (
            <div key={label} className="cn-card p-5 text-center">
              <div className="cn-display text-2xl" style={{ color: "var(--teal-900)" }}>{val}</div>
              <div className="text-xs mt-1" style={{ color: "var(--ink-soft)" }}>{label}</div>
            </div>
          ))}
        </div>
        <div className="cn-card overflow-x-auto">
          <h3 className="font-semibold px-5 pt-5">Pending Approvals</h3>
          <table className="w-full text-sm mt-3">
            <thead>
              <tr className="text-left border-t border-b" style={{ borderColor: "var(--line)", color: "var(--ink-soft)" }}>
                <th className="py-2 px-5 font-medium">Type</th><th className="py-2 px-5 font-medium">Submitted By</th>
                <th className="py-2 px-5 font-medium">Status</th><th className="py-2 px-5 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {[["Doctor", "Dr. Salma Rahman"], ["Doctor", "Dr. Anwar Kabir"], ["Donor", "Kamal Uddin"], ["Doctor", "Dr. Faria Islam"]].map(([type, who], i) => (
                <tr key={i} className="border-b" style={{ borderColor: "var(--line)" }}>
                  <td className="py-3 px-5">{type}</td>
                  <td className="py-3 px-5">{who}</td>
                  <td className="py-3 px-5"><span className="cn-pill px-2 py-0.5" style={{ background: "var(--coral-100)", color: "var(--coral)" }}>Pending</span></td>
                  <td className="py-3 px-5"><button className="cn-btn cn-btn-primary text-xs px-3 py-1.5">Approve</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-6xl mx-auto px-5 py-10 grid md:grid-cols-4 gap-6">
      <aside className="cn-card p-5 h-max flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-full flex items-center justify-center text-white cn-display text-xl mb-3" style={{ background: "var(--teal-900)" }}>
          {user?.name?.[0] || "U"}
        </div>
        <p className="font-semibold">{user?.name || "Guest User"}</p>
        <p className="text-xs mb-4" style={{ color: "var(--ink-soft)" }}>{user?.email}</p>
        <div className="flex flex-col gap-1 w-full text-left">
          {["overview", "appointments", "blood", "courses"].map((t) => (
            <button key={t} onClick={() => setTab(t)} className="text-sm text-left px-3 py-2 rounded capitalize" style={{ background: tab === t ? "var(--teal-900)" : "transparent", color: tab === t ? "#fff" : "var(--ink-soft)" }}>
              {t === "overview" ? "My Profile" : t}
            </button>
          ))}
        </div>
      </aside>

      <div className="md:col-span-3">
        <h1 className="cn-display text-3xl mb-6" style={{ color: "var(--teal-900)" }}>Dashboard Overview</h1>
        <div className="grid sm:grid-cols-4 gap-4 mb-8">
          {stats.map((s) => (
            <div key={s.label} className="cn-card p-5 text-center">
              <div className="cn-display text-2xl" style={{ color: "var(--teal-900)" }}>{s.value}</div>
              <div className="text-xs mt-1" style={{ color: "var(--ink-soft)" }}>{s.label}</div>
            </div>
          ))}
        </div>
        <div className="cn-card p-5">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><Clock size={15} />Recent Activity</h3>
          <div className="flex flex-col">
            {activity.map((a, i) => (
              <div key={i} className="flex items-center gap-3 py-2.5 border-b last:border-0 text-sm" style={{ borderColor: "var(--line)" }}>
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: "var(--green-600)" }} />
                {a}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* App root                                                             */
/* ------------------------------------------------------------------ */

export default function App() {
  const [view, setView] = useState("home");
  const [user, setUser] = useState(null);
  const [enrolled, setEnrolled] = useState([]);
  const [toast, setToast] = useState("");

  const notify = (msg) => {
    setToast(msg);
    window.clearTimeout(notify._t);
    notify._t = window.setTimeout(() => setToast(""), 3200);
  };

  const goToDashboard = (v) => {
    if (v === "dashboard" && !user) { setView("auth"); return; }
    setView(v);
  };

  return (
    <div className="cn-root min-h-screen flex flex-col">
      {FONTS}
      <NavBar view={view} setView={goToDashboard} user={user} setUser={setUser} />

      <main className="flex-1">
        {view === "home" && <HomePage setView={setView} />}
        {view === "auth" && <AuthPage setView={setView} setUser={setUser} notify={notify} />}
        {view === "doctors" && <DoctorsPage notify={notify} />}
        {view === "blood" && <BloodPage notify={notify} />}
        {view === "courses" && <CoursesPage notify={notify} enrolled={enrolled} setEnrolled={setEnrolled} />}
        {view === "dashboard" && <DashboardPage user={user} enrolled={enrolled} />}
      </main>

      <Footer />
      <Toast message={toast} onClose={() => setToast("")} />
    </div>
  );
}
