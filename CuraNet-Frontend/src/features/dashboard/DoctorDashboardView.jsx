import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Shield,
  Video,
  Building,
  DollarSign,
  ChevronRight,
  X,
  Stethoscope,
  Sparkles,
  Lock,
  Edit3,
  PenTool,
  CalendarClock,
  Ban,
  BookOpen,
  Plus,
  Search,
  Check,
  Layers,
  Award,
  MapPin,
  Eye,
  Activity,
} from "lucide-react";
import api from "../../utils/api.js";
import EditProfileModal from "../../components/EditProfileModal.jsx";

const ARTICLE_CATEGORIES = [
  { id: "nutrition", label: "Nutrition & Diet" },
  { id: "mental_health", label: "Mental Health" },
  { id: "chronic_disease", label: "Chronic Disease & Diabetes" },
  { id: "first_aid", label: "First Aid & Emergency Care" },
  { id: "maternal_health", label: "Maternal & Child Health" },
  { id: "infectious_disease", label: "Infectious Diseases" },
  { id: "general_wellness", label: "General Wellness & Longevity" },
  { id: "preventive_care", label: "Preventive Care & Screenings" },
];

const COURSE_CATEGORIES = [
  "First Aid & Emergency",
  "Chronic Disease Management",
  "Nutrition & Wellness",
  "Pediatric & Maternal Care",
  "Mental Health & Psychology",
  "General Clinical Literacy",
];

const DAYS_OF_WEEK = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

