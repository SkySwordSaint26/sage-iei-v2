import React, { useState, useRef, useEffect, useCallback, memo } from 'react';
import { Link } from 'react-router-dom';
import { EVENTS_DATA } from '../data/events-data.js';

const TECH_EVENTS = EVENTS_DATA.filter(e => e.category === 'tech');
const NON_TECH_EVENTS = EVENTS_DATA.filter(e => e.category === 'non-tech');
const TOTAL_ROUNDS = EVENTS_DATA.reduce((sum, e) => sum + (e.rounds ? e.rounds.length : 0), 0);

export default function Events() {
  const [activeEvent, setActiveEvent] = useState(null);
  const panelRef = useRef(null);

  const handleOpenEvent = useCallback((eventId) => {
    const ev = EVENTS_DATA.find(e => e.id === eventId);
    if (ev) {
      setActiveEvent(ev);
    }
  }, []);

  const handleCloseEvent = useCallback(() => {
    setActiveEvent(null);
  }, []);

  useEffect(() => {
    if (activeEvent && panelRef.current) {
      const timer = setTimeout(() => {
        const navbarOffset = -90; // Offset for fixed navbar height & padding
        const element = panelRef.current;
        const targetY = element.getBoundingClientRect().top + window.scrollY + navbarOffset;
        window.scrollTo({ top: Math.max(0, targetY), behavior: 'smooth' });
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [activeEvent]);

  return (
    <section className="events-page">
      {/* Page Header */}
      <div className="section-header reveal">
        <div className="badge-hud">ENGINEERING CHALLENGES</div>
        <h2>MISSION MODULES</h2>
        <p>Explore technical and non-technical challenges below. Select any event module to access mission details and round breakdown.</p>
      </div>

      {/* System Status Bar */}
      <div className="events-status-bar reveal">
        <div className="esb-item">
          <span className="esb-dot esb-dot-online"></span>
          <span className="esb-label">SYSTEM STATUS</span>
          <span className="esb-value">ONLINE</span>
        </div>
        <div className="esb-item">
          <span className="esb-dot esb-dot-active"></span>
          <span className="esb-label">TECH EVENTS</span>
          <span className="esb-value">04 MODULES</span>
        </div>
        <div className="esb-item">
          <span className="esb-dot esb-dot-active"></span>
          <span className="esb-label">NON-TECH EVENTS</span>
          <span className="esb-value">03 MODULES</span>
        </div>
        <div className="esb-item">
          <span className="esb-dot esb-dot-online"></span>
          <span className="esb-label">TOTAL ROUNDS</span>
          <span className="esb-value">{TOTAL_ROUNDS}</span>
        </div>
      </div>

      {/* Expand Panel */}
      <div 
        className={`event-detail-panel ${activeEvent ? 'is-open' : ''}`} 
        id="event-detail-panel" 
        style={{ marginBottom: '3rem', scrollMarginTop: '90px' }}
        ref={panelRef}
      >
        <div className="edp-inner" id="edp-inner">
          {activeEvent && (
            <div style={{ '--edp-accent': activeEvent.accent, '--edp-glow': activeEvent.accentGlow }}>
              <div className="edp-header">
                <div>
                  <div className="badge-hud" style={{ marginBottom: '0.75rem', background: activeEvent.accentGlow, borderColor: activeEvent.accentBorder, color: activeEvent.accent }}>
                    MODULE {activeEvent.number} // {activeEvent.type.toUpperCase()}
                  </div>
                  <h2 className={activeEvent.gradientClass} style={{ marginBottom: '0.35rem' }}>{activeEvent.title}</h2>
                  <p style={{ fontFamily: 'var(--font-heading)', fontSize: '0.82rem', letterSpacing: '0.15em', color: activeEvent.accent, opacity: 0.75, margin: 0 }}>
                    {activeEvent.tagline}
                  </p>
                </div>
                <button className="edp-close" onClick={handleCloseEvent} aria-label="Close details" style={{ borderColor: activeEvent.accentBorder }}>&times;</button>
              </div>

              <div style={{ marginBottom: '2rem', padding: '1.25rem', background: 'rgba(255,255,255,0.02)', borderLeft: `2px solid ${activeEvent.accent}`, borderRadius: 'var(--r-sm)' }}>
                <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', lineHeight: '1.75', margin: 0 }}>{activeEvent.concept}</p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <span style={{ fontFamily: 'var(--font-heading)', fontSize: '0.72rem', letterSpacing: '0.18em', color: activeEvent.accent, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                  Challenge Rounds
                </span>
                <div style={{ flex: 1, height: '1px', background: `linear-gradient(to right, ${activeEvent.accentBorder}, transparent)` }}></div>
              </div>

              <div className="rounds-grid">
                {activeEvent.rounds.map((r, ri) => (
                  <div key={r.num} className="round-card" style={{ '--edp-accent': activeEvent.accent, animation: `fade-in-up 0.4s ease ${ri * 0.12}s both` }}>
                    <div className="rc-number">ROUND {r.num}</div>
                    <div className="rc-name">{r.name}</div>
                    <div className="rc-activity">{r.activity}</div>
                    <p className="rc-desc">{r.desc}</p>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '2.25rem', flexWrap: 'wrap' }}>
                <Link to="/registration" className="btn btn-primary" style={{ background: `linear-gradient(135deg, ${activeEvent.accentRaw}, ${activeEvent.accentRaw}cc)` }}>
                  REGISTER FOR {activeEvent.title} &rarr;
                </Link>
                <button className="btn btn-secondary" onClick={handleCloseEvent}>&larr; BACK TO MODULES</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* TECH EVENTS SECTION */}
      <div className="events-category-section" style={{ marginBottom: '4.5rem' }}>
        <div className="reveal" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.75rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <span className="badge-hud" style={{ color: 'var(--cyan)', borderColor: 'var(--cyan-border)', background: 'rgba(0,206,255,0.06)', margin: 0, fontSize: '0.65rem' }}>
              TRACK // 01
            </span>
            <h3 style={{ margin: 0, fontFamily: 'var(--font-heading)', fontSize: '1.5rem', letterSpacing: '0.05em', color: '#fff' }}>
              TECH <span className="text-gradient">EVENTS</span>
            </h3>
          </div>
          <div style={{ flex: 1, height: '1px', minWidth: '60px', background: 'linear-gradient(to right, var(--cyan-border), transparent)' }}></div>
          <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.72rem', letterSpacing: '0.16em', color: 'var(--cyan)', textTransform: 'uppercase' }}>
            04 TECHNICAL MODULES
          </span>
        </div>

        <div className="mission-grid">
          {TECH_EVENTS.map((ev, i) => (
            <MissionModule key={ev.id} ev={ev} index={i} isActive={activeEvent?.id === ev.id} onOpen={() => handleOpenEvent(ev.id)} />
          ))}
        </div>
      </div>

      {/* NON-TECH EVENTS SECTION */}
      <div className="events-category-section" style={{ marginBottom: '3rem' }}>
        <div className="reveal" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.75rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <span className="badge-hud" style={{ color: 'var(--violet)', borderColor: 'rgba(139,61,255,0.35)', background: 'rgba(139,61,255,0.06)', margin: 0, fontSize: '0.65rem' }}>
              TRACK // 02
            </span>
            <h3 style={{ margin: 0, fontFamily: 'var(--font-heading)', fontSize: '1.5rem', letterSpacing: '0.05em', color: '#fff' }}>
              NON-TECH <span className="text-gradient-violet">EVENTS</span>
            </h3>
          </div>
          <div style={{ flex: 1, height: '1px', minWidth: '60px', background: 'linear-gradient(to right, rgba(139,61,255,0.35), transparent)' }}></div>
          <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.72rem', letterSpacing: '0.16em', color: 'var(--violet)', textTransform: 'uppercase' }}>
            03 NON-TECHNICAL MODULES
          </span>
        </div>

        <div className="mission-grid">
          {NON_TECH_EVENTS.map((ev, i) => (
            <MissionModule key={ev.id} ev={ev} index={i + TECH_EVENTS.length} isActive={activeEvent?.id === ev.id} onOpen={() => handleOpenEvent(ev.id)} />
          ))}
        </div>
      </div>

    </section>
  );
}

const MissionModule = memo(function MissionModule({ ev, index, isActive, onOpen }) {
  return (
    <div 
      className={`mission-module reveal reveal-delay-${(index % 4) + 1} ${isActive ? 'is-active' : ''}`}
      style={{
        '--module-accent': ev.accent,
        '--module-border': ev.accentBorder,
        '--module-glow': ev.accentGlow
      }}
      onClick={onOpen}
    >
      <div className="mm-corner mm-corner-tl"></div>
      <div className="mm-corner mm-corner-tr"></div>
      <div className="mm-corner mm-corner-bl"></div>
      <div className="mm-corner mm-corner-br"></div>
      <div className="mm-scan-line"></div>
      <div className="mm-number">{ev.number}</div>

      <div style={{ position: 'relative', zIndex: 1 }}>
        <div className="mm-code">EVENT MODULE {ev.number}</div>
        <h3 className="mm-title">{ev.title}</h3>
        <div className="mm-type">{ev.type}</div>
        <p className="mm-desc">{ev.concept}</p>

        <div className="mm-round-tags">
          {ev.rounds.map(r => <span key={r.name} className="mm-round-tag">{r.name}</span>)}
        </div>

        <div className="mm-footer">
          <span className="mm-rounds">{String(ev.rounds.length).padStart(2, '0')} ROUNDS</span>
          <button className="mm-btn" onClick={(e) => { e.stopPropagation(); onOpen(); }}>ACCESS MODULE &rarr;</button>
        </div>
      </div>
    </div>
  );
});