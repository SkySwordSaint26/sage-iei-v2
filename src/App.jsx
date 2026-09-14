import React, { useEffect, Suspense, lazy } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { useScrollReveal } from './hooks/useScrollReveal';

// Lazy-loaded Pages for optimal initial load time
const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Events = lazy(() => import('./pages/Events'));
const EventDetail = lazy(() => import('./pages/EventDetail'));
const Registration = lazy(() => import('./pages/Registration'));
const Login = lazy(() => import('./pages/Login'));
const Contact = lazy(() => import('./pages/Contact'));

function RouteLoadingFallback() {
  return (
    <div
      style={{
        minHeight: '55vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1.25rem',
        padding: '3rem 1rem'
      }}
    >
      <div className="brand-icon-arc" style={{ width: '36px', height: '36px' }}></div>
      <div className="badge-hud" style={{ fontSize: '0.72rem', letterSpacing: '0.16em', color: 'var(--cyan)' }}>
        SYSTEM // LOADING MODULE...
      </div>
    </div>
  );
}

function AppContent() {
  useScrollReveal();
  const location = useLocation();

  // Mark which route is active on the main app element (used for CSS overrides)
  const getRouteKey = () => {
    const path = location.pathname.replace(/^\//, '');
    return path || 'home';
  };

  useEffect(() => {
    // Scroll to top on route change
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [location.pathname]);

  return (
    <>
      <Navbar />
      
      <main id="app" className="page-wrapper" data-route={getRouteKey()}>
        <Suspense fallback={<RouteLoadingFallback />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/home" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/events" element={<Events />} />
            <Route path="/event-detail" element={<EventDetail />} />
            <Route path="/registration" element={<Registration />} />
            <Route path="/login" element={<Login />} />
            <Route path="/contact" element={<Contact />} />
          </Routes>
        </Suspense>
      </main>

      <Footer />
    </>
  );
}

export default function App() {
  return (
    <AppContent />
  );
}

