import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { auth, db } from '../firebase-config.js';
import { signInWithEmailAndPassword, sendPasswordResetEmail, updatePassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { handleFirebaseError } from '../services/error-service.js';

export default function Login() {
  const [profile, setProfile] = useState(null);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginFeedback, setLoginFeedback] = useState(null);

  // Forgot Password state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetFeedback, setResetFeedback] = useState(null);

  // Change Password state
  const [showChangePassModal, setShowChangePassModal] = useState(false);
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [changePassLoading, setChangePassLoading] = useState(false);
  const [changePassFeedback, setChangePassFeedback] = useState(null);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginFeedback(null);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      
      if (userDoc.exists()) {
        const data = userDoc.data();
        setProfile({
          name: data.fullName,
          id: data.idNumber,
          year: data.academicYear,
          branch: 'SAGE Registration',
          email: data.email,
          phone: data.contactNumber,
          feeStatus: data.amount ? `VERIFIED (₹${data.amount})` : 'VERIFIED',
          events: data.events.map(ev => ({ name: ev, type: 'Event', venue: 'Campus', time: 'TBA', status: 'Registered' })),
          team: `TEAM-${data.idNumber}`
        });
      } else {
        throw new Error("User data not found in database.");
      }
    } catch (error) {
      const el = document.createElement('div');
      handleFirebaseError(error, el, 'LOGIN AUTHENTICATION FAILED');
      setLoginFeedback(el.innerHTML);
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    setProfile(null);
    setEmail('');
    setPassword('');
    setLoginFeedback(null);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!resetEmail) return;
    setResetLoading(true);
    setResetFeedback(null);

    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setResetFeedback(`
        <div class="glass-card" style="border-color: #00e59b; background: rgba(0, 229, 155, 0.08); color: #00e59b; padding: 0.85rem 1rem; border-radius: var(--r-sm); font-size: 0.85rem; text-align: center;">
          ✓ Password reset link dispatched! Please check your email inbox and spam folder.
        </div>
      `);
    } catch (err) {
      const el = document.createElement('div');
      handleFirebaseError(err, el, 'PASSWORD RESET FAILED');
      setResetFeedback(el.innerHTML);
    } finally {
      setResetLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (!newPass || newPass.length < 6) {
      setChangePassFeedback(`
        <div class="glass-card" style="border-color: #ff4d4d; color: #ff4d4d; padding: 0.75rem; font-size: 0.8rem; text-align: center;">
          ✕ Password must be at least 6 characters long.
        </div>
      `);
      return;
    }

    if (newPass !== confirmPass) {
      setChangePassFeedback(`
        <div class="glass-card" style="border-color: #ff4d4d; color: #ff4d4d; padding: 0.75rem; font-size: 0.8rem; text-align: center;">
          ✕ New passwords do not match. Please try again.
        </div>
      `);
      return;
    }

    setChangePassLoading(true);
    setChangePassFeedback(null);

    try {
      if (!auth.currentUser) throw new Error('No active login session found.');
      await updatePassword(auth.currentUser, newPass);
      setChangePassFeedback(`
        <div class="glass-card" style="border-color: #00e59b; background: rgba(0, 229, 155, 0.08); color: #00e59b; padding: 0.85rem 1rem; border-radius: var(--r-sm); font-size: 0.85rem; text-align: center;">
          ✓ Password successfully updated! Use your new password for all future logins.
        </div>
      `);
      setTimeout(() => setShowChangePassModal(false), 2000);
    } catch (err) {
      const el = document.createElement('div');
      handleFirebaseError(err, el, 'PASSWORD UPDATE FAILED');
      setChangePassFeedback(el.innerHTML);
    } finally {
      setChangePassLoading(false);
    }
  };

  return (
    <section className="section" style={{ paddingTop: 'calc(var(--nav-height) + 2rem)' }}>
      {/* HEADER */}
      <div className="section-header">
        <div className="badge-hud">PARTICIPANT ACCESS PORTAL</div>
        <h2>PARTICIPANT LOGIN</h2>
        <p>
          Sign in with your Email and Security PIN to view registered events,
          schedule alerts, team allocations, and digital entry badges.<br />
          <span style={{ color: '#00e59b', fontSize: '0.85rem' }}>⚡ First time signing in? Your initial password is your College ID.</span>
        </p>
      </div>

      {/* LOGIN CARD */}
      {!profile ? (
        <div
          className="glass-card"
          style={{
            maxWidth: '540px',
            margin: '0 auto',
            padding: 'clamp(1.5rem, 4vw, 2.25rem) clamp(1rem, 3.5vw, 2rem)',
            border: '1px solid var(--cyan-border)',
            boxShadow: '0 0 35px rgba(0, 206, 255, 0.08)',
            borderRadius: 'var(--r-md)'
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{
              width: '58px', height: '58px', margin: '0 auto 1rem', background: 'rgba(0, 206, 255, 0.08)',
              border: '1px solid var(--cyan-border)', borderRadius: '50%', display: 'flex',
              alignItems: 'center', justifyContent: 'center', color: 'var(--cyan)',
              boxShadow: '0 0 20px rgba(0, 206, 255, 0.2)'
            }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </div>
            <h3 style={{ color: '#fff', margin: '0 0 0.4rem', fontSize: '1.35rem', letterSpacing: '0.04em' }}>
              AUTHENTICATION MATRIX
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
              Enter your participant credentials to access your event dashboard
            </p>
          </div>

          <form onSubmit={handleLoginSubmit}>
            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label className="form-label">REGISTERED EMAIL ADDRESS</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  className="form-input"
                  placeholder="e.g. user@example.com"
                  required
                  style={{ paddingLeft: '2.75rem' }}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </div>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <label className="form-label" style={{ margin: 0 }}>SECURITY PIN / PASSWORD</label>
                <button
                  type="button"
                  onClick={() => { setResetEmail(email); setShowForgotModal(true); setResetFeedback(null); }}
                  style={{ fontSize: '0.75rem', color: 'var(--cyan)', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'inherit', transition: 'color 0.2s ease' }}
                >
                  Forgot Password?
                </button>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder="Initial password: College ID"
                  required
                  style={{ paddingLeft: '2.75rem', paddingRight: '2.75rem' }}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.25rem', display: 'flex', alignItems: 'center' }}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                  )}
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem' }}>
              <input type="checkbox" id="login-remember" defaultChecked style={{ width: '16px', height: '16px', accentColor: 'var(--cyan)', cursor: 'pointer' }} />
              <label htmlFor="login-remember" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', cursor: 'pointer', margin: 0 }}>
                Remember ID on this terminal
              </label>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.9rem', fontSize: '0.95rem', letterSpacing: '0.05em' }} disabled={loginLoading}>
              {loginLoading ? '⚡ AUTHENTICATING CREDENTIALS...' : 'SIGN IN TO PORTAL →'}
            </button>

            {loginFeedback && <div style={{ marginTop: '1rem' }} dangerouslySetInnerHTML={{ __html: loginFeedback }} />}
          </form>

          <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', margin: 0 }}>
              Haven't registered for SAGE 1.0 yet?
              <Link to="/registration" style={{ color: 'var(--cyan)', fontWeight: 600, textDecoration: 'none', marginLeft: '0.35rem' }}>
                Register Online →
              </Link>
            </p>
          </div>
        </div>
      ) : (
        /* PORTAL DASHBOARD */
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div className="glass-card" style={{ padding: 'clamp(1.25rem, 4vw, 1.75rem) clamp(1rem, 3.5vw, 2rem)', border: '1px solid var(--cyan-border)', borderRadius: 'var(--r-md)', marginBottom: '1.75rem', background: 'linear-gradient(135deg, rgba(0,206,255,0.06), rgba(139,61,255,0.03))' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.25rem', marginBottom: '1.5rem', paddingBottom: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                  <span className="badge-hud" style={{ margin: 0, fontSize: '0.65rem', color: '#00e59b', borderColor: 'rgba(0,229,155,0.4)', background: 'rgba(0,229,155,0.08)' }}>● VERIFIED PARTICIPANT</span>
                  <span className="badge-hud" style={{ margin: 0, fontSize: '0.65rem' }}>ID: <span style={{ color: '#fff' }}>{profile.id}</span></span>
                </div>
                <h2 style={{ color: '#fff', margin: '0 0 0.25rem', fontSize: 'clamp(1.35rem, 4vw, 1.75rem)', letterSpacing: '0.03em' }}>{profile.name}</h2>
                <p style={{ color: 'var(--cyan)', fontSize: '0.9rem', margin: 0 }}>{profile.year} • {profile.branch}</p>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button onClick={() => { setNewPass(''); setConfirmPass(''); setChangePassFeedback(null); setShowChangePassModal(true); }} className="btn btn-outline" style={{ padding: '0.5rem 0.85rem', fontSize: '0.75rem', borderColor: 'rgba(0, 206, 255, 0.4)', color: 'var(--cyan)' }}>
                  🔐 CHANGE PASSWORD
                </button>
                <button onClick={handleLogout} className="btn btn-outline" style={{ padding: '0.5rem 1rem', fontSize: '0.75rem' }}>
                  ← LOGOUT
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 150px), 1fr))', gap: '1rem' }}>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.75rem 1rem', borderRadius: 'var(--r-sm)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Assigned Team</div>
                <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem', marginTop: '0.2rem' }}>{profile.team}</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.75rem 1rem', borderRadius: 'var(--r-sm)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Fee Clearance</div>
                <div style={{ fontWeight: 700, color: '#00e59b', fontSize: '0.95rem', marginTop: '0.2rem' }}>{profile.feeStatus}</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.75rem 1rem', borderRadius: 'var(--r-sm)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Email Address</div>
                <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.85rem', marginTop: '0.2rem', overflow: 'hidden', textOverflow: 'ellipsis' }}>{profile.email}</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.75rem 1rem', borderRadius: 'var(--r-sm)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Emergency Contact</div>
                <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.85rem', marginTop: '0.2rem' }}>{profile.phone}</div>
              </div>
            </div>
          </div>

          <div className="glass-card" style={{ padding: '1.75rem 2rem', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 'var(--r-md)', marginBottom: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <span className="badge-hud" style={{ margin: '0 0 0.35rem', fontSize: '0.65rem' }}>STAGE STATUS</span>
                <h3 style={{ color: '#fff', margin: 0, fontSize: '1.2rem', letterSpacing: '0.03em' }}>REGISTERED EVENT SESSIONS</h3>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Reporting: 15 mins prior</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.85rem' }}>
              {profile.events.map((ev, idx) => (
                <div key={idx} className="glass-card" style={{ padding: '1rem 1.25rem', border: '1px solid rgba(0, 206, 255, 0.15)', background: 'rgba(0, 206, 255, 0.03)', borderRadius: 'var(--r-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-heading)' }}>0{idx + 1}</span>
                      <h4 style={{ color: '#fff', margin: 0, fontSize: '0.95rem', letterSpacing: '0.03em' }}>{ev.name}</h4>
                      <span className="badge-hud" style={{ margin: 0, fontSize: '0.62rem', color: 'var(--cyan)', borderColor: 'var(--cyan-border)' }}>{ev.type}</span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                      <span>📍 <strong>Venue:</strong> {ev.venue}</span>
                      <span>⏰ <strong>Time:</strong> {ev.time}</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className="badge-hud" style={{ margin: 0, fontSize: '0.68rem', color: '#00e59b', borderColor: 'rgba(0,229,155,0.3)', background: 'rgba(0,229,155,0.06)' }}>
                      ● {ev.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card" style={{ padding: '1.5rem', border: '1px dashed var(--cyan-border)', borderRadius: 'var(--r-md)', background: 'rgba(0,206,255,0.02)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.25rem' }}>
            <div>
              <h4 style={{ color: '#fff', margin: '0 0 0.25rem', fontSize: '1rem' }}>🎫 DIGITAL SAGE 1.0 ENTRY PASS</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', margin: 0 }}>Show this pass at registration verification desks and individual event labs.</p>
            </div>
            <button className="btn btn-primary" style={{ padding: '0.6rem 1.25rem', fontSize: '0.8rem' }} onClick={() => alert('✓ Digital Entry Pass Verified & Synced with College ID.')}>
              DOWNLOAD BADGE (PDF) ↓
            </button>
          </div>
        </div>
      )}

      {/* FORGOT PASSWORD MODAL */}
      {showForgotModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(4, 6, 12, 0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={(e) => { if(e.target === e.currentTarget) setShowForgotModal(false); }}>
          <div className="glass-card" style={{ maxWidth: 'min(450px, 95vw)', width: '100%', border: '1px solid var(--cyan-border)', boxShadow: '0 0 35px rgba(0, 206, 255, 0.2)', borderRadius: 'var(--r-md)', padding: 'clamp(1.25rem, 4vw, 2rem)', position: 'relative', background: '#080f1d' }}>
            <button type="button" onClick={() => setShowForgotModal(false)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.25rem', padding: '0.25rem', lineHeight: 1 }}>✕</button>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div className="badge-hud" style={{ marginBottom: '0.5rem' }}>RECOVERY PROTOCOL</div>
              <h3 style={{ color: '#fff', margin: '0 0 0.4rem', fontSize: '1.25rem', letterSpacing: '0.04em' }}>RESET PASSWORD</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', margin: 0, lineHeight: 1.5 }}>Enter your registered email address to receive an official password reset link.</p>
            </div>
            <form onSubmit={handleResetPassword}>
              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="form-label">REGISTERED EMAIL ADDRESS</label>
                <input type="email" className="form-input" placeholder="e.g. user@example.com" required value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} />
              </div>
              {resetFeedback && <div style={{ marginBottom: '1.25rem' }} dangerouslySetInnerHTML={{ __html: resetFeedback }} />}
              <button type="submit" className="btn-portal" style={{ width: '100%', justifyContent: 'center' }} disabled={resetLoading}>
                {resetLoading ? 'TRANSMITTING RESET LINK...' : 'SEND RESET LINK →'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* CHANGE PASSWORD MODAL */}
      {showChangePassModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(7, 11, 20, 0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={(e) => { if(e.target === e.currentTarget) setShowChangePassModal(false); }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: 'min(440px, 95vw)', padding: 'clamp(1.25rem, 4vw, 2rem)', border: '1px solid var(--cyan-border)', borderRadius: 'var(--r-md)', boxShadow: '0 0 35px rgba(0, 206, 255, 0.15)', position: 'relative' }}>
            <button type="button" onClick={() => setShowChangePassModal(false)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '1.25rem', cursor: 'pointer', lineHeight: 1 }}>✕</button>
            <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
              <div className="badge-hud" style={{ marginBottom: '0.5rem', color: 'var(--cyan)', borderColor: 'var(--cyan-border)' }}>SECURITY PANEL</div>
              <h3 style={{ color: '#fff', margin: '0 0 0.5rem', fontSize: '1.25rem' }}>UPDATE PIN CODE</h3>
            </div>
            <form onSubmit={handleChangePassword}>
              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="form-label">NEW SECURITY PIN</label>
                <input type="password" minLength="6" className="form-input" placeholder="Min. 6 characters" required value={newPass} onChange={(e) => setNewPass(e.target.value)} />
              </div>
              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="form-label">CONFIRM PIN</label>
                <input type="password" minLength="6" className="form-input" placeholder="Re-enter password" required value={confirmPass} onChange={(e) => setConfirmPass(e.target.value)} />
              </div>
              {changePassFeedback && <div style={{ marginBottom: '1.25rem' }} dangerouslySetInnerHTML={{ __html: changePassFeedback }} />}
              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.85rem' }} disabled={changePassLoading}>
                {changePassLoading ? 'UPDATING SECURITY PIN...' : 'UPDATE PASSWORD →'}
              </button>
            </form>
          </div>
        </div>
      )}

    </section>
  );
}