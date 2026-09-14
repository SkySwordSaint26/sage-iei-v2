/* SAGE 1.0 — Firebase & Portal Error Service */

/**
 * Standardized Firebase Error Code Dictionary
 */
const FIREBASE_ERROR_MAP = {
  // Authentication Errors
  'auth/email-already-in-use': {
    title: 'EMAIL ALREADY REGISTERED',
    message: 'An account with this email address already exists in the SAGE 1.0 portal.',
    action: 'Please sign in via the Participant Access Portal or use a different email address.'
  },
  'auth/id-already-in-use': {
    title: 'COLLEGE ID ALREADY REGISTERED',
    message: 'A participant account with this College ID Number is already registered.',
    action: 'If this is your ID, please sign in via the Participant Access Portal.'
  },
  'auth/phone-already-in-use': {
    title: 'PHONE NUMBER ALREADY REGISTERED',
    message: 'A participant account with this Contact Number is already registered.',
    action: 'Please log in to your existing account or verify the number entered.'
  },
  'auth/invalid-email': {
    title: 'INVALID EMAIL FORMAT',
    message: 'The email address provided is invalid or improperly formatted.',
    action: 'Please check your email address for typos and try again.'
  },
  'auth/weak-password': {
    title: 'WEAK SECURITY PIN / PASSWORD',
    message: 'The security password does not meet security requirements.',
    action: 'Password must be at least 6 characters long.'
  },
  'auth/user-not-found': {
    title: 'ACCOUNT NOT FOUND',
    message: 'No participant account was found matching this email address.',
    action: 'Please check your email or proceed to Registration first.'
  },
  'auth/wrong-password': {
    title: 'INCORRECT PASSWORD',
    message: 'The password you entered is incorrect.',
    action: 'Please double-check your password and try signing in again.'
  },
  'auth/invalid-credential': {
    title: 'INVALID CREDENTIALS',
    message: 'The email or security password you entered is incorrect.',
    action: 'Please check your login details and try again.'
  },
  'auth/user-disabled': {
    title: 'ACCOUNT SUSPENDED',
    message: 'This participant account has been temporarily disabled.',
    action: 'Please contact the SAGE 1.0 support desk for assistance.'
  },
  'auth/too-many-requests': {
    title: 'TOO MANY ATTEMPTS',
    message: 'Access to this account has been temporarily locked due to multiple failed login attempts.',
    action: 'Please wait a few minutes before trying again.'
  },
  'auth/network-request-failed': {
    title: 'NETWORK CONNECTION ERROR',
    message: 'Unable to establish a connection with Firebase authentication servers.',
    action: 'Please check your internet connection and try again.'
  },
  'auth/operation-not-allowed': {
    title: 'AUTHENTICATION DISABLED',
    message: 'Email/Password authentication is currently disabled in Firebase project settings.',
    action: 'Please contact event administrators.'
  },

  // Firestore Database Errors
  'permission-denied': {
    title: 'DATABASE ACCESS DENIED',
    message: 'Insufficient permissions to read or write participant registration data.',
    action: 'Please contact event support if this issue persists.'
  },
  'unavailable': {
    title: 'SERVICE UNREACHABLE',
    message: 'Firebase database servers are currently unreachable or undergoing maintenance.',
    action: 'Please wait a few seconds and try again.'
  },
  'already-exists': {
    title: 'PARTICIPANT RECORD EXISTS',
    message: 'A registration entry already exists for this participant ID.',
    action: 'Please log in to your existing account.'
  },
  'resource-exhausted': {
    title: 'QUOTA EXCEEDED',
    message: 'Server request limits have been reached.',
    action: 'Please wait a short while and retry.'
  },

  // Desk Registration / Volunteer Auth Errors
  'desk/missing-club': {
    title: 'CLUB DESK NOT SELECTED',
    message: 'You must select an authorized Collaborating Club Desk to validate this registration.',
    action: 'Please choose SAEINDIA, TRS Robotics, or IEI MEPR from the dropdown.'
  },
  'desk/missing-password': {
    title: 'DESK PASSWORD REQUIRED',
    message: 'A volunteer desk authorization password is required to complete registration.',
    action: 'Please have the on-duty desk volunteer enter their club password.'
  },
  'desk/unauthorized-club': {
    title: 'UNAUTHORIZED DESK ACCOUNT',
    message: 'The selected account is not authorized as a collaborating club registration desk.',
    action: 'Please select an authorized club desk account.'
  },
  'desk/invalid-credentials': {
    title: 'DESK AUTHENTICATION FAILED',
    message: 'The desk password entered does not match the selected club account.',
    action: 'Please check the password with your club desk coordinator.'
  }
};

