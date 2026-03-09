/**
 * Yhteinen fetch-apuri + JWT-tokenin hallinta.
 */

const AUTH_TOKEN_KEY = 'health_diary_jwt';

/**
 * Palauttaa localStoragessa olevan JWT-tokenin.
 *
 * @returns {string}
 */
const getAuthToken = () => localStorage.getItem(AUTH_TOKEN_KEY) || '';

/**
 * Tarkistaa onko kayttaja kirjautunut (token olemassa).
 *
 * @returns {boolean}
 */
const hasAuthToken = () => Boolean(getAuthToken());

/**
 * Tallentaa tokenin ja ilmoittaa auth-tilan muutoksesta.
 *
 * @param {string} token
 */
const setAuthToken = (token) => {
  if (!token) {
    return;
  }

  localStorage.setItem(AUTH_TOKEN_KEY, token);
  window.dispatchEvent(
    new CustomEvent('auth:changed', { detail: { authenticated: true } })
  );
};

/**
 * Poistaa tokenin ja ilmoittaa auth-tilan muutoksesta.
 */
const clearAuthToken = () => {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  window.dispatchEvent(
    new CustomEvent('auth:changed', { detail: { authenticated: false } })
  );
};

/**
 * Tekee HTTP-kutsun ja palauttaa JSONin (tai tekstin) yhtenaisessa muodossa.
 *
 * @param {string} url
 * @param {RequestInit} options
 * @param {{ skipAuth?: boolean }} config
 * @returns {Promise<Object|Array>}
 */
const fetchData = async (url, options = {}, config = {}) => {
  const { skipAuth = false } = config;

  // Login-kutsua lukuun ottamatta vaaditaan token frontendin tasolla.
  if (!skipAuth && !hasAuthToken()) {
    return { error: 'Kirjaudu sisaan ensin.', status: 401 };
  }

  try {
    // Kootaan headerit yhteen: olemassa olevat + Authorization jos kirjautunut.
    const headers = new Headers(options.headers || {});

    if (!skipAuth) {
      headers.set('Authorization', `Bearer ${getAuthToken()}`);
    }

    const response = await fetch(url, { ...options, headers });
    const contentType = response.headers.get('content-type') || '';

    let payload;
    if (contentType.includes('application/json')) {
      payload = await response.json();
    } else {
      const text = await response.text();
      payload = text ? { message: text } : {};
    }

    // Jos token on vanhentunut/virheellinen, pudotetaan kirjautuminen pois paalta.
    if (!skipAuth && (response.status === 401 || response.status === 403)) {
      clearAuthToken();
    }

    if (!response.ok) {
      const message =
        payload?.error ||
        payload?.message ||
        `Request failed with status ${response.status}`;
      return { error: message, status: response.status, raw: payload };
    }

    return payload;
  } catch (error) {
    console.error('fetchData() error:', error.message);
    return { error: error.message };
  }
};

export { fetchData, getAuthToken, hasAuthToken, setAuthToken, clearAuthToken };
