import { fetchData, hasAuthToken } from './fetch.js';

const ITEMS_URL = '/api/items';

const state = {
  items: [],
};

const pretty = (data) => JSON.stringify(data, null, 2);

// Haetaan kaikki sivun tarvitsemat elementit
const getElements = () => ({
  responseBox: document.querySelector('.items-response'),
  tbody: document.querySelector('.items-tbody'),
  loadAllBtn: document.querySelector('.items-load-all'),
  createForm: document.querySelector('.items-create-form'),
  entryDateInput: document.querySelector('#entryDate'),
  entryNoteInput: document.querySelector('#entryNote'),
  entryValueInput: document.querySelector('#entryValue'),
  entryHoursInput: document.querySelector('#entryHours'),
  entryMinutesInput: document.querySelector('#entryMinutes'),
  entryEditIdInput: document.querySelector('#entryEditId'),
  entrySaveBtn: document.querySelector('.entry-save-btn'),
  entryCancelBtn: document.querySelector('.entry-cancel-btn'),
});

// Näyttää käyttäjälle virheen/onnistumisen
const showResponse = (payload) => {
  const { responseBox } = getElements();
  if (responseBox) {
    responseBox.textContent = pretty(payload);
  }
};

// Parsii tietokantaan tallennetun name-kentän osiin:
// "YYYY-MM-DD | Aktiviteetti | dur:h:m"
const splitEntryName = (name) => {
  const raw = String(name || '');
  const separator = ' | ';
  const parts = raw.split(separator);
  const date = parts[0] || '-';
  const detailParts = parts.slice(1);

  let hours = null;
  let minutes = null;

  const durationIndex = detailParts.findIndex((part) =>
    String(part).startsWith('dur:')
  );

  if (durationIndex !== -1) {
    const durationPart = detailParts[durationIndex];
    const match = /^dur:(\d+):(\d+)$/.exec(durationPart);
    if (match) {
      hours = Number(match[1]);
      minutes = Number(match[2]);
    }
    detailParts.splice(durationIndex, 1);
  }

  const note = detailParts.join(separator) || '-';

  return {
    date,
    note,
    hours,
    minutes,
    durationLabel:
      hours !== null && minutes !== null ? `${hours} h ${minutes} min` : '-',
  };
};

// Validoi intensiivisyyden: kokonaisluku 1–10 tai tyhjä
const parseIntensity = (valueRaw) => {
  if (valueRaw === '') {
    return { ok: true, value: null };
  }

  const value = Number(valueRaw);
  const isInt = Number.isInteger(value);

  if (!isInt || value < 1 || value > 10) {
    return {
      ok: false,
      error: 'Intensiivisyyden tulee olla kokonaisluku väliltä 1-10.',
    };
  }

  return { ok: true, value };
};

// Validoi keston: tunnit 0+, minuutit 0–59, ei 0 h 0 min
const parseDuration = (hoursRaw, minutesRaw) => {
  const hasHours = hoursRaw !== '';
  const hasMinutes = minutesRaw !== '';

  if (!hasHours && !hasMinutes) {
    return { ok: true, hours: null, minutes: null };
  }

  const hours = hasHours ? Number(hoursRaw) : 0;
  const minutes = hasMinutes ? Number(minutesRaw) : 0;

  if (
    !Number.isInteger(hours) ||
    !Number.isInteger(minutes) ||
    hours < 0 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return {
      ok: false,
      error: 'Kesto: tunnit 0+ ja minuutit 0-59 (kokonaislukuina).',
    };
  }

  if (hours === 0 && minutes === 0) {
    return { ok: false, error: 'Kesto ei voi olla 0 h 0 min.' };
  }

  return { ok: true, hours, minutes };
};

// Vaihtaa lomakkeen tilan: uusi merkintä vs muokkaus
const setEditMode = (isEditing) => {
  const { entrySaveBtn, entryCancelBtn } = getElements();

  if (entrySaveBtn) {
    entrySaveBtn.textContent = isEditing ? 'Päivitä' : 'Tallenna';
  }

  if (entryCancelBtn) {
    entryCancelBtn.hidden = !isEditing;
  }
};

