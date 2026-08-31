import { ArrowRight, Clock3, PlayCircle, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

export default function CourseCard({ course }) {
  return (
    <article className="course-card">
      <div className={`course-art ${course.tone}`}>
        <span className="course-icon">{course.icon}</span>
        {course.isFree && <span className="free-badge">FREE</span>}
      </div>
      <div className="course-body">
        <div className="eyebrow">{course.level} • {course.category}</div>
        <h3>{course.title}</h3>
        <p>{course.description}</p>
        <div className="course-meta">
          <span><Clock3 size={15}/> {course.duration}</span>
          <span><PlayCircle size={15}/> {course.lessons.length} lessons</span>
        </div>
        <div className="course-bottom">
          <strong>{course.isFree ? "Free" : `৳${course.price}`}</strong>
          <Link className="text-link" to={`/courses/${course.id}`}>
            View course <ArrowRight size={16}/>
          </Link>
        </div>
      </div>
    </article>
  );
}
