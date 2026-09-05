import { useState, useEffect } from "react";
import { User, Phone, MapPin, Stethoscope, DollarSign, Award, FileText, X, CheckCircle2, Droplet, Shield } from "lucide-react";
import api from "../utils/api.js";
import { useAuth } from "../context/AuthContext.jsx";

const SPECIALTY_OPTIONS = [
  "General Medicine",
  "Cardiology",
  "Dermatology",
  "Neurology",
  "Orthopedics",
  "Pediatrics",
  "Gynecology",
  "ENT Specialist",
];

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export default function EditProfileModal({ isOpen, onClose, onUpdated }) {
  const { user, login } = useAuth();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  // Doctor-specific fields
  const [specialty, setSpecialty] = useState(SPECIALTY_OPTIONS[0]);
  const [clinicName, setClinicName] = useState("");
  const [clinicAddress, setClinicAddress] = useState("");
  const [consultationFee, setConsultationFee] = useState("700");
  const [experienceYears, setExperienceYears] = useState("8");
  const [bio, setBio] = useState("");

  // Blood donor fields
  const [bloodGroup, setBloodGroup] = useState("O+");
  const [address, setAddress] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setPhone(user.phone || "");
      setAvatarUrl(user.avatarUrl || "");
      if (user.doctorProfile) {
        setSpecialty(user.doctorProfile.specialization?.[0] || SPECIALTY_OPTIONS[0]);
        setClinicName(user.doctorProfile.clinicName || "");
        setClinicAddress(user.doctorProfile.clinicAddress || "");
        setConsultationFee(user.doctorProfile.consultationFee?.toString() || "700");
        setExperienceYears(user.doctorProfile.experienceYears?.toString() || "8");
        setBio(user.doctorProfile.bio || "");
      }
      if (user.donorProfile) {
        setBloodGroup(user.donorProfile.bloodGroup || "O+");
        setAddress(user.donorProfile.address || "");
      }
    }
  }, [user, isOpen]);

  if (!isOpen) return null;

  const isDoctor = user?.role === "doctor";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const payload = {
        name: name.trim(),
        phone: phone.trim(),
        avatarUrl: avatarUrl.trim() || undefined,
      };

      if (isDoctor) {
        payload.specialization = [specialty];
        payload.clinicName = clinicName.trim();
        payload.clinicAddress = clinicAddress.trim();
        payload.consultationFee = Number(consultationFee) || 700;
        payload.experienceYears = Number(experienceYears) || 0;
        payload.bio = bio.trim();
      }

      if (user?.role === "donor" || bloodGroup) {
        payload.bloodGroup = bloodGroup;
        payload.address = address.trim();
      }

      const res = await api.users.updateProfile(payload);
      if (res.data?.user) {
        setSuccess("Profile updated successfully!");
        // Update user state in localStorage and auth context
        const existingToken = localStorage.getItem("token") || "";
        if (login && existingToken) {
          login(res.data.user, existingToken);
        }
        if (onUpdated) onUpdated(res.data.user);
        setTimeout(() => {
          onClose();
        }, 1200);
      }
    } catch (err) {
      setError(err.message || "Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-800 text-white flex items-center justify-center font-bold text-sm shadow-sm">
              <User size={18} />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900">
                Edit {isDoctor ? "Doctor Clinical Profile" : "User Profile"}
              </h3>
              <p className="text-xs text-slate-400 capitalize">Role: {user?.role || "User"}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 rounded-xl transition cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 font-bold rounded-xl">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 font-bold rounded-xl flex items-center gap-2">
              <CheckCircle2 size={16} />
              <span>{success}</span>
            </div>
          )}

          {/* Standard Fields for All Users */}
          <div className="space-y-3">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Full Name
              </label>
              <div className="relative">
                <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  style={{ paddingLeft: "42px" }}
                  className="modern-input text-xs py-2.5 w-full"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Contact Phone Number
                </label>
                <div className="relative">
                  <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    style={{ paddingLeft: "42px" }}
                    className="modern-input text-xs py-2.5 w-full"
                    placeholder="+8801700000000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Avatar Image URL
                </label>
                <input
                  type="url"
                  className="modern-input text-xs py-2.5 w-full"
                  placeholder="https://..."
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Doctor-Specific Settings */}
          {isDoctor && (
            <div className="pt-3 border-t border-slate-100 space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-black text-teal-800 uppercase tracking-wider">
                <Stethoscope size={14} className="text-teal-700" />
                <span>Doctor Practice Details</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Specialization
                  </label>
                  <select
                    className="modern-input text-xs py-2.5 w-full font-bold text-teal-800 cursor-pointer"
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                  >
                    {SPECIALTY_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Consultation Fee (৳ BDT)
                  </label>
                  <div className="relative">
                    <DollarSign size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <input
                      type="number"
                      style={{ paddingLeft: "42px" }}
                      className="modern-input text-xs py-2.5 w-full font-bold"
                      value={consultationFee}
                      onChange={(e) => setConsultationFee(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Clinic / Hospital Name
                  </label>
                  <input
                    type="text"
                    className="modern-input text-xs py-2.5 w-full"
                    placeholder="e.g. Square Hospital, Dhaka"
                    value={clinicName}
                    onChange={(e) => setClinicName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Clinic Area / Address
                  </label>
                  <div className="relative">
                    <MapPin size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <input
                      type="text"
                      style={{ paddingLeft: "42px" }}
                      className="modern-input text-xs py-2.5 w-full"
                      placeholder="e.g. Dhanmondi, Dhaka"
                      value={clinicAddress}
                      onChange={(e) => setClinicAddress(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Professional Bio &amp; Qualifications
                </label>
                <textarea
                  rows={2}
                  className="modern-input text-xs py-2.5 w-full resize-none"
                  placeholder="e.g. MBBS, FCPS (Cardiology). Senior Consultant with 12+ years experience..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Blood Info for Donors/Patients */}
          {!isDoctor && (
            <div className="pt-3 border-t border-slate-100 space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-black text-rose-700 uppercase tracking-wider">
                <Droplet size={14} className="text-rose-600" />
                <span>Health &amp; Blood Group Details</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Blood Group
                  </label>
                  <select
                    className="modern-input text-xs py-2.5 w-full font-bold text-rose-700 cursor-pointer"
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value)}
                  >
                    {BLOOD_GROUPS.map((bg) => (
                      <option key={bg} value={bg}>
                        {bg}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    City / Residential Area
                  </label>
                  <input
                    type="text"
                    className="modern-input text-xs py-2.5 w-full"
                    placeholder="e.g. Mirpur, Dhaka"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl font-bold transition hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-gradient-to-r from-teal-700 to-teal-800 hover:from-teal-800 text-white font-extrabold rounded-xl shadow-glow cursor-pointer transition flex items-center gap-2"
            >
              {saving ? "Saving Changes..." : "Save Profile"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
