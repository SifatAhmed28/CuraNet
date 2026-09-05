import { useState } from "react";
import { Link } from "react-router-dom";
import {
  HeartPulse,
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  Award,
  Lock,
  Droplet,
  Stethoscope,
  BookOpen,
  Send,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
} from "lucide-react";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
    }
  };

  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-800/80 relative overflow-hidden">
      {/* Subtle background ambient glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-900/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-rose-900/10 rounded-full blur-3xl pointer-events-none" />

      {/* Emergency Hotline Header Bar */}
      <div className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md">
        <div className="container max-w-7xl mx-auto px-4 py-3.5 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 sm:gap-6 text-slate-300">
            <span className="inline-flex items-center gap-1.5 font-bold text-rose-400">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              24/7 National Emergency Hotlines:
            </span>
            <a
              href="tel:999"
              className="flex items-center gap-1 hover:text-white font-bold transition text-slate-200"
            >
              <Phone size={13} className="text-rose-400" />
              <span>National Police / Ambulance:</span>
              <strong className="text-rose-400 bg-rose-950/60 px-2 py-0.5 rounded-md border border-rose-800/60">
                999
              </strong>
            </a>
            <a
              href="tel:16263"
              className="flex items-center gap-1 hover:text-white font-bold transition text-slate-200"
            >
              <Phone size={13} className="text-teal-400" />
              <span>Health Directorate (Shastho Batayon):</span>
              <strong className="text-teal-300 bg-teal-950/60 px-2 py-0.5 rounded-md border border-teal-800/60">
                16263
              </strong>
            </a>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Live Hospital &amp; Donor Network Operational
            </span>
          </div>
        </div>
      </div>

      {/* Main Multi-Column Footer Content */}
      <div className="container max-w-7xl mx-auto px-4 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">
          {/* Col 1 & 2 (Span 2): Brand, Purpose & Compliance */}
          <div className="lg:col-span-2 space-y-5">
            <Link to="/" className="inline-flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-500 text-white flex items-center justify-center shadow-lg shadow-teal-900/30 group-hover:scale-105 transition-transform">
                <HeartPulse size={22} />
              </div>
              <span className="text-2xl font-black tracking-tight text-white">
                Cura<span className="text-teal-400">Net</span>
              </span>
            </Link>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-sm">
              Bangladesh&apos;s leading digital healthcare ecosystem. Connecting patients to over
              6,500+ BMDC-verified specialist doctors, a nationwide emergency blood exchange, and
              accredited healthcare literacy hubs.
            </p>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 gap-2.5 pt-2 max-w-sm text-[11px]">
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300">
                <ShieldCheck size={16} className="text-teal-400 shrink-0" />
                <span className="font-semibold leading-tight">6,500+ BMDC Verified Specialists</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300">
                <Droplet size={16} className="text-rose-400 shrink-0" />
                <span className="font-semibold leading-tight">24/7 Verified Blood Donors</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300">
                <Lock size={16} className="text-amber-400 shrink-0" />
                <span className="font-semibold leading-tight">256-Bit SSL Encrypted</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300">
                <Award size={16} className="text-blue-400 shrink-0" />
                <span className="font-semibold leading-tight">Stripe PCI Certified</span>
              </div>
            </div>

            {/* Contact Details */}
            <div className="space-y-1.5 pt-2 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <MapPin size={13} className="text-teal-400 shrink-0" />
                <span>Level 7, Healthcare Tower, Panthapath, Dhaka-1205, Bangladesh</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={13} className="text-teal-400 shrink-0" />
                <a href="mailto:support@curanet.health" className="hover:text-white transition">
                  support@curanet.health
                </a>
              </div>
            </div>
          </div>

          {/* Col 3: Core Services */}
          <div className="space-y-3.5">
            <h4 className="text-xs font-black uppercase tracking-wider text-white border-b border-slate-800 pb-2">
              Healthcare Services
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link
                  to="/doctors"
                  className="text-slate-400 hover:text-teal-300 transition flex items-center gap-1.5 group"
                >
                  <ChevronRight size={12} className="text-slate-600 group-hover:text-teal-400 transition" />
                  <span>Find Best Doctors (6,500+)</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/blood"
                  className="text-slate-400 hover:text-rose-300 transition flex items-center gap-1.5 group"
                >
                  <ChevronRight size={12} className="text-slate-600 group-hover:text-rose-400 transition" />
                  <span>Emergency Blood Requests</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/blood"
                  className="text-slate-400 hover:text-teal-300 transition flex items-center gap-1.5 group"
                >
                  <ChevronRight size={12} className="text-slate-600 group-hover:text-teal-400 transition" />
                  <span>Volunteer Blood Donors</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/courses"
                  className="text-slate-400 hover:text-teal-300 transition flex items-center gap-1.5 group"
                >
                  <ChevronRight size={12} className="text-slate-600 group-hover:text-teal-400 transition" />
                  <span>Health Literacy Hub</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/first-aid"
                  className="text-slate-400 hover:text-teal-300 transition flex items-center gap-1.5 group"
                >
                  <ChevronRight size={12} className="text-slate-600 group-hover:text-teal-400 transition" />
                  <span>Emergency First Aid Guides</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/articles"
                  className="text-slate-400 hover:text-teal-300 transition flex items-center gap-1.5 group"
                >
                  <ChevronRight size={12} className="text-slate-600 group-hover:text-teal-400 transition" />
                  <span>Doctor Articles &amp; Insights</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Top Specialties */}
          <div className="space-y-3.5">
            <h4 className="text-xs font-black uppercase tracking-wider text-white border-b border-slate-800 pb-2">
              Top Medical Specialties
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link
                  to="/doctors?specialty=Cardiology"
                  className="text-slate-400 hover:text-teal-300 transition flex items-center gap-1.5 group"
                >
                  <ChevronRight size={12} className="text-slate-600 group-hover:text-teal-400 transition" />
                  <span>Cardiology &amp; Heart Care</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/doctors?specialty=Neurology"
                  className="text-slate-400 hover:text-teal-300 transition flex items-center gap-1.5 group"
                >
                  <ChevronRight size={12} className="text-slate-600 group-hover:text-teal-400 transition" />
                  <span>Neurology &amp; Brain Spine</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/doctors?specialty=Dermatology"
                  className="text-slate-400 hover:text-teal-300 transition flex items-center gap-1.5 group"
                >
                  <ChevronRight size={12} className="text-slate-600 group-hover:text-teal-400 transition" />
                  <span>Dermatology &amp; Skin Care</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/doctors?specialty=Gynecology"
                  className="text-slate-400 hover:text-teal-300 transition flex items-center gap-1.5 group"
                >
                  <ChevronRight size={12} className="text-slate-600 group-hover:text-teal-400 transition" />
                  <span>Gynecology &amp; Maternal Care</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/doctors?specialty=Orthopedics"
                  className="text-slate-400 hover:text-teal-300 transition flex items-center gap-1.5 group"
                >
                  <ChevronRight size={12} className="text-slate-600 group-hover:text-teal-400 transition" />
                  <span>Orthopedics &amp; Joint Surgery</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/doctors?specialty=Pediatrics"
                  className="text-slate-400 hover:text-teal-300 transition flex items-center gap-1.5 group"
                >
                  <ChevronRight size={12} className="text-slate-600 group-hover:text-teal-400 transition" />
                  <span>Pediatrics &amp; Child Health</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/doctors?specialty=General+Medicine"
                  className="text-slate-400 hover:text-teal-300 transition flex items-center gap-1.5 group"
                >
                  <ChevronRight size={12} className="text-slate-600 group-hover:text-teal-400 transition" />
                  <span>General Internal Medicine</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 5: Major Locations & Newsletter */}
          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-white border-b border-slate-800 pb-2">
              National Coverage
            </h4>
            <div className="flex flex-wrap gap-1.5 text-[11px]">
              {[
                "Dhaka",
                "Chittagong",
                "Rajshahi",
                "Bogura",
                "Barisal",
                "Comilla",
                "Jashore",
                "Gazipur",
                "Sylhet",
                "Narayanganj",
              ].map((city) => (
                <Link
                  key={city}
                  to={`/doctors?location=${encodeURIComponent(city)}`}
                  className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-teal-950 text-slate-300 hover:text-teal-300 border border-slate-800 transition"
                >
                  {city}
                </Link>
              ))}
            </div>

            <div className="pt-2 space-y-2">
              <h5 className="text-xs font-bold text-white">Health Bulletins &amp; Alerts</h5>
              <p className="text-[11px] text-slate-400 leading-normal">
                Receive weekly doctor-approved healthcare tips &amp; seasonal disease alerts.
              </p>

              {subscribed ? (
                <div className="p-2.5 bg-teal-950/80 border border-teal-800 text-teal-300 rounded-xl text-xs font-semibold flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-teal-400" />
                  <span>Thank you for subscribing!</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex items-center gap-1.5">
                  <input
                    type="email"
                    placeholder="Your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-800 text-white placeholder:text-slate-500 focus:outline-none focus:border-teal-500"
                  />
                  <button
                    type="submit"
                    className="px-3 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold transition shrink-0 cursor-pointer"
                  >
                    <Send size={13} />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Legal, Disclaimer & Status Bar */}
        <div className="mt-12 pt-8 border-t border-slate-800/80 space-y-4">
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 text-[11px] text-slate-400 leading-relaxed">
            <strong className="text-slate-300 font-bold block mb-1">
              Medical Disclaimer &amp; Emergency Protocol:
            </strong>
            CuraNet is an independent health decision and directory portal. Doctor consultations and
            medical opinions are delivered exclusively by licensed independent practitioners. In the
            event of an acute life-threatening emergency, trauma, or poisoning, please call{" "}
            <strong className="text-rose-400">999</strong> immediately or report to the nearest hospital
            emergency / casualty department.
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 pt-2">
            <div>
              &copy; {new Date().getFullYear()}{" "}
              <strong className="text-slate-300 font-bold">CuraNet Health Technologies Ltd.</strong> All
              rights reserved.
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs">
              <Link to="/about" className="hover:text-slate-300 transition">
                About Platform
              </Link>
              <Link to="/privacy" className="hover:text-slate-300 transition">
                Privacy Policy
              </Link>
              <Link to="/terms" className="hover:text-slate-300 transition">
                Terms of Service
              </Link>
              <Link to="/dashboard" className="hover:text-slate-300 transition">
                Doctor / Patient Portal
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
