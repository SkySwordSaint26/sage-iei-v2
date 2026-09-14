import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function EventDetail() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/events');
  }, [navigate]);

  return (
    <section style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div className="badge-hud" style={{ marginBottom: '1rem' }}>REDIRECTING</div>
        <h2>LOADING MISSION MODULES</h2>
        <p style={{ marginTop: '0.5rem' }}>Routing to Events interface...</p>
      </div>
    </section>
  );
}