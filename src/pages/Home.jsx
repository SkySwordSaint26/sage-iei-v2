import React from 'react';
import { Link } from 'react-router-dom';
import { EVENTS_DATA } from '../data/events-data.js';

const PILLARS = [
  {
    number: '01',
    icon: '◇',
    name: 'DESIGN',
    desc: 'Build precise engineering concepts through CAD innovation, technical drawing, and digital modeling.'
  },
  {
    number: '02',
    icon: '⚙',
    name: 'BUILD',
    desc: 'Turn engineering concepts into practical solutions through hands-on workshop challenges and fabrication.'
  },
  {
    number: '03',
    icon: '⚡',
    name: 'INNOVATE',
    desc: 'Solve real-world problems through technology ideation, creative prototyping, and strategic pitching.',
    iconColor: '#f5c518'
  },
  {
    number: '04',
    icon: '★',
    name: 'EXCEL',
    desc: 'Demonstrate technical and professional capability through aptitude assessment and industry-level evaluation.',
    iconColor: '#ffffff'
  }
];

const TOTAL_ROUNDS = EVENTS_DATA.reduce((sum, e) => sum + (e.rounds ? e.rounds.length : 0), 0);

export default function Home() {


  return (
    <>
      {/* =========================================================
           HERO SECTION
      ========================================================== */}
      <section className="j1-hero" id="hero-section">
        <div className="j1-hero-grid"></div>
        <div className="j1-hero-glow j1-glow-left"></div>
        <div className="j1-hero-glow j1-glow-right"></div>

        <div className="j1-hero-status">
          <span className="j1-status-dot"></span>
          SYSTEM STATUS // ONLINE
        </div>

        <div className="j1-hero-content">
          <div className="j1-hero-copy reveal">
            <h1 className="j1-hero-title">
              SAGE<br />
              <span className="j1-title-accent">1.0</span>
            </h1>

            <p className="j1-hero-subtitle">AN INTEGRATED ENGINEERING CHALLENGE</p>

            <div className="j1-hero-tagline">
              DESIGN <span className="j1-dot">·</span>
              BUILD <span className="j1-dot">·</span>
              INNOVATE <span className="j1-dot">·</span>
              EXCEL
            </div>

            <div className="j1-hero-actions">
              <Link to="/about" className="j1-btn j1-btn-primary">
                INITIALIZE EXPERIENCE &rarr;
              </Link>
              <Link to="/events" className="j1-btn j1-btn-outline">
                EXPLORE EVENTS
              </Link>
            </div>
          </div>

          <div className="j1-hero-visual reveal reveal-delay-2">
            <div className="j1-radar">
              <div className="j1-ring j1-ring-1"></div>
              <div className="j1-ring j1-ring-2"></div>
              <div className="j1-ring j1-ring-3"></div>
              <div className="j1-scan-arm"></div>
              <div className="j1-radar-core">
                <span className="j1-core-label">S</span>
                <span className="j1-core-ver">1.0</span>
              </div>
              <span className="j1-orbit-dot j1-od-1"></span>
              <span className="j1-orbit-dot j1-od-2"></span>
              <span className="j1-orbit-dot j1-od-3"></span>
              <span className="j1-orbit-dot j1-od-4"></span>
              <div className="j1-radar-label j1-rl-tl">
                <span className="j1-rl-title">SYS ONLINE</span>
                <span className="j1-rl-val">PRVR.09.1X</span>
              </div>
              <div className="j1-radar-label j1-rl-tr">
                <span className="j1-rl-title">07 MODULES</span>
                <span className="j1-rl-val">{TOTAL_ROUNDS} ROUNDS</span>
              </div>
              <div className="j1-radar-label j1-rl-bl">
                <span className="j1-rl-title">SND/ROTIVE</span>
                <span className="j1-rl-val">MODE INIT</span>
              </div>
              <div className="j1-radar-label j1-rl-br">
                <span className="j1-rl-title">VERIFIED BY</span>
                <span className="j1-rl-val">LUMI-2.0</span>
              </div>
              <div className="j1-crosshair j1-ch-h"></div>
              <div className="j1-crosshair j1-ch-v"></div>
            </div>
          </div>
        </div>

        <div className="j1-scroll-hint">
          <span>SCROLL TO EXPLORE</span>
          <div className="j1-scroll-line"></div>
        </div>
      </section>

      {/* =========================================================
           CORE PILLARS — DESIGN / BUILD / INNOVATE / EXCEL
      ========================================================== */}
      <section className="j1-section j1-pillars-section">
        <div className="j1-container">
          <div className="j1-section-eyebrow reveal">+ CORE PRINCIPLES</div>
          <h2 className="j1-section-title reveal">
            FOUR PILLARS.<br />
            <span className="j1-accent">ONE ENGINEER.</span>
          </h2>
          <p className="j1-section-sub reveal">The mindset behind SAGE 1.0.</p>

          <div className="j1-pillar-grid">
            {PILLARS.map((p, i) => (
              <article key={p.number} className={`j1-pillar-card reveal reveal-delay-${i + 1}`}>
                <div className="j1-pillar-top">
                  <span className="j1-pillar-module">MODULE {p.number}</span>
                </div>
                <div className="j1-pillar-icon" style={p.iconColor ? { color: p.iconColor } : {}}>{p.icon}</div>
                <h3 className="j1-pillar-name">{p.name}</h3>
                <p className="j1-pillar-desc">{p.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================
           MISSION MODULES — EVENT CARDS
      ========================================================== */}
      <section className="j1-section j1-missions-section" id="events-preview">
        <div className="j1-container">
          <div className="j1-section-eyebrow reveal">+ EVENT MODULES</div>
          <h2 className="j1-section-title reveal">MISSION MODULES</h2>
          <p className="j1-section-sub reveal">
            Seven competitive events across technical, robotics, workshop, ideation and career domains,
            organized by IE(I) Mechanical &amp; Production Students' Chapter, BVM.
          </p>

          <div className="j1-mission-grid">
            {EVENTS_DATA.map((ev, i) => (
              <article
                key={ev.id}
                className={`j1-mission-card reveal reveal-delay-${(i % 2) + 1}`}
                style={{
                  '--ev-color': ev.accentRaw || ev.accent,
                  '--ev-glow': ev.accentGlow,
                  '--ev-bdr': ev.accentBorder,
                  '--ev-dim': ev.accentGlow
                }}
              >
                <span className="j1-mc-ghost">{ev.number}</span>
                <div className="j1-mc-header">
                  <span className="j1-mc-module">MODULE {ev.number}</span>
                  <span className="j1-mc-tag" style={{ borderColor: 'var(--ev-bdr)', color: 'var(--ev-color)', textTransform: 'uppercase', fontSize: '0.65rem', padding: '2px 6px' }}>
                    {ev.category === 'tech' ? 'TECH' : 'NON-TECH'}
                  </span>
                </div>
                <h3 className="j1-mc-name">{ev.title}</h3>
                <p className="j1-mc-sub" style={{ color: 'var(--ev-color)' }}>{ev.type}</p>
                <p className="j1-mc-desc">{ev.concept}</p>
                <div className="j1-mc-tags">
                  {(ev.tags || []).map(t => (
                    <span key={t} className="j1-mc-tag">{t}</span>
                  ))}
                </div>
                <div className="j1-mc-footer">
                  <span className="j1-mc-rounds">{ev.rounds ? (ev.rounds.length < 10 ? '0' + ev.rounds.length : ev.rounds.length) : '0'} ROUNDS</span>
                  <Link to="/events" className="j1-mc-link">ACCESS MODULE &rarr;</Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================
           FINAL CTA
      ========================================================== */}
      <section className="j1-section j1-cta-section">
        <div className="j1-cta-grid"></div>
        <div className="j1-container">
          <div className="j1-cta-inner reveal">
            <div className="j1-section-eyebrow">+ YOUR MOVE</div>
            <h2 className="j1-section-title">
              READY TO ENTER<br />
              <span className="j1-accent">SAGE 1.0?</span>
            </h2>
            <p className="j1-section-sub">
              Seven events. Real challenges. One platform to prove what you can build.
            </p>
            <div className="j1-hero-actions">
              <Link to="/events" className="j1-btn j1-btn-outline">EXPLORE EVENTS</Link>
              <Link to="/registration" className="j1-btn j1-btn-primary">REGISTER NOW &rarr;</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}