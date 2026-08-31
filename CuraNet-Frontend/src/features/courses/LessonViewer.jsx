import { ArrowLeft, CheckCircle2, ChevronLeft, ChevronRight, Circle, Clock3 } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { courses as fallbackCourses } from "../../data/content";
import api from "../../utils/api";
import { useAuth } from "../../context/AuthContext";

export default function LessonViewer() {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrollment, setEnrollment] = useState(null);
  const [completed, setCompleted] = useState(false);
  const [isFallback, setIsFallback] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.courses.get(courseId);
        if (res.data) {
          const c = res.data;
          const mapped = {
            id: c._id,
            _id: c._id,
            title: c.title,
            lessons: (c.lessons || []).map(l => ({
              id: l._id,
              _id: l._id,
              title: l.title,
              duration: l.durationMinutes ? `${l.durationMinutes} min` : "10 min",
              content: l.content || l.body || "",
            })),
          };
          setCourse(mapped);
          setIsFallback(false);
          if (user) {
            try {
              const eRes = await api.courses.myEnrollments();
              const found = (eRes.data || []).find(e => String(e.courseId?._id || e.courseId) === String(c._id));
              if (found) {
                setEnrollment(found);
                const isDone = (found.completedLessonIds || []).some(id => String(id) === String(lessonId));
                setCompleted(isDone);
              }
            } catch {}
          }
        } else throw new Error("not found");
      } catch {
        const fc = fallbackCourses.find(c => c.id === courseId);
        if (fc) {
          setCourse(fc);
          setIsFallback(true);
          const key = `completed-${courseId}-${lessonId}`;
          setCompleted(localStorage.getItem(key) === "true");
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [courseId, lessonId, user]);

  if (loading) return <section className="section page-top"><div className="container" style={{ textAlign:"center", padding:60, color:"var(--muted)"}}>Loading lesson...</div></section>;
  if (!course) return <div className="container not-found"><h2>Course not found</h2><Link to="/courses">Back to courses</Link></div>;
  const lessonIndex = course.lessons.findIndex(l => String(l._id||l.id) === String(lessonId));
  const lesson = course.lessons[lessonIndex];
  if (!lesson) return <div className="container not-found"><h2>Lesson not found</h2><Link to={`/courses/${courseId}`}>Back to course</Link></div>;

  const completedCount = isFallback
    ? course.lessons.filter(item => localStorage.getItem(`completed-${courseId}-${item._id||item.id}`) === "true").length
    : (enrollment?.completedLessonIds?.length || 0);
  const progress = Math.round((completedCount / course.lessons.length) * 100);

  const toggleComplete = async () => {
    if (isFallback) {
      const key = `completed-${courseId}-${lessonId}`;
      const next = !completed;
      setCompleted(next);
      localStorage.setItem(key, String(next));
      return;
    }
    if (!user) { navigate("/login"); return; }
    try {
      if (!completed) {
        const res = await api.courses.completeLesson(course._id || courseId, lessonId);
        setEnrollment(res.data);
        setCompleted(true);
      } else {
        // No un-complete endpoint; keep completed
        setCompleted(false);
      }
    } catch (e) {
      // fallback to local
      setCompleted(!completed);
    }
  };

  const previous = course.lessons[lessonIndex - 1];
  const next = course.lessons[lessonIndex + 1];
  const goNext = async () => {
    if (!completed && !isFallback) {
      try { const res = await api.courses.completeLesson(course._id || courseId, lessonId); setEnrollment(res.data); } catch {}
    }
    if (isFallback && !completed) {
      localStorage.setItem(`completed-${courseId}-${lessonId}`, "true");
    }
    if (next) navigate(`/courses/${course._id || course.id || courseId}/lessons/${next._id || next.id}`);
  };

  return <section className="section page-top"><div className="container lesson-layout"><aside className="lesson-sidebar"><Link to={`/courses/${course._id || course.id || courseId}`} className="back-link"><ArrowLeft size={16}/> Course overview</Link><h3>{course.title}</h3><div className="lesson-progress-label">Progress: {completedCount}/{course.lessons.length} • {progress}%</div>{course.lessons.map((item, i) => {
    const done = isFallback ? localStorage.getItem(`completed-${courseId}-${item._id||item.id}`) === "true" : enrollment?.completedLessonIds?.some(id => String(id) === String(item._id||item.id));
    return <Link className={`side-lesson ${String(item._id||item.id) === String(lessonId) ? "active" : ""}`} to={`/courses/${course._id || course.id || courseId}/lessons/${item._id || item.id}`} key={item._id||item.id}>{done ? <CheckCircle2/> : <Circle/>}<span>{i + 1}. {item.title}</span></Link>;
  })}</aside><article className="lesson-content"><div className="eyebrow">LESSON {lessonIndex + 1} OF {course.lessons.length}</div><h1>{lesson.title}</h1><div className="lesson-time"><Clock3 size={16}/> {lesson.duration}</div><div className="lesson-text"><p>{lesson.content}</p></div><div className={`completion-box ${completed ? "done" : ""}`}><div><strong>{completed ? "Lesson completed" : "Ready to mark this lesson complete?"}</strong><small>{isFallback ? "Completion is stored locally in this frontend demo." : "Completion is tracked via your enrollment."}</small></div><button className="btn btn-primary" onClick={toggleComplete}>{completed ? "Mark incomplete" : "Mark complete"}</button></div><div className="lesson-nav">{previous ? <button className="btn btn-secondary" onClick={() => navigate(`/courses/${course._id || course.id || courseId}/lessons/${previous._id || previous.id}`)}><ChevronLeft/> Previous</button> : <span/>}{next ? <button className="btn btn-secondary" onClick={goNext}>Next <ChevronRight/></button> : <Link className="btn btn-primary" to={`/courses/${course._id || course.id || courseId}`} onClick={() => { if (!completed && isFallback) { localStorage.setItem(`completed-${courseId}-${lessonId}`, "true"); } }}>Finish course <CheckCircle2/></Link>}</div></article></div></section>;
}
