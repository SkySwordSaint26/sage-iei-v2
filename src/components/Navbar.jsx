import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';

const NAV_ROUTES = [
  { id: 'home',         label: 'Home',     path: '/home' },
  { id: 'about',        label: 'About',    path: '/about' },
  { id: 'events',       label: 'Events',   path: '/events' },
  { id: 'contact',      label: 'Contact',  path: '/contact' },
  { id: 'login',        label: 'Login',    path: '/login' },
  { id: 'registration', label: 'Register', path: '/registration', cta: true },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const isScrolledRef = useRef(false);
  const location = useLocation();

  useEffect(() => {
    let ticking = false;

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const shouldScroll = window.scrollY > 30;
          if (shouldScroll !== isScrolledRef.current) {
            isScrolledRef.current = shouldScroll;
            setIsScrolled(shouldScroll);
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const activeRoute = useMemo(() => {
    const path = location.pathname;
    if (path === '/' || path === '/home') return 'home';
    if (path === '/about') return 'about';
    if (path === '/events' || path === '/event-detail') return 'events';
    if (path === '/contact') return 'contact';
    if (path === '/login') return 'login';
    if (path === '/registration') return 'registration';
    return 'home';
  }, [location.pathname]);


  return (
    <>
      <header id="navbar-root" className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
        <div className="container">
          <Link to="/home" className="nav-brand">
            <div className="brand-icon-arc"></div>
            <span>SAGE&nbsp;<span style={{ color: 'var(--cyan)' }}>1.0</span></span>
          </Link>

          <ul className="nav-links">
            {NAV_ROUTES.map(r => (
              <li key={r.id}>
                <Link
                  to={r.path}
                  className={`nav-link ${r.cta ? 'nav-cta' : ''} ${activeRoute === r.id ? 'active' : ''}`}
                >
                  {r.label}
                </Link>
              </li>
            ))}
          </ul>

          <button
            id="mobile-toggle-btn"
            className="mobile-toggle"
            aria-label="Toggle navigation"
            aria-expanded={isMobileOpen}
            onClick={() => setIsMobileOpen(!isMobileOpen)}
          >
            <svg width="20" height="14" viewBox="0 0 20 14" fill="none">
              <line className="hline h1" x1="0" y1="1"  x2="20" y2="1"  stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <line className="hline h2" x1="0" y1="7"  x2="20" y2="7"  stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <line className="hline h3" x1="0" y1="13" x2="20" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      </header>

      <div id="mobile-menu-root" className={`mobile-nav-drawer ${isMobileOpen ? 'is-open' : ''}`}>
        {NAV_ROUTES.map(r => (
          <Link
            key={r.id}
            to={r.path}
            className={`mobile-nav-link ${activeRoute === r.id ? 'active' : ''}`}
            onClick={() => setIsMobileOpen(false)}
          >
            {r.label}
          </Link>
        ))}
      </div>
    </>
  );
}
