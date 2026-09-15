import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { auth, db } from '../firebase-config.js';
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  updatePassword,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  onAuthStateChanged,
  signOut
} from "firebase/auth";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { handleFirebaseError } from '../services/error-service.js';

const SAGE_AUTH_SESSION_KEY = 'sage_participant_session';
const SAGE_REMEMBERED_ID_KEY = 'sage_remembered_id';
const SAGE_REMEMBER_FLAG_KEY = 'sage_remember_flag';

function mapUserDocToProfile(data) {
  return {
    name: data.fullName || 'Participant',
    id: data.idNumber || 'SAGE-ID',
    year: data.academicYear || 'Engineering',
    branch: data.branch || 'SAGE Registration',
    email: data.email || '',
    phone: data.contactNumber || 'N/A',
    feeStatus: data.amount ? `VERIFIED (₹${data.amount})` : 'VERIFIED',
    events: Array.isArray(data.events)
      ? data.events.map(ev => ({
          name: typeof ev === 'string' ? ev : (ev.name || 'Event'),
          type: typeof ev === 'object' && ev.type ? ev.type : 'Event',
          venue: typeof ev === 'object' && ev.venue ? ev.venue : 'BVM Campus',
          time: typeof ev === 'object' && ev.time ? ev.time : 'TBA',
          status: 'Registered'
        }))
      : (data.event ? data.event.split(', ').map(ev => ({ name: ev, type: 'Event', venue: 'BVM Campus', time: 'TBA', status: 'Registered' })) : []),
    team: `TEAM-${data.idNumber || 'SAGE'}`
  };
}