// Nollaa lomakkeen ja palaa "uusi merkintä" -tilaan
const resetFormMode = () => {
  const {
    createForm,
    entryEditIdInput,
    entryDateInput,
    entryNoteInput,
    entryValueInput,
    entryHoursInput,
    entryMinutesInput,
  } = getElements();

  if (createForm) {
    createForm.reset();
  }

  if (entryEditIdInput) {
    entryEditIdInput.value = '';
  }

  if (entryDateInput) {
    entryDateInput.focus();
  }

  if (entryNoteInput) {
    entryNoteInput.value = entryNoteInput.value.trim();
  }

  if (entryValueInput) {
    entryValueInput.value = entryValueInput.value.trim();
  }

  if (entryHoursInput) {
    entryHoursInput.value = entryHoursInput.value.trim();
  }

  if (entryMinutesInput) {
    entryMinutesInput.value = entryMinutesInput.value.trim();
  }

  setEditMode(false);
};

// Piirtää taulukon rivit
const renderEntries = (items) => {
  const { tbody } = getElements();
  if (!tbody) {
    return;
  }

  tbody.innerHTML = '';

  items.forEach((item) => {
    const parsed = splitEntryName(item.name);

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${parsed.date}</td>
      <td>${parsed.note}</td>
      <td>${item.weight ?? '-'}</td>
      <td>${parsed.durationLabel}</td>
      <td>${item.id ?? '-'}</td>
      <td>
        <button type="button" class="entry-edit" data-item-id="${item.id}">Muokkaa</button>
        <button type="button" class="entry-delete" data-item-id="${item.id}">Poista</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
};

// Tyhjentää näkymän kirjautumattomassa tilassa
const clearEntriesView = () => {
  state.items = [];
  renderEntries([]);
  showResponse({ message: 'Sisäänkirjautuminen vaaditaan.' });
  resetFormMode();
};

// GET: hakee kaikki merkinnät
const loadEntries = async () => {
  const result = await fetchData(ITEMS_URL);

  if (result.error) {
    showResponse(result);
    return;
  }

  state.items = Array.isArray(result) ? result : [];
  renderEntries(state.items);
};

// POST: luo uuden merkinnän
const createEntry = async (body) =>
  fetchData(ITEMS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

// PUT: päivittää olemassa olevan merkinnän
const updateEntry = async (id, body) =>
  fetchData(`${ITEMS_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

// DELETE: poistaa merkinnän
const deleteEntry = async (id) =>
  fetchData(`${ITEMS_URL}/${id}`, {
    method: 'DELETE',
  });

// Tallennus: luo tai päivittää merkinnän lomakkeen tilan mukaan
const saveEntry = async (event) => {
  event.preventDefault();

  const formData = new FormData(event.currentTarget);

  const editId = String(formData.get('entryEditId') || '').trim();
  const date = String(formData.get('entryDate') || '').trim();
  const note = String(formData.get('entryNote') || '').trim();
  const valueRaw = String(formData.get('entryValue') || '').trim();
  const hoursRaw = String(formData.get('entryHours') || '').trim();
  const minutesRaw = String(formData.get('entryMinutes') || '').trim();

  if (!date || !note) {
    showResponse({ error: 'Syötä päivämäärä ja aktiviteetti.' });
    return;
  }

  const intensity = parseIntensity(valueRaw);
  if (!intensity.ok) {
    showResponse({ error: intensity.error });
    return;
  }

  const duration = parseDuration(hoursRaw, minutesRaw);
  if (!duration.ok) {
    showResponse({ error: duration.error });
    return;
  }

  let nameValue = `${date} | ${note}`;
  if (duration.hours !== null && duration.minutes !== null) {
    nameValue += ` | dur:${duration.hours}:${duration.minutes}`;
  }

  const body = { name: nameValue };

  if (intensity.value !== null) {
    body.weight = intensity.value;
  }

  const result = editId ? await updateEntry(editId, body) : await createEntry(body);

  showResponse(result);

  if (!result.error) {
    resetFormMode();
    await loadEntries();
  }
};

// Siirtää valitun rivin tiedot lomakkeeseen muokkausta varten
const startEditEntry = (itemId) => {
  const {
    entryDateInput,
    entryNoteInput,
    entryValueInput,
    entryHoursInput,
    entryMinutesInput,
    entryEditIdInput,
  } = getElements();

  const item = state.items.find((row) => String(row.id) === String(itemId));
  if (
    !item ||
    !entryDateInput ||
    !entryNoteInput ||
    !entryValueInput ||
    !entryHoursInput ||
    !entryMinutesInput ||
    !entryEditIdInput
  ) {
    return;
  }

  const parsed = splitEntryName(item.name);

  entryEditIdInput.value = String(item.id);
  entryDateInput.value = parsed.date !== '-' ? parsed.date : '';
  entryNoteInput.value = parsed.note !== '-' ? parsed.note : '';
  entryValueInput.value = item.weight ?? '';
  entryHoursInput.value = parsed.hours ?? '';
  entryMinutesInput.value = parsed.minutes ?? '';

  setEditMode(true);
};

// Rivitason napit: Muokkaa / Poista
const handleTableActions = async (event) => {
  const editBtn = event.target.closest('.entry-edit');
  if (editBtn) {
    startEditEntry(editBtn.dataset.itemId);
    return;
  }

  const deleteBtn = event.target.closest('.entry-delete');
  if (deleteBtn) {
    const itemId = deleteBtn.dataset.itemId;
    const confirmed = window.confirm(`Poistetaanko merkintä: ID: ${itemId}?`);
    if (!confirmed) {
      return;
    }

    const result = await deleteEntry(itemId);
    showResponse(result);

    if (!result.error) {
      await loadEntries();
    }
  }
};

// Synkkaa näkymän kirjautumistilan mukaan
const syncWithAuthState = () => {
  if (hasAuthToken()) {
    loadEntries();
    return;
  }

  clearEntriesView();
};

// Alustus: event-kuuntelijat + syötekenttien sanitointi + autentikaatio
const initItemsTab = () => {
  const {
    loadAllBtn,
    createForm,
    tbody,
    responseBox,
    entryCancelBtn,
    entryValueInput,
    entryHoursInput,
    entryMinutesInput,
  } = getElements();

  if (
    !loadAllBtn ||
    !createForm ||
    !tbody ||
    !responseBox ||
    !entryCancelBtn ||
    !entryValueInput ||
    !entryHoursInput ||
    !entryMinutesInput
  ) {
    return;
  }

  loadAllBtn.addEventListener('click', loadEntries);
  createForm.addEventListener('submit', saveEntry);
  tbody.addEventListener('click', handleTableActions);
  entryCancelBtn.addEventListener('click', resetFormMode);

  // Intensiivisyyskenttä: pakotetaan kokonaisluvuiksi
  entryValueInput.addEventListener('input', () => {
    if (entryValueInput.value === '') {
      return;
    }

    const numeric = Number(entryValueInput.value);
    if (Number.isNaN(numeric)) {
      entryValueInput.value = '';
      return;
    }

    entryValueInput.value = String(Math.trunc(numeric));
  });

  // Apufunktio tunneille/minuuteille: sallitaan vain kokonaisluvut
  const sanitizeWholeNumberInput = (input) => {
    input.addEventListener('input', () => {
      if (input.value === '') {
        return;
      }

      const numeric = Number(input.value);
      if (Number.isNaN(numeric)) {
        input.value = '';
        return;
      }

      input.value = String(Math.trunc(numeric));
    });
  };

  sanitizeWholeNumberInput(entryHoursInput);
  sanitizeWholeNumberInput(entryMinutesInput);

  window.addEventListener('auth:changed', syncWithAuthState);
  resetFormMode();
  syncWithAuthState();
};

export { initItemsTab };
