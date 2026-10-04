"use client";

import { useMemo, useState, useEffect } from "react";
import {
  ArrowDownUp,
  ArrowUpRight,
  Bell,
  Bookmark,
  BriefcaseBusiness,
  Check,
  ChevronDown,
  Clock3,
  FileText,
  LayoutDashboard,
  MapPin,
  MessageCircle,
  Plus,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Wrench,
  X,
  Settings,
  LogOut,
  UsersRound,
} from "lucide-react";
import { logout, getCurrentUser } from "../../../../actions/auth";

type Job = {
  id: number;
  title: string;
  company: string;
  category: string;
  location: string;
  distance: string;
  pay: string;
  payType: string;
  workType: string;
  posted: string;
  description: string;
  initials: string;
  color: string;
  verified: boolean;
  urgent?: boolean;
};

const jobs: Job[] = [
  { id: 1, title: "Senior Fashion Pattern Maker", company: "Thread & Form Studio", category: "Fashion", location: "Yaba, Lagos", distance: "2.4 km", pay: "₦180k–₦250k", payType: "/ month", workType: "Full-time", posted: "2h ago", description: "Lead pattern development for our ready-to-wear line. 5+ years experience and a sharp eye for fit required.", initials: "TF", color: "mint", verified: true, urgent: true },
  { id: 2, title: "Residential Electrician", company: "BrightWorks Services", category: "Electrical", location: "Surulere, Lagos", distance: "4.1 km", pay: "₦35k–₦50k", payType: "/ project", workType: "Contract", posted: "5h ago", description: "Rewire a 3-bedroom flat and install fixtures. Must have verifiable residential experience and own tools.", initials: "BW", color: "blue", verified: true },
  { id: 3, title: "Automotive Diagnostic Technician", company: "Motorshed Lagos", category: "Automotive", location: "Ikeja, Lagos", distance: "6.8 km", pay: "₦220k–₦300k", payType: "/ month", workType: "Full-time", posted: "1d ago", description: "Diagnose and repair modern vehicles. Familiarity with OBD scanners and Japanese makes is a plus.", initials: "ML", color: "orange", verified: true },
  { id: 4, title: "Bridal Hair & Makeup Artist", company: "The Beauty Room", category: "Beauty", location: "Victoria Island, Lagos", distance: "8.2 km", pay: "₦45k–₦70k", payType: "/ day", workType: "Freelance", posted: "1d ago", description: "Join our bridal team for weekend bookings. Bring a polished portfolio and a calm, client-first approach.", initials: "BR", color: "pink", verified: false },
  { id: 5, title: "Plumbing Technician", company: "Flow State Facilities", category: "Plumbing", location: "Lekki Phase 1", distance: "11 km", pay: "₦160k–₦210k", payType: "/ month", workType: "Full-time", posted: "2d ago", description: "Handle maintenance calls across residential properties. A valid driver's licence is preferred.", initials: "FS", color: "gold", verified: true },
];

const categories = ["All work", "Fashion", "Electrical", "Automotive", "Beauty", "Plumbing"];

const applicants = [
  { name: "Adebayo Adewale", role: "Master Tailor · 8 yrs", location: "Yaba, Lagos", score: "96%", initials: "AA", image: "photo-1500648767791-00dcc994a43e", verified: true },
  { name: "Chidinma Okafor", role: "Pattern Maker · 6 yrs", location: "Surulere, Lagos", score: "91%", initials: "CO", image: "photo-1534528741775-53994a69daeb", verified: true },
  { name: "Ibrahim Musa", role: "Fashion Designer · 10 yrs", location: "Mushin, Lagos", score: "88%", initials: "IM", image: "photo-1506794778202-cad84cf45f1d", verified: true },
];

