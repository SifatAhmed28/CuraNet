import { ArrowLeft, Award, CheckCircle2, Clock3, PlayCircle, Users, CreditCard, BookOpen } from "lucide-react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { courses as fallbackCourses } from "../../data/content";
import Modal from "../../components/Modal";
import api from "../../utils/api";
import { useAuth } from "../../context/AuthContext";

export default function CourseDetails() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolled, setEnrolled] = useState(false);
  const [enrollment, setEnrollment] = useState(null);
  const [showEnroll, setShowEnroll] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("Mobile wallet");
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await api.courses.get(courseId);
        if (res.data) {
          const c = res.data;
          setCourse({
            id: c._id,
            _id: c._id,
            slug: c.slug,
            title: c.title,
            category: c.category,
            level: c.level,
            duration: c.durationMinutes ? `${c.durationMinutes} min` : `${c.lessons?.length * 10} min`,
            price: c.price,
            isFree: c.isFree ?? c.price === 0,
            tone: "tone-teal",
            icon: "📚",
            students: c.enrollmentCount || 0,
            description: c.description,
            outcomes: c.outcomes || c.learningOutcomes || [],
            lessons: (c.lessons || []).map(l => ({
              id: l._id || l.id,
              _id: l._id,
              title: l.title,
              duration: l.durationMinutes ? `${l.durationMinutes} min` : "10 min",
              content: l.content || l.body || "",
            })),
          });
          // check enrollment if logged in
          if (user) {
            try {
              const eRes = await api.courses.myEnrollments();
              const found = (eRes.data || []).find(e => (e.courseId?._id === c._id || e.courseId === c._id));
              if (found) { setEnrolled(true); setEnrollment(found); }
            } catch {}
          }
        } else throw new Error("not found");
      } catch {
        // fallback to static
        const fc = fallbackCourses.find(c => c.id === courseId);
        if (fc) {
          setCourse(fc);
          const localEnrolled = localStorage.getItem(`enrolled-${courseId}`) === "true";
          setEnrolled(localEnrolled);
        } else {
          setCourse(null);
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [courseId, user]);

  const completedCount = enrollment ? (enrollment.completedLessonIds?.length ?? 0) : (course ? course.lessons.filter(l => localStorage.getItem(`completed-${courseId}-${l.id}`) === "true").length : 0);
  const progress = course ? Math.round((completedCount / course.lessons.length) * 100) : 0;

  const handleEnroll = async () => {
    setError("");
    if (!user) { navigate("/login"); return; }
    // if fallback course (no _id that is ObjectId length), use localStorage
    const isFallback = !course._id || course._id.length < 20 || fallbackCourses.some(c=>c.id===course.id);
    // Try to detect if course is from fallback by checking if API fetch failed shape
    // We attempt API enroll if we have a real _id; else localStorage
    if (isFallback && fallbackCourses.find(c=>c.id===courseId)) {
      localStorage.setItem(`enrolled-${courseId}`, "true");
      setEnrolled(true);
      setShowEnroll(false);
      return;
    }
    try {
      const res = await api.courses.enroll(course._id || course.id);
      setEnrolled(true);
      setEnrollment(res.data);
      setShowEnroll(false);
    } catch (err) {
      if (err.status === 409) { setEnrolled(true); setShowEnroll(false); }
      else setError(err.message || "Enrollment failed");
    }
  };

  if (loading) return <section className="section page-top"><div className="container" style={{ textAlign:"center", padding:60, color:"var(--muted)"}}>Loading...</div></section>;
  if (!course) return <div className="container not-found"><h2>Course not found</h2><Link to="/courses">Back to courses</Link></div>;

  const firstLesson = course.lessons[0];

  return <section className="section page-top"><div className="container">
    <Link to="/courses" className="back-link"><ArrowLeft size={16}/> Back to courses</Link>
    {error && <div style={{ background:"#ffebe3", color:"#a33", padding:"10px 14px", borderRadius:10, marginTop:12 }}>{error}</div>}
    <div className="detail-hero"><div className={`detail-art ${course.tone}`}><span>{course.icon}</span></div><div className="detail-copy">
      <div className="eyebrow">{course.category} • {course.level}</div><h1>{course.title}</h1><p>{course.description}</p>
      <div className="detail-stats"><span><Clock3/> {course.duration}</span><span><PlayCircle/> {course.lessons.length} lessons</span><span><Users/> {course.students?.toLocaleString?.() || course.students} learners</span></div>
      <div className="detail-actions">{enrolled ? <><span className="enrolled-pill"><CheckCircle2/> Enrolled</span><Link className="btn btn-primary" to={`/courses/${course._id || course.id}/lessons/${firstLesson._id || firstLesson.id}`}><BookOpen size={17}/> {completedCount ? "Continue course" : "Start course"}</Link></> : <button className="btn btn-primary" onClick={() => setShowEnroll(true)}>Enroll now — {course.isFree ? "Free" : `৳${course.price}`}</button>}</div>
    </div></div>
    <div className="content-columns"><div className="content-main">
      <div className="content-card"><h2>What you'll learn</h2><div className="outcomes">{(course.outcomes||[]).map(x => <div key={x}><CheckCircle2/> {x}</div>)}</div></div>
      <div className="content-card"><h2>Course lessons</h2><div className="lesson-list">{course.lessons.map((lesson, i) => { const done = enrollment ? enrollment.completedLessonIds?.some(id => String(id) === String(lesson._id||lesson.id)) : localStorage.getItem(`completed-${courseId}-${lesson.id}`) === "true"; return <Link to={`/courses/${course._id || course.id}/lessons/${lesson._id || lesson.id}`} className="lesson-row" key={lesson._id||lesson.id}><span className="lesson-number">{done ? <CheckCircle2 size={17}/> : i + 1}</span><span className="lesson-title"><strong>{lesson.title}</strong><small>{lesson.duration}{done ? " • Completed" : ""}</small></span><PlayCircle size={20}/></Link>; })}</div></div>
    </div><aside className="side-card"><Award size={27}/><h3>Learn & track progress</h3><p>Enrollment and per-lesson progress follow CuraNet's proposed course and enrollment model.</p><div className="progress-demo"><span style={{width: `${progress}%`}}></span></div><small>{enrolled ? `${completedCount}/${course.lessons.length} lessons completed • ${progress}%` : "Enroll to begin tracking progress"}</small></aside></div>
  </div>
  {showEnroll && <Modal title={`Enroll in ${course.title}`} onClose={() => setShowEnroll(false)}><p>{course.isFree ? "This course is free. Confirm enrollment to save it." : `This is a ৳${course.price} demo course. Choose a sandbox payment method.`}</p>{!course.isFree && <div className="payment-options">{["Mobile wallet", "Card", "Cash on delivery (demo)"].map(method => <label key={method} className="payment-option"><input type="radio" name="payment" value={method} checked={paymentMethod === method} onChange={e => setPaymentMethod(e.target.value)}/><CreditCard size={16}/>{method}</label>)}</div>}<button className="btn btn-primary full" onClick={handleEnroll}>{course.isFree ? "Confirm free enrollment" : `Pay with ${paymentMethod} (demo)`}</button></Modal>}
  </section>;
}
