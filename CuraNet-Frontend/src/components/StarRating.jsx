import { Star } from "lucide-react";

export default function StarRating({ value }) {
  return (
    <span className="mono" style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: "0.78rem" }}>
      <Star size={12} fill="var(--gold)" color="var(--gold)" />
      {value.toFixed(1)}
    </span>
  );
}