export default function StaffGuruHome() {
  const [role, setRole] = useState<"worker" | "employer">("worker");
  const [activeView, setActiveView] = useState("Discover work");
  const [activeCategory, setActiveCategory] = useState("All work");
  const [search, setSearch] = useState("");
  const [saved, setSaved] = useState<number[]>([3]);
  const [applied, setApplied] = useState<number[]>([]);
  const [showPostJob, setShowPostJob] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [toast, setToast] = useState("");
  const [showSidebarMenu, setShowSidebarMenu] = useState(false);
  const [showTopbarMenu, setShowTopbarMenu] = useState(false);
  const [currentDate, setCurrentDate] = useState("TODAY");

  const [currentUser, setCurrentUser] = useState({
    firstName: "Adebayo",
    lastName: "Adewale",
    company: "Thread & Form",
    initials: "AA",
    email: "adebayo@example.com",
    accountType: role === "worker" ? "Worker profile" : "Employer profile",
  });

  useEffect(() => {
    getCurrentUser().then(session => {
      if (session && session.email) {
        const parts = (session.email.split('@')[0] || "").split(/[._-]/);
        const fName = parts[0] ? parts[0].charAt(0).toUpperCase() + parts[0].slice(1) : "User";
        const lName = parts[1] ? parts[1].charAt(0).toUpperCase() + parts[1].slice(1) : "";

        setCurrentUser({
          firstName: fName,
          lastName: lName,
          company: fName + (lName ? " " + lName : ""),
          initials: (fName.charAt(0) + (lName ? lName.charAt(0) : "")).toUpperCase() || "U",
          email: session.email,
          accountType: session.role === "EMPLOYER" ? "Employer profile" : "Worker profile"
        });

        if (session.role === "EMPLOYER") {
          setRole("employer");
        } else {
          setRole("worker");
        }
      }
    });

    const date = new Date();
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    setCurrentDate(date.toLocaleDateString('en-GB', options).toUpperCase());
  }, []);

  const filteredJobs = useMemo(() => jobs.filter((job) => {
    const matchesCategory = activeCategory === "All work" || job.category === activeCategory;
    const matchesSearch = `${job.title} ${job.company} ${job.location} ${job.category}`.toLowerCase().includes(search.toLowerCase());
    const matchesView = activeView === "Saved jobs" ? saved.includes(job.id) : activeView === "My applications" ? applied.includes(job.id) : true;
    return matchesCategory && matchesSearch && matchesView;
  }), [activeCategory, search, activeView, saved, applied]);

  function notify(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2600);
  }

  function toggleSaved(id: number) {
    setSaved((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
    notify(saved.includes(id) ? "Removed from saved jobs" : "Job saved to your list");
  }

  function applyToJob(job: Job) {
    if (applied.includes(job.id)) return;
    setApplied((current) => [...current, job.id]);
    notify(`Application sent to ${job.company}`);
  }

  function switchRole(nextRole: "worker" | "employer") {
    setRole(nextRole);
    setActiveView(nextRole === "worker" ? "Discover work" : "Overview");
  }

  return (
    <div className="app-frame">
      <aside className="sidebar">
        <a className="wordmark" href="#home" aria-label="Staff Guru home"><span>staff<span className="wordmark-guru">guru</span><i>.</i></span></a>
        <nav className="side-nav" aria-label="Main navigation">
          <p className="nav-section-label">{role === "worker" ? "YOUR CAREER" : "HIRING DESK"}</p>
          {(role === "worker"
            ? [{ label: "Discover work", icon: Search }, { label: "My applications", icon: FileText }, { label: "Saved jobs", icon: Bookmark }]
            : [{ label: "Overview", icon: LayoutDashboard }, { label: "My vacancies", icon: BriefcaseBusiness }, { label: "Find workers", icon: UsersRound }]
          ).map(({ label, icon: Icon }) => (
            <button key={label} className={`nav-link ${activeView === label ? "active" : ""}`} onClick={() => setActiveView(label)}>
              <Icon size={17} strokeWidth={1.8} /><span>{label}</span>
              {label === "My applications" && applied.length > 0 && <small>{applied.length}</small>}
            </button>
          ))}
        </nav>
        <div className="sidebar-spacer" />
        <div className="profile-progress">
          <div className="progress-top"><span>Profile strength</span><strong>72%</strong></div>
          <div className="progress-track"><span /></div>
          <p>Add a work sample to stand out to employers.</p>
          <button onClick={() => notify("Profile editor is ready for the next demo step")}>Complete profile <ArrowUpRight size={14} /></button>
        </div>
        <div className="relative">
          <button className="account-button" onClick={() => setShowSidebarMenu(!showSidebarMenu)}>
            <span className="account-avatar">{currentUser.initials}</span>
            <span className="account-info">
              <strong>{currentUser.firstName} {currentUser.lastName}</strong>
              <small>{currentUser.accountType}</small>
            </span>
            <ChevronDown size={15} />
          </button>

          {showSidebarMenu && (
            <div className="absolute left-0 bottom-[calc(100%+10px)] w-[calc(100%-10px)] bg-white border border-[var(--line)] rounded-xl shadow-2xl py-1.5 z-50 flex flex-col overflow-hidden mx-1">
              <button
                className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-[var(--ink)] hover:bg-[var(--canvas)] transition-colors w-full text-left"
                onClick={() => { notify("Profile settings"); setShowSidebarMenu(false); }}
              >
                <Settings size={14} className="text-[var(--muted)]" /> Profile settings
              </button>
              <div className="h-px bg-[var(--line)] my-1 w-full" />
              <form action={logout} className="w-full">
                <button
                  type="submit"
                  className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-[#d76d61] hover:bg-[#d76d61]/10 transition-colors w-full text-left"
                >
                  <LogOut size={14} /> Sign out
                </button>
              </form>
            </div>
          )}
        </div>
      </aside>

      <div className="main-column">
        <header className="topbar">
          <div className="mobile-brand"><strong>staff<span>guru</span><i>.</i></strong></div>
          <div className="breadcrumb"><span>{role === "worker" ? "Worker workspace" : "Employer workspace"}</span><span className="crumb-slash">/</span><strong>{activeView}</strong></div>
          <div className="topbar-actions relative">
            <button className="icon-button notification-button" aria-label="Notifications" onClick={() => notify("You're all caught up")}><Bell size={18} /><span className="notification-dot" /></button>
            <div className="relative">
              <button className="top-avatar" aria-label="Open account menu" onClick={() => setShowTopbarMenu(!showTopbarMenu)}>{currentUser.initials}</button>
              {showTopbarMenu && (
                <div className="absolute right-0 top-[calc(100%+10px)] w-48 bg-white border border-[var(--line)] rounded-xl shadow-2xl py-1.5 z-50 flex flex-col overflow-hidden">
                  <div className="px-3 py-2 border-b border-[var(--line)] mb-1">
                    <p className="text-xs font-bold text-[var(--ink)]">{currentUser.firstName} {currentUser.lastName}</p>
                    <p className="text-[10px] text-[var(--muted)]">{currentUser.email}</p>
                  </div>
                  <button
                    className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-[var(--ink)] hover:bg-[var(--canvas)] transition-colors w-full text-left"
                    onClick={() => { notify("Profile settings"); setShowTopbarMenu(false); }}
                  >
                    <Settings size={14} className="text-[var(--muted)]" /> Profile settings
                  </button>
                  <div className="h-px bg-[var(--line)] my-1 w-full" />
                  <form action={logout} className="w-full">
                    <button
                      type="submit"
                      className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-[#d76d61] hover:bg-[#d76d61]/10 transition-colors w-full text-left"
                    >
                      <LogOut size={14} /> Sign out
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="content" id="home">
          {role === "worker" ? (
            <>
              <section className="welcome-row">
                <div><p className="eyebrow">{currentDate} <span className="live-dot" /> LAGOS</p><h1>Find your next <span>good work.</span></h1><p className="welcome-subtitle">Skilled work, closer to home. Opportunities picked for you.</p></div>
                <button className="profile-pill" onClick={() => notify("Your verified profile is visible to employers")}><span className="profile-pill-icon"><ShieldCheck size={17} /></span><span><strong>Profile verified</strong><small>Employers can find you</small></span><ArrowUpRight size={15} /></button>
              </section>

              <section className="search-panel" aria-label="Search work">
                <label className="search-field"><Search size={19} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Role, skill or company" aria-label="Search jobs" /></label>
                <div className="search-divider" />
                <button className="location-select" onClick={() => notify("Showing work near Yaba, Lagos")}><MapPin size={18} /><span><small>LOCATION</small>Yaba, Lagos</span><ChevronDown size={15} /></button>
                <button className={`filter-button ${showFilters ? "filter-active" : ""}`} onClick={() => setShowFilters((current) => !current)}><SlidersHorizontal size={17} /><span>Filters</span><span className="filter-count">2</span></button>
                {showFilters && <div className="filter-popover"><strong>Quick filters</strong><label><input type="checkbox" defaultChecked /> Verified employers</label><label><input type="checkbox" /> Pay shown upfront</label><label><input type="checkbox" /> Within 5 km</label><button onClick={() => { setShowFilters(false); notify("Filters applied"); }}>Apply filters</button></div>}
              </section>

              <section className="match-strip"><div className="match-spark"><Sparkles size={17} /></div><p><strong>12 strong matches</strong> for your skills around Yaba <span>·</span> Updated just now</p><button onClick={() => notify("Match preferences opened")}>Edit preferences <ArrowUpRight size={14} /></button></section>

              <section className="jobs-section">
                <div className="section-heading"><div><p className="eyebrow">OPPORTUNITIES FOR YOU</p><h2>{activeView === "Saved jobs" ? "Your saved work" : activeView === "My applications" ? "Application tracker" : "Work near you"} <span className="job-count">{filteredJobs.length}</span></h2></div><button className="sort-button" onClick={() => notify("Sorted by best match")}><ArrowDownUp size={15} /> Best match <ChevronDown size={14} /></button></div>
                <div className="category-list" role="tablist" aria-label="Filter jobs by trade">{categories.map((category) => <button key={category} role="tab" aria-selected={activeCategory === category} className={activeCategory === category ? "category-chip active" : "category-chip"} onClick={() => setActiveCategory(category)}>{category}</button>)}</div>
                <div className="job-list">{filteredJobs.length ? filteredJobs.map((job) => <article className="job-card" key={job.id}>
                  <div className={`company-mark ${job.color}`}>{job.initials}</div>
                  <div className="job-main"><div className="job-company-line"><span>{job.company}</span>{job.verified && <span className="verified-mark" title="Verified employer"><ShieldCheck size={13} /></span>}{job.urgent && <span className="urgent-tag">URGENT</span>}<span className="posted">{job.posted}</span></div><h3>{job.title}</h3><p className="job-description">{job.description}</p><div className="job-tags"><span><MapPin size={13} />{job.location} <i>·</i> {job.distance}</span><span><Clock3 size={13} />{job.workType}</span><span><Wrench size={13} />{job.category}</span></div></div>
                  <div className="job-side"><div className="job-pay">{job.pay}<small>{job.payType}</small></div><button className={`save-button ${saved.includes(job.id) ? "saved" : ""}`} aria-label={saved.includes(job.id) ? "Remove saved job" : "Save job"} onClick={() => toggleSaved(job.id)}><Bookmark size={17} fill={saved.includes(job.id) ? "currentColor" : "none"} /></button><button className={applied.includes(job.id) ? "apply-button applied" : "apply-button"} onClick={() => applyToJob(job)}>{applied.includes(job.id) ? <><Check size={15} /> Applied</> : <>View & apply <ArrowUpRight size={15} /></>}</button></div>
                </article>) : <div className="empty-state"><Search size={22} /><strong>No matches in this view</strong><span>Try another skill or trade category.</span><button onClick={() => { setSearch(""); setActiveCategory("All work"); setActiveView("Discover work"); }}>Reset search</button></div>}</div>
                <button className="load-more" onClick={() => notify("You’re viewing all demo opportunities")}>You’re all caught up <span>·</span> 5 of 12 matches</button>
              </section>
            </>
          ) : (
            <EmployerWorkspace user={currentUser} onPost={() => setShowPostJob(true)} onNotify={notify} />
          )}

          <footer className="content-footer"><span>STAFF GURU <i>·</i> TRUSTED SKILLS, REAL OPPORTUNITY</span><button onClick={() => notify("Help centre opened")}>Help centre</button><button onClick={() => notify("Safety and trust information opened")}>Safety & trust</button></footer>
        </main>
      </div>

      <nav className="mobile-nav" aria-label="Mobile navigation"><button className="mobile-nav-active" onClick={() => setActiveView(role === "worker" ? "Discover work" : "Overview")}><Search size={19} /><span>Discover</span></button><button onClick={() => setActiveView(role === "worker" ? "My applications" : "My vacancies")}><FileText size={19} /><span>{role === "worker" ? "Activity" : "Jobs"}</span></button><button onClick={() => notify("Messages inbox opened")}><MessageCircle size={19} /><span>Messages</span></button><button onClick={() => notify("Your profile opened")}><UsersRound size={19} /><span>Profile</span></button></nav>

      {showPostJob && <PostJobModal onClose={() => setShowPostJob(false)} onPosted={() => { setShowPostJob(false); notify("Your vacancy has been posted"); }} />}
      {toast && <div className="toast" role="status"><Check size={16} />{toast}</div>}
    </div>
  );
}

function EmployerWorkspace({ user, onPost, onNotify }: { user: any; onPost: () => void; onNotify: (message: string) => void }) {
  return <>
    <section className="employer-welcome"><div><p className="eyebrow">EMPLOYER WORKSPACE <span className="live-dot" /> LAGOS</p><h1>Good morning, <span>{user.company}.</span></h1><p className="welcome-subtitle">Your hiring desk, ready when you are.</p></div><button className="post-job-button" onClick={onPost}><Plus size={17} /> Post a job</button></section>
    <section className="employer-stats"><div><span>OPEN VACANCIES</span><strong>04</strong><small>Across 3 trades</small></div><div><span>NEW APPLICANTS</span><strong>18</strong><small className="stat-positive">+6 since yesterday</small></div><div><span>SHORTLISTED</span><strong>07</strong><small>Awaiting your review</small></div></section>
    <section className="employer-grid"><div className="employer-panel applicants-panel"><div className="section-heading"><div><p className="eyebrow">BEST-FIT TALENT</p><h2>Recommended for you</h2></div><button className="text-action" onClick={() => onNotify("Opening talent search")}>View all <ArrowUpRight size={14} /></button></div><p className="panel-description">People matched to your Senior Fashion Pattern Maker vacancy.</p>{applicants.map((person) => <article className="person-row" key={person.name}><div className="person-image" style={{ backgroundImage: `url(https://images.unsplash.com/${person.image}?auto=format&fit=crop&w=120&q=80)` }} aria-label={person.name} role="img" /><div className="person-info"><strong>{person.name} {person.verified && <ShieldCheck size={13} />}</strong><span>{person.role}</span><small><MapPin size={12} />{person.location}</small></div><div className="match-score"><strong>{person.score}</strong><small>match</small></div><button className="person-open" aria-label={`View ${person.name}`} onClick={() => onNotify(`Viewing ${person.name}'s profile`)}><ArrowUpRight size={16} /></button></article>)}<button className="outline-wide" onClick={() => onNotify("Talent search opened")}>Explore all matched talent <ArrowUpRight size={15} /></button></div>
      <aside className="employer-panel vacancies-panel"><div className="section-heading"><div><p className="eyebrow">HIRING NOW</p><h2>Your vacancies</h2></div><button className="add-vacancy" aria-label="Post a vacancy" onClick={onPost}><Plus size={17} /></button></div><Vacancy title="Senior Fashion Pattern Maker" applicants="12 applicants" status="Active" /><Vacancy title="Production Assistant" applicants="4 applicants" status="Active" /><Vacancy title="Alterations Tailor" applicants="2 applicants" status="Draft" /><button className="text-action manage-link" onClick={() => onNotify("Vacancy manager opened")}>Manage vacancies <ArrowUpRight size={14} /></button><div className="trust-note"><ShieldCheck size={17} /><span><strong>Your business is verified</strong><small>Verified employers get 3× more applications.</small></span><Check size={15} /></div></aside></section>
  </>;
}

function Vacancy({ title, applicants, status }: { title: string; applicants: string; status: string }) {
  return <div className="vacancy-row"><div className="vacancy-icon"><BriefcaseBusiness size={16} /></div><div><strong>{title}</strong><small>{applicants}</small></div><span className={status === "Draft" ? "vacancy-status draft" : "vacancy-status"}>{status}</span></div>;
}

function PostJobModal({ onClose, onPosted }: { onClose: () => void; onPosted: () => void }) {
  return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><form className="job-modal" onSubmit={(event) => { event.preventDefault(); onPosted(); }}><div className="modal-heading"><div><p className="eyebrow">EMPLOYER WORKSPACE</p><h2>Post a vacancy</h2></div><button type="button" className="icon-button" aria-label="Close dialog" onClick={onClose}><X size={19} /></button></div><p className="modal-copy">Tell skilled people what you need. You can review matches before publishing.</p><label>Job title<input required placeholder="e.g. Senior Fashion Designer" /></label><div className="modal-two-col"><label>Trade<select required defaultValue=""><option value="" disabled>Select trade</option><option>Fashion & tailoring</option><option>Electrical</option><option>Automotive</option><option>Beauty</option><option>Plumbing</option></select></label><label>Work type<select required defaultValue=""><option value="" disabled>Select type</option><option>Full-time</option><option>Contract</option><option>Freelance</option><option>Temporary</option></select></label></div><div className="modal-two-col"><label>Location<input required placeholder="e.g. Yaba, Lagos" /></label><label>Pay range<input required placeholder="e.g. ₦180k–₦250k / month" /></label></div><label>What will they do?<textarea required rows={3} placeholder="Describe the work and the experience you need..." /></label><div className="modal-footer"><span><ShieldCheck size={15} /> Your verified business profile will be shown</span><button type="submit" className="post-job-button">Publish vacancy <ArrowUpRight size={15} /></button></div></form></div>;
}
