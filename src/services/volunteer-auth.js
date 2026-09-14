import { initializeApp, getApps } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { firebaseConfig } from '../firebase-config.js';

export const AUTHORIZED_CLUBS = [
  {
    id: 'sae',
    name: 'SAEINDIA BVM Collegiate Club',
    email: 'saeindia@bvmengineering.ac.in',
    shortName: 'SAEINDIA'
  },
  {
    id: 'trs',
    name: 'The Robotics Society (TRS) BVM',
    email: 'trs@bvmengineering.ac.in',
    shortName: 'TRS ROBOTICS'
  },
  {
    id: 'iei',
    name: 'IEI Students\' Chapter (MEPR) BVM',
    email: 'ieimepr@bvmengineering.ac.in',
    shortName: 'IEI MEPR'
  }
];

/**
 * Gets or initializes an isolated secondary Firebase App instance.
 * This prevents volunteer login from overriding the current participant's session.
 */
function getVolunteerAuthInstance() {
  const secondaryAppName = 'VolunteerDeskAuthSecondaryApp';
  const existingApps = getApps();
  const foundApp = existingApps.find(a => a.name === secondaryAppName);
  
  const secondaryApp = foundApp || initializeApp(firebaseConfig, secondaryAppName);
  return getAuth(secondaryApp);
}

/**
 * Authenticates a desk volunteer using one of the 3 authorized club accounts.
 * @param {string} clubEmail The selected club email
 * @param {string} password The club desk password entered by the volunteer
 * @returns {Promise<{success: boolean, club: object, volunteerEmail: string}>}
 */
export async function verifyVolunteerDeskAuth(clubEmail, password) {
  const normalizedEmail = (clubEmail || '').trim().toLowerCase();
  
  // 1. Verify email belongs to one of the 3 authorized clubs
  const matchedClub = AUTHORIZED_CLUBS.find(c => c.email.toLowerCase() === normalizedEmail);
  if (!matchedClub) {
    throw new Error(`Unauthorized Club ID: "${clubEmail}". Only authorized club desks can validate registrations.`);
  }

  if (!password || password.trim() === '') {
    throw new Error('Please enter the Club Desk Password to authorize this registration.');
  }

  // 2. Perform authentication on secondary auth instance
  const secondaryAuth = getVolunteerAuthInstance();

  try {
    const userCredential = await signInWithEmailAndPassword(secondaryAuth, normalizedEmail, password);
    
    // Immediate sign-out on secondary auth instance to prevent persistent state
    await signOut(secondaryAuth).catch(() => {});

    return {
      success: true,
      club: matchedClub,
      volunteerEmail: userCredential.user.email
    };
  } catch (error) {
    // Immediate sign-out in case of any partial state
    await signOut(secondaryAuth).catch(() => {});

    if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
      throw new Error(`Incorrect desk password for ${matchedClub.name}. Please verify with your club desk coordinator.`);
    } else if (error.code === 'auth/user-not-found') {
      throw new Error(`The club account (${matchedClub.email}) is not registered in Firebase Authentication. Please create it in Firebase Console.`);
    } else if (error.code === 'auth/too-many-requests') {
      throw new Error('Too many failed authorization attempts. Please wait a moment and try again.');
    } else {
      throw new Error(error.message || 'Volunteer desk authorization failed. Please try again.');
    }
  }
}
