import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Stethoscope,
  Search,
  MapPin,
  Star,
  ShieldCheck,
  Calendar,
  ArrowRight,
  Sparkles,
  HeartPulse,
  BookOpen,
  Droplet,
  CheckCircle2,
  Clock,
  ChevronRight,
  Activity,
  Award,
  Zap,
  AwardIcon,
  Info,
} from "lucide-react";
import { DOCTORS } from "../data/doctors.js";
import { SPECIALTIES } from "../data/specialties.js";
import { courses, firstAidTopics } from "../data/content.js";
import CourseCard from "../components/CourseCard.jsx";
import api from "../utils/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import BookingPaymentModal from "../features/doctors/BookingPaymentModal.jsx";
import DoctorDetailsModal from "../features/doctors/DoctorDetailsModal.jsx";

// Common patient requirement presets for 1-click matching
const POPULAR_REQUIREMENTS = [
  { label: "Chest Pain & Heart", specialty: "Cardiology", query: "heart" },
  { label: "Severe Migraine & Headache", specialty: "Neurology", query: "headache" },
  { label: "Skin Allergy & Rash", specialty: "Dermatology", query: "skin" },
  { label: "Joint & Back Pain", specialty: "Orthopedics", query: "back pain" },
  { label: "Child Fever & Health", specialty: "Pediatrics", query: "fever" },
  { label: "Persistent Cough & Asthma", specialty: "Pulmonology", query: "asthma" },
  { label: "Diabetes & Thyroid", specialty: "Endocrinology", query: "diabetes" },
  { label: "Eye Care & Vision", specialty: "Ophthalmology", query: "eye" },
];