export default function DoctorDashboardView({ user }) {
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState("consultations"); // consultations | patients | schedule_fee | courses | articles

  // Data states
  const [appointments, setAppointments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [articles, setArticles] = useState([]);
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [patientSearch, setPatientSearch] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");

  // Modals state
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null); // Detailed patient clinical record modal
  const [prescribingAppt, setPrescribingAppt] = useState(null);
  const [prescriptionText, setPrescriptionText] = useState("");

  // Reschedule Conference Time Modal
  const [reschedulingAppt, setReschedulingAppt] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleStartTime, setRescheduleStartTime] = useState("10:00");
  const [rescheduleEndTime, setRescheduleEndTime] = useState("10:30");

  // Write Article Modal
  const [isWriteArticleOpen, setIsWriteArticleOpen] = useState(false);
  const [articleTitle, setArticleTitle] = useState("");
  const [articleCategory, setArticleCategory] = useState(ARTICLE_CATEGORIES[0].id);
  const [articleExcerpt, setArticleExcerpt] = useState("");
  const [articleContent, setArticleContent] = useState("");
  const [articleTags, setArticleTags] = useState("");
  const [articleSaving, setArticleSaving] = useState(false);

  // Launch Course Modal
  const [isLaunchCourseOpen, setIsLaunchCourseOpen] = useState(false);
  const [courseTitle, setCourseTitle] = useState("");
  const [courseCategory, setCourseCategory] = useState(COURSE_CATEGORIES[0]);
  const [courseLevel, setCourseLevel] = useState("beginner");
  const [courseDuration, setCourseDuration] = useState("45");
  const [courseDescription, setCourseDescription] = useState("");
  const [courseTags, setCourseTags] = useState("");
  const [courseThumbnail, setCourseThumbnail] = useState("");
  const [courseSaving, setCourseSaving] = useState(false);

  // Visiting Time & Fee Settings State
  const [feeInput, setFeeInput] = useState(700);
  const [clinicNameInput, setClinicNameInput] = useState("");
  const [clinicAddressInput, setClinicAddressInput] = useState("");
  const [chamberInput, setChamberInput] = useState("");
  const [cityInput, setCityInput] = useState("Dhaka");
  const [districtInput, setDistrictInput] = useState("Dhaka");
  const [availabilitySlots, setAvailabilitySlots] = useState([]);
  const [scheduleSaving, setScheduleSaving] = useState(false);

  // Fetch initial doctor data
  const fetchDoctorData = async () => {
    try {
      setLoading(true);
      const [apptsRes, profileRes, coursesRes, articlesRes] = await Promise.allSettled([
        api.appointments.list(),
        api.doctors.getMe(),
        api.courses.list(),
        api.articles.list(),
      ]);

      if (apptsRes.status === "fulfilled" && apptsRes.value?.data) {
        setAppointments(apptsRes.value.data);
      }

      if (profileRes.status === "fulfilled" && profileRes.value?.data?.data) {
        const p = profileRes.value.data.data;
        setDoctorProfile(p);
        setFeeInput(p.consultationFee || 700);
        setClinicNameInput(p.clinicName || "");
        setClinicAddressInput(p.clinicAddress || "");
        setChamberInput(p.chamber || "");
        setCityInput(p.city || "Dhaka");
        setDistrictInput(p.district || "Dhaka");
        setAvailabilitySlots(
          p.availabilitySlots && p.availabilitySlots.length > 0
            ? p.availabilitySlots
            : [
                { dayOfWeek: "monday", startTime: "17:00", endTime: "21:00", isAvailable: true },
                { dayOfWeek: "wednesday", startTime: "17:00", endTime: "21:00", isAvailable: true },
                { dayOfWeek: "friday", startTime: "17:00", endTime: "21:00", isAvailable: true },
              ]
        );
      }

      if (coursesRes.status === "fulfilled" && coursesRes.value?.data?.data) {
        setCourses(coursesRes.value.data.data);
      }

      if (articlesRes.status === "fulfilled" && articlesRes.value?.data?.data) {
        setArticles(articlesRes.value.data.data);
      }
    } catch {
      // Graceful fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctorData();
  }, []);

  // Compute Distinct Patient Roster
  const patientRoster = useMemo(() => {
    const map = new Map();
    appointments.forEach((appt) => {
      const pId = appt.patientId?._id || appt.patientId || appt._id;
      const pName = appt.patientId?.name || "Patient";
      const pEmail = appt.patientId?.email || "Confidential Contact";
      const pPhone = appt.patientId?.phone || "+880 1XXXXXXXXX";

      if (!map.has(pId)) {
        map.set(pId, {
          patientId: pId,
          name: pName,
          email: pEmail,
          phone: pPhone,
          totalVisits: 0,
          lastVisitDate: appt.appointmentDate,
          appointments: [],
          symptomsList: [],
        });
      }

      const record = map.get(pId);
      record.totalVisits += 1;
      record.appointments.push(appt);
      if (appt.reason && !record.symptomsList.includes(appt.reason)) {
        record.symptomsList.push(appt.reason);
      }
      if (new Date(appt.appointmentDate) > new Date(record.lastVisitDate)) {
        record.lastVisitDate = appt.appointmentDate;
      }
    });

    return Array.from(map.values());
  }, [appointments]);

  // Filtered patients for search
  const filteredPatients = useMemo(() => {
    if (!patientSearch.trim()) return patientRoster;
    const q = patientSearch.toLowerCase();
    return patientRoster.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.symptomsList.some((s) => s.toLowerCase().includes(q))
    );
  }, [patientRoster, patientSearch]);

  // Save Prescription
  const handleSavePrescription = async (e) => {
    e.preventDefault();
    if (!prescribingAppt) return;
    try {
      await api.appointments.update(prescribingAppt._id, {
        notes: prescriptionText,
        status: "completed",
      });
      setActionSuccess("Prescription and clinical diagnosis saved successfully.");
      setPrescribingAppt(null);
      setPrescriptionText("");
      fetchDoctorData();
      setTimeout(() => setActionSuccess(""), 4000);
    } catch (err) {
      alert(err.message || "Failed to save prescription notes");
    }
  };

  // Change Conference Time / Reschedule
  const handleSaveReschedule = async (e) => {
    e.preventDefault();
    if (!reschedulingAppt) return;
    try {
      await api.appointments.update(reschedulingAppt._id, {
        appointmentDate: rescheduleDate,
        timeSlot: {
          startTime: rescheduleStartTime,
          endTime: rescheduleEndTime,
        },
        notes: `Conference rescheduled by Dr. ${user?.name || "Doctor"} to ${rescheduleDate} at ${rescheduleStartTime}.`,
      });
      setActionSuccess("Conference appointment time updated successfully. Patient will be notified.");
      setReschedulingAppt(null);
      fetchDoctorData();
      setTimeout(() => setActionSuccess(""), 4000);
    } catch (err) {
      alert(err.message || "Failed to reschedule appointment");
    }
  };

  // Doctor Cancel Appointment
  const handleDoctorCancel = async (apptId) => {
    const reason = window.prompt(
      "Please provide a reason for cancelling this appointment (e.g. Emergency surgery, clinical duty conflict):"
    );
    if (!reason) return;
    try {
      await api.appointments.cancel(apptId, { reason: `Cancelled by doctor: ${reason}` });
      setActionSuccess("Appointment has been cancelled and patient status updated.");
      fetchDoctorData();
      setTimeout(() => setActionSuccess(""), 4000);
    } catch (err) {
      alert(err.message || "Failed to cancel appointment");
    }
  };

  // Publish Health Article
  const handlePublishArticle = async (e) => {
    e.preventDefault();
    if (!articleTitle || !articleContent) return;
    try {
      setArticleSaving(true);
      await api.articles.create({
        title: articleTitle,
        category: articleCategory,
        excerpt: articleExcerpt,
        content: articleContent,
        tags: articleTags.split(",").map((t) => t.trim()).filter(Boolean),
      });
      setActionSuccess("Medical article published successfully! It is now live in the Health Literacy Hub.");
      setIsWriteArticleOpen(false);
      setArticleTitle("");
      setArticleExcerpt("");
      setArticleContent("");
      setArticleTags("");
      fetchDoctorData();
      setTimeout(() => setActionSuccess(""), 4000);
    } catch (err) {
      alert(err.message || "Failed to publish article");
    } finally {
      setArticleSaving(false);
    }
  };

  // Launch New Course
  const handleLaunchCourse = async (e) => {
    e.preventDefault();
    if (!courseTitle || !courseDescription) return;
    try {
      setCourseSaving(true);
      await api.courses.create({
        title: courseTitle,
        description: courseDescription,
        category: courseCategory,
        level: courseLevel,
        durationMinutes: Number(courseDuration) || 45,
        tags: courseTags.split(",").map((t) => t.trim()).filter(Boolean),
        thumbnailUrl:
          courseThumbnail ||
          "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=600&q=80",
      });
      setActionSuccess("Course launched successfully! It is now accessible to learners in the Course Hub.");
      setIsLaunchCourseOpen(false);
      setCourseTitle("");
      setCourseDescription("");
      setCourseTags("");
      setCourseThumbnail("");
      fetchDoctorData();
      setTimeout(() => setActionSuccess(""), 4000);
    } catch (err) {
      alert(err.message || "Failed to launch course");
    } finally {
      setCourseSaving(false);
    }
  };

  // Save Visiting Hours & Consultation Fee
  const handleSaveVisitingAndFee = async (e) => {
    e.preventDefault();
    try {
      setScheduleSaving(true);
      await api.doctors.updateMe({
        consultationFee: Number(feeInput),
        clinicName: clinicNameInput,
        clinicAddress: clinicAddressInput,
        chamber: chamberInput,
        city: cityInput,
        district: districtInput,
        availabilitySlots: availabilitySlots,
      });
      setActionSuccess("Visiting hours, chamber address, and consultation fee updated successfully.");
      fetchDoctorData();
      setTimeout(() => setActionSuccess(""), 4000);
    } catch (err) {
      alert(err.message || "Failed to update visiting schedule and fee");
    } finally {
      setScheduleSaving(false);
    }
  };

  // Add / Toggle Slot Helper
  const handleToggleDaySlot = (day) => {
    const existingIndex = availabilitySlots.findIndex((s) => s.dayOfWeek.toLowerCase() === day);
    if (existingIndex > -1) {
      const updated = [...availabilitySlots];
      updated[existingIndex].isAvailable = !updated[existingIndex].isAvailable;
      setAvailabilitySlots(updated);
    } else {
      setAvailabilitySlots([
        ...availabilitySlots,
        {
          dayOfWeek: day,
          startTime: "17:00",
          endTime: "21:00",
          slotDurationMinutes: 30,
          isAvailable: true,
        },
      ]);
    }
  };

  const handleUpdateSlotTimes = (day, field, value) => {
    const updated = availabilitySlots.map((s) => {
      if (s.dayOfWeek.toLowerCase() === day) {
        return { ...s, [field]: value };
      }
      return s;
    });
    setAvailabilitySlots(updated);
  };

  const handleMarkStatus = async (apptId, newStatus) => {
    try {
      await api.appointments.update(apptId, { status: newStatus });
      setActionSuccess(`Appointment marked as ${newStatus}.`);
      fetchDoctorData();
      setTimeout(() => setActionSuccess(""), 4000);
    } catch (err) {
      alert(err.message || "Failed to update appointment");
    }
  };

  // Metrics calculation
  const totalPatientsCount = patientRoster.length;
  const pendingCount = appointments.filter((a) => a.status === "confirmed" || a.status === "pending").length;
  const completedCount = appointments.filter((a) => a.status === "completed").length;
  const totalEarnings = appointments
    .filter((a) => a.paymentStatus === "paid")
    .reduce((acc, curr) => acc + (curr.fee || feeInput || 700), 0);

  const filteredAppointments = appointments.filter((a) => {
    if (filterStatus === "all") return true;
    if (filterStatus === "upcoming") return a.status === "confirmed" || a.status === "pending";
    if (filterStatus === "completed") return a.status === "completed";
    if (filterStatus === "cancelled") return a.status === "cancelled";
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Doctor Header Banner with Quick Actions */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-teal-700/60 text-teal-200 border border-teal-600/50">
            <Stethoscope size={14} className="text-teal-300" />
            <span>Doctor Clinical Console</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Welcome back, Dr. {user?.name}
          </h1>
          <p className="text-teal-100 text-xs sm:text-sm max-w-2xl">
            Inspect your patient records, adjust your consultation fees and chamber visiting hours, publish health articles, and launch medical courses for public health literacy.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setIsWriteArticleOpen(true)}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer"
          >
            <PenTool size={14} />
            <span>Write Medical Article</span>
          </button>

          <button
            onClick={() => setIsLaunchCourseOpen(true)}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer"
          >
            <BookOpen size={14} />
            <span>Launch Course</span>
          </button>

          <button
            onClick={() => setIsEditProfileOpen(true)}
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs rounded-xl backdrop-blur-md transition flex items-center gap-1.5 cursor-pointer"
          >
            <Edit3 size={14} />
            <span>Edit Profile</span>
          </button>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-2xl text-sm font-bold flex items-center gap-2 shadow-sm animate-fadeIn">
          <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Active Patients", value: totalPatientsCount, icon: Users, color: "text-teal-700 bg-teal-50" },
          { label: "Upcoming Consults", value: pendingCount, icon: Calendar, color: "text-blue-700 bg-blue-50" },
          { label: "Completed Visits", value: completedCount, icon: CheckCircle2, color: "text-emerald-700 bg-emerald-50" },
          { label: "Consultation Fee", value: `৳${feeInput}`, icon: DollarSign, color: "text-amber-700 bg-amber-50" },
        ].map((m) => (
          <div key={m.label} className="content-card p-5 rounded-2xl flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold ${m.color}`}>
              <m.icon size={22} />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900 leading-tight">{m.value}</div>
              <div className="text-xs text-slate-400 font-semibold mt-0.5">{m.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Modern Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab("consultations")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === "consultations"
              ? "bg-teal-900 text-white shadow-sm"
              : "bg-white text-slate-600 hover:text-slate-900 border border-slate-200"
          }`}
        >
          <Calendar size={15} />
          <span>Appointments &amp; Schedule</span>
          {pendingCount > 0 && (
            <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-black bg-teal-500 text-white">
              {pendingCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("patients")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === "patients"
              ? "bg-teal-900 text-white shadow-sm"
              : "bg-white text-slate-600 hover:text-slate-900 border border-slate-200"
          }`}
        >
          <Users size={15} />
          <span>Patient Roster &amp; Details</span>
          <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-black bg-slate-200 text-slate-800">
            {totalPatientsCount}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("schedule_fee")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === "schedule_fee"
              ? "bg-teal-900 text-white shadow-sm"
              : "bg-white text-slate-600 hover:text-slate-900 border border-slate-200"
          }`}
        >
          <Clock size={15} />
          <span>Visiting Hours &amp; Fee</span>
        </button>

        <button
          onClick={() => setActiveTab("courses")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === "courses"
              ? "bg-teal-900 text-white shadow-sm"
              : "bg-white text-slate-600 hover:text-slate-900 border border-slate-200"
          }`}
        >
          <BookOpen size={15} />
          <span>Launch Courses</span>
          <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-black bg-blue-100 text-blue-800">
            {courses.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("articles")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === "articles"
              ? "bg-teal-900 text-white shadow-sm"
              : "bg-white text-slate-600 hover:text-slate-900 border border-slate-200"
          }`}
        >
          <PenTool size={15} />
          <span>Medical Articles</span>
          <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">
            {articles.length}
          </span>
        </button>
      </div>

      {/* TAB 1: APPOINTMENTS & CONSULTATIONS */}
      {activeTab === "consultations" && (
        <div className="content-card p-6 sm:p-8 rounded-3xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                <Calendar size={20} className="text-teal-700" />
                Patient Consultations &amp; Clinical Records
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Review assigned patient symptoms, change conference times, cancel visits, and issue treatment notes.
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
              {[
                { id: "all", label: "All" },
                { id: "upcoming", label: "Upcoming" },
                { id: "completed", label: "Completed" },
                { id: "cancelled", label: "Cancelled" },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFilterStatus(f.id)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                    filterStatus === f.id
                      ? "bg-white text-teal-900 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="py-12 text-center text-sm font-semibold text-slate-400">
              Loading assigned patient consultations...
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="text-center py-12 text-slate-400 space-y-2">
              <Calendar size={32} className="mx-auto opacity-40 text-teal-700" />
              <p className="text-sm font-semibold">No appointments found matching this filter.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredAppointments.map((appt) => {
                const patientName = appt.patientId?.name || "Patient";
                const isPaid = appt.paymentStatus === "paid";
                const isOnline = appt.consultationType === "online";
                const isCancelled = appt.status === "cancelled";

                return (
                  <div
                    key={appt._id}
                    className="py-4.5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/70 p-3 rounded-2xl transition"
                  >
                    {/* Left: Patient Info & Symptoms */}
                    <div className="space-y-1.5 max-w-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-teal-800 text-white font-black text-sm flex items-center justify-center">
                          {patientName.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-slate-900 text-base">{patientName}</span>
                            <span
                              className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                                isPaid
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : "bg-amber-50 text-amber-700 border border-amber-200"
                              }`}
                            >
                              {isPaid ? "✓ Paid via Stripe" : "Pending Payment"}
                            </span>
                            {isCancelled && (
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-rose-50 text-rose-700 border border-rose-200">
                                Cancelled
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-500 flex items-center gap-2">
                            <span className="flex items-center gap-1 font-semibold text-slate-700">
                              <Clock size={12} className="text-teal-700" />
                              {appt.appointmentDate ? new Date(appt.appointmentDate).toISOString().slice(0, 10) : ""} • {appt.timeSlot?.startTime} - {appt.timeSlot?.endTime}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              {isOnline ? <Video size={12} className="text-indigo-600" /> : <Building size={12} className="text-teal-600" />}
                              {isOnline ? "Online Call" : "In-Person Chamber"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-xs text-slate-600 bg-slate-100/70 p-2.5 rounded-xl border border-slate-200/60">
                        <strong className="text-slate-800 font-bold">Chief Symptoms: </strong>
                        <span>{appt.reason || "General medical consultation requested"}</span>
                      </div>
                    </div>

                    {/* Right: Action Buttons */}
                    <div className="flex flex-wrap items-center gap-2 self-start md:self-center">
                      <button
                        onClick={() => {
                          const matchedRecord = patientRoster.find(
                            (p) => p.patientId === (appt.patientId?._id || appt.patientId)
                          ) || {
                            name: patientName,
                            totalVisits: 1,
                            appointments: [appt],
                            symptomsList: [appt.reason || "General consultation"],
                          };
                          setSelectedPatient(matchedRecord);
                        }}
                        className="px-3 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 transition cursor-pointer flex items-center gap-1.5 shadow-sm"
                      >
                        <Eye size={13} className="text-teal-700" />
                        <span>Patient Details</span>
                      </button>

                      {!isCancelled && (
                        <button
                          onClick={() => {
                            setReschedulingAppt(appt);
                            setRescheduleDate(
                              appt.appointmentDate
                                ? new Date(appt.appointmentDate).toISOString().slice(0, 10)
                                : new Date().toISOString().slice(0, 10)
                            );
                            setRescheduleStartTime(appt.timeSlot?.startTime || "10:00");
                            setRescheduleEndTime(appt.timeSlot?.endTime || "10:30");
                          }}
                          className="px-3 py-2 rounded-xl text-xs font-bold text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition cursor-pointer flex items-center gap-1.5"
                          title="Change conference time"
                        >
                          <CalendarClock size={13} />
                          <span>Change Time</span>
                        </button>
                      )}

                      {!isCancelled && (
                        <button
                          onClick={() => {
                            setPrescribingAppt(appt);
                            setPrescriptionText(appt.notes || "");
                          }}
                          className="px-3 py-2 rounded-xl text-xs font-bold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 transition cursor-pointer flex items-center gap-1.5"
                        >
                          <FileText size={13} />
                          <span>{appt.notes ? "Edit Rx" : "+ Rx"}</span>
                        </button>
                      )}

                      {!isCancelled && appt.status !== "completed" && (
                        <button
                          onClick={() => handleMarkStatus(appt._id, "completed")}
                          className="px-3 py-2 rounded-xl text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition cursor-pointer"
                          title="Mark Consultation Complete"
                        >
                          Complete ✓
                        </button>
                      )}

                      {!isCancelled && appt.status !== "completed" && (
                        <button
                          onClick={() => handleDoctorCancel(appt._id)}
                          className="px-2.5 py-2 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition cursor-pointer"
                          title="Cancel this appointment"
                        >
                          <Ban size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PATIENT ROSTER & CLINICAL DETAILS */}
      {activeTab === "patients" && (
        <div className="content-card p-6 sm:p-8 rounded-3xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                <Users size={20} className="text-teal-700" />
                Active Patient Roster ({patientRoster.length} Total Registered Patients)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Browse all patients who have scheduled consultations with you. Click any patient to inspect their full medical history, complaints, and issued prescriptions.
              </p>
            </div>

            {/* Search Bar */}
            <div className="relative w-full sm:w-72">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search patient or symptoms..."
                value={patientSearch}
                onChange={(e) => setPatientSearch(e.target.value)}
                className="modern-input pl-10 py-2 text-xs w-full font-medium"
              />
            </div>
          </div>

          {filteredPatients.length === 0 ? (
            <div className="text-center py-12 text-slate-400 space-y-2">
              <Users size={32} className="mx-auto opacity-40 text-teal-700" />
              <p className="text-sm font-semibold">
                {patientSearch ? "No patients matching search query." : "No patient records found yet."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredPatients.map((patient) => (
                <div
                  key={patient.patientId}
                  className="p-5 rounded-2xl border border-slate-100 hover:border-teal-300 hover:shadow-md transition bg-white space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-teal-800 text-white font-black text-base flex items-center justify-center shadow-sm">
                        {patient.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-extrabold text-base text-slate-900">{patient.name}</h3>
                        <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                          <span>{patient.totalVisits} Consultations Booked</span>
                          <span>•</span>
                          <span>Last: {patient.lastVisitDate ? new Date(patient.lastVisitDate).toLocaleDateString() : "Recent"}</span>
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedPatient(patient)}
                      className="px-3.5 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-900 border border-teal-200 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1"
                    >
                      <span>View Details</span>
                      <ChevronRight size={14} />
                    </button>
                  </div>

                  {patient.symptomsList.length > 0 && (
                    <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1">
                      <div className="font-bold text-slate-600 text-[11px] uppercase tracking-wider">
                        Reported Symptoms &amp; Notes:
                      </div>
                      <p className="text-slate-800 font-medium line-clamp-2">
                        {patient.symptomsList.join(" • ")}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: VISITING SCHEDULE & CONSULTATION FEE SETTINGS */}
      {activeTab === "schedule_fee" && (
        <div className="content-card p-6 sm:p-8 rounded-3xl space-y-8">
          <div className="pb-4 border-b border-slate-100">
            <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <Clock size={20} className="text-teal-700" />
              Chamber Visiting Hours &amp; Consultation Fee Settings
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Customize your consultation fees and weekly visiting schedule. Patients will book appointments strictly within these designated time windows.
            </p>
          </div>

          <form onSubmit={handleSaveVisitingAndFee} className="space-y-6">
            {/* Consultation Fee & Chamber Address Section */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Consultation Fee (৳ BDT) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400">৳</span>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    value={feeInput}
                    onChange={(e) => setFeeInput(e.target.value)}
                    className="modern-input pl-8 py-2.5 text-base font-black text-slate-900 w-full"
                    required
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">This fee applies to each patient appointment booking.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Chamber / Room Info
                </label>
                <input
                  type="text"
                  placeholder="e.g. Chamber 402, Level 4"
                  value={chamberInput}
                  onChange={(e) => setChamberInput(e.target.value)}
                  className="modern-input py-2.5 text-xs font-medium w-full"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Hospital / Clinic Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Popular Diagnostic & Hospital"
                  value={clinicNameInput}
                  onChange={(e) => setClinicNameInput(e.target.value)}
                  className="modern-input py-2.5 text-xs font-medium w-full"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Full Chamber / Clinic Address *
                </label>
                <input
                  type="text"
                  placeholder="e.g. House 16, Road 2, Dhanmondi R/A"
                  value={clinicAddressInput}
                  onChange={(e) => setClinicAddressInput(e.target.value)}
                  className="modern-input py-2.5 text-xs font-medium w-full"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  City / Division
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dhaka"
                  value={cityInput}
                  onChange={(e) => setCityInput(e.target.value)}
                  className="modern-input py-2.5 text-xs font-medium w-full"
                />
              </div>
            </div>

            {/* Day of Week Visiting Schedule Manager */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                    <CalendarClock size={16} className="text-teal-700" />
                    Weekly Chamber Visiting Hours
                  </h3>
                  <p className="text-xs text-slate-400">
                    Enable or disable visiting days and set your chamber consultation hours.
                  </p>
                </div>
              </div>

              <div className="space-y-2.5">
                {DAYS_OF_WEEK.map((day) => {
                  const slot = availabilitySlots.find((s) => s.dayOfWeek.toLowerCase() === day);
                  const isAvailable = slot ? slot.isAvailable !== false : false;
                  const startTime = slot?.startTime || "17:00";
                  const endTime = slot?.endTime || "21:00";

                  return (
                    <div
                      key={day}
                      className={`p-3.5 rounded-2xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isAvailable
                          ? "bg-teal-50/40 border-teal-200/80"
                          : "bg-slate-50 border-slate-200 opacity-60"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id={`day-${day}`}
                          checked={isAvailable}
                          onChange={() => handleToggleDaySlot(day)}
                          className="w-4 h-4 rounded text-teal-800 cursor-pointer accent-teal-800"
                        />
                        <label
                          htmlFor={`day-${day}`}
                          className="text-xs font-black uppercase tracking-wider text-slate-900 cursor-pointer"
                        >
                          {day}
                        </label>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            isAvailable
                              ? "bg-teal-100 text-teal-800"
                              : "bg-slate-200 text-slate-600"
                          }`}
                        >
                          {isAvailable ? "Visiting Active" : "Day Off"}
                        </span>
                      </div>

                      {isAvailable && (
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-slate-500 font-semibold">Hours:</span>
                          <input
                            type="time"
                            value={startTime}
                            onChange={(e) => handleUpdateSlotTimes(day, "startTime", e.target.value)}
                            className="modern-input py-1 px-2 text-xs font-bold text-center"
                          />
                          <span className="text-slate-400 font-bold">to</span>
                          <input
                            type="time"
                            value={endTime}
                            onChange={(e) => handleUpdateSlotTimes(day, "endTime", e.target.value)}
                            className="modern-input py-1 px-2 text-xs font-bold text-center"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={scheduleSaving}
                className="px-6 py-3 bg-teal-800 hover:bg-teal-900 text-white font-extrabold text-xs rounded-xl shadow-md transition cursor-pointer flex items-center gap-2"
              >
                <Check size={16} />
                <span>{scheduleSaving ? "Saving Visiting Settings..." : "Save Visiting Schedule & Consultation Fee"}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 4: LAUNCH COURSES & HUB */}
      {activeTab === "courses" && (
        <div className="content-card p-6 sm:p-8 rounded-3xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                <BookOpen size={20} className="text-teal-700" />
                Medical Course Studio &amp; Education Hub
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Launch structured healthcare courses to educate the community on disease management, preventative care, and emergency first aid.
              </p>
            </div>

            <button
              onClick={() => setIsLaunchCourseOpen(true)}
              className="px-4 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
            >
              <Plus size={15} />
              <span>Launch New Medical Course</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {courses.map((course) => (
              <div
                key={course._id || course.slug}
                className="rounded-2xl border border-slate-100 overflow-hidden hover:shadow-md transition bg-white flex flex-col"
              >
                <div className="h-36 bg-slate-100 relative overflow-hidden">
                  <img
                    src={
                      course.thumbnailUrl ||
                      "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=600&q=80"
                    }
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2.5 left-2.5 px-2.5 py-1 bg-black/60 backdrop-blur-md rounded-lg text-[10px] font-black text-white uppercase tracking-wider">
                    {course.category}
                  </div>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900 line-clamp-1">{course.title}</h4>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1">{course.description}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-400 capitalize">{course.level} • {course.durationMinutes || 45}m</span>
                    <Link
                      to={`/courses/${course.slug || course._id}`}
                      className="text-teal-800 font-extrabold hover:underline flex items-center gap-1"
                    >
                      <span>View Course</span>
                      <ChevronRight size={13} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: MEDICAL ARTICLES & PUBLICATIONS */}
      {activeTab === "articles" && (
        <div className="content-card p-6 sm:p-8 rounded-3xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                <PenTool size={20} className="text-teal-700" />
                Health Literacy Articles &amp; Clinical Guides
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Write verified medical articles and share expert health insights with thousands of patients across Bangladesh.
              </p>
            </div>

            <button
              onClick={() => setIsWriteArticleOpen(true)}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
            >
              <PenTool size={14} />
              <span>Write Medical Article</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {articles.map((art) => (
              <div
                key={art._id || art.slug}
                className="p-5 rounded-2xl border border-slate-100 hover:border-emerald-300 hover:shadow-md transition bg-white space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
                    {art.category}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {art.createdAt ? new Date(art.createdAt).toLocaleDateString() : "Published"}
                  </span>
                </div>

                <h3 className="font-extrabold text-base text-slate-900 line-clamp-1">{art.title}</h3>
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {art.excerpt || art.content?.slice(0, 150)}
                </p>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-medium">By {art.authorName || `Dr. ${user?.name}`}</span>
                  <Link
                    to={`/health-literacy`}
                    className="text-xs font-bold text-emerald-800 hover:underline flex items-center gap-1"
                  >
                    <span>Read in Hub</span>
                    <ChevronRight size={13} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL 1: COMPREHENSIVE PATIENT CLINICAL RECORD */}
      {selectedPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-teal-800 text-white rounded-xl">
                  <Users size={18} />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">Patient Clinical File</h3>
                  <p className="text-[11px] text-slate-400">Dr. {user?.name} Clinical Roster Record</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedPatient(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 text-xs">
              {/* Privacy Notice */}
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 text-amber-900">
                <Lock size={16} className="text-amber-700 shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                  <strong>Medical Record Confidentiality: </strong> Direct financial billing credentials and personal identifiers are safeguarded in compliance with healthcare data protection standards.
                </span>
              </div>

              {/* Patient Profile Card */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <span className="font-bold text-slate-500">Patient Full Name</span>
                  <span className="font-extrabold text-slate-900 text-sm">{selectedPatient.name}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <span className="font-bold text-slate-500">Total Consultations with You</span>
                  <span className="font-bold text-slate-900">{selectedPatient.totalVisits} Recorded Visit(s)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-500">Last Consultation Date</span>
                  <span className="font-bold text-slate-900">
                    {selectedPatient.lastVisitDate ? new Date(selectedPatient.lastVisitDate).toLocaleDateString() : "Recent"}
                  </span>
                </div>
              </div>

              {/* Reported Symptoms History */}
              <div className="space-y-2">
                <label className="block font-bold text-slate-700 uppercase tracking-wider">
                  Reported Conditions &amp; Chief Symptoms
                </label>
                <div className="space-y-1.5">
                  {selectedPatient.symptomsList?.length > 0 ? (
                    selectedPatient.symptomsList.map((s, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-teal-50/60 border border-teal-100 rounded-xl text-slate-800 leading-relaxed font-medium"
                      >
                        • {s}
                      </div>
                    ))
                  ) : (
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-400">
                      No specific condition history noted.
                    </div>
                  )}
                </div>
              </div>

              {/* Visit Chronology & Prescriptions */}
              <div className="space-y-2">
                <label className="block font-bold text-slate-700 uppercase tracking-wider">
                  Consultation Chronology &amp; Prescriptions
                </label>
                <div className="space-y-2">
                  {selectedPatient.appointments?.map((appt) => (
                    <div key={appt._id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-extrabold text-slate-900">
                          {appt.appointmentDate ? new Date(appt.appointmentDate).toISOString().slice(0, 10) : ""} ({appt.timeSlot?.startTime})
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                            appt.status === "completed"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {appt.status}
                        </span>
                      </div>
                      <p className="text-slate-600">
                        <strong>Complaint: </strong> {appt.reason || "General medical consultation"}
                      </p>
                      {appt.notes && (
                        <div className="p-2.5 bg-white rounded-lg border border-slate-200 font-mono text-[11px] text-teal-900 whitespace-pre-wrap">
                          <strong>Rx Note: </strong> {appt.notes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button
                onClick={() => setSelectedPatient(null)}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl cursor-pointer"
              >
                Close Medical File
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: RESCHEDULE CONFERENCE TIME */}
      {reschedulingAppt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <CalendarClock size={18} className="text-blue-700" />
                <h3 className="font-extrabold text-base text-slate-900">
                  Reschedule Conference Time
                </h3>
              </div>
              <button
                onClick={() => setReschedulingAppt(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveReschedule} className="p-6 space-y-4 text-xs">
              <p className="text-slate-500">
                Adjust consultation time for <strong>{reschedulingAppt.patientId?.name || "Patient"}</strong>.
              </p>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  New Appointment Date
                </label>
                <input
                  type="date"
                  className="modern-input py-2.5 text-xs w-full font-bold"
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Start Time
                  </label>
                  <input
                    type="time"
                    className="modern-input py-2.5 text-xs w-full font-bold text-center"
                    value={rescheduleStartTime}
                    onChange={(e) => setRescheduleStartTime(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    End Time
                  </label>
                  <input
                    type="time"
                    className="modern-input py-2.5 text-xs w-full font-bold text-center"
                    value={rescheduleEndTime}
                    onChange={(e) => setRescheduleEndTime(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReschedulingAppt(null)}
                  className="px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl shadow-sm cursor-pointer"
                >
                  Update Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: WRITE HEALTH ARTICLE */}
      {isWriteArticleOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <PenTool size={18} className="text-emerald-700" />
                <h3 className="font-extrabold text-base text-slate-900">
                  Publish Medical &amp; Health Article
                </h3>
              </div>
              <button
                onClick={() => setIsWriteArticleOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handlePublishArticle} className="p-6 overflow-y-auto space-y-4 text-xs flex-1">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Article Title *
                </label>
                <input
                  type="text"
                  className="modern-input py-2.5 text-xs w-full font-bold text-slate-900"
                  placeholder="e.g. Daily Habits to Prevent Hypertension and Heart Disease"
                  value={articleTitle}
                  onChange={(e) => setArticleTitle(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Category
                  </label>
                  <select
                    className="modern-input py-2.5 text-xs w-full font-bold text-teal-800 cursor-pointer"
                    value={articleCategory}
                    onChange={(e) => setArticleCategory(e.target.value)}
                  >
                    {ARTICLE_CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Tags (comma separated)
                  </label>
                  <input
                    type="text"
                    className="modern-input py-2.5 text-xs w-full"
                    placeholder="e.g. blood pressure, cardiology, wellness"
                    value={articleTags}
                    onChange={(e) => setArticleTags(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Summary / Excerpt
                </label>
                <input
                  type="text"
                  className="modern-input py-2.5 text-xs w-full"
                  placeholder="A concise synopsis of the article for readers..."
                  value={articleExcerpt}
                  onChange={(e) => setArticleExcerpt(e.target.value)}
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Full Article Body *
                </label>
                <textarea
                  rows={8}
                  className="modern-input py-3 text-xs w-full resize-none font-sans leading-relaxed"
                  placeholder="Write comprehensive, medically verified health advice..."
                  value={articleContent}
                  onChange={(e) => setArticleContent(e.target.value)}
                  required
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsWriteArticleOpen(false)}
                  className="px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={articleSaving}
                  className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold rounded-xl shadow-md transition cursor-pointer"
                >
                  {articleSaving ? "Publishing..." : "Publish Article Now"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: LAUNCH COURSE */}
      {isLaunchCourseOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <BookOpen size={18} className="text-blue-700" />
                <h3 className="font-extrabold text-base text-slate-900">
                  Launch New Healthcare Course
                </h3>
              </div>
              <button
                onClick={() => setIsLaunchCourseOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleLaunchCourse} className="p-6 overflow-y-auto space-y-4 text-xs flex-1">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Course Title *
                </label>
                <input
                  type="text"
                  className="modern-input py-2.5 text-xs w-full font-bold text-slate-900"
                  placeholder="e.g. Practical Emergency First Aid &amp; CPR"
                  value={courseTitle}
                  onChange={(e) => setCourseTitle(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Category *
                  </label>
                  <select
                    className="modern-input py-2.5 text-xs w-full font-bold text-blue-800 cursor-pointer"
                    value={courseCategory}
                    onChange={(e) => setCourseCategory(e.target.value)}
                  >
                    {COURSE_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Difficulty Level
                  </label>
                  <select
                    className="modern-input py-2.5 text-xs w-full font-bold cursor-pointer"
                    value={courseLevel}
                    onChange={(e) => setCourseLevel(e.target.value)}
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    min="15"
                    step="15"
                    className="modern-input py-2.5 text-xs w-full font-bold text-center"
                    value={courseDuration}
                    onChange={(e) => setCourseDuration(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Thumbnail Image URL (Optional)
                </label>
                <input
                  type="url"
                  className="modern-input py-2.5 text-xs w-full font-mono"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={courseThumbnail}
                  onChange={(e) => setCourseThumbnail(e.target.value)}
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  className="modern-input py-2.5 text-xs w-full"
                  placeholder="e.g. first aid, cpr, emergency, patient safety"
                  value={courseTags}
                  onChange={(e) => setCourseTags(e.target.value)}
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Course Curriculum &amp; Overview *
                </label>
                <textarea
                  rows={6}
                  className="modern-input py-3 text-xs w-full resize-none font-sans leading-relaxed"
                  placeholder="Describe the learning objectives, course modules, practical tips, and clinical takeaways..."
                  value={courseDescription}
                  onChange={(e) => setCourseDescription(e.target.value)}
                  required
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsLaunchCourseOpen(false)}
                  className="px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={courseSaving}
                  className="px-6 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-extrabold rounded-xl shadow-md transition cursor-pointer"
                >
                  {courseSaving ? "Launching..." : "Publish & Launch Course"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: ISSUE PRESCRIPTION / CLINICAL NOTES */}
      {prescribingAppt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <FileText size={18} className="text-teal-700" />
                <h3 className="font-extrabold text-base text-slate-900">
                  Prescription for {prescribingAppt.patientId?.name || "Patient"}
                </h3>
              </div>
              <button
                onClick={() => setPrescribingAppt(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSavePrescription} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Clinical Diagnosis &amp; Medication Advice
                </label>
                <textarea
                  rows={6}
                  className="modern-input text-xs py-3 w-full font-mono resize-none"
                  placeholder="e.g.
1. Tab. Paracetamol 500mg — 1+1+1 (After meals for 3 days)
2. Syrup Ambrotuss 10ml — 1+0+1
Advised: Chest X-ray if cough persists over 5 days."
                  value={prescriptionText}
                  onChange={(e) => setPrescriptionText(e.target.value)}
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPrescribingAppt(null)}
                  className="px-4 py-2.5 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold rounded-xl shadow-glow cursor-pointer"
                >
                  Save Rx &amp; Complete Visit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 6: EDIT PROFILE */}
      <EditProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        onUpdated={(updatedUser) => {
          setActionSuccess("Practice profile updated successfully.");
          fetchDoctorData();
          setTimeout(() => setActionSuccess(""), 4000);
        }}
      />
    </div>
  );
}
