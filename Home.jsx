import { ArrowRight, BookOpen, HeartPulse, ShieldCheck, Sparkles, Stethoscope } from "lucide-react";
import { Link } from "react-router-dom";
import { courses, firstAidTopics } from "../data/content";
import CourseCard from "../components/CourseCard";

export default function Home() {
  return <>
    <section className="hero"><div className="container hero-grid">
      <div className="hero-copy"><div className="pill"><Sparkles size={15}/> Healthcare Literacy Hub</div>
        <h1>Learn health skills.<br/><span>Know what to do next.</span></h1>
        <p>CuraNet's Healthcare Literacy Hub gives users educational mini-courses and a separate First Aid & Remedies reference in one clear interface.</p>
        <div className="hero-actions"><Link to="/courses" className="btn btn-primary"><BookOpen size={18}/> Explore Courses</Link><Link to="/first-aid" className="btn btn-secondary"><HeartPulse size={18}/> First Aid & Remedies</Link></div>
        <div className="hero-trust"><ShieldCheck size={18}/><span>Educational information • Not a diagnosis • Get professional help for emergencies</span></div>
      </div>
      <div className="hero-visual"><div className="floating-card card-top"><BookOpen size={20}/><div><strong>{courses.length} Courses</strong><small>Lessons & progress</small></div></div><div className="health-orb"><Stethoscope size={76}/><div className="pulse-ring"></div></div><div className="floating-card card-bottom"><HeartPulse size={20}/><div><strong>{firstAidTopics.length} First-Aid Topics</strong><small>Measures & warning signs</small></div></div></div>
    </div></section>

    <section className="section" id="courses-preview"><div className="container">
      <div className="section-heading"><div><div className="eyebrow">COURSES</div><h2>Educational courses</h2><p>Short lessons with learning outcomes, enrollment and progress UI.</p></div><Link to="/courses" className="text-link">See all courses <ArrowRight size={17}/></Link></div>
      <div className="course-grid">{courses.map(course => <CourseCard key={course.id} course={course}/>)}</div>
    </div></section>

    <section className="aid-section" id="first-aid-preview"><div className="container">
      <div className="section-heading aid-heading"><div><div className="eyebrow">FIRST AID & REMEDIES</div><h2>First-aid measures & home-care guidance</h2><p>Each card opens a dedicated page containing basic measures, what to avoid, and when to seek professional help.</p></div><Link to="/first-aid" className="btn btn-dark">Open Full List <ArrowRight size={17}/></Link></div>
      <div className="aid-grid-large">{firstAidTopics.map(topic => <Link to={`/first-aid/${topic.id}`} className="aid-card" key={topic.id}><div className="aid-icon">{topic.icon}</div><div className="eyebrow">{topic.category}</div><h3>{topic.title}</h3><p>{topic.summary}</p><span className="text-link">View measures <ArrowRight size={15}/></span></Link>)}</div>
      <div className="safety-strip"><ShieldCheck size={22}/><div><strong>Safety reminder</strong><span>First aid information is educational. Serious, worsening, or unusual symptoms should be assessed by a qualified healthcare professional.</span></div></div>
    </div></section>
  </>;
}
