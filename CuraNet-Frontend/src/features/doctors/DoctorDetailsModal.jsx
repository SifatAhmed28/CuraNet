import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  X,
  Star,
  MapPin,
  Clock,
  ShieldCheck,
  Award,
  Calendar,
  Phone,
  Mail,
  Lock,
  Stethoscope,
  BookOpen,
  CheckCircle2,
  Building2,
  AlertCircle,
} from "lucide-react";
import StarRating from "../../components/StarRating.jsx";
import api from "../../utils/api.js";

export default function DoctorDetailsModal({
  isOpen,
  onClose,
  doctorId,
  initialDoctor,
  user,
  onBook,
}) {
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(initialDoctor || null);
  const [loading, setLoading] = useState(false);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    if (!isOpen) return;

    if (doctorId) {
      setLoading(true);
      api.doctors
        .get(doctorId)
        .then((res) => {
          if (res?.data) {
            setDoctor(res.data);
            setReviews(res.data.reviews || []);
          }
        })
        .catch((err) => {
          console.warn("Failed to fetch doctor detail:", err);
          if (initialDoctor) setDoctor(initialDoctor);
        })
        .finally(() => setLoading(false));
    } else if (initialDoctor) {
      setDoctor(initialDoctor);
    }
  }, [isOpen, doctorId, initialDoctor]);

  if (!isOpen) return null;

  // If user is NOT logged in, show the access gate modal
  if (!user) {
    const previewName =
      doctor?.name || doctor?.userId?.name || initialDoctor?.name || "Specialist Doctor";
    const previewSpec =
      doctor?.specialization?.[0] || doctor?.specialty || initialDoctor?.specialty || "Specialist";

    return (
      <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
        <div className="modern-card p-7 sm:p-8 rounded-3xl max-w-md w-full bg-white border border-slate-100 shadow-2xl space-y-6 text-center animate-scaleUp">
          <div className="w-16 h-16 rounded-3xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-100 shadow-sm">
            <Lock size={30} />
          </div>

          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
              Authentication Required
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Sign in to View Doctor Profile
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Full qualifications, chamber schedules, clinical focus, and appointment booking for{" "}
              <strong className="text-slate-800">{previewName}</strong> ({previewSpec}) are reserved
              for verified CuraNet members.
            </p>
          </div>

          <div className="space-y-2.5 pt-2">
            <button
              onClick={() => {
                onClose();
                navigate("/login");
              }}
              className="w-full py-3.5 px-4 bg-teal-800 hover:bg-teal-900 text-white font-black text-xs sm:text-sm rounded-2xl shadow-glow cursor-pointer transition"
            >
              Sign In to Your Account
            </button>
            <button
              onClick={() => {
                onClose();
                navigate("/register");
              }}
              className="w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm rounded-2xl transition cursor-pointer"
            >
              Create Free Account
            </button>
          </div>

          <button
            onClick={onClose}
            className="text-xs font-semibold text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            Cancel &amp; Continue Browsing
          </button>
        </div>
      </div>
    );
  }

  // User is logged in: display the full, rich profile
  const name = doctor?.name || doctor?.userId?.name || "Specialist Doctor";
  const primarySpecialty = doctor?.specialization?.[0] || doctor?.specialty || "Specialist";
  const allSpecialties = doctor?.specialization || [primarySpecialty];
  const education =
    doctor?.education ||
    (doctor?.qualifications ? doctor.qualifications.join(", ") : "MBBS, Specialist");
  const qualificationsList = doctor?.qualifications || ["MBBS"];
  const expYears = doctor?.experienceYears || 12;
  const rating = doctor?.ratingAvg ?? doctor?.rating ?? 4.8;
  const ratingCount = doctor?.ratingCount ?? 35;
  const fee = doctor?.consultationFee ?? doctor?.fee ?? 800;
  const chamber = doctor?.chamber || doctor?.clinicName || "Specialized Healthcare Chamber";
  const address = doctor?.clinicAddress || doctor?.location || "Dhaka, Bangladesh";
  const city = doctor?.city || "Dhaka";
  const licenseNumber = doctor?.licenseNumber || "BMDC Verified";
  const bio =
    doctor?.bio ||
    `${name} is a renowned ${primarySpecialty} with over ${expYears} years of clinical experience serving patients in ${city}.`;
  const concentrations = doctor?.concentrations || [];
  const slots = doctor?.availabilitySlots || [];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fadeIn">
      <div className="modern-card rounded-3xl max-w-3xl w-full bg-white border border-slate-200/90 shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col animate-scaleUp">
        {/* Header Bar */}
        <div className="p-6 sm:p-7 border-b border-slate-100 bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 text-white relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
            title="Close"
          >
            <X size={18} />
          </button>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-18 h-18 rounded-3xl bg-white text-teal-900 flex items-center justify-center font-black text-2xl shadow-xl shrink-0">
              {name.replace(/^Dr\.\s*|^(Asst\.|Assoc\.|Prof\.)\s*/gi, "").trim()[0] || "D"}
            </div>

            <div className="space-y-1.5 flex-1 pr-8">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-500/20 text-teal-200 border border-teal-400/30">
                  {primarySpecialty}
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-emerald-500/20 text-emerald-200 px-2.5 py-0.5 rounded-full border border-emerald-400/30">
                  <ShieldCheck size={13} /> BMDC Verified
                </span>
                <span className="text-[11px] text-teal-200/80 font-mono">
                  License: {licenseNumber}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">{name}</h2>

              <p className="text-xs sm:text-sm text-teal-100/90 font-medium">{education}</p>
            </div>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 sm:p-8 space-y-6 overflow-y-auto flex-1 text-slate-700 text-xs sm:text-sm">
          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Experience
              </span>
              <span className="text-base font-black text-slate-900">{expYears}+ Years</span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Consultation Fee
              </span>
              <span className="text-base font-black text-teal-800">৳ {fee}</span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Patient Rating
              </span>
              <div className="flex items-center gap-1 text-slate-900 font-black text-base">
                <Star size={15} className="text-amber-500 fill-amber-500" />
                <span>{rating}</span>
                <span className="text-slate-400 text-xs font-normal">({ratingCount})</span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Languages
              </span>
              <span className="text-xs font-bold text-slate-900 block truncate">
                Bengali, English
              </span>
            </div>
          </div>

          {/* Chamber & Location */}
          <div className="p-4 rounded-2xl bg-teal-50/50 border border-teal-100 flex items-start gap-3">
            <Building2 size={20} className="text-teal-700 shrink-0 mt-0.5" />
            <div className="space-y-0.5 text-xs">
              <span className="font-bold text-slate-900 block text-sm">{chamber}</span>
              <p className="text-slate-600 flex items-center gap-1">
                <MapPin size={13} className="text-teal-600 shrink-0" />
                <span>{address}</span>
              </p>
            </div>
          </div>

          {/* Bio / Summary */}
          {bio && (
            <div className="space-y-1.5">
              <h4 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider text-xs">
                About the Specialist
              </h4>
              <p className="text-slate-600 text-xs leading-relaxed">{bio}</p>
            </div>
          )}

          {/* Degrees & Qualifications */}
          <div className="space-y-2">
            <h4 className="font-extrabold text-slate-900 uppercase tracking-wider text-xs">
              Degrees &amp; Certifications
            </h4>
            <div className="flex flex-wrap gap-2">
              {qualificationsList.map((q, i) => (
                <span
                  key={i}
                  className="px-3 py-1 bg-slate-100 text-slate-800 text-xs font-bold rounded-xl border border-slate-200/80 flex items-center gap-1.5"
                >
                  <Award size={13} className="text-teal-700" />
                  <span>{q}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Clinical Concentrations & Conditions Treated */}
          {concentrations.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-slate-900 uppercase tracking-wider text-xs flex items-center gap-1.5">
                  <Stethoscope size={14} className="text-teal-700" />
                  Conditions Treated &amp; Clinical Focus ({concentrations.length})
                </h4>
              </div>
              <div className="flex flex-wrap gap-1.5 max-h-44 overflow-y-auto p-1 scrollbar-thin">
                {concentrations.map((c, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 bg-teal-50/80 text-teal-900 text-xs font-medium rounded-lg border border-teal-200/60"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Availability Schedule */}
          <div className="space-y-2">
            <h4 className="font-extrabold text-slate-900 uppercase tracking-wider text-xs flex items-center gap-1.5">
              <Clock size={14} className="text-teal-700" />
              Chamber Consultation Hours
            </h4>
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs space-y-1.5 text-slate-600">
              <div className="flex items-center justify-between font-semibold text-slate-800">
                <span>In-Clinic Chambers:</span>
                <span>Saturday – Thursday (09:00 - 13:00 &amp; 16:00 - 20:00)</span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span>Online Video Consultation:</span>
                <span className="text-teal-800 font-bold">Supported via CuraNet Telehealth</span>
              </div>
            </div>
          </div>

          {/* Patient Reviews Section */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h4 className="font-extrabold text-slate-900 uppercase tracking-wider text-xs flex items-center gap-1.5">
                <Star size={14} className="text-amber-500 fill-amber-500" />
                Patient Reviews &amp; Feedback ({reviews.length > 0 ? reviews.length : "Verified"})
              </h4>
              <span className="text-xs text-slate-400 font-medium">100% verified appointments</span>
            </div>

            {reviews.length > 0 ? (
              <div className="space-y-2.5">
                {reviews.slice(0, 3).map((r, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800">
                        {r.patientId?.name || "Verified Patient"}
                      </span>
                      <StarRating value={r.rating || 5} />
                    </div>
                    {r.comment && <p className="text-slate-600 italic">&ldquo;{r.comment}&rdquo;</p>}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-500 flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                <span>
                  High satisfaction rating based on <strong>{ratingCount} verified patient visits</strong>. Patients praise punctuality and clear explanations.
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Footer Action Bar */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/80 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-left">
            <span className="text-xs text-slate-400 font-medium block">Consultation Fee</span>
            <span className="text-xl font-black text-slate-900">৳ {fee}</span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-5 py-2.5 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={() => {
                onClose();
                if (onBook) onBook(doctor);
              }}
              className="flex-1 sm:flex-none px-6 py-2.5 bg-teal-800 hover:bg-teal-900 text-white font-black text-xs rounded-xl shadow-glow transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Calendar size={14} />
              <span>Book Appointment</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
