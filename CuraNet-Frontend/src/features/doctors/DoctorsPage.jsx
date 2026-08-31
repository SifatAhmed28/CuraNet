import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { MapPin } from "lucide-react";
import StarRating from "../../components/StarRating.jsx";
import { IMAGES } from "../../data/images.js";
import { SPECIALTIES } from "../../data/specialties.js";
import { DOCTORS as FALLBACK_DOCTORS } from "../../data/doctors.js";
import api from "../../utils/api.js";
import { useAuth } from "../../context/AuthContext.jsx";

export default function DoctorsPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [symptoms, setSymptoms] = useState("");
  const [matched, setMatched] = useState(null);
  const [filters, setFilters] = useState({ specialty: "All", location: "", maxFee: "" });
  const [booked, setBooked] = useState("");
  const [error, setError] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [useFallback, setUseFallback] = useState(false);

  // Fetch doctors from API
  const fetchDoctors = async (opts = {}) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      const specialty = opts.specialty ?? filters.specialty;
      const maxFee = opts.maxFee ?? filters.maxFee;
      if (specialty && specialty !== "All") params.set("specialty", specialty);
      if (maxFee) params.set("maxFee", maxFee);
      if (opts.matched) {
        // if matched from symptoms, we will filter client side OR use match endpoint
        // but list endpoint with specialty filter works; we fetch all and filter
      }
      const res = await api.doctors.list(params.toString());
      setDoctors(res.data || []);
      setUseFallback(false);
    } catch {
      setDoctors(FALLBACK_DOCTORS.map(d => ({
        _id: d.id,
        specialization: [d.specialty],
        ratingAvg: d.rating,
        consultationFee: d.fee,
        clinicAddress: d.location,
        userId: { name: d.name },
        _fallbackColor: d.color,
        _fallback: true,
      })));
      setUseFallback(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
    const prefill = searchParams.get("symptoms");
    if (prefill) {
      setSymptoms(prefill);
      handleMatch(prefill);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // refetch when filters change
    if (!matched) fetchDoctors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.specialty, filters.maxFee]);

  const handleMatch = async (text) => {
    const val = typeof text === "string" ? text : symptoms;
    if (!val.trim()) return;
    try {
      const res = await api.doctors.match(val);
      setMatched(res.matchedSpecialties || []);
      // fetch doctors for matched specialties
      if (res.data && res.data.length) {
        setDoctors(res.data);
        setUseFallback(false);
      } else {
        // fallback filter
        fetchDoctors();
      }
    } catch {
      // fallback to local matching
      const lower = val.toLowerCase();
      const scored = SPECIALTIES.map((s) => ({ ...s, score: s.keywords.filter((k) => lower.includes(k)).length }))
        .filter((s) => s.score > 0)
        .sort((a, b) => b.score - a.score);
      const m = scored.length ? scored.map((s) => s.name) : ["General Medicine"];
      setMatched(m);
    }
  };

  const matchSymptoms = (e) => {
    e.preventDefault();
    handleMatch(symptoms);
  };

  const handleBook = async (doctor) => {
    if (!user) {
      navigate("/login");
      return;
    }
    const doctorId = doctor._id || doctor.id;
    // Use fallback doctors without API: just show message
    if (doctor._fallback || useFallback) {
      setBooked(`Appointment booked with ${doctor.userId?.name || doctor.name}. (demo)`);
      setError("");
      return;
    }
    try {
      setError("");
      await api.appointments.create({
        doctorId,
        appointmentDate: new Date(Date.now() + 86400000).toISOString(),
        timeSlot: { startTime: "10:00", endTime: "10:30" },
        consultationType: "offline",
        reason: symptoms || "General consultation",
      });
      setBooked(`Appointment booked with ${doctor.userId?.name || "doctor"} — check Dashboard.`);
    } catch (err) {
      setError(err.message || "Booking failed. Please try again.");
    }
  };

  const visibleDoctors = useMemo(() => {
    let list = doctors;
    if (matched) {
      list = list.filter((d) => {
        const specs = d.specialization || [d.specialty];
        return specs.some(s => matched.includes(s));
      });
    }
    if (filters.specialty !== "All") {
      list = list.filter((d) => {
        const specs = d.specialization || [d.specialty];
        return specs.includes(filters.specialty);
      });
    }
    if (filters.location) {
      list = list.filter((d) => {
        const loc = d.clinicAddress || d.location || "";
        return loc.toLowerCase().includes(filters.location.toLowerCase());
      });
    }
    if (filters.maxFee) {
      list = list.filter((d) => (d.consultationFee ?? d.fee) <= Number(filters.maxFee));
    }
    return [...list].sort((a, b) => (b.ratingAvg ?? b.rating ?? 0) - (a.ratingAvg ?? a.rating ?? 0));
  }, [doctors, matched, filters]);

  return (
    <div className="container py-8 max-w-6xl mx-auto">
      {/* Banner */}
      <div className="relative rounded-3xl overflow-hidden shadow-xl mb-8 border border-slate-200/80 bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 text-white min-h-[200px] flex items-center">
        <img
          src={IMAGES.doctor}
          alt="Doctor Consultation"
          className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-luminosity"
        />
        <div className="relative z-10 p-8 sm:p-12 max-w-2xl">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-teal-500/20 text-teal-200 border border-teal-400/30 mb-3 backdrop-blur-sm">
            Verified Healthcare Specialists
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-2">
            Find the right doctor for your symptoms
          </h2>
          <p className="text-teal-100/90 text-sm leading-relaxed">
            CuraNet covers {SPECIALTIES.length} medical specialties end to end — match symptoms or browse doctors by location and fee.
          </p>
        </div>
      </div>

      {/* Symptom Match Form */}
      <form onSubmit={matchSymptoms} className="modern-card p-4 sm:p-5 rounded-2xl mb-8 flex flex-col sm:flex-row gap-3 items-center">
        <div className="relative flex-1 w-full">
          <input
            className="modern-input py-3.5 pl-4 text-sm"
            placeholder="Describe your symptoms — e.g. severe chest pain, shortness of breath, joint swelling..."
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
          />
        </div>
        <button
          type="submit"
          className="w-full sm:w-auto px-7 py-3.5 btn-gradient text-white text-sm font-bold rounded-xl shadow-glow cursor-pointer whitespace-nowrap"
        >
          Match Specialist
        </button>
      </form>

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

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <aside className="lg:col-span-1">
          <div className="modern-card p-6 rounded-2xl space-y-4 sticky top-24">
            <h3 className="font-extrabold text-base text-slate-900 pb-2 border-b border-slate-100">
              Filter Doctors
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Specialty
              </label>
              <select
                className="modern-input text-xs py-2.5 cursor-pointer"
                value={filters.specialty}
                onChange={(e) => setFilters({ ...filters, specialty: e.target.value })}
              >
                <option>All</option>
                {SPECIALTIES.map((s) => (
                  <option key={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Area / Location
              </label>
              <input
                className="modern-input text-xs py-2.5"
                placeholder="e.g. Dhanmondi, Gulshan"
                value={filters.location}
                onChange={(e) => setFilters({ ...filters, location: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Max Fee (৳)
              </label>
              <input
                type="number"
                className="modern-input text-xs py-2.5"
                placeholder="e.g. 1000"
                value={filters.maxFee}
                onChange={(e) => setFilters({ ...filters, maxFee: e.target.value })}
              />
            </div>

            {matched && (
              <button
                onClick={() => {
                  setMatched(null);
                  fetchDoctors();
                }}
                className="w-full py-2 text-xs font-bold text-teal-700 hover:text-teal-900 bg-teal-50 hover:bg-teal-100 rounded-xl transition cursor-pointer"
              >
                Clear Symptom Match
              </button>
            )}
          </div>
        </aside>

        {/* Doctors List */}
        <div className="lg:col-span-3 space-y-4">
          {matched && (
            <div className="p-3 bg-teal-50/70 border border-teal-200/80 rounded-2xl text-xs text-slate-700 flex items-center justify-between">
              <span>
                Matching condition: <strong className="text-teal-900 font-bold">{matched.join(", ")}</strong>
              </span>
              <span className="text-slate-400 font-semibold">{visibleDoctors.length} available</span>
            </div>
          )}

          {loading ? (
            <div className="text-center py-16 text-slate-400 font-medium">
              Loading verified doctors...
            </div>
          ) : visibleDoctors.length === 0 ? (
            <div className="text-center py-16 modern-card rounded-2xl">
              <p className="text-slate-500 font-semibold">No doctors found matching these filters.</p>
            </div>
          ) : (
            visibleDoctors.map((d) => {
              const name = d.userId?.name || d.name;
              const specialty = (d.specialization?.[0] || d.specialty);
              const rating = d.ratingAvg ?? d.rating ?? 0;
              const fee = d.consultationFee ?? d.fee;
              const location = d.clinicAddress || d.location || "";
              const color = d._fallbackColor || "#0f766e";

              return (
                <div
                  key={d._id || d.id}
                  className="modern-card modern-card-hover p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="w-14 h-14 rounded-2xl text-white font-extrabold text-xl flex items-center justify-center shadow-md shrink-0"
                      style={{ background: color }}
                    >
                      {name?.split(" ")[1]?.[0] || name?.[0] || "D"}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-lg text-slate-900 tracking-tight">{name}</h4>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-50 text-teal-800 border border-teal-200">
                          {specialty}
                        </span>
                        <StarRating value={rating} />
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <MapPin size={13} className="text-slate-400" /> {location}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100 gap-3">
                    <span className="text-lg font-black text-slate-900">৳{fee}</span>
                    <button
                      onClick={() => handleBook(d)}
                      className="px-5 py-2.5 btn-gradient text-white text-xs font-bold rounded-xl shadow-glow cursor-pointer whitespace-nowrap"
                    >
                      Book Consultation
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

