import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  MessageCircle,
  X,
  Send,
  Paperclip,
  Film,
  ChevronRight,
  Bot,
  MapPin,
  Compass,
  AlertOctagon,
  Sparkles,
  Calendar,
  Star,
  Activity,
  CheckCircle2,
} from "lucide-react";
import { SPECIALTIES } from "../../data/specialties.js";
import { DOCTORS } from "../../data/doctors.js";
import api from "../../utils/api.js";

// Standard coordinates for Dhaka & Bangladesh hubs
const AREA_COORDINATES = {
  "dhanmondi": { lat: 23.7465, lng: 90.3753, label: "Dhanmondi, Dhaka" },
  "gulshan": { lat: 23.7925, lng: 90.4125, label: "Gulshan, Dhaka" },
  "banani": { lat: 23.7937, lng: 90.4043, label: "Banani, Dhaka" },
  "uttara": { lat: 23.8759, lng: 90.3978, label: "Uttara, Dhaka" },
  "mirpur": { lat: 23.8065, lng: 90.3657, label: "Mirpur, Dhaka" },
  "mohammadpur": { lat: 23.7658, lng: 90.3610, label: "Mohammadpur, Dhaka" },
  "bashundhara": { lat: 23.8151, lng: 90.4328, label: "Bashundhara, Dhaka" },
  "chittagong": { lat: 22.3569, lng: 91.7832, label: "Chittagong Central" },
};

// Emergency keywords that warrant immediate clinical attention
const EMERGENCY_KEYWORDS = [
  "chest pain", "pressure in chest", "heart attack", "shortness of breath",
  "difficulty breathing", "unconscious", "fainting", "fainted", "paralysis",
  "facial drooping", "stroke", "severe bleeding", "coughing blood", "seizure",
  "poison", "anaphylaxis", "severe allergic"
];

// High severity symptom indicators
const HIGH_SEVERITY_KEYWORDS = [
  "severe", "unbearable", "high fever", "intense", "sharp pain", "bleeding",
  "cannot walk", "vision loss", "projectile vomit", "extreme weakness"
];

function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

function getDoctorCoords(doc) {
  if (doc.location?.coordinates && Array.isArray(doc.location.coordinates)) {
    return { lng: doc.location.coordinates[0], lat: doc.location.coordinates[1] };
  }
  const locStr = String(doc.location || "").toLowerCase();
  for (const [key, coords] of Object.entries(AREA_COORDINATES)) {
    if (locStr.includes(key)) return coords;
  }
  return { lat: 23.7808, lng: 90.4192 };
}

function measureSymptoms(text) {
  const lower = text.toLowerCase();

  // 1. Check emergency
  const isEmergency = EMERGENCY_KEYWORDS.some(k => lower.includes(k));

  // 2. Measure severity
  let severity = "Mild";
  const highHits = HIGH_SEVERITY_KEYWORDS.filter(k => lower.includes(k)).length;
  if (isEmergency) severity = "Critical / Emergency";
  else if (highHits >= 2) severity = "Acute / High";
  else if (highHits === 1 || lower.includes("moderate") || lower.includes("days") || lower.includes("fever")) {
    severity = "Moderate";
  }

  // 3. Specialty scoring
  const scored = SPECIALTIES.map((s) => ({
    ...s,
    score: s.keywords.filter((k) => lower.includes(k)).length,
  }))
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score);

  return {
    isEmergency,
    severity,
    matchedSpecialties: scored.map(s => s.name),
    topMatch: scored[0]?.name || "General Medicine",
  };
}

let attachmentId = 0;
let messageId = 0;

