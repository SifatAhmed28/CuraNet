import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Eye, Heart, Clock3, User as UserIcon } from "lucide-react";
import api from "../../utils/api";

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

export default function ArticlePage() {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    api.articles
      .get(slug)
      .then((res) => setArticle(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  const handleLike = async () => {
    if (liked || !article) return;
    try {
      const res = await api.articles.like(article._id);
      setArticle({ ...article, likes: res.data.likes });
      setLiked(true);
    } catch {
      /* silent */
    }
  };

  if (loading) {
    return (
      <section className="section page-top">
        <div className="container" style={{ textAlign: "center", padding: 80, color: "var(--muted)" }}>
          Loading...
        </div>
      </section>
    );
  }

  if (!article) {
    return (
      <section className="section page-top">
        <div className="container not-found">
          <h2>Article not found</h2>
          <Link to="/articles" className="text-link">
            Back to articles
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="section page-top">
      <div className="container narrow">
        <Link to="/articles" className="back-link">
          <ArrowLeft size={16} /> Back to articles
        </Link>

        <article style={{ marginTop: 20 }}>
          {article.coverImageUrl && (
            <div
              style={{
                height: 300,
                borderRadius: 18,
                background: `url(${article.coverImageUrl}) center/cover, var(--mint)`,
                marginBottom: 28,
              }}
            />
          )}

          <div className="eyebrow">{CATEGORY_LABELS[article.category] || article.category}</div>
          <h1 style={{ fontSize: 42, margin: "10px 0 14px", letterSpacing: "-.04em" }}>{article.title}</h1>

          {article.excerpt && (
            <p style={{ fontSize: 18, color: "var(--muted)", lineHeight: 1.6, margin: "0 0 20px" }}>
              {article.excerpt}
            </p>
          )}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 20,
              fontSize: 13,
              color: "#718482",
              paddingBottom: 24,
              borderBottom: "1px solid var(--line)",
              marginBottom: 28,
            }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <UserIcon size={15} />
              {article.authorId?.name || "CuraNet"}
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <Clock3 size={14} /> {article.readingTimeMinutes || 5} min read
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <Eye size={14} /> {article.views} views
            </span>
            <button
              onClick={handleLike}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                background: liked ? "var(--mint)" : "transparent",
                border: `1px solid ${liked ? "var(--teal)" : "var(--line)"}`,
                borderRadius: 99,
                padding: "6px 14px",
                color: liked ? "var(--teal)" : "#718482",
                fontWeight: 700,
                fontSize: 13,
                transition: "all .15s",
              }}
            >
              <Heart size={14} fill={liked ? "var(--teal)" : "none"} /> {article.likes}
            </button>
          </div>

          <div
            className="lesson-text"
            style={{ whiteSpace: "pre-wrap" }}
            dangerouslySetInnerHTML={{
              __html: article.content
                .replace(/^# (.+)$/gm, "<h2>$1</h2>")
                .replace(/^## (.+)$/gm, "<h3>$1</h3>")
                .replace(/^- (.+)$/gm, "<li>$1</li>")
                .replace(/^> (.+)$/gm, '<blockquote style="border-left:3px solid var(--teal);padding-left:14px;color:var(--muted)">$1</blockquote>')
                .replace(/\n/g, "<br/>"),
            }}
          />

          {article.tags && article.tags.length > 0 && (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 24 }}>
              {article.tags.map((tag) => (
                <span
                  key={tag}
                  className="pill"
                  style={{ background: "var(--bg)", border: "1px solid var(--line)" }}
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </article>
      </div>
    </section>
  );
}
