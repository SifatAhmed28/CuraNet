import { HeartPulse } from "lucide-react";

// A small animated "vitals" card — a looping ECG trace plus a beating heart
// and a BPM readout. Purely decorative/frontend: no real sensor data.
export default function HeartbeatMonitor({ bpm = 72, className = "" }) {
  return (
    <div className={`heartbeat-card ${className}`.trim()}>
      <div className="heartbeat-top">
        <HeartPulse size={16} className="heartbeat-heart-icon" />
        <span className="heartbeat-bpm">{bpm} BPM</span>
      </div>
      <div className="heartbeat-trace">
        <svg viewBox="0 0 600 60" preserveAspectRatio="none" className="heartbeat-svg">
          <polyline
            className="heartbeat-line"
            fill="none"
            strokeWidth="2.5"
            points="
              0,30 40,30 55,30 65,10 75,50 85,6 95,30 110,30
              150,30 190,30 205,30 215,10 225,50 235,6 245,30 260,30
              300,30 340,30 355,30 365,10 375,50 385,6 395,30 410,30
              450,30 490,30 505,30 515,10 525,50 535,6 545,30 560,30
              600,30
            "
          />
        </svg>
      </div>
    </div>
  );
}
