import React, { useState } from 'react';

export default function Contact() {
  const [feedback, setFeedback] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const name = formData.get('name') || 'Participant';

    setFeedback(`
      <div class="glass-card" style="border-color: var(--emerald-accent); text-align: center; margin-top: 1.5rem;">
        <h3 style="color: var(--emerald-accent); margin-bottom: 0.5rem;">
          ✓ MESSAGE TRANSMITTED
        </h3>
        <p style="color: #fff;">
          Thank you <strong>${name}</strong>. Your message has been received by the SAGE 1.0 organizing committee.
        </p>
      </div>
    `);

    e.target.reset();
  };

  return (
    <section>
      {/* PAGE HEADER */}
      <div className="section-header">
        <div className="badge-hud">SUPPORT CHANNEL</div>
        <h2>CONTACT &amp; SUPPORT</h2>
        <p>
          Connect with the SAGE 1.0 organizing committee
          for event queries, registration support, and general assistance.
        </p>
      </div>

      {/* CONTACT GRID */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
        gap: '2rem',
        alignItems: 'start'
      }}>
        {/* LEFT: CONTACT INFORMATION */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* EMAIL */}
          <div className="glass-card">
            <h4 style={{ color: 'var(--cyan-primary)', marginBottom: '0.5rem', fontSize: '0.95rem' }}>
              📧 EMAIL
            </h4>
            <p style={{ color: '#fff', fontSize: '0.95rem', marginBottom: '0.35rem' }}>
              ieiteambvm.jarvis@gmail.com
            </p>
            <p style={{ fontSize: '0.9rem' }}>
              Official communication channel for SAGE 1.0.
            </p>
            <a href="mailto:ieiteambvm.jarvis@gmail.com" className="btn btn-secondary" style={{ display: 'inline-block', marginTop: '0.75rem', padding: '0.5rem 1rem', fontSize: '0.8rem' }}>
              SEND EMAIL →
            </a>
          </div>

          {/* HELPDESK */}
          <div className="glass-card">
            <h4 style={{ color: 'var(--cyan-primary)', marginBottom: '0.75rem', fontSize: '0.95rem' }}>
              📞 HELPDESK
            </h4>
            <div style={{ marginBottom: '0.85rem' }}>
              <p style={{ color: '#fff', fontSize: '0.95rem', marginBottom: '0.2rem' }}>
                <strong>Manav Khara</strong>
              </p>
              <a href="tel:+919313134619" style={{ color: 'var(--cyan-primary)', fontSize: '0.9rem' }}>
                +91 93131 34619
              </a>
            </div>
            <div>
              <p style={{ color: '#fff', fontSize: '0.95rem', marginBottom: '0.2rem' }}>
                <strong>Saesh Nadar</strong>
              </p>
              <a href="tel:+918000085752" style={{ color: 'var(--cyan-primary)', fontSize: '0.9rem' }}>
                +91 80000 85752
              </a>
            </div>
          </div>

          {/* SOCIAL MEDIA */}
          <div className="glass-card">
            <h4 style={{ color: 'var(--cyan-primary)', marginBottom: '0.75rem', fontSize: '0.95rem' }}>
              FOLLOW US
            </h4>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <a href="https://www.instagram.com/ieiteambvm/" target="_blank" rel="noopener noreferrer" className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>
                Instagram ↗
              </a>
              <a href="https://www.linkedin.com/company/ie-i-team-bvm/" target="_blank" rel="noopener noreferrer" className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>
                LinkedIn ↗
              </a>
            </div>
          </div>
        </div>

        {/* RIGHT: CONTACT FORM */}
        <div className="glass-card">
          <h3 style={{ color: '#fff', marginBottom: '1.5rem' }}>SEND A MESSAGE</h3>
          <form id="sage-contact-form" onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="contact-name">Full Name</label>
                <input type="text" id="contact-name" name="name" className="form-input" placeholder="Your name" required />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="contact-email">Email Address</label>
                <input type="email" id="contact-email" name="email" className="form-input" placeholder="your@email.com" required />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="contact-subject">Subject</label>
              <select id="contact-subject" name="subject" className="form-select" required>
                <option value="">-- Select Topic --</option>
                <option value="registration">Registration Query</option>
                <option value="events">Event Details</option>
                <option value="rules">Rules &amp; Guidelines</option>
                <option value="general">General Query</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="contact-message">Message</label>
              <textarea id="contact-message" name="message" className="form-textarea" rows="5" placeholder="Describe your query..." required style={{ resize: 'vertical' }}></textarea>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
              TRANSMIT MESSAGE →
            </button>
          </form>

          {feedback && <div dangerouslySetInnerHTML={{ __html: feedback }} />}
        </div>
      </div>
    </section>
  );
}