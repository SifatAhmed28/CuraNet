import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { MapPin, Stethoscope, Search, Sparkles, ChevronLeft, ChevronRight, Award, Clock, Info } from "lucide-react";
import StarRating from "../../components/StarRating.jsx";
import { IMAGES } from "../../data/images.js";
import { SPECIALTIES } from "../../data/specialties.js";
import { DOCTORS as FALLBACK_DOCTORS } from "../../data/doctors.js";
import api from "../../utils/api.js";
import { useAuth } from "../../context/AuthContext.jsx";
import BookingPaymentModal from "./BookingPaymentModal.jsx";
import DoctorDetailsModal from "./DoctorDetailsModal.jsx";

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
  "Cox's Bazar",
  "Kushtia",
  "Munshiganj",
  "Narsingdi",
];

export default function DoctorsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Search & Symptom state
  const [symptoms, setSymptoms] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [matched, setMatched] = useState(null);

  // Filters & Pagination State
  const [filters, setFilters] = useState({
    specialty: "All",
    location: "All Bangladesh",
    maxFee: "",
    sort: "rating",
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // UI & Data State
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [booked, setBooked] = useState("");
  const [error, setError] = useState("");

  // Booking & Stripe modal state
  const [selectedDoctorForBooking, setSelectedDoctorForBooking] = useState(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  // Doctor Details Modal state
  const [selectedDoctorForDetails, setSelectedDoctorForDetails] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const handleViewDetails = (doc) => {
    setSelectedDoctorForDetails(doc);
    setIsDetailsModalOpen(true);
  };

  // Fetch doctors from API with server-side filtering and pagination
  const fetchDoctors = useCallback(async (overrideOpts = {}) => {
    try {
      setLoading(true);
      setError("");

      const activeFilters = { ...filters, ...overrideOpts };
      const targetPage = overrideOpts.page ?? page;

      const params = new URLSearchParams();
      params.set("page", String(targetPage));
      params.set("limit", "15");

      if (activeFilters.specialty && activeFilters.specialty !== "All") {
        params.set("specialty", activeFilters.specialty);
      }
      if (activeFilters.location && activeFilters.location !== "All Bangladesh" && activeFilters.location !== "All") {
        params.set("location", activeFilters.location);
      }
      if (activeFilters.maxFee) {
        params.set("maxFee", activeFilters.maxFee);
      }
      if (activeFilters.sort) {
        params.set("sort", activeFilters.sort);
      }
      if (activeFilters.search && activeFilters.search.trim()) {
        params.set("search", activeFilters.search.trim());
      }

      const res = await api.doctors.list(params.toString());

      if (res.success && res.data) {
        setDoctors(res.data);
        setTotalCount(res.total || res.data.length);
        setTotalPages(res.pages || 1);
      } else {
        setDoctors(res.data || []);
      }
    } catch (err) {
      console.warn("API list failed, falling back to local dataset:", err.message);
      // Fallback
      setDoctors(
        FALLBACK_DOCTORS.map((d) => ({
          _id: d.id,
          name: d.name,
          specialization: [d.specialty],
          ratingAvg: d.rating,
          consultationFee: d.fee,
          clinicAddress: d.location,
          userId: { name: d.name },
          _fallbackColor: d.color,
          _fallback: true,
        }))
      );
      setTotalCount(FALLBACK_DOCTORS.length);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  // Initial query params synchronization
  useEffect(() => {
    const prefillSymptoms = searchParams.get("symptoms");
    const specPrefill = searchParams.get("specialty");
    const locPrefill = searchParams.get("location");
    const qPrefill = searchParams.get("search");

    const newFilters = { ...filters };
    if (specPrefill && specPrefill !== "All") newFilters.specialty = specPrefill;
    if (locPrefill && locPrefill !== "All Bangladesh") newFilters.location = locPrefill;
    if (qPrefill) setSearchQuery(qPrefill);

    setFilters(newFilters);

    if (prefillSymptoms) {
      setSymptoms(prefillSymptoms);
      handleMatch(prefillSymptoms);
    } else {
      fetchDoctors({ ...newFilters, search: qPrefill || "", page: 1 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle symptom AI / Rule Match
  const handleMatch = async (text) => {
    const val = typeof text === "string" ? text : symptoms;
    if (!val.trim()) return;

    try {
      setLoading(true);
      const res = await api.doctors.match(val);
      setMatched(res.matchedSpecialties || []);
      if (res.data && res.data.length > 0) {
        setDoctors(res.data);
        setTotalCount(res.total || res.data.length);
        setTotalPages(1);
        setPage(1);
      } else {
        fetchDoctors({ page: 1 });
      }
    } catch {
      // Local fallback matching
      const lower = val.toLowerCase();
      const scored = SPECIALTIES.map((s) => ({
        ...s,
        score: s.keywords.filter((k) => lower.includes(k)).length,
      }))
        .filter((s) => s.score > 0)
        .sort((a, b) => b.score - a.score);

      const m = scored.length ? scored.map((s) => s.name) : ["General Medicine"];
      setMatched(m);
      fetchDoctors({ specialty: m[0], page: 1 });
    } finally {
      setLoading(false);
    }
  };

  const matchSymptoms = (e) => {
    e.preventDefault();
    handleMatch(symptoms);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    setMatched(null);
    fetchDoctors({ search: searchQuery, page: 1 });
  };

  const handleFilterChange = (field, value) => {
    const updated = { ...filters, [field]: value };
    setFilters(updated);
    setPage(1);
    setMatched(null);
    fetchDoctors({ ...updated, page: 1, search: searchQuery });
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      fetchDoctors({ page: newPage, search: searchQuery });
      window.scrollTo({ top: 320, behavior: "smooth" });
    }
  };

  const handleBook = (doctor) => {
    if (!user) {
      navigate("/login");
      return;
    }
    setSelectedDoctorForBooking(doctor);
    setIsBookingModalOpen(true);
  };

  // Check if selectedDoctor was passed in URL query
  useEffect(() => {
    const selectedDocId = searchParams.get("selectedDoctor");
    if (selectedDocId && doctors.length > 0 && !selectedDoctorForBooking) {
      const found = doctors.find((d) => (d._id || d.id)?.toString() === selectedDocId.toString());
      if (found) {
        setSelectedDoctorForBooking(found);
        setIsBookingModalOpen(true);
      }
    }
  }, [searchParams, doctors, selectedDoctorForBooking]);

  return (
    <div className="container py-8 max-w-6xl mx-auto px-4">
      {/* Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden shadow-2xl mb-8 border border-teal-800/40 bg-gradient-to-r from-teal-950 via-teal-900 to-slate-900 text-white min-h-[220px] flex items-center">
        <img
          src={IMAGES.doctor}
          alt="Doctor Consultation"
          className="absolute inset-0 w-full h-full object-cover opacity-15 mix-blend-luminosity"
        />
        <div className="relative z-10 p-8 sm:p-12 max-w-3xl">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-teal-500/20 text-teal-200 border border-teal-400/30 mb-3 backdrop-blur-sm">
            Verified Healthcare Specialists of Bangladesh
          </span>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white mb-2">
            Find the Best Doctors Across Bangladesh
          </h2>
          <p className="text-teal-100/90 text-sm sm:text-base leading-relaxed">
            Discover over 6,500+ verified specialists across Dhaka, Chittagong, Rajshahi, Bogura, Barisal, and all divisions. Match by symptoms, condition, or chamber.
          </p>
        </div>
      </div>

      {/* Symptom AI Match Form */}
      <form
        onSubmit={matchSymptoms}
        className="relative rounded-3xl bg-white/95 backdrop-blur-xl border border-teal-100 shadow-xl shadow-teal-950/5 p-4 sm:p-5 mb-6 flex flex-col sm:flex-row gap-3 items-center"
      >
        <div className="relative flex-1 w-full flex items-center group">
          <div className="absolute left-3.5 p-2 rounded-xl bg-teal-50 text-teal-700 border border-teal-100 pointer-events-none group-focus-within:bg-teal-700 group-focus-within:text-white transition-colors">
            <Stethoscope size={18} />
          </div>
          <input
            className="w-full pl-14 pr-10 py-3.5 bg-slate-50/80 hover:bg-slate-50 focus:bg-white text-sm font-semibold text-slate-900 placeholder:text-slate-400 placeholder:font-normal rounded-2xl border border-slate-200 focus:border-teal-700 focus:ring-4 focus:ring-teal-700/10 transition-all outline-none"
            placeholder="Describe your symptoms — e.g. severe chest pain, skin allergy, knee swelling, migraine headache..."
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
          />
          {symptoms && (
            <button
              type="button"
              onClick={() => {
                setSymptoms("");
                setMatched(null);
                fetchDoctors({ page: 1 });
              }}
              className="absolute right-3 p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition cursor-pointer"
              title="Clear"
            >
              <span className="text-xs font-bold px-1.5">✕</span>
            </button>
          )}
        </div>
        <button
          type="submit"
          className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-teal-700 via-teal-800 to-emerald-700 hover:from-teal-800 hover:to-emerald-800 text-white text-sm font-black rounded-2xl shadow-glow cursor-pointer whitespace-nowrap transition transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
        >
          <Sparkles size={16} />
          <span>Match Specialist</span>
        </button>
      </form>

      {/* Quick Location Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-thin text-xs">
        <span className="text-slate-500 font-bold whitespace-nowrap pl-1 flex items-center gap-1">
          <MapPin size={13} className="text-teal-600" /> Cities:
        </span>
        {BANGLADESH_CITIES.map((city) => (
          <button
            key={city}
            onClick={() => handleFilterChange("location", city)}
            className={`px-3 py-1.5 rounded-full font-bold transition whitespace-nowrap cursor-pointer ${
              filters.location === city
                ? "bg-teal-700 text-white shadow-sm"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            {city}
          </button>
        ))}
      </div>

      {booked && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-2xl text-sm font-semibold flex items-center gap-2 shadow-sm animate-fadeIn">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
          {booked}
        </div>
      )}
      {error && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-300 text-rose-800 rounded-2xl text-sm font-semibold flex items-center gap-2 shadow-sm animate-fadeIn">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-600" />
          {error}
        </div>
      )}

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <aside className="lg:col-span-1 space-y-6">
          <div className="modern-card p-6 rounded-2xl space-y-5 sticky top-24">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-base text-slate-900">
                Filter Doctors
              </h3>
              {(filters.specialty !== "All" || filters.location !== "All Bangladesh" || filters.maxFee || searchQuery || matched) && (
                <button
                  onClick={() => {
                    setFilters({ specialty: "All", location: "All Bangladesh", maxFee: "", sort: "rating" });
                    setSearchQuery("");
                    setMatched(null);
                    setPage(1);
                    fetchDoctors({ specialty: "All", location: "All Bangladesh", maxFee: "", sort: "rating", search: "", page: 1 });
                  }}
                  className="text-xs text-teal-600 hover:text-teal-800 font-bold cursor-pointer"
                >
                  Reset All
                </button>
              )}
            </div>

            {/* Keyword Search */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Doctor / Chamber / Disease
              </label>
              <form onSubmit={handleSearchSubmit} className="relative">
                <input
                  style={{ paddingLeft: "36px" }}
                  className="modern-input text-xs py-2.5 w-full"
                  placeholder="e.g. Heart, Prof. Nurun, Asthma..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search size={14} className="absolute left-3 top-3 text-slate-400 pointer-events-none" />
              </form>
            </div>

            {/* Specialty Filter */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Specialty
              </label>
              <select
                className="modern-input text-xs py-2.5 cursor-pointer"
                value={filters.specialty}
                onChange={(e) => handleFilterChange("specialty", e.target.value)}
              >
                <option value="All">All Specialties</option>
                {SPECIALTIES.map((s) => (
                  <option key={s.id} value={s.name}>{s.name}</option>
                ))}
              </select>
            </div>

            {/* City / Area Filter */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Location in Bangladesh
              </label>
              <select
                className="modern-input text-xs py-2.5 cursor-pointer"
                value={filters.location}
                onChange={(e) => handleFilterChange("location", e.target.value)}
              >
                {BANGLADESH_CITIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Sort Order */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Sort By
              </label>
              <select
                className="modern-input text-xs py-2.5 cursor-pointer"
                value={filters.sort}
                onChange={(e) => handleFilterChange("sort", e.target.value)}
              >
                <option value="rating">Best Rated</option>
                <option value="experience">Most Experienced</option>
                <option value="fee_asc">Consultation Fee: Low to High</option>
                <option value="fee_desc">Consultation Fee: High to Low</option>
              </select>
            </div>

            {/* Max Fee */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Max Consultation Fee (৳)
              </label>
              <input
                type="number"
                className="modern-input text-xs py-2.5"
                placeholder="e.g. 1200"
                value={filters.maxFee}
                onChange={(e) => handleFilterChange("maxFee", e.target.value)}
              />
            </div>

            {matched && (
              <button
                onClick={() => {
                  setMatched(null);
                  fetchDoctors({ page: 1 });
                }}
                className="w-full py-2.5 text-xs font-bold text-teal-700 hover:text-teal-900 bg-teal-50 hover:bg-teal-100 rounded-xl transition cursor-pointer"
              >
                Clear Symptom Match
              </button>
            )}
          </div>
        </aside>

        {/* Doctors Listing Area */}
        <div className="lg:col-span-3 space-y-4">
          {/* Status Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs">
            <span className="text-slate-700 font-semibold">
              {matched ? (
                <>Matched condition: <strong className="text-teal-900 font-bold">{matched.join(", ")}</strong></>
              ) : (
                <>Showing <strong className="text-slate-900 font-bold">{doctors.length}</strong> of <strong className="text-teal-900 font-bold">{totalCount.toLocaleString()}</strong> verified doctors</>
              )}
              {filters.location !== "All Bangladesh" && ` in ${filters.location}`}
            </span>
            <span className="text-slate-400 font-semibold">
              Page {page} of {totalPages}
            </span>
          </div>

          {loading ? (
            <div className="text-center py-20 modern-card rounded-2xl space-y-3">
              <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-slate-500 font-semibold text-sm">Searching verified doctors across Bangladesh...</p>
            </div>
          ) : doctors.length === 0 ? (
            <div className="text-center py-20 modern-card rounded-2xl space-y-3">
              <Stethoscope size={40} className="mx-auto text-slate-300" />
              <p className="text-slate-700 font-extrabold text-base">No doctors found matching these filters.</p>
              <p className="text-slate-400 text-xs">Try selecting 'All Bangladesh', clearing filters, or searching for other medical conditions.</p>
              <button
                onClick={() => {
                  setFilters({ specialty: "All", location: "All Bangladesh", maxFee: "", sort: "rating" });
                  setSearchQuery("");
                  setMatched(null);
                  fetchDoctors({ specialty: "All", location: "All Bangladesh", maxFee: "", sort: "rating", search: "", page: 1 });
                }}
                className="mt-2 px-5 py-2 text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-xl transition"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            doctors.map((d) => {
              const name = d.name || d.userId?.name || "Specialist Doctor";
              const primarySpecialty = d.specialization?.[0] || d.specialty || "General Medicine";
              const rating = d.ratingAvg ?? d.rating ?? 4.8;
              const ratingCount = d.ratingCount ?? 20;
              const fee = d.consultationFee ?? d.fee ?? 800;
              const locationText = d.clinicAddress || d.chamber || d.location || "Bangladesh";
              const expYears = d.experienceYears || 10;
              const education = d.education || (d.qualifications ? d.qualifications.join(", ") : "");
              const concentrations = d.concentrations || [];
              const color = d._fallbackColor || "#0f766e";

              return (
                <div
                  key={d._id || d.id}
                  className="modern-card modern-card-hover p-6 rounded-2xl flex flex-col gap-4 border border-slate-200/80 transition-all hover:shadow-lg"
                >
                  <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                    {/* Doctor Info */}
                    <div className="flex items-start gap-4 flex-1">
                      <div
                        className="w-14 h-14 rounded-2xl text-white font-black text-xl flex items-center justify-center shadow-md shrink-0 mt-0.5"
                        style={{ background: color }}
                      >
                        {name.replace(/^Dr\.\s*|^(Asst\.|Assoc\.|Prof\.)\s*/gi, "").trim()[0] || "D"}
                      </div>
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-extrabold text-lg text-slate-900 tracking-tight">{name}</h4>
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-50 text-teal-800 border border-teal-200/80">
                            {primarySpecialty}
                          </span>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                            <Clock size={11} className="text-slate-500" /> {expYears}+ yrs exp
                          </span>
                        </div>

                        {education && (
                          <p className="text-xs font-semibold text-slate-500 line-clamp-1">
                            {education}
                          </p>
                        )}

                        <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-500">
                          <span className="flex items-center gap-1 text-slate-600 font-medium">
                            <MapPin size={13} className="text-teal-600 shrink-0" />
                            <span className="line-clamp-1">{locationText}</span>
                          </span>
                          <div className="flex items-center gap-1 font-bold text-slate-700">
                            <StarRating value={rating} />
                            <span className="text-slate-800">{rating}</span>
                            <span className="text-slate-400 font-normal">({ratingCount})</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Fee & Action */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100 gap-2.5 shrink-0">
                      <div className="text-left sm:text-right">
                        <span className="text-xs text-slate-400 font-semibold block">Consultation Fee</span>
                        <span className="text-xl font-black text-slate-900">৳{fee}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewDetails(d)}
                          className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition cursor-pointer whitespace-nowrap flex items-center gap-1.5"
                        >
                          <Info size={13} className="text-teal-700" />
                          <span>View Profile</span>
                        </button>
                        <button
                          onClick={() => handleBook(d)}
                          className="px-5 py-2.5 btn-gradient text-white text-xs font-bold rounded-xl shadow-glow cursor-pointer whitespace-nowrap transition transform hover:-translate-y-0.5"
                        >
                          Book Consultation
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Top Concentrations / Conditions Treated */}
                  {concentrations.length > 0 && (
                    <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-1.5">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1 flex items-center gap-1">
                        <Award size={12} className="text-amber-500" /> Focus:
                      </span>
                      {concentrations.slice(0, 4).map((c, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 bg-slate-100 hover:bg-teal-50 text-slate-600 hover:text-teal-800 rounded-lg text-[11px] font-medium transition cursor-pointer"
                          onClick={() => {
                            setSearchQuery(c);
                            setPage(1);
                            fetchDoctors({ search: c, page: 1 });
                          }}
                        >
                          {c}
                        </span>
                      ))}
                      {concentrations.length > 4 && (
                        <span className="text-[11px] text-slate-400 font-medium pl-1">
                          +{concentrations.length - 4} more conditions
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}

          {/* Pagination Navigation */}
          {totalPages > 1 && (
            <div className="modern-card p-4 rounded-2xl flex items-center justify-between gap-2 mt-6">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page <= 1}
                className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition"
              >
                <ChevronLeft size={14} /> Previous
              </button>

              <div className="flex items-center gap-1 text-xs font-bold">
                {page > 2 && (
                  <button
                    onClick={() => handlePageChange(1)}
                    className="w-8 h-8 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100"
                  >
                    1
                  </button>
                )}
                {page > 3 && <span className="px-1 text-slate-400">...</span>}
                {page > 1 && (
                  <button
                    onClick={() => handlePageChange(page - 1)}
                    className="w-8 h-8 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100"
                  >
                    {page - 1}
                  </button>
                )}
                <span className="w-8 h-8 rounded-lg bg-teal-700 text-white flex items-center justify-center shadow-sm">
                  {page}
                </span>
                {page < totalPages && (
                  <button
                    onClick={() => handlePageChange(page + 1)}
                    className="w-8 h-8 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100"
                  >
                    {page + 1}
                  </button>
                )}
                {page < totalPages - 2 && <span className="px-1 text-slate-400">...</span>}
                {page < totalPages - 1 && (
                  <button
                    onClick={() => handlePageChange(totalPages)}
                    className="w-8 h-8 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100"
                  >
                    {totalPages}
                  </button>
                )}
              </div>

              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= totalPages}
                className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition"
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Booking & Stripe Payment Modal */}
      <BookingPaymentModal
        isOpen={isBookingModalOpen}
        onClose={() => {
          setIsBookingModalOpen(false);
          setSelectedDoctorForBooking(null);
        }}
        doctor={selectedDoctorForBooking}
        initialSymptoms={symptoms}
        onSuccess={() => {
          setBooked(
            `Appointment confirmed & paid with ${
              selectedDoctorForBooking?.name || selectedDoctorForBooking?.userId?.name || "doctor"
            } — view details in Dashboard.`
          );
        }}
      />

      {/* Doctor Details Modal */}
      <DoctorDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedDoctorForDetails(null);
        }}
        doctorId={selectedDoctorForDetails?._id || selectedDoctorForDetails?.id}
        initialDoctor={selectedDoctorForDetails}
        user={user}
        onBook={(doc) => handleBook(doc)}
      />
    </div>
  );
}
