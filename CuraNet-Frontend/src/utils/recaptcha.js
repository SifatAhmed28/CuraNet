export const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY || "";

/**
 * Executes reCAPTCHA Enterprise action and returns token
 * @param {string} action - Action name (e.g. 'LOGIN', 'REGISTER', 'BOOK_APPOINTMENT', 'BLOOD_REQUEST')
 * @returns {Promise<string|null>}
 */
export async function getRecaptchaToken(action = "LOGIN") {
  if (typeof window === "undefined") return null;

  try {
    if (window.grecaptcha?.enterprise) {
      return new Promise((resolve) => {
        window.grecaptcha.enterprise.ready(async () => {
          try {
            const token = await window.grecaptcha.enterprise.execute(RECAPTCHA_SITE_KEY, {
              action,
            });
            resolve(token);
          } catch (err) {
            console.warn("reCAPTCHA enterprise execution error:", err);
            resolve(null);
          }
        });
      });
    }
  } catch (err) {
    console.warn("reCAPTCHA unavailable:", err);
  }

  return null;
}
