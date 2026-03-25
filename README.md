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
- Ajettu terminaalissa robot browser_demo.robot
- Epäonnistui kahdesta syystä
    - keywords.robot tiedostonimen alkukirjaimen koko ei täsmännyt
    - ***variables*** edessä oli ylimääräinen välilyönti
- Virheet selvitetty ja korjattu
- robot browser_demo.robot ajettu onnistuneesti
- Tiedostorakenne muutettu siistimmäksi: nyt testit toimii komennolla robot -d tests/outputs tests/robot/browser_demo.robot. (tässä kohdassa oikean komennon löytämiseksi on kysytty apua ChatGPT:ltä)

![Onnistunut Chromiumissa](./public/tehtava2.png)
![Onnistunut terminaalissa](./public/tehtava2-2.png)