export default function SymptomChatbot() {
  const [open, setOpen] = useState(false);
  const [patientLocation, setPatientLocation] = useState({
    name: "Dhanmondi, Dhaka",
    lat: 23.7465,
    lng: 90.3753,
  });
  const [detectingGps, setDetectingGps] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: "greet",
      from: "bot",
      text: "Hello! I am your CuraNet Medical & Geospatial Assistant. Describe your symptoms, and I will measure the severity and recommend the nearest verified doctors to your location.",
      quickSuggestions: [
        "Chest tightness & shortness of breath",
        "Severe knee pain after running",
        "Child high fever & cough",
        "Itchy red skin rash",
        "Persistent headache & dizziness",
      ],
    },
  ]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState([]);
  const [typing, setTyping] = useState(false);
  const [historyText, setHistoryText] = useState("");
  const fileInputRef = useRef(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, typing, open]);

  // Request browser geolocation on open
  const detectLocation = () => {
    if (!navigator.geolocation) return;
    setDetectingGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPatientLocation({
          name: "Current GPS Location",
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setDetectingGps(false);
      },
      () => {
        setDetectingGps(false);
      },
      { timeout: 8000 }
    );
  };

  const handleFiles = (fileList) => {
    const files = Array.from(fileList || []).filter(
      (f) => f.type.startsWith("image/") || f.type.startsWith("video/")
    );
    const next = files.map((f) => ({
      id: `att-${attachmentId++}`,
      url: URL.createObjectURL(f),
      type: f.type.startsWith("video/") ? "video" : "image",
      name: f.name,
    }));
    setPending((p) => [...p, ...next]);
  };

  const removePending = (id) => {
    setPending((p) => {
      const found = p.find((a) => a.id === id);
      if (found) URL.revokeObjectURL(found.url);
      return p.filter((a) => a.id !== id);
    });
  };

  const processUserInput = async (textToSend) => {
    const text = textToSend.trim();
    if (!text && pending.length === 0) return;

    const userMsg = { id: `m-${messageId++}`, from: "user", text, attachments: pending };
    setMessages((m) => [...m, userMsg]);
    const combined = `${historyText} ${text}`.trim();
    setHistoryText(combined);
    setInput("");
    setPending([]);
    setTyping(true);

    // Measure symptoms
    const analysis = measureSymptoms(combined);

    // Fetch doctors from API or fallback dataset
    let doctorsPool = [];
    try {
      const res = await api.doctors.list();
      if (res.data && res.data.length > 0) {
        doctorsPool = res.data.map(d => ({
          id: d._id,
          name: d.userId?.name || "Dr. Specialist",
          specialty: Array.isArray(d.specialization) ? d.specialization[0] : d.specialization,
          rating: d.ratingAvg || 4.8,
          fee: d.consultationFee || 800,
          clinicName: d.clinicName || "CuraNet Clinic",
          location: d.clinicAddress || "Dhaka",
          rawCoords: getDoctorCoords(d),
        }));
      }
    } catch {
      /* fallback */
    }

    if (!doctorsPool.length) {
      doctorsPool = DOCTORS.map(d => ({
        ...d,
        rawCoords: getDoctorCoords(d),
      }));
    }

    // Compute distance for all doctors
    const doctorsWithDistance = doctorsPool.map(d => {
      const dist = calculateDistanceKm(
        patientLocation.lat,
        patientLocation.lng,
        d.rawCoords.lat,
        d.rawCoords.lng
      );
      return { ...d, distanceKm: dist };
    });

    // Filter & rank doctors by specialty match and proximity
    let filteredDoctors = doctorsWithDistance;
    if (analysis.matchedSpecialties.length > 0) {
      filteredDoctors = doctorsWithDistance.filter(d =>
        analysis.matchedSpecialties.some(spec =>
          d.specialty?.toLowerCase().includes(spec.toLowerCase()) ||
          spec.toLowerCase().includes(d.specialty?.toLowerCase())
        )
      );
    }

    if (!filteredDoctors.length) {
      filteredDoctors = doctorsWithDistance;
    }

    // Sort by proximity distance first, then rating
    filteredDoctors.sort((a, b) => {
      if (a.distanceKm !== null && b.distanceKm !== null) {
        return a.distanceKm - b.distanceKm;
      }
      return b.rating - a.rating;
    });

    const topRanked = filteredDoctors.slice(0, 3);

    setTimeout(() => {
      const reply = {
        id: `m-${messageId++}`,
        from: "bot",
        analysis,
        patientLocName: patientLocation.name,
        doctors: topRanked,
        combined,
      };

      setMessages((m) => [...m, reply]);
      setTyping(false);
    }, 600);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      processUserInput(input);
    }
  };

  return (
    <>
      {/* Floating Launcher Button */}
      <button
        className="chatbot-toggle shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close symptom assistant" : "Open symptom assistant"}
      >
        {open ? <X size={22} /> : <MessageCircle size={22} className="animate-bounce" />}
      </button>

      {/* Chatbot Window */}
      {open && (
        <div className="chatbot-panel shadow-2xl rounded-3xl overflow-hidden border border-slate-200/80 bg-white/95 backdrop-blur-lg flex flex-col animate-fadeIn">
          {/* Header */}
          <div className="bg-gradient-to-r from-teal-800 via-teal-700 to-emerald-700 text-white p-4 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center shadow-inner">
                <Bot size={20} className="text-teal-100" />
              </div>
              <div>
                <div className="font-extrabold text-sm tracking-tight flex items-center gap-1.5">
                  CuraNet AI Assistant
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                </div>
                <div className="text-[11px] text-teal-200 font-medium">
                  Symptom Triage &amp; Distance Match
                </div>
              </div>
            </div>
            <button
              className="text-white/80 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition cursor-pointer"
              onClick={() => setOpen(false)}
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>

          {/* Location Bar */}
          <div className="bg-slate-50 border-b border-slate-200/70 px-3.5 py-2 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-slate-700 font-semibold truncate">
              <MapPin size={14} className="text-rose-500 shrink-0" />
              <span className="truncate">Your location: <strong>{patientLocation.name}</strong></span>
            </div>
            <button
              onClick={detectLocation}
              disabled={detectingGps}
              className="text-[11px] font-bold text-teal-700 hover:text-teal-900 bg-teal-50 hover:bg-teal-100/80 border border-teal-200/80 rounded-lg px-2 py-1 flex items-center gap-1 transition shrink-0 cursor-pointer"
            >
              <Compass size={12} className={detectingGps ? "animate-spin" : ""} />
              {detectingGps ? "Locating..." : "Use GPS"}
            </button>
          </div>

          {/* Quick Location Chips */}
          <div className="bg-white/80 border-b border-slate-100 px-3 py-1.5 flex gap-1.5 overflow-x-auto text-[11px] no-scrollbar">
            {Object.entries(AREA_COORDINATES).slice(0, 5).map(([k, c]) => (
              <button
                key={k}
                onClick={() => setPatientLocation({ name: c.label, lat: c.lat, lng: c.lng })}
                className={`px-2 py-0.5 rounded-md whitespace-nowrap font-medium transition cursor-pointer ${
                  patientLocation.name.toLowerCase().includes(k)
                    ? "bg-teal-600 text-white font-bold"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {c.label.split(",")[0]}
              </button>
            ))}
          </div>

          {/* Messages Area */}
          <div className="chatbot-messages flex-1 p-4 overflow-y-auto space-y-4" ref={scrollRef}>
            {messages.map((m) => (
              <div key={m.id} className={`chatbot-msg chatbot-msg-${m.from} space-y-2`}>
                {m.text && <p className="leading-relaxed text-sm">{m.text}</p>}

                {/* Quick Suggestion Chips */}
                {m.quickSuggestions && (
                  <div className="pt-2 flex flex-col gap-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Tap a common condition:
                    </span>
                    {m.quickSuggestions.map((sug, i) => (
                      <button
                        key={i}
                        onClick={() => processUserInput(sug)}
                        className="text-left text-xs p-2 bg-teal-50/80 hover:bg-teal-100/90 text-teal-900 rounded-xl border border-teal-200/60 font-medium transition flex items-center justify-between group cursor-pointer"
                      >
                        <span>{sug}</span>
                        <ChevronRight size={13} className="text-teal-600 group-hover:translate-x-0.5 transition" />
                      </button>
                    ))}
                  </div>
                )}

                {/* Symptom Measurement Card */}
                {m.analysis && (
                  <div className="mt-2 space-y-2.5">
                    {m.analysis.isEmergency ? (
                      <div className="p-3 bg-rose-50 border border-rose-300 rounded-2xl text-rose-900 flex items-start gap-2.5">
                        <AlertOctagon size={20} className="text-rose-600 shrink-0 mt-0.5" />
                        <div>
                          <strong className="block text-xs font-bold text-rose-700 uppercase tracking-wide">
                            Emergency Warning Signs Detected
                          </strong>
                          <p className="text-xs text-rose-800 mt-0.5">
                            Symptoms like chest pressure or breathing distress require immediate emergency medical care. Call 999 or go to the nearest emergency hospital.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 bg-teal-50/70 border border-teal-200/80 rounded-2xl">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="font-bold text-slate-600">Measured Severity:</span>
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-teal-600 text-white">
                            {m.analysis.severity}
                          </span>
                        </div>
                        <div className="text-xs text-slate-600">
                          Primary Recommended Specialty: <strong className="text-teal-800">{m.analysis.topMatch}</strong>
                        </div>
                      </div>
                    )}

                    {/* Nearest Recommended Doctors List */}
                    <div className="space-y-2 pt-1">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                        <span className="flex items-center gap-1">
                          <Activity size={14} className="text-teal-600" /> Nearest Verified Specialists:
                        </span>
                        <span className="text-[10px] text-slate-400">Sorted by distance</span>
                      </div>

                      {m.doctors.map((d) => (
                        <div
                          key={d.id}
                          className="p-3 bg-white hover:bg-slate-50 border border-slate-200/90 hover:border-teal-400 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 flex flex-col gap-2"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h4 className="font-bold text-sm text-slate-900">{d.name}</h4>
                              <p className="text-xs text-teal-700 font-semibold">{d.specialty} • {d.clinicName}</p>
                            </div>
                            {d.distanceKm !== null && (
                              <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0 flex items-center gap-1">
                                <MapPin size={10} /> {d.distanceKm} km away
                              </span>
                            )}
                          </div>

                          <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100 text-slate-500">
                            <span className="flex items-center gap-1 font-semibold text-amber-600">
                              <Star size={13} fill="#d97706" /> {d.rating}
                            </span>
                            <span className="font-bold text-slate-800">৳{d.fee} Fee</span>
                            <Link
                              to={`/doctors?specialty=${encodeURIComponent(d.specialty)}`}
                              onClick={() => setOpen(false)}
                              className="px-2.5 py-1 bg-teal-700 hover:bg-teal-800 text-white font-bold text-[11px] rounded-lg shadow-sm flex items-center gap-1 transition"
                            >
                              <Calendar size={12} /> Book Now
                            </Link>
                          </div>
                        </div>
                      ))}

                      <Link
                        to={`/doctors?symptoms=${encodeURIComponent(m.combined)}`}
                        onClick={() => setOpen(false)}
                        className="block text-center py-2 bg-slate-100 hover:bg-teal-50 text-teal-800 text-xs font-bold rounded-xl transition mt-1"
                      >
                        View all matching specialists &amp; map →
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {typing && (
              <div className="chatbot-msg chatbot-msg-bot chatbot-typing p-3 rounded-2xl bg-teal-50/80 inline-flex items-center gap-1">
                <span className="pulse-icon chatbot-dot" />
                <span className="pulse-icon chatbot-dot chatbot-dot-2" />
                <span className="pulse-icon chatbot-dot chatbot-dot-3" />
                <span className="text-xs font-medium text-teal-800 ml-1">Measuring symptoms &amp; calculating distance...</span>
              </div>
            )}
          </div>

          {/* Pending Attachments */}
          {pending.length > 0 && (
            <div className="chatbot-pending p-2 bg-slate-100/90 border-t border-slate-200 flex gap-2 overflow-x-auto">
              {pending.map((a) => (
                <div key={a.id} className="chatbot-pending-item relative rounded-lg overflow-hidden border border-slate-300 shrink-0">
                  {a.type === "image" ? (
                    <img src={a.url} alt="Pending" className="w-12 h-12 object-cover" />
                  ) : (
                    <div className="w-12 h-12 bg-slate-800 flex items-center justify-center text-white">
                      <Film size={18} />
                    </div>
                  )}
                  <button
                    onClick={() => removePending(a.id)}
                    className="absolute top-0 right-0 bg-rose-600 text-white p-0.5 rounded-bl"
                    aria-label="Remove attachment"
                  >
                    <X size={10} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Input Footer */}
          <div className="p-3 bg-white border-t border-slate-200/80 flex items-center gap-2">
            <button
              type="button"
              className="p-2 text-slate-400 hover:text-teal-700 hover:bg-slate-100 rounded-xl transition cursor-pointer shrink-0"
              onClick={() => fileInputRef.current?.click()}
              title="Attach symptom photo or video"
            >
              <Paperclip size={18} />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              multiple
              hidden
              onChange={(e) => {
                handleFiles(e.target.files);
                e.target.value = "";
              }}
            />
            <input
              type="text"
              className="flex-1 modern-input py-2 text-xs placeholder:text-slate-400"
              placeholder="Describe symptoms (e.g. severe knee pain, fever)..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button
              type="button"
              disabled={!input.trim() && pending.length === 0}
              className="p-2.5 btn-gradient text-white rounded-xl shadow-sm disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shrink-0"
              onClick={() => processUserInput(input)}
              aria-label="Send message"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
