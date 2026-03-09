import { fetchData, hasAuthToken } from './fetch.js';

const USERS_URL = '/api/users';

const state = {
  users: [],
};

// Muuntaa backendin aikaleiman luettavaan muotoon taulukkoa varten
const formatDate = (value) => {
  if (!value) {
    return '-';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString('fi-FI');
};

const pretty = (data) => JSON.stringify(data, null, 2);

// Haetaan kaikki users-nakymän tarvitsemat DOM-elementit
const getElements = () => ({
  responseBox: document.querySelector('.users-response'),
  tbody: document.querySelector('.users-tbody'),
  searchInput: document.querySelector('.users-search'),
  loadAllBtn: document.querySelector('.users-load-all'),
  getForm: document.querySelector('.users-get-form'),
  createForm: document.querySelector('.users-create-form'),
  updateForm: document.querySelector('.users-update-form'),
  deleteForm: document.querySelector('.users-delete-form'),
});

// Näyttää backendin vastauksen (onnistuminen/virhe)
const showResponse = (payload) => {
  const { responseBox } = getElements();
  if (responseBox) {
    responseBox.textContent = pretty(payload);
  }
};

// Tyhjentää users-näkymän, kun käyttajä ei ole kirjautunut
const clearUsersView = () => {
  state.users = [];
  renderUsers([]);
  showResponse({ message: 'Kirjaudu sisaan kayttaaksesi users-endpointteja.' });
};

// Asettaa users-listan taulukkoon
const renderUsers = (users) => {
  const { tbody } = getElements();
  if (!tbody) {
    return;
  }

  // Tyhjennetään vanhat rivit ennen uusien luontia
  tbody.innerHTML = '';

  users.forEach((user) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${user.user_id ?? '-'}</td>
      <td>${user.username ?? '-'}</td>
      <td>${user.email ?? '-'}</td>
      <td>${formatDate(user.created_at)}</td>
      <td>${user.user_level ?? '-'}</td>
      <td>
        <button type="button" class="row-info" data-user-id="${user.user_id}">Info</button>
        <button type="button" class="row-delete danger" data-user-id="${user.user_id}">Delete</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
};

// GET /api/users
// Hakee kaikki käyttäjät ja päivittää taulukon
const loadUsers = async () => {
  const result = await fetchData(USERS_URL);

  if (result.error) {
    showResponse(result);
    return;
  }

  state.users = Array.isArray(result) ? result : [];
  renderUsers(state.users);
  showResponse(state.users);
};

// Suodattaa users-listaa hakukentästä kirjoitetun tekstin perusteella
// Haku osuu username- tai email-kenttään
const applySearch = () => {
  const { searchInput } = getElements();
  if (!searchInput) {
    return;
  }

  const term = searchInput.value.trim().toLowerCase();
  if (!term) {
    renderUsers(state.users);
    return;
  }

  const filtered = state.users.filter((user) => {
    const username = (user.username || '').toLowerCase();
    const email = (user.email || '').toLowerCase();
    return username.includes(term) || email.includes(term);
  });

  renderUsers(filtered);
};

// GET /api/users/:id
// Hakee käyttäjän ID:n perusteella
const getUserById = async (event) => {
  event.preventDefault();

  const formData = new FormData(event.currentTarget);
  const userId = formData.get('userGetId');

  const result = await fetchData(`${USERS_URL}/${userId}`);
  showResponse(result);
};

// POST /api/users
// Luo uuden käyttäjän
const createUser = async (event) => {
  event.preventDefault();

  const form = event.currentTarget;
  const formData = new FormData(form);

  const body = {
    username: String(formData.get('username') || '').trim(),
    password: String(formData.get('password') || '').trim(),
    email: String(formData.get('email') || '').trim(),
  };

  const result = await fetchData(USERS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  showResponse(result);

  // Onnistuneen luonnin jälkeen tyhjennetään formi ja päivitetään lista
  if (!result.error) {
    form.reset();
    await loadUsers();
  }
};

// PUT /api/users/:id
// Päivittää käyttäjää
const updateUser = async (event) => {
  event.preventDefault();

  const form = event.currentTarget;
  const formData = new FormData(form);
  const userId = String(formData.get('userId') || '').trim();

  // Kootaan kaikki mahdolliset päivitettävät kentät
  const payload = {
    username: String(formData.get('username') || '').trim(),
    email: String(formData.get('email') || '').trim(),
    password: String(formData.get('password') || '').trim(),
    user_level: String(formData.get('user_level') || '').trim(),
  };

  // Poistetaan tyhjät kentät
  const body = Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== '')
  );

  // Jos päivitettävää dataa ei ole, ei pyyntöä lähetetä
  if (!Object.keys(body).length) {
    showResponse({ error: 'Anna vahintaan yksi kentta paivitettavaksi.' });
    return;
  }

  const result = await fetchData(`${USERS_URL}/${userId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  showResponse(result);

  if (!result.error) {
    form.reset();
    await loadUsers();
  }
};

// DELETE /api/users/:id
// Yhteinen poistofunktio
const deleteUserById = async (id) => {
  const result = await fetchData(`${USERS_URL}/${id}`, {
    method: 'DELETE',
  });

  showResponse(result);

  if (!result.error) {
    await loadUsers();
  }
};

// Poistaa käyttäjän delete-formista annetulla ID:lla
const deleteUserFromForm = async (event) => {
  event.preventDefault();

  const form = event.currentTarget;
  const formData = new FormData(form);
  const userId = String(formData.get('userId') || '').trim();

  if (!userId) {
    showResponse({ error: 'Anna poistettava kayttaja ID.' });
    return;
  }

  // Varmistus ennen poistoa
  const confirmed = window.confirm(`Poistetaanko kayttaja ${userId}?`);
  if (!confirmed) {
    return;
  }

  await deleteUserById(userId);
  form.reset();
};

// Käsittelee taulukon rivinappien (Info/Delete) klikkaukset
// Käytetään event delegationia
const handleTableActions = async (event) => {
  const infoButton = event.target.closest('.row-info');
  if (infoButton) {
    const userId = infoButton.dataset.userId;
    const result = await fetchData(`${USERS_URL}/${userId}`);
    showResponse(result);
    return;
  }

  const deleteButton = event.target.closest('.row-delete');
  if (deleteButton) {
    const userId = deleteButton.dataset.userId;
    const confirmed = window.confirm(`Poistetaanko kayttaja ${userId}?`);
    if (!confirmed) {
      return;
    }
    await deleteUserById(userId);
  }
};

// Reagoi kirjautumistilan muutokseen:
// - kirjautuneena haetaan data
// - kirjautumattomana tyhjennetään lista
const syncWithAuthState = () => {
  if (hasAuthToken()) {
    loadUsers();
    return;
  }

  clearUsersView();
};

// Alustaa koko users-välilehden:
// 1) lisataan event-kuuntelijat
// 2) synkataan heti autentikaatio-tilan mukaan
const initUsersTab = () => {
  const {
    loadAllBtn,
    searchInput,
    getForm,
    createForm,
    updateForm,
    deleteForm,
    tbody,
  } = getElements();

  // Jos sivulla ei ole users-elementtejä, lopetetaan
  if (
    !loadAllBtn ||
    !searchInput ||
    !getForm ||
    !createForm ||
    !updateForm ||
    !deleteForm ||
    !tbody
  ) {
    return;
  }

  loadAllBtn.addEventListener('click', loadUsers);
  searchInput.addEventListener('input', applySearch);
  getForm.addEventListener('submit', getUserById);
  createForm.addEventListener('submit', createUser);
  updateForm.addEventListener('submit', updateUser);
  deleteForm.addEventListener('submit', deleteUserFromForm);
  tbody.addEventListener('click', handleTableActions);

  window.addEventListener('auth:changed', syncWithAuthState);
  syncWithAuthState();
};

export { initUsersTab };
