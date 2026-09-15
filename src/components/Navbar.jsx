import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { auth } from '../firebase-config.js';
import { onAuthStateChanged, signOut } from 'firebase/auth';

import logoIcon from '../assets/Only S metallic Blue.png';

const SAGE_AUTH_SESSION_KEY = 'sage_participant_session';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    try {
      return Boolean(localStorage.getItem(SAGE_AUTH_SESSION_KEY) || sessionStorage.getItem(SAGE_AUTH_SESSION_KEY));
    } catch {
      return false;
    }
  });

  const isScrolledRef = useRef(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Track session and auth changes
  useEffect(() => {
    const syncAuthStatus = () => {
      try {
        const hasSession = Boolean(
          localStorage.getItem(SAGE_AUTH_SESSION_KEY) || sessionStorage.getItem(SAGE_AUTH_SESSION_KEY)
        );
        setIsLoggedIn(hasSession);
      } catch {
        setIsLoggedIn(false);
      }
    };

    syncAuthStatus();

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsLoggedIn(true);
      } else {
        syncAuthStatus();
      }
    });

    window.addEventListener('sage-auth-change', syncAuthStatus);
    window.addEventListener('storage', syncAuthStatus);

    return () => {
      unsubscribe();
      window.removeEventListener('sage-auth-change', syncAuthStatus);
      window.removeEventListener('storage', syncAuthStatus);
    };
  }, []);

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

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.warn("Logout error:", err);
    }

    localStorage.removeItem(SAGE_AUTH_SESSION_KEY);
    sessionStorage.removeItem(SAGE_AUTH_SESSION_KEY);
    setIsLoggedIn(false);
    window.dispatchEvent(new Event('sage-auth-change'));
    setIsMobileOpen(false);
    navigate('/login');
  };

  const navRoutes = useMemo(() => {
    const base = [
      { id: 'home',    label: 'Home',    path: '/home' },
      { id: 'about',   label: 'About',   path: '/about' },
      { id: 'events',  label: 'Events',  path: '/events' },
      { id: 'contact', label: 'Contact', path: '/contact' },
    ];

    if (isLoggedIn) {
      base.push({ id: 'login', label: 'Portal', path: '/login' });
    } else {
      base.push({ id: 'login', label: 'Login', path: '/login' });
      base.push({ id: 'registration', label: 'Register', path: '/registration', cta: true });
    }

    return base;
  }, [isLoggedIn]);

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
          <Link to="/home" className="nav-brand" style={{ display: 'flex', alignItems: 'center' }}>
            <img src={logoIcon} alt="SAGE Logo" style={{ height: '36px', width: 'auto' }} />
          </Link>

          <ul className="nav-links">
            {navRoutes.map(r => (
              <li key={r.id}>
                <Link
                  to={r.path}
                  className={`nav-link ${r.cta ? 'nav-cta' : ''} ${activeRoute === r.id ? 'active' : ''}`}
                >
                  {r.label}
                </Link>
              </li>
            ))}

            {isLoggedIn && (
              <li>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="nav-link nav-logout-btn"
                  title="Sign out of your terminal session"
                >
                  LOGOUT
                </button>
              </li>
            )}
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
        {navRoutes.map(r => (
          <Link
            key={r.id}
            to={r.path}
            className={`mobile-nav-link ${activeRoute === r.id ? 'active' : ''}`}
            onClick={() => setIsMobileOpen(false)}
          >
            {r.label}
          </Link>
        ))}

        {isLoggedIn && (
          <button
            type="button"
            onClick={handleLogout}
            className="mobile-nav-link mobile-logout-btn"
          >
            LOGOUT
          </button>
        )}
      </div>
    </>
  );
}
