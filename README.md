Sovellus on yksinkertainen nettisivu omien liikuntatottumusten seurantaan. Se sisältää mahdollisuudet BMI:n laskemiselle, sekä omien liikuntasuoritusten kirjaamiselle. Sovellus ei vaadi sisäänkirjautumista sen käyttöä varten, mutta mikäli omia liikuntatietoja haluaa tallentaa, on se välttämätöntä. Ohessa kuva tietokantarakenteesta, jota sovellus käyttää.

## Tietokantarakenne
![Tietokantarakenne hyte 2026](./public/tietokantarakenne_hyte_2026.png)


Koodin kehittämisessä on hyödynnetty opettajien esimerkkikoodeja, sekä tekoälytyökaluja, kuten ChatGPT:tä ja Codexia. Tekoälyä on käytetty laajalti tukena koodin ideoinnissa, rakenteen hahmottamisessa ja ongelmien ratkaisemisessa. Lopullinen toteutus ei kuitenkaan ole suoraan tekoälyn tuottama, vaan sitä on muokattu ja sovellettu projektin tarpeisiin. Sivuston kehittäjä ymmärtää koodin toiminnan kokonaisuudessaan.


## Tehdyt tehtävät, Terveyssovelluksen kehitys, Testaus

### Tehtävä 1

Asennettu seuraavat työkalut:
- Robot Framework
- Browser Library
- Requests library
- CryptoLibrary
- Robotidy

![Robotframework asennukset](./public/Robotframework_asennukset_hyte_2026.png)
![Asennustesti](./public/Asennustesti.png)

Tekoäly ChatGPT:ltä kysytty apua asennuksiin


### Tehtävä 2

- Tiedostot keywords.robot ja browser_demo.robot luotu
- Yllä mainittuihin kopioitu opettajan antamat koodirivit
- Koodi muokattu omaan sivustoon sopivaksi
- Debuggauksessa käytetty apuna tekoälytyökalu Chat-GPT:tä
- Tietokanta ei käytössä, joten sisäänkirjautuminen ei onnistu puuttuvien käyttäjätietojen vuoksi, testi onnistuu kuitenkin

![Onnistunut terminaalissa](./public/tehtava2.png)
![Onnistunut selaimessa](./public/tehtava2-2.png)


### Tehtävä 3

- .env tiedosto luotu
- .env lisätty .gitignoreen
- load_env.py tiedosto lisätty
- python-dotenv-kirjasto ladattu verkkoympäristöön
- web-form.robot luotu: täällä käytetään tuota Python-kirjastoa
- CryptoLibrary asennettu
- Salausavaimet generoitu

![Avainpari luotu onnistuneesti](./public/tehtava3-1.png)

- Salasana ja käyttäjänimi salattu käyttäen CryptoClientia, jotta ne eivät ole koodissa näkyvissä

![Tiedot salattu](./public/tehtava3-2.png)

- Lisätty testejä Web form -esimerkkisivun muiden kenttien toiminnasta: select dropdown, datalist, file input, checkbox ja radio button
- Testit ajettu onnistuneesti

![Testit onnistuneet](./public/tehtava3-3.png)

Tekoäly ChatGPT:tä käytetty työkaluna tehtävänannon ymmärtämisessä, oikeiden komentojen löytämisessä sekä debuggaamisessa