import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/intro.css';

/* -------- data -------- */
const FEATURES = [
  {
    icon: '📌', title: 'Certification Management',
    desc: 'Add, organise, and update your professional certifications in one place.',
    points: [
      'Add with issuing authority and dates',
      'Upload certificate files securely',
      'Search and filter your collection',
    ],
    colorA: '#f97316', colorB: '#fbbf24',
    bg: 'rgba(249,115,22,0.1)',
  },
  {
    icon: '⏰', title: 'Expiration & Renewal Tracking',
    desc: 'Never miss a renewal deadline with real-time validity monitoring.',
    points: [
      'Automatic validity tracking',
      'Renewal reminders and deadline alerts',
      'One-click renewal process updates',
    ],
    colorA: '#ffa502', colorB: '#ff6348',
    bg: 'rgba(255,165,2,0.1)',
  },
  {
    icon: '🔐', title: 'Secure Certificate Storage',
    desc: 'A centralised digital repository with quick access and verification.',
    points: [
      'Centralised digital document store',
      'Instant access and download',
      'Organised renewal history',
    ],
    colorA: '#2ed573', colorB: '#fbbf24',
    bg: 'rgba(46,213,115,0.1)',
  },
  {
    icon: '👥', title: 'Role-Based Access Control',
    desc: 'Tailored dashboards for professionals and administrators alike.',
    points: [
      'Admin panel with full oversight',
      'User dashboard for self-management',
      'Secure role-based permissions',
    ],
    colorA: '#fb923c', colorB: '#f97316',
    bg: 'rgba(249,115,22,0.1)',
  },
];

const STEPS = [
  { icon: '👤', title: 'Register or Sign In',            desc: 'Create your account in seconds. Choose your role — Professional or Administrator — and dive right in.' },
  { icon: '📝', title: 'Add Your Certifications',        desc: 'Enter certification details: title, issuing body, dates, credential ID, and relevant tags.' },
  { icon: '📎', title: 'Upload Certificate Documents',   desc: 'Attach your PDF or image certificates directly. They are stored and accessible anytime.' },
  { icon: '📡', title: 'Monitor Expiry & Get Alerts',    desc: 'The platform automatically tracks validity. Receive in-app notifications when renewals are approaching.' },
  { icon: '🔄', title: 'Renew and Stay Current',         desc: 'Submit renewals, update expiry dates, and keep your professional profile always up to date.' },
];

const ROLES = [
  {
    ri: 0,
    badge: '🛡️ Admin',
    badgeBg: 'rgba(255,165,2,0.12)',
    badgeBorder: 'rgba(255,165,2,0.3)',
    badgeColor: '#ffa502',
    title: 'Administrator',
    sub: 'Full oversight of the certification platform — monitor all users, track expirations, and facilitate renewals across the organisation.',
    color: '#ffa502',
    rc: '#ffa502',
    features: [
      'Manage and verify all certification records',
      'Track upcoming expirations across all users',
      'Approve or update renewal processes',
      'View uploaded certificate documents',
      'Send renewal notices to professionals',
      'Maintain platform data integrity',
    ],
    checks: ['✅','✅','✅','✅','✅','✅'],
  },
  {
    ri: 1,
    badge: '👤 User',
    badgeBg: 'rgba(249,115,22,0.12)',
    badgeBorder: 'rgba(249,115,22,0.3)',
    badgeColor: '#f97316',
    title: 'Professional',
    sub: 'Your personal certification hub — record achievements, track deadlines, and maintain an organised professional portfolio.',
    color: '#f97316',
    rc: '#f97316',
    features: [
      'Record and manage personal certifications',
      'Upload and replace certificate documents',
      'Monitor renewal deadlines with visual alerts',
      'Log achievements, milestones, and events',
      'Access and download certificates anytime',
      'View full certification history',
    ],
    checks: ['✅','✅','✅','✅','✅','✅'],
  },
];

const BENEFITS = [
  { icon:'🎯', title:'Never Miss a Deadline',      desc:'Visual expiration tracking and in-app alerts ensure renewals are always on time.' },
  { icon:'🗂️', title:'Organised Records',          desc:'All certifications stored and searchable in one clean, structured dashboard.' },
  { icon:'✔️', title:'Quick Verification',         desc:'Employers and institutions can verify credentials instantly via the platform.' },
  { icon:'⚡', title:'Reduce Manual Effort',       desc:'Automated tracking eliminates spreadsheets and calendar reminders.' },
  { icon:'📈', title:'Track Career Growth',        desc:'Log achievements and milestones to build a living professional timeline.' },
  { icon:'🔒', title:'Secure & Private',           desc:'Role-based access ensures only the right people see the right records.' },
];

