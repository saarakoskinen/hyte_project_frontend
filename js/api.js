import {
  getItems,
  getItemById,
  deleteItemById,
  addItem,
  updateItemById,
  loadItemToPutForm,
} from './items';

console.log('Scripti starttaa');

// sync ja asyc ajatus ja demo

// function synchronousFunction() {
//   let number = 1;
//   for (let i = 1; i < 10000; i++) {
//     number += i;
//     console.log('synchronousFunction running');
//   }
//   console.log('regular function complete', number);
// }

// synchronousFunction();

console.log('Valmis');

// synkroninen
// console.log('1');
// console.log('2');
// console.log('3');

// async suoritus

// console.log('1');

// setTimeout(() => {
//   console.log('2');
// }, 4000);

// console.log('3');

// GET
// eka haku ulkoiseen rajapintaan
// tämä on fetch käyttäen promisea (eli lupausta)
// ja ON asykroninen

// fetch('https://api.restful-api.dev/objects')
//   .then((response) => {
//     console.log(response);
//     if (!response.ok) {
//       throw new Error('Verkkovastaus ei ollut kunnossa');
//     }
//     return response.json();
//   })
//   .then((data) => {
//     console.log(data);
//   })
//   .catch((error) => {
//     console.error('Fetch-operaatiossa ilmeni ongelma:', error);
//   });

// Yksikertaistetaan ja modernisoidaan haku
// käytettän async ja await avainsanoja

// async function getData() {
//   try {
//     const response = await fetch('https://api.restful-api.dev/objects');
//     const data = await response.json();
//     console.log(data);
//   } catch (error) {
//     console.error('Virhe:', error);
//   }
// }

//getData();

// ensimmäinen oma kutsu BE puolelle

// const consoleLogItems = async () => {
//   try {
//     // default on GET kutsu ilman optiota
//     const response = await fetch('http://localhost:3000/api/items');
//     const data = await response.json();
//     console.log('Haetaan omasta rajapinnasta!!!');
//     console.log(data);

//     data.forEach((rivi) => {
//       console.log(rivi);
//       console.log(rivi.name);
//     });
//   } catch (error) {
//     console.error('Virhe:', error);
//   }
// };

// consoleLogItems();

//getItems();

// hakekaa nappula
// lisätkää kuuntelija suorittakaa klikatessa getItems funktio
const getItemsBtn = document.querySelector('.get_items');
getItemsBtn.addEventListener('click', getItems);

const getForm = document.querySelector('.get-item-form');
getForm.addEventListener('submit', getItemById);

const deleteBtn = document.querySelector('.delete-item');
deleteBtn.addEventListener('click', deleteItemById);

// Etsitään formi, ei itse nappulaa ja tutkitaan SUBMIT eventtiä
const addItemForm = document.querySelector('.add-item-form');
addItemForm.addEventListener('submit', addItem);

// PUT lisäykset KOTITEHTÄVÄKSI
const loadItemBtn = document.querySelector('.load-item');
loadItemBtn.addEventListener('click', loadItemToPutForm);

const putForm = document.querySelector('.put-item-form');
putForm.addEventListener('submit', updateItemById);