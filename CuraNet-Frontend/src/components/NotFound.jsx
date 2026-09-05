import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="container section" style={{ textAlign: "center" }}>
      <p className="eyebrow">404</p>
      <h1 className="display" style={{ color: "var(--clinical-900)" }}>Page not found</h1>
      <p style={{ color: "var(--ink-soft)", marginBottom: 24 }}>The page you're looking for doesn't exist.</p>
      <Link to="/" className="btn btn-primary">Back to Home</Link>
    </div>
  );
}
