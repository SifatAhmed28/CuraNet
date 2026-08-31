import { ArrowLeft, Award, CheckCircle2, Clock3, PlayCircle, Users, CreditCard, BookOpen } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useMemo, useState } from "react";
import { courses } from "../../data/content";
import Modal from "../../components/Modal";

export default function CourseDetails() {
  const { courseId } = useParams();
  const course = courses.find(c => c.id === courseId);
  const [enrolled, setEnrolled] = useState(() => localStorage.getItem(`enrolled-${courseId}`) === "true");
  const [showEnroll, setShowEnroll] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("Mobile wallet");

  const completedCount = useMemo(() => course ? course.lessons.filter(l => localStorage.getItem(`completed-${courseId}-${l.id}`) === "true").length : 0, [course, courseId, enrolled, showEnroll]);
  if (!course) return <div className="container not-found"><h2>Course not found</h2><Link to="/courses">Back to courses</Link></div>;
  const progress = Math.round((completedCount / course.lessons.length) * 100);
  const enroll = () => { localStorage.setItem(`enrolled-${courseId}`, "true"); setEnrolled(true); setShowEnroll(false); };
  const firstLesson = course.lessons[0];

  return <section className="section page-top"><div className="container">
    <Link to="/courses" className="back-link"><ArrowLeft size={16}/> Back to courses</Link>
    <div className="detail-hero"><div className={`detail-art ${course.tone}`}><span>{course.icon}</span></div><div className="detail-copy">
      <div className="eyebrow">{course.category} • {course.level}</div><h1>{course.title}</h1><p>{course.description}</p>
      <div className="detail-stats"><span><Clock3/> {course.duration}</span><span><PlayCircle/> {course.lessons.length} lessons</span><span><Users/> {course.students.toLocaleString()} learners</span></div>
      <div className="detail-actions">{enrolled ? <><span className="enrolled-pill"><CheckCircle2/> Enrolled</span><Link className="btn btn-primary" to={`/courses/${course.id}/lessons/${firstLesson.id}`}><BookOpen size={17}/> {completedCount ? "Continue course" : "Start course"}</Link></> : <button className="btn btn-primary" onClick={() => setShowEnroll(true)}>Enroll now — {course.isFree ? "Free" : `৳${course.price}`}</button>}</div>
    </div></div>
    <div className="content-columns"><div className="content-main">
      <div className="content-card"><h2>What you'll learn</h2><div className="outcomes">{course.outcomes.map(x => <div key={x}><CheckCircle2/> {x}</div>)}</div></div>
      <div className="content-card"><h2>Course lessons</h2><div className="lesson-list">{course.lessons.map((lesson, i) => { const done = localStorage.getItem(`completed-${courseId}-${lesson.id}`) === "true"; return <Link to={`/courses/${course.id}/lessons/${lesson.id}`} className="lesson-row" key={lesson.id}><span className="lesson-number">{done ? <CheckCircle2 size={17}/> : i + 1}</span><span className="lesson-title"><strong>{lesson.title}</strong><small>{lesson.duration}{done ? " • Completed" : ""}</small></span><PlayCircle size={20}/></Link>; })}</div></div>
    </div><aside className="side-card"><Award size={27}/><h3>Learn & track progress</h3><p>Enrollment and per-lesson progress follow CuraNet's proposed course and enrollment model.</p><div className="progress-demo"><span style={{width: `${progress}%`}}></span></div><small>{enrolled ? `${completedCount}/${course.lessons.length} lessons completed • ${progress}%` : "Enroll to begin tracking progress"}</small></aside></div>
  </div>
  {showEnroll && <Modal title={`Enroll in ${course.title}`} onClose={() => setShowEnroll(false)}><p>{course.isFree ? "This course is free. Confirm enrollment to save it in this browser." : `This is a ৳${course.price} demo course. Choose a sandbox payment method to demonstrate the enrollment flow.`}</p>{!course.isFree && <div className="payment-options">{["Mobile wallet", "Card", "Cash on delivery (demo)"].map(method => <label key={method} className="payment-option"><input type="radio" name="payment" value={method} checked={paymentMethod === method} onChange={e => setPaymentMethod(e.target.value)}/><CreditCard size={16}/>{method}</label>)}</div>}<button className="btn btn-primary full" onClick={enroll}>{course.isFree ? "Confirm free enrollment" : `Pay with ${paymentMethod} (demo)`}</button></Modal>}
  </section>;
}
