import React, { useState, useRef, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { auth, db } from '../firebase-config.js';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { collection, query, where, getDocs, doc, setDoc } from "firebase/firestore";
import { handleFirebaseError } from '../services/error-service.js';
import { verifyVolunteerDeskAuth } from '../services/volunteer-auth.js';
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

const ALL_NON_TECH_OPTIONS = EVENTS_DATA.filter(e => e.category === 'non-tech');

export default function Registration() {
  const [formData, setFormData] = useState({
    name: '', idNumber: '', contactNumber: '', academicYear: '', email: '', paymentMethod: '', transactionId: '', volunteerClub: '', volunteerPass: ''
  });
  
  const [selectedTechEvents, setSelectedTechEvents] = useState([]);
  const [selectedNonTechEvents, setSelectedNonTechEvents] = useState([]);
  const [singleEvent, setSingleEvent] = useState('');
  const [screenshotFile, setScreenshotFile] = useState(null);
  
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [showVolunteerPass, setShowVolunteerPass] = useState(false);
  
  const formRef = useRef(null);
  const feedbackRef = useRef(null);

  const isPG = formData.academicYear === 'PG';
  const isFirstOrSecondYear = formData.academicYear === '1st Year' || formData.academicYear === '2nd Year';
  const isThirdYear = formData.academicYear === '3rd Year';
  const isFourthYear = formData.academicYear === '4th Year';
  const hasMandateEvents = !isPG && formData.academicYear !== '';

  const compulsoryEvent = isFirstOrSecondYear ? 'ARC FORGE' : 'MISSION: HIRE';
  const minNonTechRequired = isFirstOrSecondYear ? 2 : (isThirdYear ? 1 : 0);
  const minTechRequired = isFirstOrSecondYear ? 2 : 3;

  const techOptions = useMemo(() => {
    return EVENTS_DATA.filter(e => e.category === 'tech' && !(isFirstOrSecondYear && e.title === 'ARC FORGE'));
  }, [isFirstOrSecondYear]);

  const availableNonTechOptions = useMemo(() => {
    return (isThirdYear || isFourthYear) ? ALL_NON_TECH_OPTIONS.filter(e => e.title !== 'MISSION: HIRE') : ALL_NON_TECH_OPTIONS;
  }, [isThirdYear, isFourthYear]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'academicYear') {
      setSelectedTechEvents([]);
      setSelectedNonTechEvents([]);
      setSingleEvent('');
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


  let selectedCount = 0;
  if (hasMandateEvents) {
    selectedCount = 1 + selectedTechEvents.length + selectedNonTechEvents.length;
  } else if (isPG) {
    selectedCount = singleEvent ? 1 : 0;
  }
  const feeAmount = calculateEventFee(selectedCount);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback(null);

    let eventsList = [];
    if (hasMandateEvents) {
      if (selectedNonTechEvents.length < minNonTechRequired) {
        setFeedback(`<div class="glass-card" style="border-color:#ff4d4d; text-align:center; margin-top:1.5rem;"><h3 style="color:#ff4d4d;">✕ NON-TECH EVENT SELECTION INCOMPLETE</h3><p style="color:#91a1bd;">You must select at least <strong>${minNonTechRequired} Non-Tech Events</strong>.</p></div>`);
        feedbackRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }
      if (selectedTechEvents.length < minTechRequired) {
        setFeedback(`<div class="glass-card" style="border-color:#ff4d4d; text-align:center; margin-top:1.5rem;"><h3 style="color:#ff4d4d;">✕ TECH EVENT SELECTION INCOMPLETE</h3><p style="color:#91a1bd;">You must select at least <strong>${minTechRequired} Additional Tech Events</strong>.</p></div>`);
        feedbackRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }
      eventsList = [compulsoryEvent, ...selectedNonTechEvents, ...selectedTechEvents];
    } else if (isPG) {
      if (!singleEvent) {
        setFeedback(`<div class="glass-card" style="border-color:#ff4d4d; text-align:center; margin-top:1.5rem;"><h3 style="color:#ff4d4d;">✕ EVENT SELECTION REQUIRED</h3><p style="color:#91a1bd;">Please choose an event.</p></div>`);
        feedbackRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }
      eventsList = [singleEvent];
    }

    if (!formData.volunteerClub || !formData.volunteerPass) {
      setFeedback(`<div class="glass-card" style="border-color:#ff4d4d; text-align:center; margin-top:1.5rem;"><h3 style="color:#ff4d4d;">✕ DESK AUTHORIZATION REQUIRED</h3><p style="color:#91a1bd;">Please select a club and enter the password.</p></div>`);
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

    try {
      let screenshotData = '';
      if (screenshotFile) {
        screenshotData = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = () => reject(new Error('Unable to read screenshot.'));
          reader.readAsDataURL(screenshotFile);
        });
      }

      const deskAuth = await verifyVolunteerDeskAuth(formData.volunteerClub, formData.volunteerPass);

      const idQuery = query(collection(db, 'users'), where('idNumber', '==', formData.idNumber));
      if (!(await getDocs(idQuery)).empty) throw new Error('A participant with this College ID is already registered.');

      const phoneQuery = query(collection(db, 'users'), where('contactNumber', '==', formData.contactNumber));
      if (!(await getDocs(phoneQuery)).empty) throw new Error('A participant with this Contact Number is already registered.');

      const initialPassword = formData.idNumber.length < 6 ? formData.idNumber.padEnd(6, '0') : formData.idNumber;
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, initialPassword);

      await setDoc(doc(db, 'users', userCredential.user.uid), {
        fullName: formData.name, idNumber: formData.idNumber, contactNumber: formData.contactNumber,
        academicYear: formData.academicYear, email: formData.email, event: eventsList.join(', '), events: eventsList,
        paymentMethod: formData.paymentMethod, amount: feeAmount, transactionId: formData.transactionId,
        screenshotData, screenshotFileName: screenshotFile?.name || '', screenshotContentType: screenshotFile?.type || '',
        registeredAtDesk: true, authorizedByClub: deskAuth.club.name, authorizedByEmail: deskAuth.club.email,
        authorizedClubShort: deskAuth.club.shortName, initialPasswordSet: true, createdAt: new Date().toISOString()
      });

      setFeedback(`
        <div class="glass-card" style="border-color:var(--emerald-accent); text-align:center; margin-top:1.5rem;">
          <div class="badge-hud" style="color:var(--emerald-accent); border-color:rgba(0,229,155,0.4); background:rgba(0,229,155,0.08);">✓ DESK REGISTRATION AUTHORIZED</div>
          <h3 style="color:var(--emerald-accent); margin-top:1rem;">✓ REGISTRATION SUCCESSFUL</h3>
          <p style="color:#fff;">Thank you <strong>${formData.name}</strong>!</p>
          <div style="margin-top:1.25rem; color:var(--cyan-primary); text-align: left; background: rgba(0,206,255,0.04); padding: 1rem 1.25rem; border-radius: var(--r-sm); border: 1px solid var(--cyan-border);">
            <p style="margin-bottom: 0.5rem; color:#00e59b; font-size:0.88rem;"><strong>🛡️ Verified Desk:</strong> ${deskAuth.club.name}</p>
            <p style="margin-bottom: 0.5rem;"><strong>Registered Events:</strong> ${eventsList.join(', ')}</p>
            <p style="margin-bottom: 0.25rem;"><strong>Registration Fee:</strong> ₹${feeAmount}</p>
          </div>
        </div>
      `);
      setFormData({ name: '', idNumber: '', contactNumber: '', academicYear: '', email: '', paymentMethod: '', transactionId: '', volunteerClub: '', volunteerPass: '' });
      setSelectedTechEvents([]); setSelectedNonTechEvents([]); setSingleEvent(''); setScreenshotFile(null);
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
                <option value="PG">Postgraduate</option>
              </select>
            </div>
          </div>

          <div className="form-group"><label className="form-label">Registered Email</label><input type="email" name="email" className="form-input" placeholder="e.g. name@example.com" required value={formData.email} onChange={handleChange} /></div>

          {/* EVENT SELECTION SECTIONS */}

          {isPG && (
            <div className="form-group">
              <label className="form-label">Select Event</label>
              <select className="form-select" value={singleEvent} onChange={e => setSingleEvent(e.target.value)} required>
                <option value="">-- Choose an Event --</option>
                {EVENTS_DATA.map(e => <option key={e.id} value={e.title}>{e.title}</option>)}
              </select>
            </div>
          )}

          {hasMandateEvents && (
            <div style={{ marginTop: '2.5rem' }}>
              <h3 style={{ color: 'var(--cyan-primary)', marginBottom: '1.5rem' }}>EVENT SELECTION MODULES</h3>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">01 // COMPULSORY EVENT</label>
                <div className="glass-card" style={{ borderColor: 'var(--emerald)', background: 'rgba(0,206,255,0.04)', padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <input type="checkbox" checked disabled style={{ width: '20px', height: '20px', accentColor: 'var(--cyan)' }} />
                  <div>
                    <h4 style={{ color: '#fff', margin: 0 }}>{compulsoryEvent}</h4>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>Pre-selected compulsory module for your academic year.</p>
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">02 // NON-TECH EVENTS (MIN {minNonTechRequired})</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
                  {availableNonTechOptions.map(opt => (
                    <label key={opt.id} className="glass-card" style={{ padding: '1rem', cursor: 'pointer', display: 'flex', gap: '0.75rem', borderColor: selectedNonTechEvents.includes(opt.title) ? opt.accent : 'rgba(255,255,255,0.1)', background: selectedNonTechEvents.includes(opt.title) ? 'rgba(139,61,255,0.08)' : 'rgba(255,255,255,0.02)' }}>
                      <input type="checkbox" value={opt.title} checked={selectedNonTechEvents.includes(opt.title)} onChange={handleNonTechChange} style={{ width: '18px', height: '18px', accentColor: opt.accent }} />
                      <div>
                        <div style={{ color: '#fff', fontWeight: 700 }}>{opt.title}</div>
                        <div style={{ fontSize: '0.74rem', color: opt.accent }}>{opt.type}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">03 // TECH EVENTS (MIN {minTechRequired})</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
                  {techOptions.map(opt => (
                    <label key={opt.id} className="glass-card" style={{ padding: '1rem', cursor: 'pointer', display: 'flex', gap: '0.75rem', borderColor: selectedTechEvents.includes(opt.title) ? 'var(--cyan)' : 'rgba(255,255,255,0.1)', background: selectedTechEvents.includes(opt.title) ? 'rgba(0,206,255,0.08)' : 'rgba(255,255,255,0.02)' }}>
                      <input type="checkbox" value={opt.title} checked={selectedTechEvents.includes(opt.title)} onChange={handleTechChange} style={{ width: '18px', height: '18px', accentColor: 'var(--cyan)' }} />
                      <div>
                        <div style={{ color: '#fff', fontWeight: 700 }}>{opt.title}</div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--cyan)' }}>{opt.type}</div>
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
              <h4 style={{ color: '#fff', marginBottom: '1rem' }}>ONLINE PAYMENT DETAILS</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>Scan the QR code at the desk or transfer to the provided UPI ID.</p>
              <div className="form-group">
                <label className="form-label">Transaction ID / UTR</label>
                <input type="text" name="transactionId" className="form-input" placeholder="e.g. 123456789012" value={formData.transactionId} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">Payment Screenshot</label>
                <input type="file" className="form-input" accept="image/*" onChange={e => setScreenshotFile(e.target.files[0])} required />
              </div>
            </div>
          )}

          {/* VOLUNTEER AUTH */}
          <div className="glass-card" style={{ padding: '1.5rem', border: '1px solid rgba(255,152,0,0.3)', background: 'rgba(255,152,0,0.03)', marginTop: '2.5rem' }}>
            <h4 style={{ color: '#ff9800', marginBottom: '0.5rem' }}>🛡️ VOLUNTEER DESK AUTHORIZATION</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>Must be filled by an authorized organizing committee member.</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Authorized Desk</label>
                <select name="volunteerClub" className="form-select" value={formData.volunteerClub} onChange={handleChange} required>
                  <option value="">-- Select Club --</option>
                  <option value="ieiteambvm.jarvis@gmail.com">IE(I) Mechanical</option>
                  <option value="trf.bvm@gmail.com">TRS</option>
                  <option value="rs.bvm@gmail.com">SAEINDIA</option>
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Desk Password</label>
                <div style={{ position: 'relative' }}>
                  <input type={showVolunteerPass ? 'text' : 'password'} name="volunteerPass" className="form-input" placeholder="Enter PIN" value={formData.volunteerPass} onChange={handleChange} required />
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