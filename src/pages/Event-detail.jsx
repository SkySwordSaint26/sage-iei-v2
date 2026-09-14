
import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';


export default function Eventdetail() {
  const containerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Execute legacy logic
    
  // Redirect to the main events page
  setTimeout(() => {
    window.location.hash = '#events';
  }, 50);

  


    // Intercept clicks on links that go to HashRouter
    const handleLinkClick = (e) => {
      const target = e.target.closest('a');
      if (target && target.getAttribute('href')?.startsWith('#/')) {
        e.preventDefault();
        const path = target.getAttribute('href').replace('#', '');
        navigate(path);
      }
    };
    
    const container = containerRef.current;
    if (container) {
      container.addEventListener('click', handleLinkClick);
    }
    
    return () => {
      if (container) {
        container.removeEventListener('click', handleLinkClick);
      }
    };
  }, [navigate]);

  return (
    <div 
      ref={containerRef}
      dangerouslySetInnerHTML={{ __html: `
    <section style="min-height: 60vh; display: flex; align-items: center; justify-content: center;">
      <div style="text-align: center;">
        <div class="badge-hud" style="margin-bottom: 1rem;">REDIRECTING</div>
        <h2>LOADING MISSION MODULES</h2>
        <p style="margin-top: 0.5rem;">Routing to Events interface...</p>
      </div>
    </section>
  ` }} 
    />
  );
}
