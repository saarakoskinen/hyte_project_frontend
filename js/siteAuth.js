import {
  fetchData,
  hasAuthToken,
  setAuthToken,
  clearAuthToken,
  getAuthToken,
} from './fetch.js';

const USERS_LOGIN_URL = '/api/users/login';
const USERS_CREATE_URL = '/api/users';

// Purkaa JWT-tokenin payloadin (middle part) ja hakee käyttäjänimen
const getUsernameFromToken = () => {
  const token = getAuthToken();
  if (!token) {
    return '';
  }

  try {
    const payloadPart = token.split('.')[1];
    if (!payloadPart) {
      return '';
    }

    const base64 = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    const payload = JSON.parse(atob(padded));

    return payload?.username || '';
  } catch (_error) {
    return '';
  }
};

// Luo oikeaan ylakulmaan auth-triggerin + dialogin, jos niitä ei vielä ole
const ensureAuthUI = () => {
  const headerContainer =
    document.querySelector('.site-header .container') || document.body;
  if (!headerContainer) {
    return null;
  }

  let trigger = headerContainer.querySelector('.site-auth-trigger');
  let dialog = document.querySelector('.site-auth-dialog');

  if (!trigger) {
    trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'site-auth-trigger';
    trigger.textContent = 'Kirjaudu sisään';
    trigger.setAttribute('aria-haspopup', 'dialog');

    headerContainer.appendChild(trigger);
  }

  if (!dialog) {
    dialog = document.createElement('dialog');
    dialog.className = 'site-auth-dialog';
    dialog.innerHTML = `
      <article class="site-auth-card">
        <header class="site-auth-dialog-header">
          <h2 class="site-auth-dialog-title">Tunnistautuminen</h2>
          <button type="button" class="site-auth-close" aria-label="Sulje">x</button>
        </header>

        <section class="site-auth-logged-out">
          <form class="site-auth-login-form" autocomplete="on">
            <label for="siteAuthUsername">Username</label>
            <input id="siteAuthUsername" type="text" required />

            <label for="siteAuthPassword">Password</label>
            <input id="siteAuthPassword" type="password" required />

            <button type="submit">Kirjaudu sisään</button>
          </form>

          <hr class="site-auth-divider" />

          <form class="site-auth-register-form" autocomplete="on">
            <h3 class="site-auth-subtitle">Luo uusi käyttäjä</h3>

            <label for="siteAuthRegisterUsername">Username</label>
            <input id="siteAuthRegisterUsername" type="text" required />

            <label for="siteAuthRegisterEmail">Email</label>
            <input id="siteAuthRegisterEmail" type="email" required />

            <label for="siteAuthRegisterPassword">Password</label>
            <input id="siteAuthRegisterPassword" type="password" required />

            <button type="submit">Luo kayttäjä</button>
          </form>
        </section>

        <section class="site-auth-logged-in" hidden>
          <p class="site-auth-welcome"></p>
          <button type="button" class="site-auth-logout-btn">Kirjaudu ulos</button>
        </section>

        <p class="site-auth-feedback" aria-live="polite"></p>
      </article>
    `;

    document.body.appendChild(dialog);
  }

  return { trigger, dialog };
};

// Palauttaa autentikaatio-näkymän tarvitsemat elementit
const getElements = () => {
  const base = ensureAuthUI();
  if (!base) {
    return {};
  }

  const { trigger, dialog } = base;

  return {
    trigger,
    dialog,
    closeBtn: dialog.querySelector('.site-auth-close'),
    loginForm: dialog.querySelector('.site-auth-login-form'),
    usernameInput: dialog.querySelector('#siteAuthUsername'),
    passwordInput: dialog.querySelector('#siteAuthPassword'),
    registerForm: dialog.querySelector('.site-auth-register-form'),
    registerUsernameInput: dialog.querySelector('#siteAuthRegisterUsername'),
    registerEmailInput: dialog.querySelector('#siteAuthRegisterEmail'),
    registerPasswordInput: dialog.querySelector('#siteAuthRegisterPassword'),
    loggedOutSection: dialog.querySelector('.site-auth-logged-out'),
    loggedInSection: dialog.querySelector('.site-auth-logged-in'),
    welcomeLabel: dialog.querySelector('.site-auth-welcome'),
    logoutBtn: dialog.querySelector('.site-auth-logout-btn'),
    feedback: dialog.querySelector('.site-auth-feedback'),
  };
};

