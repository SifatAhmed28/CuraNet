import { BookOpen, Search, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import CourseCard from "../../components/CourseCard";
import { courses } from "../../data/content";

export default function CourseHub() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");

  const categories = ["All", ...new Set(courses.map(c => c.category))];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return courses.filter(c => {
      const matchesCategory = category === "All" || c.category === category;
      const matchesQuery = !q || `${c.title} ${c.description} ${c.category}`.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [query, category]);

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

        <div className="results-line"><span>{filtered.length} course{filtered.length !== 1 ? "s" : ""} available</span><span>Free & paid learning</span></div>
        <div className="course-grid course-grid-wide">
          {filtered.map(course => <CourseCard key={course.id} course={course}/>)}
        </div>
        {!filtered.length && <div className="empty-state"><BookOpen size={32}/><h3>No courses found</h3><p>Try another search or category.</p></div>}
      </div>
    </section>
  );
}
