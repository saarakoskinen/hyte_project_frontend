import { fetchData, hasAuthToken } from './fetch.js';

const ITEMS_URL = '/api/items';

const state = {
  items: [],
};

const pretty = (data) => JSON.stringify(data, null, 2);

const getElements = () => ({
  responseBox: document.querySelector('.items-response'),
  tbody: document.querySelector('.items-tbody'),
  loadAllBtn: document.querySelector('.items-load-all'),
  getForm: document.querySelector('.items-get-form'),
  createForm: document.querySelector('.items-create-form'),
  updateForm: document.querySelector('.items-update-form'),
  deleteForm: document.querySelector('.items-delete-form'),
});

const showResponse = (payload) => {
  const { responseBox } = getElements();
  if (responseBox) {
    responseBox.textContent = pretty(payload);
  }
};

const clearItemsView = () => {
  state.items = [];
  renderItems([]);
  showResponse({ message: 'Kirjaudu sisaan kayttaaksesi items-endpointteja.' });
};

const renderItems = (items) => {
  const { tbody } = getElements();
  if (!tbody) {
    return;
  }

  tbody.innerHTML = '';

  items.forEach((item) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${item.id ?? '-'}</td>
      <td>${item.name ?? '-'}</td>
      <td>${item.weight ?? '-'}</td>
      <td>
        <button type="button" class="item-row-info" data-item-id="${item.id}">Info</button>
        <button type="button" class="item-row-delete danger" data-item-id="${item.id}">Delete</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
};

const loadItems = async () => {
  const result = await fetchData(ITEMS_URL);

  if (result.error) {
    showResponse(result);
    return;
  }

  state.items = Array.isArray(result) ? result : [];
  renderItems(state.items);
  showResponse(state.items);
};

const getItemById = async (event) => {
  event.preventDefault();

  const formData = new FormData(event.currentTarget);
  const itemId = formData.get('itemId');

  const result = await fetchData(`${ITEMS_URL}/${itemId}`);
  showResponse(result);
};

const createItem = async (event) => {
  event.preventDefault();

  const form = event.currentTarget;
  const formData = new FormData(form);

  const body = {
    name: String(formData.get('name') || '').trim(),
  };

  const weightValue = String(formData.get('weight') || '').trim();
  if (weightValue !== '') {
    body.weight = Number(weightValue);
  }

  const result = await fetchData(ITEMS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  showResponse(result);

  if (!result.error) {
    form.reset();
    await loadItems();
  }
};

const updateItem = async (event) => {
  event.preventDefault();

  const form = event.currentTarget;
  const formData = new FormData(form);

  const itemId = String(formData.get('itemId') || '').trim();
  const name = String(formData.get('name') || '').trim();
  const weightValue = String(formData.get('weight') || '').trim();

  const body = {};

  if (name) {
    body.name = name;
  }

  if (weightValue !== '') {
    body.weight = Number(weightValue);
  }

  if (!Object.keys(body).length) {
    showResponse({ error: 'Anna vahintaan yksi kentta paivitettavaksi.' });
    return;
  }

  const result = await fetchData(`${ITEMS_URL}/${itemId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  showResponse(result);

  if (!result.error) {
    form.reset();
    await loadItems();
  }
};

const deleteItemById = async (id) => {
  const result = await fetchData(`${ITEMS_URL}/${id}`, {
    method: 'DELETE',
  });

  showResponse(result);

  if (!result.error) {
    await loadItems();
  }
};

const deleteItemFromForm = async (event) => {
  event.preventDefault();

  const form = event.currentTarget;
  const formData = new FormData(form);
  const itemId = String(formData.get('itemId') || '').trim();

  if (!itemId) {
    showResponse({ error: 'Anna poistettava tapahtuma ID.' });
    return;
  }

  const confirmed = window.confirm(`Poistetaanko tapahtuma ${itemId}?`);
  if (!confirmed) {
    return;
  }

  await deleteItemById(itemId);
  form.reset();
};

const handleTableActions = async (event) => {
  const infoButton = event.target.closest('.item-row-info');
  if (infoButton) {
    const itemId = infoButton.dataset.itemId;
    const result = await fetchData(`${ITEMS_URL}/${itemId}`);
    showResponse(result);
    return;
  }

  const deleteButton = event.target.closest('.item-row-delete');
  if (deleteButton) {
    const itemId = deleteButton.dataset.itemId;
    const confirmed = window.confirm(`Poistetaanko tapahtuma ${itemId}?`);
    if (!confirmed) {
      return;
    }

    await deleteItemById(itemId);
  }
};

const syncWithAuthState = () => {
  if (hasAuthToken()) {
    loadItems();
    return;
  }

  clearItemsView();
};

const initItemsTab = () => {
  const { loadAllBtn, getForm, createForm, updateForm, deleteForm, tbody } =
    getElements();

  if (
    !loadAllBtn ||
    !getForm ||
    !createForm ||
    !updateForm ||
    !deleteForm ||
    !tbody
  ) {
    return;
  }

  loadAllBtn.addEventListener('click', loadItems);
  getForm.addEventListener('submit', getItemById);
  createForm.addEventListener('submit', createItem);
  updateForm.addEventListener('submit', updateItem);
  deleteForm.addEventListener('submit', deleteItemFromForm);
  tbody.addEventListener('click', handleTableActions);

  window.addEventListener('auth:changed', syncWithAuthState);
  syncWithAuthState();
};

export { initItemsTab };