/**
 * Format raw error (Firebase error or standard JS Error) into a clean structured object.
 * @param {Error|Object|string} error
 * @param {string} fallbackTitle
 * @returns {{ code: string, title: string, message: string, action: string, raw: Error }}
 */
export function formatFirebaseError(error, fallbackTitle = 'OPERATION FAILED') {
  let code = '';
  let rawMessage = '';

  if (typeof error === 'string') {
    rawMessage = error;
  } else if (error && typeof error === 'object') {
    code = error.code || '';
    rawMessage = error.message || String(error);
  }

  // Look up mapped error
  if (code && FIREBASE_ERROR_MAP[code]) {
    const mapped = FIREBASE_ERROR_MAP[code];
    return {
      code,
      title: mapped.title,
      message: mapped.message,
      action: mapped.action,
      raw: error
    };
  }

  // Extract code from message strings if present (e.g. "Firebase: Error (auth/email-already-in-use).")
  const extractedCodeMatch = rawMessage.match(/\((auth\/[a-z0-9-]+|[a-z0-9-]+)\)/i);
  if (extractedCodeMatch && extractedCodeMatch[1] && FIREBASE_ERROR_MAP[extractedCodeMatch[1]]) {
    const mapped = FIREBASE_ERROR_MAP[extractedCodeMatch[1]];
    return {
      code: extractedCodeMatch[1],
      title: mapped.title,
      message: mapped.message,
      action: mapped.action,
      raw: error
    };
  }

  // Default Fallback
  return {
    code: code || 'UNKNOWN_ERROR',
    title: fallbackTitle,
    message: rawMessage.replace(/^Firebase:\s*/i, '').trim() || 'An unexpected error occurred during processing.',
    action: 'Please check your internet connection and details, or contact event support.',
    raw: error
  };
}

/**
 * Generate a styled HUD glassmorphism error HTML card component.
 * @param {Error|Object|string} error
 * @param {string} fallbackTitle
 * @returns {string} HTML string
 */
export function renderErrorHTML(error, fallbackTitle = 'OPERATION FAILED') {
  const formatted = formatFirebaseError(error, fallbackTitle);

  return `
    <div
      class="glass-card"
      style="
        border-color: #ff4d4d;
        background: rgba(255, 77, 77, 0.06);
        box-shadow: 0 0 20px rgba(255, 77, 77, 0.15);
        text-align: center;
        padding: 1.5rem 1.25rem;
        margin-top: 1.25rem;
        border-radius: var(--r-sm);
        animation: fadeIn 0.3s ease-out;
      "
    >
      <div
        class="badge-hud"
        style="
          color: #ff4d4d;
          border-color: rgba(255, 77, 77, 0.4);
          background: rgba(255, 77, 77, 0.1);
          font-size: 0.68rem;
          margin-bottom: 0.75rem;
          display: inline-block;
        "
      >
        ✕ ERROR // ${formatted.code ? formatted.code.toUpperCase() : 'FIREBASE_EXCEPTION'}
      </div>

      <h3
        style="
          color: #ff4d4d;
          font-family: var(--font-heading);
          letter-spacing: 0.05em;
          margin: 0 0 0.5rem;
          font-size: 1.05rem;
        "
      >
        ${formatted.title}
      </h3>

      <p
        style="
          color: #d1d9e6;
          font-size: 0.85rem;
          line-height: 1.55;
          margin: 0 0 0.5rem;
        "
      >
        ${formatted.message}
      </p>

      <p
        style="
          color: #91a1bd;
          font-size: 0.78rem;
          margin: 0;
          font-style: italic;
        "
      >
        💡 <strong>Recommendation:</strong> ${formatted.action}
      </p>
    </div>
  `;
}

/**
 * Convenience handler to process and render Firebase error into a target DOM container.
 * @param {Error|Object|string} error
 * @param {HTMLElement|string} targetEl Element or ID string where feedback HTML should be injected
 * @param {string} fallbackTitle
 */
export function handleFirebaseError(error, targetEl, fallbackTitle = 'OPERATION FAILED') {
  console.error(`[Firebase Error Service] [${fallbackTitle}]:`, error);

  const container = typeof targetEl === 'string' ? document.getElementById(targetEl) : targetEl;
  if (!container) return;

  container.style.display = 'block';
  container.innerHTML = renderErrorHTML(error, fallbackTitle);
  container.scrollIntoView({ behavior: 'smooth', block: 'center' });
}
