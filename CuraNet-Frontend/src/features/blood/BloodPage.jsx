import { useState } from "react";
import { Droplet, HeartHandshake, ShieldCheck, Activity, Users, Flame } from "lucide-react";
import { IMAGES } from "../../data/images.js";
import BloodDonationSection from "./BloodDonationSection.jsx";
import OrganDonationSection from "./OrganDonationSection.jsx";

const TABS = [
  { id: "blood", label: "Blood Donation & Emergency Requests", icon: Droplet },
  { id: "organ", label: "Organ Donation & Pledges", icon: HeartHandshake },
];

export default function BloodPage() {
  const [tab, setTab] = useState("blood");
  const isBlood = tab === "blood";
  const [imgError, setImgError] = useState(false);

  return (
    <div className="container py-8 max-w-6xl mx-auto space-y-8">
      {/* 1. Redesigned Premium Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-rose-800/40 bg-gradient-to-r from-rose-950 via-rose-900 to-slate-950 text-white min-h-[220px] sm:min-h-[250px] flex flex-col justify-between p-6 sm:p-10">
        {/* Background Image with Fallback */}
        {!imgError && (
          <img
            src={isBlood ? IMAGES.blood : IMAGES.organ}
            alt={isBlood ? "Blood donation" : "Organ donation"}
            onError={() => setImgError(true)}
            loading="eager"
            className="absolute inset-0 w-full h-full object-cover opacity-25 mix-blend-luminosity pointer-events-none transition-opacity duration-300"
          />
        )}

        {/* Ambient Glows */}
        <div className="absolute top-0 right-10 w-80 h-80 bg-rose-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 left-10 w-60 h-60 bg-red-500/20 rounded-full blur-2xl pointer-events-none" />

        {/* Top Eyebrow Tag */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-black tracking-wider uppercase bg-rose-800/60 text-rose-200 border border-rose-700/60 backdrop-blur-md shadow-sm">
            <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
            <span>Emergency Life Network · 24/7 Match Hub</span>
          </div>

          <div className="hidden sm:flex items-center gap-4 text-xs font-bold text-rose-200">
            <span className="flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-rose-400" /> Verified Donors
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Activity size={14} className="text-rose-400" /> Real-time Proximity
            </span>
          </div>
        </div>

        {/* Banner Title & Description */}
        <div className="relative z-10 max-w-2xl space-y-2 mt-4 sm:mt-6">
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white leading-tight">
            {isBlood
              ? "Every Unit Matters. Every Minute Saves a Life."
              : "The Gift of Life, Given and Received."}
          </h1>
          <p className="text-rose-100/90 text-xs sm:text-sm leading-relaxed max-w-xl">
            {isBlood
              ? "Connect instantly with nearby volunteer blood donors across all eight blood types or post an emergency request for critical hospital patients."
              : "Pledge organ and tissue donations or register clinical requirements through an encrypted, verified network."}
          </p>
        </div>

        {/* Bottom Quick Metrics Bar */}
        <div className="relative z-10 pt-4 border-t border-rose-800/50 flex flex-wrap items-center gap-4 sm:gap-8 text-xs font-semibold text-rose-200">
          <div className="flex items-center gap-2">
            <Droplet size={15} className="text-rose-400" />
            <span>All 8 Blood Groups Supported</span>
          </div>
          <div className="flex items-center gap-2">
            <Users size={15} className="text-rose-400" />
            <span>Direct Hospital &amp; Patient Contact</span>
          </div>
          <div className="flex items-center gap-2">
            <Flame size={15} className="text-rose-400" />
            <span>Zero Brokerage / 100% Free Service</span>
          </div>
        </div>
      </div>

      {/* 2. Modern Segmented Tab Switcher */}
      <div className="flex items-center p-1.5 bg-slate-100/80 rounded-2xl border border-slate-200 max-w-md">
        {TABS.map((t) => {
          const active = tab === t.id;
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => {
                setTab(t.id);
                setImgError(false);
              }}
              className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                active
                  ? "bg-rose-700 text-white shadow-md shadow-rose-950/20"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
              }`}
            >
              <Icon size={16} />
              <span>{t.id === "blood" ? "Blood Donation" : "Organ Donation"}</span>
            </button>
          );
        })}
      </div>

      {/* 3. Section Content */}
      <div className="animate-fadeIn">
        {isBlood ? <BloodDonationSection /> : <OrganDonationSection />}
      </div>
    </div>
  );
}
