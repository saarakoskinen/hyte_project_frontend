import { fetchData } from './fetch.js';

// Render Item in a List in the UI
/////////////////////
const renderFruitList = (items) => {
  console.log('Teen kohta listan');
  // Haetaan fruitlist UL
  const list = document.querySelector('.fruitlist');
  list.innerHTML = '';

  console.log(items);

  items.forEach((item) => {
    console.log(item.name);
    let li = document.createElement('li');
    li.textContent = `Hedelmän id ${item.id} ja nimi ${item.name}`;
    list.appendChild(li);
  });

  // ja lisätään loopissa kaikki yksittäiset
  // hedelmät listaan
};

// GEt items
/////////////////////

const getItems = async () => {
  //  const items = await fetchData(url, options);
  const items = await fetchData('http://localhost:3000/api/items');

  // jos BE puolelta tulee virhe niin informoidaan
  // joko consoleen tai käyttäjälle virheestä

  if (items.error) {
    console.log(items.error);
    return;
  }

  // tai jatketaan jä tehdään datalle jotain
  // items.forEach((item) => {
  //   console.log(item.name);
  // });

  renderFruitList(items);
};

// GEt item by ID
/////////////////////

const getItemById = async (event) => {
  console.log('Haetaan IDn avulla!!!');

  event.preventDefault();

  //const idInput = document.getElementById('itemID');
  const idInput = document.querySelector('#itemId');
  const itemId = idInput.value;
  console.log(itemId);

  const url = `http://localhost:3000/api/items/${itemId}`;

  const options = {
    method: 'GET',
  };

  const item = await fetchData(url, options);

  // jos BE puolelta tulee virhe niin informoidaan
  // joko consoleen tai käyttäjälle virheestä

  if (item.error) {
    console.log(item.error);
    return;
  }

  // 1. kehittäjälle virheet ja onnistumiset
  console.log(item);
  // 2. Käyttäjälle tieto näkyviin ja mahdolliset virheet näyviin
  alert(`Item found :) ${item.name}`);
};

// DELETE item by ID
/////////////////////

const deleteItemById = async () => {
  console.log('Deletoidaan IDn avulla!!!');

  const idInput = document.querySelector('#itemId');
  const itemId = idInput.value;
  console.log(itemId);

  // Muista usein tarkistaa että käyttäjä lähettää oikean datan
  if (!itemId) {
    console.log('Item ID missing, fill in the details!!!!');
    return;
  }

  const confirmed = confirm(
    `Oletko varma että haluat poistaa itemin: ${itemId}`
  );
  // Jos käyttäjä painaa cancel niin palautuu FALSE ja hypätään pois
  if (!confirmed) return;

  const url = `http://localhost:3000/api/items/${itemId}`;

  const options = {
    method: 'DELETE',
  };

  const item = await fetchData(url, options);

  if (item.error) {
    console.log(item.error);
    return;
  }

  console.log(item);
  alert(item.message);

  // Päivitä UI niin käyttäjä tietää että hedelmä poistui
  await getItems();
};

// POST item
/////////////////////

const addItem = async (event) => {
  event.preventDefault();

  const form = document.querySelector('add-item-form');
  const fruitName = document.querySelector('#newItemName').value.trim();
  const fruitWeight = document.querySelector('#newItemWeight').value.trim();

  if (!fruitName) {
    alert('Nimi puuttuu!!!!!!');
    return;
  }

  const body = {};

  const url = `http://localhost:3000/api/items`;

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: fruitName,
      weight: fruitWeight,
    }),
  };

  console.log(url, options);

  const response = await fetchData(url, options);

  if (response.error) {
    console.log(response.error);
    return;
  }

  await getItems();
  console.log(response);
};

// Load item to PUT form (GET by id -> fill inputs)
/////////////////////////////

const loadItemToPutForm = async () => {
  const idInput = document.querySelector('#putItemId');
  const nameInput = document.querySelector('#putItemName');

  const itemId = idInput.value.trim();

  if (!itemId) {
    alert('Anna Item ID');
    return;
  }

  const url = `http://localhost:3000/api/items/${itemId}`;

  const item = await fetchData(url);

  if (item.error) {
    console.error(item.error);
    alert(`Error: ${item.error}`);
    return;
  }

  // täytetään nimi kenttään
  // mikäli nimeä ei saada haettua niin käytä tyhjää merkkijonoa
  nameInput.value = item.name ?? '';

  alert(`Haettu item: ${item.name}`);
};

// Update item (PUT by id)
/////////////////////////////

const updateItemById = async (event) => {
  event.preventDefault();

  const idInput = document.querySelector('#putItemId');
  const nameInput = document.querySelector('#putItemName');

  const itemId = idInput.value.trim();
  const newName = nameInput.value.trim();

  if (!itemId) {
    alert('Item ID puuttuu');
    return;
  }

  if (!newName) {
    alert('Uusi nimi puuttuu');
    return;
  }

  const url = `http://localhost:3000/api/items/${itemId}`;

  const options = {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: newName }),
  };

  const updated = await fetchData(url, options);

  if (updated.error) {
    console.error(updated.error);
    alert(`Error: ${updated.error}`);
    return;
  }
  console.log(updated);
  console.log(updated.message);
  alert(`Item updated: ${updated.item.name}`);

  // valinnainen: päivitä lista uudestaan
  // await getItems();

  idInput.value = '';
  nameInput.value = '';
};

export {
  getItems,
  getItemById,
  deleteItemById,
  addItem,
  loadItemToPutForm,
  updateItemById,
};