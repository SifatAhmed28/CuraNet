import { ArrowLeft, CheckCircle2, ChevronLeft, ChevronRight, Circle, Clock3 } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useMemo, useState } from "react";
import { courses } from "../../data/content";

export default function LessonViewer() {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();
  const course = courses.find(c => c.id === courseId);
  const lessonIndex = course?.lessons.findIndex(l => l.id === lessonId) ?? -1;
  const lesson = course?.lessons[lessonIndex];
  const key = `completed-${courseId}-${lessonId}`;
  const [completed, setCompleted] = useState(() => localStorage.getItem(key) === "true");
  const [refresh, setRefresh] = useState(0);
  if (!course || !lesson) return <div className="container not-found"><h2>Lesson not found</h2><Link to="/courses">Back to courses</Link></div>;
  const completedCount = useMemo(() => course.lessons.filter(item => localStorage.getItem(`completed-${courseId}-${item.id}`) === "true").length, [course, courseId, completed, refresh]);
  const toggleComplete = () => { const next = !completed; setCompleted(next); localStorage.setItem(key, String(next)); setRefresh(v => v + 1); };
  const previous = course.lessons[lessonIndex - 1]; const next = course.lessons[lessonIndex + 1];
  const goNext = () => { if (!completed) { localStorage.setItem(key, "true"); setCompleted(true); setRefresh(v => v + 1); } if (next) navigate(`/courses/${course.id}/lessons/${next.id}`); };
  const progress = Math.round((completedCount / course.lessons.length) * 100);
  return <section className="section page-top"><div className="container lesson-layout"><aside className="lesson-sidebar"><Link to={`/courses/${course.id}`} className="back-link"><ArrowLeft size={16}/> Course overview</Link><h3>{course.title}</h3><div className="lesson-progress-label">Progress: {completedCount}/{course.lessons.length} • {progress}%</div>{course.lessons.map((item, i) => <Link className={`side-lesson ${item.id === lessonId ? "active" : ""}`} to={`/courses/${course.id}/lessons/${item.id}`} key={item.id}>{localStorage.getItem(`completed-${courseId}-${item.id}`) === "true" ? <CheckCircle2/> : <Circle/>}<span>{i + 1}. {item.title}</span></Link>)}</aside><article className="lesson-content"><div className="eyebrow">LESSON {lessonIndex + 1} OF {course.lessons.length}</div><h1>{lesson.title}</h1><div className="lesson-time"><Clock3 size={16}/> {lesson.duration}</div><div className="lesson-text"><p>{lesson.content}</p></div><div className={`completion-box ${completed ? "done" : ""}`}><div><strong>{completed ? "Lesson completed" : "Ready to mark this lesson complete?"}</strong><small>Completion is stored locally in this frontend demo.</small></div><button className="btn btn-primary" onClick={toggleComplete}>{completed ? "Mark incomplete" : "Mark complete"}</button></div><div className="lesson-nav">{previous ? <button className="btn btn-secondary" onClick={() => navigate(`/courses/${course.id}/lessons/${previous.id}`)}><ChevronLeft/> Previous</button> : <span/>}{next ? <button className="btn btn-secondary" onClick={goNext}>Next <ChevronRight/></button> : <Link className="btn btn-primary" to={`/courses/${course.id}`} onClick={() => { if (!completed) { localStorage.setItem(key, "true"); } }}>Finish course <CheckCircle2/></Link>}</div></article></div></section>;
}
