import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import logoIcon from '../assets/Only S metallic Blue.png';

const currentYear = new Date().getFullYear();

export default memo(function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <Link to="/home" className="nav-brand" style={{ marginBottom: '1rem', textDecoration: 'none' }}>
              <img src={logoIcon} alt="SAGE Logo" style={{ height: '36px', width: 'auto' }} />
            </Link>
            <p style={{ maxWidth: '400px', fontSize: '0.9rem' }}>
              The next-generation national engineering symposium. Empowering future innovators through competitive hackathons, robotics, AI challenges, and expert workshops.
            </p>
          </div>

          <div>
            <h4 style={{ color: 'var(--cyan-primary)', marginBottom: '1.25rem', fontSize: '0.95rem' }}>Quick Navigation</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.9rem', padding: 0 }}>
              <li><Link to="/home" style={{ color: 'inherit', textDecoration: 'none' }}>Home</Link></li>
              <li><Link to="/about" style={{ color: 'inherit', textDecoration: 'none' }}>About Symposium</Link></li>
              <li><Link to="/events" style={{ color: 'inherit', textDecoration: 'none' }}>Event Tracks</Link></li>
            </ul>
          </div>

          <div>
            <h4 style={{ color: 'var(--cyan-primary)', marginBottom: '1.25rem', fontSize: '0.95rem' }}>Support & Contact</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.9rem', padding: 0 }}>
              <li><Link to="/registration" style={{ color: 'inherit', textDecoration: 'none' }}>Register Now</Link></li>
              <li><Link to="/contact" style={{ color: 'inherit', textDecoration: 'none' }}>Contact Organizers</Link></li>
              <li><Link to="/contact" style={{ color: 'inherit', textDecoration: 'none' }}>Venue Map</Link></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <span>&copy; {currentYear} SAGE 1.0 Engineering Event. All rights reserved.</span>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <span className="badge-hud" style={{ fontSize: '0.75rem' }}>SYSTEM ONLINE</span>
          </div>
        </div>
      </div>
    </footer>
  );
});

