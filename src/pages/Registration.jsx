import React, { useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { auth, db } from '../firebase-config.js';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, deleteUser } from "firebase/auth";
import { collection, query, where, getDocs, doc, setDoc, getDoc } from "firebase/firestore";
import { handleFirebaseError } from '../services/error-service.js';
import { verifyVolunteer } from '../services/volunteer-auth.js';
import { EVENTS_DATA } from '../data/events-data.js';

function calculateEventFee(count) {
  if (count <= 0) return 0;
  if (count === 1) return 40;
  if (count === 2) return 70;
  if (count === 3) return 100;
  if (count === 4) return 125;
  if (count === 5) return 150;
  if (count === 6) return 165;
  return 180; // All 7 Events
}

const TECH_OPTIONS = EVENTS_DATA.filter(e => e.category === 'tech');
const NON_TECH_OPTIONS = EVENTS_DATA.filter(e => e.category === 'non-tech');
const BRANCHES = ['Mechanical', 'Production', 'Civil', 'Computer', 'IT', 'Electronics', 'Electronics & Communication', 'Electrical'];

export default function Registration() {
  const [formData, setFormData] = useState({
    name: '', idNumber: '', contactNumber: '', academicYear: '', branch: '', email: '', paymentMethod: '', transactionId: '', volunteerEmail: '', volunteerPass: ''
  });

  const [selectedTechEvents, setSelectedTechEvents] = useState([]);
  const [selectedNonTechEvents, setSelectedNonTechEvents] = useState([]);
  const [screenshotFile, setScreenshotFile] = useState(null);
  
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [showVolunteerPass, setShowVolunteerPass] = useState(false);
  
  const formRef = useRef(null);
  const feedbackRef = useRef(null);

  // Mechanical & Production 1st–3rd year: min 2 non-tech + min 2 tech. Everyone else: any events, at least 1.
  const hasMinimums = (formData.branch === 'Mechanical' || formData.branch === 'Production') && ['1st Year', '2nd Year', '3rd Year'].includes(formData.academicYear);
  const minNonTechRequired = hasMinimums ? 2 : 0;
  const minTechRequired = hasMinimums ? 2 : 0;

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'paymentMethod' && value !== 'online') {
      setFormData(prev => ({ ...prev, transactionId: '' }));
      setScreenshotFile(null);
    }
  }, []);

  const handleTechChange = useCallback((e) => {
    const value = e.target.value;
    if (e.target.checked) setSelectedTechEvents(prev => [...prev, value]);
    else setSelectedTechEvents(prev => prev.filter(v => v !== value));
  }, []);

  const handleNonTechChange = useCallback((e) => {
    const value = e.target.value;
    if (e.target.checked) setSelectedNonTechEvents(prev => [...prev, value]);
    else setSelectedNonTechEvents(prev => prev.filter(v => v !== value));
  }, []);


  const selectedCount = selectedTechEvents.length + selectedNonTechEvents.length;
  const feeAmount = calculateEventFee(selectedCount);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback(null);

    if (selectedNonTechEvents.length < minNonTechRequired) {
      setFeedback(`<div class="glass-card" style="border-color:#ff4d4d; text-align:center; margin-top:1.5rem;"><h3 style="color:#ff4d4d;">✕ NON-TECH EVENT SELECTION INCOMPLETE</h3><p style="color:#91a1bd;">You must select at least <strong>${minNonTechRequired} Non-Tech Events</strong>.</p></div>`);
      feedbackRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    if (selectedTechEvents.length < minTechRequired) {
      setFeedback(`<div class="glass-card" style="border-color:#ff4d4d; text-align:center; margin-top:1.5rem;"><h3 style="color:#ff4d4d;">✕ TECH EVENT SELECTION INCOMPLETE</h3><p style="color:#91a1bd;">You must select at least <strong>${minTechRequired} Tech Events</strong>.</p></div>`);
      feedbackRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    if (selectedCount === 0) {
      setFeedback(`<div class="glass-card" style="border-color:#ff4d4d; text-align:center; margin-top:1.5rem;"><h3 style="color:#ff4d4d;">✕ EVENT SELECTION REQUIRED</h3><p style="color:#91a1bd;">Please select at least <strong>1 event</strong>.</p></div>`);
      feedbackRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    const eventsList = [...selectedNonTechEvents, ...selectedTechEvents];

    if (!formData.volunteerEmail || !formData.volunteerPass) {
      setFeedback(`<div class="glass-card" style="border-color:#ff4d4d; text-align:center; margin-top:1.5rem;"><h3 style="color:#ff4d4d;">✕ VOLUNTEER AUTHORIZATION REQUIRED</h3><p style="color:#91a1bd;">Please enter volunteer email and password.</p></div>`);
      feedbackRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    if (formData.paymentMethod === 'online' && !screenshotFile) {
      setFeedback(`<div class="glass-card" style="border-color:#ff4d4d; text-align:center; margin-top:1.5rem;"><h3 style="color:#ff4d4d;">✕ PAYMENT SCREENSHOT REQUIRED</h3><p style="color:#91a1bd;">Please upload your payment screenshot.</p></div>`);
      feedbackRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setLoading(true);
    setFeedback(`<div class="glass-card" style="border-color:var(--cyan-primary); text-align:center; margin-top:1.5rem;"><h3 style="color:var(--cyan-primary);">AUTHENTICATING & SUBMITTING...</h3><p style="color:#91a1bd;">Verifying volunteer desk authorization and uploading registration details.</p></div>`);
    feedbackRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });

    const idNumber = formData.idNumber.trim().toUpperCase();
    const email = formData.email.trim();

    try {
      const [volunteer, idSnap, phoneSnap, screenshotData] = await Promise.all([
        verifyVolunteer(formData.volunteerEmail, formData.volunteerPass),
        getDocs(query(collection(db, 'users'), where('idNumber', 'in', [...new Set([formData.idNumber.trim(), idNumber])]))),
        getDocs(query(collection(db, 'users'), where('contactNumber', '==', formData.contactNumber))),
        screenshotFile ? new Promise((resolve, reject) => {
          const img = new Image();
          const url = URL.createObjectURL(screenshotFile);
          img.onload = () => {
            URL.revokeObjectURL(url);
            // Cap the longest side so very tall screenshots stay well under Firestore's 1 MiB doc limit
            const scale = Math.min(1, 1280 / Math.max(img.width, img.height));
            const width = Math.round(img.width * scale), height = Math.round(img.height * scale);
            const canvas = document.createElement('canvas');
            canvas.width = width; canvas.height = height;
            canvas.getContext('2d').drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', 0.6));
          };
          img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Unable to read screenshot. Please upload a PNG or JPG image (iPhone HEIC photos are not supported).')); };
          img.src = url;
        }) : Promise.resolve('')
      ]);

      if (!idSnap.empty) throw new Error('A participant with this College ID is already registered.');
      if (!phoneSnap.empty) throw new Error('A participant with this Contact Number is already registered.');

      const initialPassword = idNumber.length < 6 ? idNumber.padEnd(6, '0') : idNumber;

      let userCredential;
      try {
        userCredential = await createUserWithEmailAndPassword(auth, email, initialPassword);
      } catch (authErr) {
        if (authErr.code === 'auth/email-already-in-use') {
          // Self-healing: Check if this is a ghost account (Auth exists but no Firestore doc)
          try {
            userCredential = await signInWithEmailAndPassword(auth, email, initialPassword);
            const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
            if (userDoc.exists()) {
              // Real registration already exists
              throw new Error('A participant with this Email is already registered.');
            }
            // If we reach here, it's a ghost account! Proceed to create the Firestore doc.
          } catch {
            // If sign in fails, or any other error occurs, fallback to standard error
            throw new Error('A participant with this Email is already registered.');
          }
        } else {
          throw authErr;
        }
      }

      try {
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          fullName: formData.name, idNumber, contactNumber: formData.contactNumber,
          academicYear: formData.academicYear, branch: formData.branch, email, event: eventsList.join(', '), events: eventsList,
          paymentMethod: formData.paymentMethod, amount: feeAmount, transactionId: formData.transactionId,
          screenshotData, screenshotFileName: screenshotFile?.name || '', screenshotContentType: screenshotFile?.type || '',
          volunteerUid: volunteer.uid, authorizedByVolunteer: volunteer.name, authorizedByClub: volunteer.club,
          initialPasswordSet: true, createdAt: new Date().toISOString()
        });
      } catch (firestoreErr) {
        // Roll back the Auth account so it doesn't become a ghost registration
        await deleteUser(userCredential.user).catch(() => {});
        throw firestoreErr;
      }

      setFeedback(`
        <div class="glass-card" style="border-color:var(--emerald-accent); text-align:center; margin-top:1.5rem;">
          <div class="badge-hud" style="color:var(--emerald-accent); border-color:rgba(0,229,155,0.4); background:rgba(0,229,155,0.08);">✓ REGISTRATION AUTHORIZED</div>
          <h3 style="color:var(--emerald-accent); margin-top:1rem;">✓ REGISTRATION SUCCESSFUL</h3>
          <p style="color:#fff;">Thank you <strong>${formData.name}</strong>!</p>
          <div style="margin-top:1.25rem; color:var(--cyan-primary); text-align: left; background: rgba(0,206,255,0.04); padding: 1rem 1.25rem; border-radius: var(--r-sm); border: 1px solid var(--cyan-border);">
            <p style="margin-bottom: 0.5rem; color:#00e59b; font-size:0.88rem;"><strong>🛡️ Authorized by:</strong> ${volunteer.name} (${volunteer.club})</p>
            <p style="margin-bottom: 0.5rem;"><strong>Registered Events:</strong> ${eventsList.join(', ')}</p>
            <p style="margin-bottom: 0.25rem;"><strong>Registration Fee:</strong> ₹${feeAmount}</p>
          </div>
        </div>
      `);
      setFormData(prev => ({ name: '', idNumber: '', contactNumber: '', academicYear: '', branch: '', email: '', paymentMethod: '', transactionId: '', volunteerEmail: prev.volunteerEmail, volunteerPass: prev.volunteerPass }));
      setSelectedTechEvents([]); setSelectedNonTechEvents([]); setScreenshotFile(null);
      formRef.current?.reset();
    } catch (err) {
      const el = document.createElement('div');
      handleFirebaseError(err, el, 'REGISTRATION FAILED');
      setFeedback(el.innerHTML);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section>
      <div className="section-header">
        <div className="badge-hud">ONLINE PORTAL</div>
        <h2>PARTICIPANT REGISTRATION</h2>
        <p>Register individually for SAGE 1.0. Teams will be formed by the organizing committee.</p>
      </div>

      <div className="glass-card" style={{ maxWidth: '850px', margin: '0 auto', padding: 'clamp(1.25rem, 4vw, 2.5rem)' }}>
        <div style={{ background: 'rgba(0, 206, 255, 0.04)', border: '1px solid var(--cyan-border)', borderRadius: 'var(--r-sm)', padding: '0.75rem 1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>⚡ Already registered for SAGE 1.0?</span>
          <Link to="/login" style={{ color: 'var(--cyan)', fontSize: '0.82rem', fontWeight: 700, textDecoration: 'none' }}>Access Participant Login Portal →</Link>
        </div>

        <form ref={formRef} onSubmit={handleSubmit}>
          <h3 style={{ color: 'var(--cyan-primary)', marginBottom: '1.5rem' }}>01 &nbsp; PARTICIPANT DETAILS</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: '1.25rem' }}>
            <div className="form-group"><label className="form-label">Full Name</label><input type="text" name="name" className="form-input" placeholder="Enter your full name" required value={formData.name} onChange={handleChange} /></div>
            <div className="form-group"><label className="form-label">ID Number</label><input type="text" name="idNumber" className="form-input" placeholder="Enter your college ID" required value={formData.idNumber} onChange={handleChange} /></div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: '1.25rem', marginTop: '0.5rem' }}>
            <div className="form-group"><label className="form-label">Contact Number</label><input type="tel" name="contactNumber" className="form-input" placeholder="Enter 10-digit mobile number" pattern="[0-9]{10}" maxLength="10" required value={formData.contactNumber} onChange={handleChange} /></div>
            <div className="form-group">
              <label className="form-label">Academic Year</label>
              <select name="academicYear" className="form-select" required value={formData.academicYear} onChange={handleChange}>
                <option value="">-- Select Academic Year --</option>
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: '1.25rem', marginTop: '0.5rem' }}>
            <div className="form-group">
              <label className="form-label">Branch</label>
              <select name="branch" className="form-select" required value={formData.branch} onChange={handleChange}>
                <option value="">-- Select Branch --</option>
                {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div className="form-group"><label className="form-label">Registered Email</label><input type="email" name="email" className="form-input" placeholder="e.g. name@example.com" required value={formData.email} onChange={handleChange} /></div>
          </div>

          {/* EVENT SELECTION SECTIONS */}

          {formData.academicYear && formData.branch && (
            <div style={{ marginTop: '2.5rem' }}>
              <h3 style={{ color: 'var(--cyan-primary)', marginBottom: '1.5rem' }}>EVENT SELECTION MODULES</h3>
              {!hasMinimums && <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Choose any events you like — at least 1.</p>}

              <div style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">01 // NON-TECH EVENTS{hasMinimums && ` (MIN ${minNonTechRequired})`}</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
                  {NON_TECH_OPTIONS.map(opt => (
                    <label key={opt.id} className="glass-card" style={{ padding: '1rem', cursor: 'pointer', display: 'flex', gap: '0.75rem', borderColor: selectedNonTechEvents.includes(opt.title) ? opt.accent : 'rgba(255,255,255,0.1)', background: selectedNonTechEvents.includes(opt.title) ? 'rgba(139,61,255,0.08)' : 'rgba(255,255,255,0.02)' }}>
                      <input type="checkbox" value={opt.title} checked={selectedNonTechEvents.includes(opt.title)} onChange={handleNonTechChange} style={{ width: '18px', height: '18px', accentColor: opt.accent }} />
                      <div>
                        <div style={{ color: '#fff', fontWeight: 700 }}>{opt.title}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">02 // TECH EVENTS{hasMinimums && ` (MIN ${minTechRequired})`}</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
                  {TECH_OPTIONS.map(opt => (
                    <label key={opt.id} className="glass-card" style={{ padding: '1rem', cursor: 'pointer', display: 'flex', gap: '0.75rem', borderColor: selectedTechEvents.includes(opt.title) ? 'var(--cyan)' : 'rgba(255,255,255,0.1)', background: selectedTechEvents.includes(opt.title) ? 'rgba(0,206,255,0.08)' : 'rgba(255,255,255,0.02)' }}>
                      <input type="checkbox" value={opt.title} checked={selectedTechEvents.includes(opt.title)} onChange={handleTechChange} style={{ width: '18px', height: '18px', accentColor: 'var(--cyan)' }} />
                      <div>
                        <div style={{ color: '#fff', fontWeight: 700 }}>{opt.title}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* PAYMENT */}
          <h3 style={{ color: 'var(--cyan-primary)', marginBottom: '1.5rem', marginTop: '2.5rem' }}>FEE ALLOCATION</h3>
          
          <div className="glass-card" style={{ padding: '1.25rem', marginBottom: '1.5rem', border: '1px solid var(--cyan-border)', background: 'linear-gradient(135deg, rgba(0,206,255,0.05), rgba(139,61,255,0.02))' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.75rem', marginBottom: '0.75rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Selected Modules</span>
              <span style={{ color: '#fff', fontWeight: 700 }}>{selectedCount}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#fff', fontSize: '1.1rem' }}>Total Fee Amount</span>
              <span style={{ color: 'var(--cyan-primary)', fontSize: '1.5rem', fontWeight: 700 }}>₹{feeAmount}</span>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Payment Mode</label>
            <select name="paymentMethod" className="form-select" required value={formData.paymentMethod} onChange={handleChange}>
              <option value="">-- Select Mode --</option>
              <option value="cash">Cash</option>
              <option value="online">Online UPI</option>
            </select>
          </div>

          {formData.paymentMethod === 'online' && (
            <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.5rem', border: '1px solid var(--cyan-border)' }}>
              <h4 style={{ color: '#fff', marginBottom: '1rem' }}>ONLINE PAYMENT VERIFICATION</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>Ask the volunteer to show their UPI QR. Pay exactly <strong style={{ color: '#00e59b' }}>₹{feeAmount}</strong>, then enter the details below.</p>
              <div className="form-group">
                <label className="form-label">Transaction ID / UTR</label>
                <input type="text" name="transactionId" className="form-input" placeholder="e.g. 123456789012" value={formData.transactionId} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">Payment Screenshot</label>
                <input type="file" className="form-input" accept="image/png,image/jpeg,image/webp" onChange={e => setScreenshotFile(e.target.files[0])} required />
              </div>
            </div>
          )}

          {/* VOLUNTEER AUTH */}
          <div className="glass-card" style={{ padding: '1.5rem', border: '1px solid rgba(255,152,0,0.3)', background: 'rgba(255,152,0,0.03)', marginTop: '2.5rem' }}>
            <h4 style={{ color: '#ff9800', marginBottom: '0.5rem' }}>🛡️ VOLUNTEER AUTHORIZATION</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>Must be filled by an authorized volunteer to complete registration.</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Volunteer Email</label>
                <input type="email" name="volunteerEmail" className="form-input" placeholder="volunteer@example.com" value={formData.volunteerEmail} onChange={handleChange} required />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Volunteer Password</label>
                <div style={{ position: 'relative' }}>
                  <input type={showVolunteerPass ? 'text' : 'password'} name="volunteerPass" className="form-input" placeholder="Enter password" value={formData.volunteerPass} onChange={handleChange} required />
                  <button type="button" onClick={() => setShowVolunteerPass(!showVolunteerPass)} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: 'var(--text-muted)' }}>
                    {showVolunteerPass ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div ref={feedbackRef}>
            {feedback && <div dangerouslySetInnerHTML={{ __html: feedback }} />}
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '2rem', padding: '1rem', fontSize: '1rem' }} disabled={loading}>
            {loading ? 'PROCESSING REGISTRATION...' : 'AUTHORIZE & SUBMIT REGISTRATION →'}
          </button>
        </form>
      </div>
    </section>
  );
}