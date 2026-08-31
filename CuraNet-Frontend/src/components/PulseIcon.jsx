import * as Icons from "lucide-react";

// Renders a lucide icon (looked up by name) that fades in and out via an
// opacity keyframe animation — used in place of the emoji that used to sit
// on first-aid topic cards.
export default function PulseIcon({ name, size = 22, color = "var(--medical-red)", style = {}, className = "" }) {
  const IconComponent = Icons[name] || Icons.HeartPulse;

  return (
    <IconComponent
      size={size}
      color={color}
      className={`pulse-icon ${className}`.trim()}
      style={style}
    />
  );
}
