import { Plus } from "lucide-react";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="bar">
        <div className="footer-brand">
          <Plus size={16} strokeWidth={3} />
          CuraNet
        </div>
        <div className="footer-links">
          <a href="#/about">About</a>
          <a href="#/contact">Contact</a>
          <a href="#/privacy">Privacy</a>
          <a href="#/terms">Terms</a>
        </div>
      </div>
    </footer>
  );
}