export default function Login() {
  const [profile, setProfile] = useState(() => {
    try {
      const raw = localStorage.getItem(SAGE_AUTH_SESSION_KEY) || sessionStorage.getItem(SAGE_AUTH_SESSION_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        return parsed?.profile || null;
      }
    } catch {
      return null;
    }
    return null;
  });

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginFeedback, setLoginFeedback] = useState(null);

  // Forgot Password state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetFeedback, setResetFeedback] = useState(null);
  const [resetCooldown, setResetCooldown] = useState(0);

  useEffect(() => {
    let timer;
    if (resetCooldown > 0) {
      timer = setInterval(() => {
        setResetCooldown(c => c - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resetCooldown]);

  useEffect(() => {
    if (showForgotModal) {
      const lastReset = localStorage.getItem('sage_last_reset_time');
      if (lastReset) {
        const diff = Math.floor((Date.now() - parseInt(lastReset, 10)) / 1000);
        if (diff < 60) {
          setResetCooldown(60 - diff);
        }
      }
    }
  }, [showForgotModal]);

  // Change Password state
  const [showChangePassModal, setShowChangePassModal] = useState(false);
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [changePassLoading, setChangePassLoading] = useState(false);
  const [changePassFeedback, setChangePassFeedback] = useState(null);

  // ── Session Restoration on Mount & Tab Reopen ──
  useEffect(() => {
    let isMounted = true;

    // 1. Restore Remembered Identifier
    const savedRememberFlag = localStorage.getItem(SAGE_REMEMBER_FLAG_KEY);
    if (savedRememberFlag !== null) {
      setRememberMe(savedRememberFlag === 'true');
    }

    const savedIdentifier = localStorage.getItem(SAGE_REMEMBERED_ID_KEY);
    if (savedIdentifier) {
      setIdentifier(savedIdentifier);
    }

    // 2. Instant cache check from localStorage or sessionStorage
    try {
      const localSessionRaw = localStorage.getItem(SAGE_AUTH_SESSION_KEY);
      const sessionSessionRaw = sessionStorage.getItem(SAGE_AUTH_SESSION_KEY);
      const activeSessionRaw = localSessionRaw || sessionSessionRaw;

      if (activeSessionRaw) {
        const parsed = JSON.parse(activeSessionRaw);
        if (parsed && parsed.profile) {
          setProfile(parsed.profile);
        }
      }
    } catch (err) {
      console.warn("Session cache read error:", err);
    }

    // 3. Listen to external auth changes (e.g. Logout button clicked in Navbar)
    const handleAuthChange = () => {
      const hasSession = Boolean(
        localStorage.getItem(SAGE_AUTH_SESSION_KEY) || sessionStorage.getItem(SAGE_AUTH_SESSION_KEY)
      );
      if (!hasSession) {
        setProfile(null);
        setPassword('');
      }
    };
    window.addEventListener('sage-auth-change', handleAuthChange);

    // 4. Sync with Firebase Auth state
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!isMounted) return;

      if (currentUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) {
            const freshProfile = mapUserDocToProfile(userDoc.data());
            const token = await currentUser.getIdToken();
            setProfile(freshProfile);

            const isRemembered = localStorage.getItem(SAGE_REMEMBER_FLAG_KEY) !== 'false';
            const sessionPayload = {
              uid: currentUser.uid,
              token,
              email: currentUser.email,
              profile: freshProfile,
              rememberMe: isRemembered,
              updatedAt: Date.now()
            };

            if (isRemembered) {
              localStorage.setItem(SAGE_AUTH_SESSION_KEY, JSON.stringify(sessionPayload));
            }
            sessionStorage.setItem(SAGE_AUTH_SESSION_KEY, JSON.stringify(sessionPayload));
          }
        } catch (syncErr) {
          console.warn("Background session sync error:", syncErr);
        }
      } else {
        // If not in firebase, check if we had a persistent local session
        const localSessionRaw = localStorage.getItem(SAGE_AUTH_SESSION_KEY);
        if (!localSessionRaw) {
          sessionStorage.removeItem(SAGE_AUTH_SESSION_KEY);
          setProfile(null);
        }
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
      window.removeEventListener('sage-auth-change', handleAuthChange);
    };
  }, []);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    const trimmedId = identifier.trim();
    const trimmedPass = password.trim();

    if (!trimmedId || !trimmedPass) {
      setLoginFeedback(`
        <div class="glass-card" style="border-color: #ff4d4d; color: #ff4d4d; padding: 0.8rem; font-size: 0.85rem; text-align: center;">
          ✕ Please provide both College ID / Email and your Security PIN.
        </div>
      `);
      return;
    }

    setLoginLoading(true);
    setLoginFeedback(null);

    try {
      // Configure Firebase auth persistence based on Remember Me
      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);

      // Resolve login email (supports entering either College ID or Email)
      let loginEmail = trimmedId;
      let cachedProfileDoc = null;
      
      if (!trimmedId.includes('@')) {
        // Query Firestore users by idNumber using 'in' operator to avoid sequential queries
        const searchValues = Array.from(new Set([trimmedId, trimmedId.toUpperCase()]));
        const idQuery = query(collection(db, 'users'), where('idNumber', 'in', searchValues));
        const idSnap = await getDocs(idQuery);

        if (idSnap.empty) {
          throw new Error(`No registered account found with College ID "${trimmedId}". Please enter your registered email address.`);
        }
        
        cachedProfileDoc = idSnap.docs[0];
        loginEmail = cachedProfileDoc.data().email;
      }

      const userCredential = await signInWithEmailAndPassword(auth, loginEmail, trimmedPass);
      
      let userDoc = cachedProfileDoc;
      if (!userDoc) {
        userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      }
      
      if (!userDoc.exists()) {
        throw new Error("Participant profile not found in database.");
      }

      const profileData = mapUserDocToProfile(userDoc.data());
      const token = await userCredential.user.getIdToken();

      const sessionPayload = {
        uid: userCredential.user.uid,
        token,
        email: loginEmail,
        profile: profileData,
        rememberMe,
        savedAt: Date.now()
      };

      if (rememberMe) {
        localStorage.setItem(SAGE_AUTH_SESSION_KEY, JSON.stringify(sessionPayload));
        localStorage.setItem(SAGE_REMEMBERED_ID_KEY, trimmedId);
        localStorage.setItem(SAGE_REMEMBER_FLAG_KEY, 'true');
        sessionStorage.setItem(SAGE_AUTH_SESSION_KEY, JSON.stringify(sessionPayload));
      } else {
        sessionStorage.setItem(SAGE_AUTH_SESSION_KEY, JSON.stringify(sessionPayload));
        localStorage.removeItem(SAGE_AUTH_SESSION_KEY);
        localStorage.removeItem(SAGE_REMEMBERED_ID_KEY);
        localStorage.setItem(SAGE_REMEMBER_FLAG_KEY, 'false');
      }

      setProfile(profileData);
    } catch (error) {
      const el = document.createElement('div');
      handleFirebaseError(error, el, 'LOGIN AUTHENTICATION FAILED');
      setLoginFeedback(el.innerHTML);
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.warn("Logout error:", err);
    }

    localStorage.removeItem(SAGE_AUTH_SESSION_KEY);
    sessionStorage.removeItem(SAGE_AUTH_SESSION_KEY);

    if (!rememberMe) {
      localStorage.removeItem(SAGE_REMEMBERED_ID_KEY);
      localStorage.removeItem(SAGE_REMEMBER_FLAG_KEY);
      setIdentifier('');
    }

    setProfile(null);
    setPassword('');
    setLoginFeedback(null);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!resetEmail) return;

    if (resetCooldown > 0) {
      setResetFeedback(`
        <div class="glass-card" style="border-color: #ff4d4d; color: #ff4d4d; padding: 0.85rem 1rem; border-radius: var(--r-sm); font-size: 0.85rem; text-align: center;">
          ✕ Please wait ${resetCooldown} seconds before requesting another reset link.
        </div>
      `);
      return;
    }

    setResetLoading(true);
    setResetFeedback(null);

    try {
      await sendPasswordResetEmail(auth, resetEmail);
      localStorage.setItem('sage_last_reset_time', Date.now().toString());
      setResetCooldown(60);
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
          ✓ Password successfully updated! Use your new password for future logins.
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
    <section className="login-portal-section">
      {/* COMPACT HUD HEADER */}
      <div className="login-header">
        <div className="badge-hud">ACCESS TERMINAL // PARTICIPANT PORTAL</div>
        <h2>PARTICIPANT LOGIN</h2>
        <div className="login-tip-banner">
          <span>⚡</span>
          <span>First time signing in? Your initial password is your <strong>College ID</strong>.</span>
        </div>
      </div>

      {/* LOGIN TERMINAL CARD OR AUTHENTICATED DASHBOARD */}
      {!profile ? (
        /* LOGIN TERMINAL CARD */
        <div className="login-terminal-card">
          <div className="login-terminal-topbar">
            <div className="login-terminal-dots">
              <span className="login-terminal-dot active"></span>
              <span className="login-terminal-dot"></span>
              <span className="login-terminal-dot"></span>
            </div>
            {/* <span>PORTAL_AUTH // SECURE_SOCKET</span> */}

          </div>

          <div className="login-terminal-body">
            <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
              <div className="login-avatar-ring">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              </div>
              <h3 style={{ color: '#fff', margin: '0 0 0.35rem', fontSize: '1.3rem', letterSpacing: '0.04em', fontFamily: 'var(--font-heading)' }}>
                AUTHENTICATION MATRIX
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', margin: 0 }}>
                Enter your participant credentials to access your event dashboard
              </p>
            </div>

            <form onSubmit={handleLoginSubmit}>
              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>REGISTERED EMAIL</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Enter College Email"
                    required
                    style={{ paddingLeft: '2.75rem' }}
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                  />
                  <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--cyan)' }}>
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
                    onClick={() => {
                      setResetEmail(identifier.includes('@') ? identifier : '');
                      setShowForgotModal(true);
                      setResetFeedback(null);
                    }}
                    style={{ fontSize: '0.75rem', color: 'var(--cyan)', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'inherit' }}
                  >
                    Forgot Password?
                  </button>
                </div>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-input"
                    placeholder="Initial password: Your College ID"
                    required
                    style={{ paddingLeft: '2.75rem', paddingRight: '2.75rem' }}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--cyan)' }}>
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

              {/* REMEMBER ID & SESSION PERSISTENCE CHECKBOX */}
              <label className="remember-terminal-wrapper" htmlFor="login-remember">
                <input
                  type="checkbox"
                  id="login-remember"
                  className="remember-terminal-checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <div className="remember-terminal-text">
                  <span className="remember-terminal-title">Remember ID on this terminal</span>
                  <span className="remember-terminal-desc">Saves credentials &amp; stays signed in across refreshes and tab reopens</span>
                </div>
              </label>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.95rem', fontSize: '0.92rem', letterSpacing: '0.06em' }} disabled={loginLoading}>
                {loginLoading ? '⚡ VERIFYING TERMINAL CREDENTIALS...' : 'SIGN IN TO PORTAL →'}
              </button>

              {loginFeedback && <div style={{ marginTop: '1.25rem' }} dangerouslySetInnerHTML={{ __html: loginFeedback }} />}
            </form>

            <div style={{ marginTop: '1.75rem', textAlign: 'center', paddingTop: '1.25rem', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', margin: 0 }}>
                Haven't registered for SAGE 1.0 yet?
                <Link to="/registration" style={{ color: 'var(--cyan)', fontWeight: 600, textDecoration: 'none', marginLeft: '0.35rem' }}>
                  Register Online →
                </Link>
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* PORTAL DASHBOARD (AUTHENTICATED) */
        <div className="participant-dashboard-entrance" style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div className="glass-card participant-card-stagger-1" style={{ padding: 'clamp(1.25rem, 4vw, 1.75rem) clamp(1rem, 3.5vw, 2rem)', border: '1px solid var(--cyan-border)', borderRadius: 'var(--r-md)', marginBottom: '1.75rem', background: 'linear-gradient(135deg, rgba(0,206,255,0.06), rgba(139,61,255,0.03))' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.25rem', marginBottom: '1.5rem', paddingBottom: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                  <span className="badge-hud" style={{ margin: 0, fontSize: '0.65rem', color: '#00e59b', borderColor: 'rgba(0,229,155,0.4)', background: 'rgba(0,229,155,0.08)' }}>● VERIFIED PARTICIPANT</span>
                  <span className="badge-hud" style={{ margin: 0, fontSize: '0.65rem' }}>ID: <span style={{ color: '#fff' }}>{profile.id}</span></span>
                  <span className="badge-hud" style={{ margin: 0, fontSize: '0.65rem', color: 'var(--cyan)', borderColor: 'var(--cyan-border)' }}>TERMINAL SESSION ACTIVE</span>
                </div>
                <h2 style={{ color: '#fff', margin: '0 0 0.25rem', fontSize: 'clamp(1.35rem, 4vw, 1.75rem)', letterSpacing: '0.03em' }}>{profile.name}</h2>
                <p style={{ color: 'var(--cyan)', fontSize: '0.9rem', margin: 0 }}>{profile.year} • {profile.branch}</p>
              </div>

              <div>
                <button onClick={() => { setNewPass(''); setConfirmPass(''); setChangePassFeedback(null); setShowChangePassModal(true); }} className="btn btn-outline" style={{ padding: '0.5rem 0.85rem', fontSize: '0.75rem', borderColor: 'rgba(0, 206, 255, 0.4)', color: 'var(--cyan)' }}>
                  🔐 CHANGE PASSWORD
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

          <div className="glass-card participant-card-stagger-2" style={{ padding: '1.75rem 2rem', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 'var(--r-md)', marginBottom: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <span className="badge-hud" style={{ margin: '0 0 0.35rem', fontSize: '0.65rem' }}>STAGE STATUS</span>
                <h3 style={{ color: '#fff', margin: 0, fontSize: '1.2rem', letterSpacing: '0.03em' }}>REGISTERED EVENT SESSIONS</h3>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Reporting: 15 mins prior</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.85rem' }}>
              {profile.events && profile.events.length > 0 ? (
                profile.events.map((ev, idx) => (
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
                ))
              ) : (
                <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '1rem' }}>
                  No event records found.
                </div>
              )}
            </div>
          </div>

          <div className="glass-card participant-card-stagger-3" style={{ padding: '1.5rem', border: '1px dashed var(--cyan-border)', borderRadius: 'var(--r-md)', background: 'rgba(0,206,255,0.02)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.25rem' }}>
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
              <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={resetLoading || resetCooldown > 0}>
                {resetLoading ? 'TRANSMITTING RESET LINK...' : resetCooldown > 0 ? `RETRY IN ${resetCooldown}s` : 'SEND RESET LINK →'}
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