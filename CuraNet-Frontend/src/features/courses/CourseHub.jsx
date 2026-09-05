import { BookOpen, Search, SlidersHorizontal } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import CourseCard from "../../components/CourseCard";
import { courses as fallbackCourses } from "../../data/content";
import api from "../../utils/api";

export default function CourseHub() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [useFallback, setUseFallback] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const params = new URLSearchParams();
        if (query) params.set("search", query);
        if (category !== "All") params.set("category", category);
        const res = await api.courses.list(params.toString());
        if (res.data && res.data.length) {
          // normalize API shape to match CourseCard expectations
          const mapped = res.data.map(c => ({
            id: c._id || c.slug,
            _id: c._id,
            slug: c.slug,
            title: c.title,
            category: c.category,
            level: c.level,
            duration: c.durationMinutes ? `${c.durationMinutes} min` : c.duration,
            price: c.price,
            isFree: c.isFree ?? c.price === 0,
            tone: c.tone || "tone-teal",
            icon: c.icon || "📚",
            rating: c.ratingAvg || 4.8,
            students: c.enrollmentCount || 0,
            description: c.description,
            lessons: c.lessons || [],
          }));
          setCourses(mapped);
          setUseFallback(false);
        } else {
          throw new Error("empty");
        }
      } catch {
        // fallback to static courses filtered locally
        setUseFallback(true);
        const q = query.trim().toLowerCase();
        const filtered = fallbackCourses.filter(c => {
          // only actual course entries have lessons & description shape for hub
          if (!c.lessons || !c.title) return false;
          const matchesCategory = category === "All" || c.category === category;
          const matchesQuery = !q || `${c.title} ${c.description} ${c.category}`.toLowerCase().includes(q);
          return matchesCategory && matchesQuery;
        });
        // if API failed but no query/category filter, show all fallback
        setCourses(filtered.length ? filtered : fallbackCourses.filter(c => c.lessons && c.title));
      } finally {
        setLoading(false);
      }
    }
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [query, category]);

  const categories = useMemo(() => {
    const cats = useFallback ? [...new Set(fallbackCourses.filter(c=>c.category).map(c => c.category))] : [...new Set(courses.map(c => c.category))];
    return ["All", ...cats];
  }, [courses, useFallback]);

  if (loading) return <section className="section page-top"><div className="container" style={{ textAlign:"center", padding:60, color:"var(--muted)"}}>Loading courses...</div></section>;

  return (
    <section className="section page-top">
      <div className="container">
        <div className="page-title">
          <div className="pill"><BookOpen size={15}/> Healthcare Literacy Hub</div>
          <h1>Learn something useful for your health</h1>
          <p>Mini-courses are structured as short lessons with clear learning outcomes and progress tracking.</p>
        </div>

        <div className="filter-bar">
          <div className="searchbox"><Search size={18}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search courses..." /></div>
          <div className="filter-select"><SlidersHorizontal size={17}/><select value={category} onChange={e => setCategory(e.target.value)}>{categories.map(c => <option key={c}>{c}</option>)}</select></div>
        </div>

        <div className="results-line"><span>{courses.length} course{courses.length !== 1 ? "s" : ""} available</span><span>Free & paid learning</span></div>
        <div className="course-grid course-grid-wide">
          {courses.map(course => <CourseCard key={course.id || course._id} course={course}/>)}
        </div>
        {!courses.length && <div className="empty-state"><BookOpen size={32}/><h3>No courses found</h3><p>Try another search or category.</p></div>}
      </div>
    </section>
  );
}