const BANGLADESH_CITIES = [
  "All Bangladesh",
  "Dhaka",
  "Chittagong",
  "Rajshahi",
  "Bogura",
  "Barisal",
  "Comilla",
  "Jashore",
  "Gazipur",
  "Narayanganj",
  "Sylhet",
  "Dhanmondi, Dhaka",
  "Mirpur, Dhaka",
  "Uttara, Dhaka",
  "Gulshan, Dhaka",
];

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Search & Filter state for patient requirements
  const [symptoms, setSymptoms] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("All");
  const [selectedLocation, setSelectedLocation] = useState("All Bangladesh");
  const [activeChip, setActiveChip] = useState(null);

  // Dynamic Doctors Query State from 6,523 Bangladesh Doctors
  const [matchedDoctors, setMatchedDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [totalMatches, setTotalMatches] = useState(0);

  // Booking Modal State
  const [selectedDoctorForBooking, setSelectedDoctorForBooking] = useState(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookedMessage, setBookedMessage] = useState("");

  // Doctor Details Modal State
  const [selectedDoctorForDetails, setSelectedDoctorForDetails] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // Live Query Doctors from Backend API based on user criteria
  const fetchDoctors = useCallback(async () => {
    try {
      setLoadingDoctors(true);
      const params = new URLSearchParams();
      params.set("limit", "8");
      params.set("sort", "rating");

      if (selectedSpecialty && selectedSpecialty !== "All") {
        params.set("specialty", selectedSpecialty);
      }
      if (
        selectedLocation &&
        selectedLocation !== "All Bangladesh" &&
        selectedLocation !== "All Areas"
      ) {
        params.set("location", selectedLocation.split(",")[0].trim());
      }
      if (symptoms && symptoms.trim()) {
        params.set("search", symptoms.trim());
      }

      const res = await api.doctors.list(params.toString());
      if (res?.data && res.data.length > 0) {
        setMatchedDoctors(res.data);
        setTotalMatches(res.total || res.data.length);
      } else {
        setMatchedDoctors([]);
        setTotalMatches(0);
      }
    } catch {
      // Fallback
      setMatchedDoctors(DOCTORS.slice(0, 4));
      setTotalMatches(DOCTORS.length);
    } finally {
      setLoadingDoctors(false);
    }
  }, [selectedSpecialty, selectedLocation, symptoms]);

  // Debounce user search input
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchDoctors();
    }, 280);
    return () => clearTimeout(timer);
  }, [fetchDoctors]);

  // Handle requirement chip click
  const handleChipClick = (req) => {
    if (activeChip === req.label) {
      // Toggle off
      setActiveChip(null);
      setSymptoms("");
      setSelectedSpecialty("All");
    } else {
      setActiveChip(req.label);
      setSymptoms(req.query);
      setSelectedSpecialty(req.specialty);
    }
  };

  // Submit search and navigate to /doctors directory
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (symptoms.trim()) params.set("search", symptoms.trim());
    if (selectedSpecialty !== "All") params.set("specialty", selectedSpecialty);
    if (
      selectedLocation !== "All Bangladesh" &&
      selectedLocation !== "All Areas"
    ) {
      params.set("location", selectedLocation.split(",")[0].trim());
    }

    navigate(`/doctors${params.toString() ? `?${params.toString()}` : ""}`);
  };

  const handleOpenBooking = (doc) => {
    setSelectedDoctorForBooking(doc);
    setIsBookingModalOpen(true);
  };

  const handleViewDetails = (doc) => {
    setSelectedDoctorForDetails(doc);
    setIsDetailsModalOpen(true);
  };

  return (
    <div className="space-y-16 pb-20">
      {/* 1. PRIMARY SECTION: FIND BEST DOCTOR ACCORDING TO PATIENT REQUIREMENT */}
      <section className="relative overflow-hidden pt-10 sm:pt-14 pb-12 bg-gradient-to-b from-teal-50/70 via-white to-slate-50 border-b border-slate-200/80">
        {/* Subtle background glow decorative elements */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-teal-200/30 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-100/40 rounded-full blur-2xl pointer-events-none -z-10" />

        <div className="container max-w-7xl mx-auto px-4">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10 space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-100/80 text-teal-900 border border-teal-200/80 text-xs font-extrabold tracking-wide uppercase shadow-sm">
              <Sparkles size={14} className="text-teal-700" />
              Patient-First Healthcare · Doctor Match Engine
            </div>
            <h1 className="text-3xl sm:text-5xl lg:text-5xl font-black text-slate-900 tracking-tight leading-[1.12]">
              Find the Best Doctor for Your{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-700 via-teal-800 to-emerald-700">
                Exact Requirements
              </span>
            </h1>
            <p className="text-slate-600 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
              Search by symptoms, disease, chamber, or city. Instant matching across 6,500+
              BMDC-verified specialist doctors throughout Bangladesh.
            </p>
          </div>

          {bookedMessage && (
            <div className="max-w-4xl mx-auto mb-6 p-4 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-2xl text-xs sm:text-sm font-semibold flex items-center justify-between shadow-sm animate-fadeIn">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                <span>{bookedMessage}</span>
              </div>
              <button
                onClick={() => setBookedMessage("")}
                className="text-emerald-700 hover:text-emerald-900 text-xs font-bold"
              >
                ✕
              </button>
            </div>
          )}

          {/* Interactive Patient Requirement Finder Card */}
          <div className="relative rounded-3xl bg-white/95 backdrop-blur-xl border border-teal-100/90 shadow-2xl shadow-teal-950/8 p-6 sm:p-8 space-y-6 max-w-5xl mx-auto">
            {/* Header Badge */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-1 border-b border-slate-100/80">
              <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-teal-800">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <Sparkles size={14} className="text-teal-600" />
                <span>Search 6,500+ Verified Doctors Across Bangladesh</span>
              </div>
              <span className="text-[11px] font-semibold text-slate-400">
                BMDC Verified Roster · Real Patient Ratings
              </span>
            </div>

            <form onSubmit={handleSearchSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                {/* Symptoms / Condition / Doctor Input */}
                <div className="md:col-span-5 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-black text-slate-800 uppercase tracking-wider">
                      Symptoms, Disease or Doctor Name
                    </label>
                    <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200/60">
                      Live Database Search
                    </span>
                  </div>

                  <div className="relative flex items-center group">
                    <div className="absolute left-3 p-1.5 rounded-xl bg-teal-50 text-teal-700 border border-teal-100 pointer-events-none group-focus-within:bg-teal-700 group-focus-within:text-white transition-colors">
                      <Stethoscope size={16} />
                    </div>
                    <input
                      type="text"
                      className="w-full pl-12 pr-10 py-3.5 bg-slate-50/80 hover:bg-slate-50 focus:bg-white text-sm font-semibold text-slate-900 placeholder:text-slate-400 placeholder:font-normal rounded-2xl border border-slate-200 focus:border-teal-700 focus:ring-4 focus:ring-teal-700/10 transition-all outline-none"
                      placeholder="e.g. Chest pain, kidney stone, Dr. Nurun, asthma..."
                      value={symptoms}
                      onChange={(e) => {
                        setSymptoms(e.target.value);
                        setActiveChip(null);
                      }}
                    />
                    {symptoms && (
                      <button
                        type="button"
                        onClick={() => {
                          setSymptoms("");
                          setActiveChip(null);
                        }}
                        className="absolute right-3 p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition cursor-pointer"
                        title="Clear"
                      >
                        <span className="text-xs font-bold px-1">✕</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Specialty Dropdown */}
                <div className="md:col-span-3 space-y-2">
                  <label className="block text-xs font-black text-slate-800 uppercase tracking-wider">
                    Specialty
                  </label>
                  <div className="relative flex items-center">
                    <div className="absolute left-3 p-1.5 rounded-xl bg-slate-100 text-slate-500 pointer-events-none">
                      <Sparkles size={16} />
                    </div>
                    <select
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-50/80 hover:bg-slate-50 focus:bg-white text-sm font-semibold text-slate-900 rounded-2xl border border-slate-200 focus:border-teal-700 focus:ring-4 focus:ring-teal-700/10 transition-all outline-none cursor-pointer appearance-none"
                      value={selectedSpecialty}
                      onChange={(e) => {
                        setSelectedSpecialty(e.target.value);
                        setActiveChip(null);
                      }}
                    >
                      <option value="All">All Specialties</option>
                      {SPECIALTIES.map((s) => (
                        <option key={s.id} value={s.name}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-3.5 pointer-events-none text-slate-400">
                      <ChevronRight size={14} className="rotate-90" />
                    </div>
                  </div>
                </div>

                {/* Location Dropdown */}
                <div className="md:col-span-2 space-y-2">
                  <label className="block text-xs font-black text-slate-800 uppercase tracking-wider">
                    Location in BD
                  </label>
                  <div className="relative flex items-center">
                    <div className="absolute left-3 p-1.5 rounded-xl bg-slate-100 text-slate-500 pointer-events-none">
                      <MapPin size={16} />
                    </div>
                    <select
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-50/80 hover:bg-slate-50 focus:bg-white text-sm font-semibold text-slate-900 rounded-2xl border border-slate-200 focus:border-teal-700 focus:ring-4 focus:ring-teal-700/10 transition-all outline-none cursor-pointer appearance-none"
                      value={selectedLocation}
                      onChange={(e) => setSelectedLocation(e.target.value)}
                    >
                      {BANGLADESH_CITIES.map((loc) => (
                        <option key={loc} value={loc}>
                          {loc}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-3.5 pointer-events-none text-slate-400">
                      <ChevronRight size={14} className="rotate-90" />
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="md:col-span-2">
                  <button
                    type="submit"
                    className="w-full py-3.5 px-4 bg-gradient-to-r from-teal-700 via-teal-800 to-emerald-700 hover:from-teal-800 hover:to-emerald-800 text-white font-black text-sm rounded-2xl shadow-glow cursor-pointer transition transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                  >
                    <Search size={17} />
                    <span>Find Doctors</span>
                  </button>
                </div>
              </div>

              {/* Quick Requirement Chips */}
              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2">
                <span className="text-xs font-extrabold text-slate-600 flex items-center gap-1.5 mr-1">
                  <Activity size={14} className="text-teal-700" />
                  Quick Filters:
                </span>
                {POPULAR_REQUIREMENTS.map((req) => {
                  const isActive = activeChip === req.label;
                  return (
                    <button
                      type="button"
                      key={req.label}
                      onClick={() => handleChipClick(req)}
                      className={`text-xs px-3.5 py-1.5 rounded-full font-bold transition-all border cursor-pointer flex items-center gap-1.5 ${
                        isActive
                          ? "bg-teal-800 text-white border-teal-800 shadow-sm transform scale-105"
                          : "bg-slate-50 hover:bg-teal-50/80 text-slate-700 hover:text-teal-950 border-slate-200 hover:border-teal-200"
                      }`}
                    >
                      <span>{req.label}</span>
                    </button>
                  );
                })}
              </div>
            </form>
          </div>

          {/* Matched Doctors Live Showcase */}
          <div className="mt-10 space-y-5 max-w-6xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                  <Award size={22} className="text-amber-500" />
                  Recommended Verified Specialists
                </h3>
                <p className="text-xs sm:text-sm text-slate-500">
                  {loadingDoctors ? (
                    "Searching 6,523 doctors in Bangladesh database..."
                  ) : (
                    <>
                      Found <strong className="text-teal-800 font-bold">{totalMatches.toLocaleString()}</strong> doctors matching your criteria
                      {selectedSpecialty !== "All" ? ` in ${selectedSpecialty}` : ""}
                      {selectedLocation !== "All Bangladesh" ? ` in ${selectedLocation}` : ""}
                    </>
                  )}
                </p>
              </div>

              <Link
                to={`/doctors?${new URLSearchParams({
                  ...(symptoms.trim() ? { search: symptoms.trim() } : {}),
                  ...(selectedSpecialty !== "All" ? { specialty: selectedSpecialty } : {}),
                  ...(selectedLocation !== "All Bangladesh" ? { location: selectedLocation } : {}),
                }).toString()}`}
                className="text-xs sm:text-sm font-bold text-teal-800 hover:text-teal-950 flex items-center gap-1 group self-start sm:self-auto"
              >
                <span>View all in full directory</span>
                <ChevronRight size={15} className="group-hover:translate-x-0.5 transition" />
              </Link>
            </div>

            {/* Doctor Cards Grid */}
            {loadingDoctors ? (
              <div className="text-center py-16 modern-card rounded-2xl space-y-3">
                <div className="w-8 h-8 border-3 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs font-semibold text-slate-400">Loading top doctors for you...</p>
              </div>
            ) : matchedDoctors.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {matchedDoctors.slice(0, 4).map((doc) => {
                  const name = doc.name || doc.userId?.name || "Specialist Doctor";
                  const primarySpecialty =
                    doc.specialization?.[0] || doc.specialty || "General Medicine";
                  const education =
                    doc.education || (doc.qualifications ? doc.qualifications.join(", ") : "MBBS");
                  const rating = doc.ratingAvg ?? doc.rating ?? 4.8;
                  const ratingCount = doc.ratingCount ?? 30;
                  const fee = doc.consultationFee ?? doc.fee ?? 800;
                  const locationText = doc.city || doc.clinicAddress || doc.location || "Bangladesh";
                  const chamber = doc.chamber || doc.clinicName || "Specialized Hospital";
                  const expYears = doc.experienceYears || 10;
                  const concentrations = doc.concentrations || [];

                  return (
                    <div
                      key={doc._id || doc.id}
                      className="modern-card modern-card-hover p-5 rounded-2xl border border-slate-200/90 bg-white flex flex-col justify-between space-y-4 shadow-sm hover:shadow-lg transition-all"
                    >
                      <div className="space-y-3">
                        {/* Status & Rating */}
                        <div className="flex items-center justify-between gap-2">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                            BMDC Verified
                          </span>
                          <div className="flex items-center gap-1 text-slate-800 text-xs font-bold">
                            <Star size={13} className="text-amber-500 fill-amber-500" />
                            <span>{rating}</span>
                            <span className="text-slate-400 font-normal text-[11px]">({ratingCount})</span>
                          </div>
                        </div>

                        {/* Doctor Avatar & Name */}
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-teal-800 text-white flex items-center justify-center font-black text-lg shadow-md shrink-0">
                            {name.replace(/^Dr\.\s*|^(Asst\.|Assoc\.|Prof\.)\s*/gi, "").trim()[0] || "D"}
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-black text-sm text-slate-900 line-clamp-1 flex items-center gap-1" title={name}>
                              {name}
                            </h4>
                            <span className="inline-block text-[10px] font-bold text-teal-800 bg-teal-50 border border-teal-200/80 px-2 py-0.5 rounded-md mt-0.5">
                              {primarySpecialty}
                            </span>
                            <p className="text-[11px] text-slate-400 font-medium line-clamp-1 mt-0.5">
                              {education} • {expYears}+ yrs
                            </p>
                          </div>
                        </div>

                        {/* Chamber & Location */}
                        <div className="space-y-1 text-xs text-slate-500 pt-2 border-t border-slate-100">
                          <div className="flex items-center gap-1.5 text-slate-700 font-semibold text-[11px]">
                            <MapPin size={12} className="text-teal-600 shrink-0" />
                            <span className="line-clamp-1" title={chamber}>
                              {chamber}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 pl-4 truncate">
                            {locationText}
                          </p>
                        </div>

                        {/* Key Focus Tags */}
                        {concentrations.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-1">
                            {concentrations.slice(0, 2).map((c, i) => (
                              <span
                                key={i}
                                className="px-1.5 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-medium rounded-md truncate max-w-[120px]"
                                title={c}
                              >
                                {c}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Fee & Action */}
                      <div className="pt-2 border-t border-slate-100 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-500 font-medium">Consultation:</span>
                          <span className="text-sm font-black text-slate-900">৳ {fee}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewDetails(doc)}
                            className="flex-1 py-2 px-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <Info size={13} className="text-teal-700" />
                            <span>Details</span>
                          </button>
                          <button
                            onClick={() => handleOpenBooking(doc)}
                            className="flex-1 py-2 px-2 bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1 shadow-sm cursor-pointer"
                          >
                            <Calendar size={13} />
                            <span>Book</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="modern-card p-8 rounded-2xl text-center space-y-3 bg-white border border-slate-100">
                <p className="text-slate-600 font-semibold text-sm">
                  No specialists matched your current filter criteria.
                </p>
                <p className="text-xs text-slate-400">
                  Try clearing your search query or selecting &apos;All Bangladesh&apos;.
                </p>
                <button
                  onClick={() => {
                    setSymptoms("");
                    setSelectedSpecialty("All");
                    setSelectedLocation("All Bangladesh");
                    setActiveChip(null);
                  }}
                  className="px-4 py-2 bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold text-xs rounded-xl transition cursor-pointer"
                >
                  Reset Filters &amp; Show Top Specialists
                </button>
              </div>
            )}
          </div>

          {/* Doctor Trust & Verification Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-10 max-w-5xl mx-auto">
            <div className="p-3.5 rounded-2xl bg-white/80 border border-slate-100 flex items-center gap-2.5 shadow-sm">
              <div className="p-2 bg-teal-50 text-teal-700 rounded-xl">
                <ShieldCheck size={18} />
              </div>
              <div>
                <p className="text-xs font-black text-slate-900">BMDC Verified</p>
                <p className="text-[11px] text-slate-500">6,500+ Registered Doctors</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/80 border border-slate-100 flex items-center gap-2.5 shadow-sm">
              <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
                <Zap size={18} />
              </div>
              <div>
                <p className="text-xs font-black text-slate-900">Instant Matching</p>
                <p className="text-[11px] text-slate-500">By Disease &amp; District</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/80 border border-slate-100 flex items-center gap-2.5 shadow-sm">
              <div className="p-2 bg-amber-50 text-amber-700 rounded-xl">
                <Clock size={18} />
              </div>
              <div>
                <p className="text-xs font-black text-slate-900">Zero Wait Time</p>
                <p className="text-[11px] text-slate-500">Direct Confirmed Slots</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/80 border border-slate-100 flex items-center gap-2.5 shadow-sm">
              <div className="p-2 bg-rose-50 text-rose-700 rounded-xl">
                <Star size={18} />
              </div>
              <div>
                <p className="text-xs font-black text-slate-900">Real Patient Ratings</p>
                <p className="text-[11px] text-slate-500">Verified Treatment Reviews</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. EMERGENCY BLOOD & ORGAN DONATION HIGHLIGHT */}
      <section className="container max-w-7xl mx-auto px-4">
        <div
          className="relative overflow-hidden rounded-3xl p-7 sm:p-10 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl border border-rose-800/50"
          style={{ background: "linear-gradient(135deg, #4c0519 0%, #881337 50%, #0f172a 100%)" }}
        >
          {/* Ambient Glows */}
          <div className="absolute -top-10 right-10 w-72 h-72 bg-rose-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 left-10 w-60 h-60 bg-red-600/20 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 space-y-3 max-w-xl text-center md:text-left">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-black tracking-wider uppercase bg-rose-950/80 text-rose-200 border border-rose-600/60 shadow-inner">
              <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
              <Droplet size={14} className="text-rose-300" />
              <span>Emergency Network</span>
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white leading-tight drop-shadow-sm">
              Urgent Blood &amp; Organ Donation Portal
            </h2>
            <p className="text-rose-100/95 text-xs sm:text-sm leading-relaxed">
              Connect with nearby eligible donors across all 8 blood groups or post an emergency
              hospital requirement in minutes.
            </p>
          </div>

          <div className="relative z-10 flex flex-wrap gap-3 shrink-0 justify-center md:justify-end">
            <Link
              to="/blood"
              className="px-6 py-3.5 bg-white text-rose-950 hover:bg-rose-50 font-black text-xs sm:text-sm rounded-xl shadow-lg transition-transform hover:-translate-y-0.5 cursor-pointer"
            >
              Request Blood / Find Donors
            </Link>
            <Link
              to="/blood"
              className="px-6 py-3.5 bg-rose-900/90 hover:bg-rose-800 text-white font-black text-xs sm:text-sm rounded-xl border border-rose-500/60 transition-transform hover:-translate-y-0.5 cursor-pointer shadow-sm"
            >
              Register as Donor
            </Link>
          </div>
        </div>
      </section>

      {/* 3. HEALTHCARE LITERACY COURSES PREVIEW */}
      <section className="container max-w-7xl mx-auto px-4" id="courses-preview">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-teal-700 mb-1">
              HEALTHCARE EDUCATION
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Interactive Health Literacy Courses
            </h2>
            <p className="text-slate-500 text-sm">
              Short, structured lessons designed to help you make informed everyday health choices.
            </p>
          </div>
          <Link
            to="/courses"
            className="text-sm font-bold text-teal-800 hover:text-teal-900 flex items-center gap-1 self-start sm:self-auto"
          >
            <span>See all courses</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.slice(0, 3).map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      </section>

      {/* 4. FIRST AID & EMERGENCY REMEDIES PREVIEW */}
      <section className="container max-w-7xl mx-auto px-4" id="first-aid-preview">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-rose-700 mb-1">
              EMERGENCY PREPAREDNESS
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              First-Aid Measures &amp; Home Care
            </h2>
            <p className="text-slate-500 text-sm">
              Instant guidance on basic measures, what to avoid, and critical warning signs.
            </p>
          </div>
          <Link
            to="/first-aid"
            className="text-sm font-bold text-slate-800 hover:text-slate-950 flex items-center gap-1 self-start sm:self-auto"
          >
            <span>Open full reference list</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {firstAidTopics.slice(0, 4).map((topic) => (
            <Link
              to={`/first-aid/${topic.id}`}
              className="modern-card modern-card-hover p-5 rounded-2xl border border-slate-100 bg-white flex flex-col justify-between space-y-3 group"
              key={topic.id}
            >
              <div>
                <div className="text-2xl mb-2">{topic.icon}</div>
                <div className="text-[10px] font-extrabold uppercase tracking-wider text-teal-700">
                  {topic.category}
                </div>
                <h3 className="font-extrabold text-base text-slate-900 group-hover:text-teal-800 transition">
                  {topic.title}
                </h3>
                <p className="text-xs text-slate-500 line-clamp-2 mt-1">{topic.summary}</p>
              </div>
              <span className="text-xs font-bold text-teal-700 flex items-center gap-1 pt-2 border-t border-slate-50">
                <span>View measures</span>
                <ArrowRight size={13} className="group-hover:translate-x-0.5 transition" />
              </span>
            </Link>
          ))}
        </div>

        <div className="mt-6 p-4 rounded-2xl bg-amber-50/70 border border-amber-200/60 flex items-start gap-3">
          <ShieldCheck size={20} className="text-amber-700 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900 leading-relaxed">
            <strong>Medical Notice: </strong> First aid guides are for general education and immediate
            stabilization. Serious, worsening, or acute emergency conditions require immediate professional
            attention or hospital emergency services.
          </div>
        </div>
      </section>

      {/* Booking Modal */}
      <BookingPaymentModal
        isOpen={isBookingModalOpen}
        onClose={() => {
          setIsBookingModalOpen(false);
          setSelectedDoctorForBooking(null);
        }}
        doctor={selectedDoctorForBooking}
        initialSymptoms={symptoms}
        onSuccess={() => {
          setBookedMessage(
            `Appointment successfully booked & paid with ${
              selectedDoctorForBooking?.name ||
              selectedDoctorForBooking?.userId?.name ||
              "doctor"
            }! View details in your Dashboard.`
          );
        }}
      />

      {/* Doctor Details Profile Modal (Logged in users can see full details, guests prompted to sign in) */}
      <DoctorDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedDoctorForDetails(null);
        }}
        doctorId={selectedDoctorForDetails?._id || selectedDoctorForDetails?.id}
        initialDoctor={selectedDoctorForDetails}
        user={user}
        onBook={(doc) => {
          setIsDetailsModalOpen(false);
          handleOpenBooking(doc);
        }}
      />
    </div>
  );
}
