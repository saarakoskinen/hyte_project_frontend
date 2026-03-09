import {
  fetchData,
  getAuthToken,
  hasAuthToken,
  setAuthToken,
  clearAuthToken,
} from './fetch.js';
import { initUsersTab } from './users.js';
import { initItemsTab } from './items.js';

const USERS_LOGIN_URL = '/api/users/login';

const pretty = (data) => JSON.stringify(data, null, 2);

const getAuthElements = () => ({
  loginForm: document.querySelector('.auth-login-form'),
  usernameInput: document.querySelector('#authUsername'),
  passwordInput: document.querySelector('#authPassword'),
  logoutBtn: document.querySelector('.auth-logout-btn'),
  statusLabel: document.querySelector('.auth-status'),
  responseBox: document.querySelector('.auth-response'),
  protectedContent: document.querySelector('.protected-content'),
  tabs: document.querySelector('.tabs'),
});

const setAuthResponse = (payload) => {
  const { responseBox } = getAuthElements();
  if (responseBox) {
    responseBox.textContent = pretty(payload);
  }
};

const setLoggedInUI = () => {
  const { loginForm, logoutBtn, statusLabel, protectedContent, tabs } =
    getAuthElements();

  if (loginForm) {
    loginForm.hidden = true;
  }

  if (logoutBtn) {
    logoutBtn.hidden = false;
  }

  if (statusLabel) {
    const token = getAuthToken();
    statusLabel.textContent = `Kirjautunut. Token: ${token.slice(0, 20)}...`;
  }

  if (protectedContent) {
    protectedContent.hidden = false;
  }

  if (tabs) {
    tabs.hidden = false;
  }
};

const setLoggedOutUI = () => {
  const { loginForm, logoutBtn, statusLabel, protectedContent, tabs } =
    getAuthElements();

  if (loginForm) {
    loginForm.hidden = false;
  }

  if (logoutBtn) {
    logoutBtn.hidden = true;
  }

  if (statusLabel) {
    statusLabel.textContent = 'Et ole kirjautunut.';
  }

  if (protectedContent) {
    protectedContent.hidden = true;
  }

  if (tabs) {
    tabs.hidden = true;
  }
};

const syncAuthUI = () => {
  if (hasAuthToken()) {
    setLoggedInUI();
    return;
  }

  setLoggedOutUI();
};

const login = async (event) => {
  event.preventDefault();

  const { loginForm, usernameInput, passwordInput } = getAuthElements();
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

  setAuthResponse(result);

  if (result.error) {
    return;
  }

  if (!result.token) {
    setAuthResponse({ error: 'Login onnistui, mutta token puuttuu vastauksesta.' });
    return;
  }

  setAuthToken(result.token);
  loginForm.reset();
};

const logout = () => {
  clearAuthToken();
  setAuthResponse({ message: 'Uloskirjautuminen onnistui.' });
};

const initAuth = () => {
  const { loginForm, logoutBtn } = getAuthElements();

  if (!loginForm || !logoutBtn) {
    return;
  }

  loginForm.addEventListener('submit', login);
  logoutBtn.addEventListener('click', logout);

  window.addEventListener('auth:changed', syncAuthUI);
  syncAuthUI();
};

const initTabs = () => {
  const tabButtons = [...document.querySelectorAll('.tab-btn')];
  const tabPanels = [...document.querySelectorAll('.tab-panel')];

  if (!tabButtons.length || !tabPanels.length) {
    return;
  }

  const activateTab = (tabName) => {
    tabButtons.forEach((button) => {
      const isActive = button.dataset.tab === tabName;
      button.classList.toggle('active', isActive);
      button.setAttribute('aria-selected', String(isActive));
    });

    tabPanels.forEach((panel) => {
      const isActive = panel.id === `${tabName}-panel`;
      panel.classList.toggle('active', isActive);
      panel.hidden = !isActive;
    });
  };

  tabButtons.forEach((button) => {
    button.addEventListener('click', () => activateTab(button.dataset.tab));
  });
};

const init = () => {
  initAuth();
  initTabs();
  initUsersTab();
  initItemsTab();
};

init();
