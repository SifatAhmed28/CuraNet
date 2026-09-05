import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FileText, Search, SlidersHorizontal, ArrowRight, Eye, Heart, Clock3 } from "lucide-react";
import api from "../../utils/api";

const CATEGORIES = [
  "All",
  "chronic_disease",
  "first_aid",
  "general_wellness",
  "maternal_health",
  "nutrition",
  "mental_health",
  "preventive_care",
];

const CATEGORY_LABELS = {
  chronic_disease: "Chronic Disease",
  first_aid: "First Aid",
  general_wellness: "General Wellness",
  maternal_health: "Maternal Health",
  nutrition: "Nutrition",
  mental_health: "Mental Health",
  preventive_care: "Preventive Care",
  infectious_disease: "Infectious Disease",
};

export default function ArticlesPage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("date");

  useEffect(() => {
    async function load() {
      try {
        const params = new URLSearchParams();
        if (query) params.set("search", query);
        if (category !== "All") params.set("category", category);
        if (sort === "views") params.set("sort", "views");
        if (sort === "likes") params.set("sort", "likes");
        const res = await api.articles.list(params.toString());
        setArticles(res.data || []);
      } catch {
        /* fallback */
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [query, category, sort]);

  return (
    <section className="section page-top">
      <div className="container">
        <div className="page-title">
          <div className="pill">
            <FileText size={15} /> Health Articles
          </div>
          <h1>Stay informed about your health</h1>
          <p>Expert-written articles on chronic disease, first aid, wellness, and more.</p>
        </div>

        <div className="filter-bar">
          <div className="searchbox">
            <Search size={18} />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search articles..." />
          </div>
          <div className="filter-select">
            <SlidersHorizontal size={17} />
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c === "All" ? "All categories" : CATEGORY_LABELS[c] || c}
                </option>
              ))}
            </select>
          </div>
          <div className="filter-select">
            <select value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="date">Latest</option>
              <option value="views">Most viewed</option>
              <option value="likes">Most liked</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: 60, color: "var(--muted)" }}>Loading articles...</div>
        ) : articles.length === 0 ? (
          <div className="empty-state">
            <FileText size={32} />
            <h3>No articles found</h3>
            <p>Try a different search or category.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
            {articles.map((article) => (
              <Link
                key={article._id}
                to={`/articles/${article.slug}`}
                className="content-card"
                style={{ padding: 0, overflow: "hidden", transition: ".2s" }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-3px)")}
                onMouseLeave={(e) => (e.currentTarget.style.transform = "none")}
              >
                {article.coverImageUrl && (
                  <div
                    style={{
                      height: 160,
                      background: `url(${article.coverImageUrl}) center/cover, var(--mint)`,
                    }}
                  />
                )}
                <div style={{ padding: 20 }}>
                  <div className="eyebrow">{CATEGORY_LABELS[article.category] || article.category}</div>
                  <h3 style={{ fontSize: 18, margin: "8px 0" }}>{article.title}</h3>
                  {article.excerpt && (
                    <p style={{ color: "var(--muted)", fontSize: 13, lineHeight: 1.55, margin: 0 }}>
                      {article.excerpt}
                    </p>
                  )}
                  <div
                    style={{
                      display: "flex",
                      gap: 16,
                      marginTop: 14,
                      fontSize: 11,
                      color: "#718482",
                    }}
                  >
                    <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <Clock3 size={13} /> {article.readingTimeMinutes || 5} min
                    </span>
                    <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <Eye size={13} /> {article.views}
                    </span>
                    <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <Heart size={13} /> {article.likes}
                    </span>
                  </div>
                  <div style={{ marginTop: 14 }}>
                    <span className="text-link">
                      Read article <ArrowRight size={14} />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
