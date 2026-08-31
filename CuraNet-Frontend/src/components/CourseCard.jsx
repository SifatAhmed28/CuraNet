import { ArrowRight, Clock3, PlayCircle, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

export default function CourseCard({ course = {} }) {
  const tone = course.tone || "tone-teal";
  const icon = course.icon || "📚";
  const lessonsCount = course.lessons?.length ?? 0;
  const isFree = course.isFree ?? (!course.price || course.price === 0);
  const courseId = course.slug || course.id || course._id;
  const priceText = isFree ? "Free" : `৳${course.price}`;

  return (
    <article className="course-card">
      <div className={`course-art ${tone}`}>
        <span className="course-icon">{icon}</span>
        {isFree && <span className="free-badge">FREE</span>}
      </div>
      <div className="course-body">
        <div className="eyebrow">{course.level || "Beginner"} • {course.category || "General"}</div>
        <h3>{course.title || "Untitled Course"}</h3>
        <p>{course.description || ""}</p>
        <div className="course-meta">
          <span><Clock3 size={15}/> {course.duration || "30 min"}</span>
          <span><PlayCircle size={15}/> {lessonsCount} lessons</span>
        </div>
        <div className="course-bottom">
          <strong>{priceText}</strong>
          <Link className="text-link" to={`/courses/${courseId}`}>
            View course <ArrowRight size={16}/>
          </Link>
        </div>
      </div>
    </article>
  );
}