const setFeedback = (text, type = 'info') => {
  const { feedback } = getElements();
  if (!feedback) {
    return;
  }

  feedback.textContent = text || '';
  feedback.dataset.type = type;
};

// Päivittää triggerin tekstin oikeaan yläkulmaan
const syncTriggerLabel = () => {
  const { trigger } = getElements();
  if (!trigger) {
    return;
  }

  if (!hasAuthToken()) {
    trigger.textContent = 'Kirjaudu sisään';
    return;
  }

  const username = getUsernameFromToken();
  trigger.textContent = username || 'Olet kirjautunut';
};

// Päivittää dialogin sisällön kirjautumistilan mukaan
const syncDialogState = () => {
  const { loggedOutSection, loggedInSection, welcomeLabel } = getElements();
  if (!loggedOutSection || !loggedInSection || !welcomeLabel) {
    return;
  }

  if (!hasAuthToken()) {
    loggedOutSection.hidden = false;
    loggedInSection.hidden = true;
    setFeedback('');
    return;
  }

  loggedOutSection.hidden = true;
  loggedInSection.hidden = false;

  const username = getUsernameFromToken();
  welcomeLabel.textContent = username
    ? `Kirjautuneena: ${username}`
    : 'Kirjautuneena.';
};

const syncAuthUI = () => {
  syncTriggerLabel();
  syncDialogState();
};

const openDialog = () => {
  const { dialog } = getElements();
  if (!dialog) {
    return;
  }

  syncDialogState();
  if (!dialog.open) {
    dialog.showModal();
  }
};

const closeDialog = () => {
  const { dialog } = getElements();
  if (dialog?.open) {
    dialog.close();
  }
};

// Login-formin submit-käsittelijä
const login = async (event) => {
  event.preventDefault();

  const { loginForm, usernameInput, passwordInput } = getElements();
  if (!loginForm || !usernameInput || !passwordInput) {
    return;
  }

  const body = {
    username: usernameInput.value.trim(),
    password: passwordInput.value.trim(),
  };

  const result = await fetchData(
    USERS_LOGIN_URL,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    },
    { skipAuth: true }
  );

  if (result.error) {
    setFeedback(result.error, 'error');
    return;
  }

  if (!result.token) {
    setFeedback('Kirjautuminen epäonnistui: token puuttuu.', 'error');
    return;
  }

  setAuthToken(result.token);
  setFeedback('');
  loginForm.reset();
  closeDialog();
};

const registerUser = async (event) => {
  event.preventDefault();

  const {
    registerForm,
    registerUsernameInput,
    registerEmailInput,
    registerPasswordInput,
    usernameInput,
  } = getElements();

  if (
    !registerForm ||
    !registerUsernameInput ||
    !registerEmailInput ||
    !registerPasswordInput
  ) {
    return;
  }

  const body = {
    username: registerUsernameInput.value.trim(),
    email: registerEmailInput.value.trim(),
    password: registerPasswordInput.value.trim(),
  };

  const result = await fetchData(
    USERS_CREATE_URL,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    },
    { skipAuth: true }
  );

  if (result.error) {
    setFeedback(result.error, 'error');
    return;
  }

  setFeedback('Käyttäjä luotu. Voit nyt kirjautua sisään.', 'success');
  registerForm.reset();

  if (usernameInput) {
    usernameInput.value = body.username;
  }
};

const logout = () => {
  clearAuthToken();
};

const initSiteAuth = () => {
  const { trigger, dialog, closeBtn, loginForm, registerForm, logoutBtn } =
    getElements();

  // Jos sivulla ei ole site-headeria, ei alusteta autentikaatio-näkymää
  if (
    !trigger ||
    !dialog ||
    !closeBtn ||
    !loginForm ||
    !registerForm ||
    !logoutBtn
  ) {
    return;
  }

  trigger.addEventListener('click', openDialog);
  closeBtn.addEventListener('click', closeDialog);
  loginForm.addEventListener('submit', login);
  registerForm.addEventListener('submit', registerUser);
  logoutBtn.addEventListener('click', logout);

  // Suljetaan dialog, jos klikataan taustaa (dialogin ulkopuolelle)
  dialog.addEventListener('click', (event) => {
    const rect = dialog.getBoundingClientRect();
    const isInside =
      event.clientX >= rect.left &&
      event.clientX <= rect.right &&
      event.clientY >= rect.top &&
      event.clientY <= rect.bottom;

    if (!isInside) {
      closeDialog();
    }
  });

  window.addEventListener('auth:changed', syncAuthUI);
  syncAuthUI();
};

initSiteAuth();