/* -------- component -------- */
export default function IntroPage() {
  const navigate    = useNavigate();
  const sectionsRef = useRef([]);

  // intersection observer for scroll-reveal
  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('in-view');
          obs.unobserve(e.target);
        }
      }),
      { threshold: 0.12 }
    );
    sectionsRef.current.forEach(el => el && obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const ref = (i) => (el) => { sectionsRef.current[i] = el; };

  const goAuth   = (mode) => navigate('/auth', { state: { mode } });

  return (
    <div className="intro-page">

      {/* ---- Navbar ---- */}
      <nav className="intro-nav">
        {/* Left — brand name */}
        <div className="intro-nav__brand">
          <div className="intro-nav__name">
            CertTracker Pro
            <span>Professional Certification Platform</span>
          </div>
        </div>

        {/* Centre — logo */}
        <div className="intro-nav__logo-center">
          <img src="/logorbg.png" alt="CertTracker Pro" className="intro-nav__logo" />
        </div>

        {/* Right — actions */}
        <div className="intro-nav__actions">
          <button className="intro-nav__link" onClick={() => goAuth('login')}>
            Sign In
          </button>
          <button className="intro-nav__cta" onClick={() => goAuth('register')}>
            Get Started →
          </button>
        </div>
      </nav>

      {/* ======================================================
          HERO
      ====================================================== */}
      <section className="intro-hero">
        <div className="intro-hero__eyebrow">
          <span className="intro-hero__eyebrow-dot" />
          Now Live — Certification Management Platform
        </div>

        <h1 className="intro-hero__title">
          <span className="intro-hero__title-line1">Securely Manage &amp;</span>
          <span className="intro-hero__title-line2">Track Your Certifications</span>
        </h1>

        <p className="intro-hero__subtitle">
          A centralised platform for professionals and organisations to store certification
          details, track expiration dates, receive renewal reminders, and access digital
          certificates — anytime, anywhere.
        </p>

        <div className="intro-hero__ctas">
          <button className="hero-btn hero-btn--primary" onClick={() => goAuth('register')}>
            🚀 Get Started Free
          </button>
          <button className="hero-btn hero-btn--secondary" onClick={() => goAuth('login')}>
            → Sign In to Dashboard
          </button>
        </div>

        <div className="intro-hero__stats">
          {[
            { val:'4',         label:'Cert Statuses Tracked' },
            { val:'Real-Time', label:'Expiry Monitoring' },
            { val:'2',         label:'Role Types Supported' },
            { val:'100%',      label:'Secure Document Store' },
          ].map(s => (
            <div key={s.label} className="hero-stat">
              <div className="hero-stat__val">{s.val}</div>
              <div className="hero-stat__label">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="scroll-indicator" onClick={() => document.getElementById('features')?.scrollIntoView({ behavior:'smooth' })}>
          <div className="scroll-indicator__arrow">
            <div className="scroll-indicator__dot" />
          </div>
          Scroll to explore
        </div>
      </section>

      {/* ======================================================
          FEATURES
      ====================================================== */}
      <div id="features">
        <div className="intro-section reveal-section" ref={ref(0)}>
          <div className="intro-section__header">
            <div className="section-tag">✨ Platform Features</div>
            <h2 className="intro-section__title">
              Everything You Need to <span>Stay Certified</span>
            </h2>
            <p className="intro-section__desc">
              From uploading documents to tracking renewal deadlines — the platform handles every step of your certification lifecycle.
            </p>
          </div>

          <div className="features-grid">
            {FEATURES.map((f, i) => (
              <div
                key={f.title}
                className="feature-card"
                style={{
                  '--fi': i,
                  '--fc-a': f.colorA,
                  '--fc-b': f.colorB,
                }}
              >
                <div
                  className="feature-card__icon-ring"
                  style={{ background: f.bg }}
                >
                  {f.icon}
                </div>
                <div className="feature-card__title">{f.title}</div>
                <div className="feature-card__desc">{f.desc}</div>
                <ul className="feature-card__points">
                  {f.points.map(p => <li key={p}>{p}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ======================================================
          HOW IT WORKS
      ====================================================== */}
      <div className="intro-section--full">
        <div className="intro-section__inner reveal-section" ref={ref(1)}>
          <div className="intro-section__header">
            <div className="section-tag">⚙️ How It Works</div>
            <h2 className="intro-section__title">
              Up and Running in <span>5 Simple Steps</span>
            </h2>
            <p className="intro-section__desc">
              Getting started takes minutes. Here is everything you do from registration to keeping your certifications current.
            </p>
          </div>

          <div className="steps-track">
            {STEPS.map((s, i) => (
              <div key={s.title} className="step-item" style={{ '--si': i }}>
                <div className="step-item__left">
                  <div className="step-item__num">{i + 1}</div>
                  <div className="step-item__line" />
                </div>
                <div className="step-item__content">
                  <span className="step-item__icon">{s.icon}</span>
                  <div className="step-item__title">{s.title}</div>
                  <div className="step-item__desc">{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ======================================================
          ROLES
      ====================================================== */}
      <div className="intro-section reveal-section" ref={ref(2)}>
        <div className="intro-section__header">
          <div className="section-tag">👥 User Roles</div>
          <h2 className="intro-section__title">
            Built for <span>Every Stakeholder</span>
          </h2>
          <p className="intro-section__desc">
            Whether you manage your own credentials or oversee an entire organisation, there is a tailored experience for you.
          </p>
        </div>

        <div className="roles-grid">
          {ROLES.map(r => (
            <div
              key={r.title}
              className="role-card"
              style={{ '--ri': r.ri, '--rc': r.rc }}
            >
              <div
                className="role-card__badge"
                style={{ background: r.badgeBg, border: `1px solid ${r.badgeBorder}`, color: r.badgeColor }}
              >
                {r.badge}
              </div>
              <div className="role-card__title">{r.title}</div>
              <div className="role-card__sub">{r.sub}</div>
              <ul className="role-card__features">
                {r.features.map((f, fi) => (
                  <li key={fi}>
                    <span className="check" style={{ color: r.color }}>{r.checks[fi]}</span>
                    {f}
                  </li>
                ))}
              </ul>
              <div style={{ marginTop:'1.5rem' }}>
                <button
                  onClick={() => goAuth('register')}
                  style={{
                    width:'100%', padding:'0.65rem', borderRadius:'var(--radius-md)',
                    background: `linear-gradient(135deg, ${r.color}22, ${r.color}11)`,
                    border: `1.5px solid ${r.color}44`,
                    color: r.color, fontWeight:700, fontSize:'0.88rem',
                    cursor:'pointer', transition:'all var(--transition-fast)',
                  }}
                  onMouseOver={e => { e.currentTarget.style.background = `${r.color}22`; e.currentTarget.style.borderColor = r.color; e.currentTarget.style.boxShadow = `0 0 16px ${r.color}44`; }}
                  onMouseOut={e => {  e.currentTarget.style.background = `linear-gradient(135deg,${r.color}22,${r.color}11)`; e.currentTarget.style.borderColor = `${r.color}44`; e.currentTarget.style.boxShadow='none'; }}
                >
                  Register as {r.title} →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ======================================================
          BENEFITS
      ====================================================== */}
      <div className="intro-section--full">
        <div className="intro-section__inner reveal-section" ref={ref(3)}>
          <div className="intro-section__header">
            <div className="section-tag">🌟 Benefits</div>
            <h2 className="intro-section__title">
              Why <span>CertTracker Pro?</span>
            </h2>
            <p className="intro-section__desc">
              Join professionals who have left behind scattered spreadsheets and missed deadlines for a smarter, organised approach.
            </p>
          </div>

          <div className="benefits-grid">
            {BENEFITS.map((b, i) => (
              <div key={b.title} className="benefit-item" style={{ '--bi': i }}>
                <div className="benefit-item__icon">{b.icon}</div>
                <div className="benefit-item__title">{b.title}</div>
                <div className="benefit-item__desc">{b.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ======================================================
          CTA BANNER
      ====================================================== */}
      <div className="cta-banner">
        <h2 className="cta-banner__title">
          Stay ahead in your professional journey
        </h2>
        <p className="cta-banner__sub">
          Log in or register now to begin tracking your certifications securely.
          It only takes a minute to get started.
        </p>
        <div style={{ display:'flex', gap:'1rem', justifyContent:'center', flexWrap:'wrap', position:'relative', zIndex:1 }}>
          <button className="hero-btn hero-btn--primary" onClick={() => goAuth('register')}>
            🚀 Create Free Account
          </button>
          <button className="hero-btn hero-btn--secondary" onClick={() => goAuth('login')}>
            → Sign In
          </button>
        </div>
      </div>

      {/* ======================================================
          FOOTER
      ====================================================== */}
      <footer className="intro-footer">
        <div className="intro-footer__top">
          <div style={{ display:'flex', alignItems:'center', gap:'0.6rem' }}>
            <img src="/logorbg.png" alt="CertTracker Pro" style={{ height: '48px', objectFit: 'contain', filter:'drop-shadow(0 0 10px var(--glow-primary))' }} />
            <div>
              <div style={{ fontWeight:800, fontSize:'0.95rem', color:'var(--text-primary)' }}>CertTracker Pro</div>
              <div style={{ fontSize:'0.7rem', color:'var(--text-muted)' }}>Professional Certification Platform</div>
            </div>
          </div>
          <div className="intro-footer__links">
            <button onClick={() => goAuth('register')}>Get Started</button>
            <button onClick={() => goAuth('login')}>Sign In</button>
            <a href="#">About</a>
            <a href="#">Contact</a>
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
          </div>
        </div>
        <div className="intro-footer__bottom">
          <div className="intro-footer__copy">
            © 2026 Professional Skill Certification Tracker. All rights reserved.
          </div>
          <div className="intro-footer__made">
            Built for professionals, by professionals
          </div>
        </div>
      </footer>

    </div>
  );
}
