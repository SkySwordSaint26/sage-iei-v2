import { initializeApp, getApps } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, getDoc, getFirestore } from "firebase/firestore";
import { firebaseConfig } from '../firebase-config.js';

/**
 * Gets or initializes an isolated secondary Firebase App instance.
 * This prevents volunteer login from overriding the current participant's session.
 */
function getVolunteerAuthInstance() {
  const name = 'VolunteerAuthSecondary';
  const existing = getApps().find(a => a.name === name);
  return getAuth(existing || initializeApp(firebaseConfig, name));
}

let cachedVolunteer = null;
let cachedCredentials = { email: '', password: '' };

/**
 * Authenticates an individual volunteer by email + password.
 * Verifies they exist in the `volunteers` Firestore collection.
 * @param {string} email The volunteer's personal email
 * @param {string} password The volunteer's password
 * @returns {Promise<{uid: string, name: string, email: string, club: string}>}
 */
export async function verifyVolunteer(email, password) {
  if (!email || !password) {
    throw new Error('Please enter your volunteer email and password.');
  }

  const trimmedEmail = email.trim();

  // Fast path: if the same credentials are used, return the cached result instantly (0ms network cost)
  if (cachedVolunteer && cachedCredentials.email === trimmedEmail && cachedCredentials.password === password) {
    return cachedVolunteer;
  }

  const secondaryAuth = getVolunteerAuthInstance();

  try {
    const cred = await signInWithEmailAndPassword(secondaryAuth, trimmedEmail, password);

    // Fetch volunteer profile from Firestore
    const secondaryDb = getFirestore(secondaryAuth.app);
    const volunteerDoc = await getDoc(doc(secondaryDb, 'volunteers', cred.user.uid));
    
    await signOut(secondaryAuth).catch(() => {});

    if (!volunteerDoc.exists()) {
      throw new Error('You are not registered as an authorized volunteer.');
    }

    const data = volunteerDoc.data();
    const volunteerObj = { uid: cred.user.uid, name: data.name, email: data.email, club: data.club };
    
    // Cache the successful authorization for subsequent registrations
    cachedVolunteer = volunteerObj;
    cachedCredentials = { email: trimmedEmail, password };

    return volunteerObj;
  } catch (error) {
    await signOut(secondaryAuth).catch(() => {});

    if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
      throw new Error('Incorrect volunteer password.');
    } else if (error.code === 'auth/user-not-found') {
      throw new Error('Volunteer account not found.');
    } else if (error.code === 'auth/too-many-requests') {
      throw new Error('Too many failed attempts. Wait and try again.');
    }
    throw error;
  }
}
