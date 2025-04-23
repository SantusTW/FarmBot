// ==UserScript==
// @name         FarmBot
// @namespace    http://tampermonkey.net/
// @version      2025-04-22
// @description  try to take over the world!
// @author       You
// @match        https://des1.die-staemme.de/game.php?screen=place&village=*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=die-staemme.de
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const vorlage = 'spy' // 👈 Vorlage hier anpassen

    const vorlageToClick = Array.from(document.querySelectorAll('a')).find(a => a.textContent.trim() === vorlage);

    function getRandomDelay(min = 500, max = 950) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function fillUnitsAndSend(coords) {
        const coordField = document.querySelector('.target-input-field');
         coordField.value = coords;

        if (vorlageToClick) {
            vorlageToClick.click();
        } else {
            console.warn("❌ Kein Link mit Text 'plaa' gefunden.");
        }

        document.querySelector('#target_attack').click();

        setTimeout(() => {
            document.querySelector('#troop_confirm_go').click();
        }, 1000);
    }

    function farmBarbarians(storageKey) {
        const barbarianVillages = JSON.parse(localStorage.getItem(storageKey));
        const randomIndex = Math.floor(Math.random() * barbarianVillages.length);
        const randomVillage = barbarianVillages[randomIndex];
        setTimeout(() => {
            fillUnitsAndSend(randomVillage);
        }, getRandomDelay());
    }


// Koordinaten aus dem Header ziehen
function getStartCoordFromHeader() {
  const headerText = document.querySelector('#menu_row2 b')?.textContent;
  const match = headerText.match(/\((\d+)\|(\d+)\)/);
  if (match) {
    return { x: parseInt(match[1]), y: parseInt(match[2]) };
  }
  throw new Error('Startkoordinaten nicht gefunden!');
}


// ===================
// START & CHECK LOGIK
// ===================
try {

  console.log('FarmBot');
  const { x, y } = getStartCoordFromHeader();
  const originCoord = `${x}|${y}`;

  const radiusstorageKey = `radius_${originCoord}`;
  const radius = JSON.parse(localStorage.getItem(radiusstorageKey));

  const storageKey = `bb_${originCoord}_${radius}`;
  console.log(storageKey);
  const existingData = localStorage.getItem(storageKey);
  console.log(existingData);
  if (existingData) {
      farmBarbarians(storageKey);
  }else{
      console.error("❌ Farmbot nicht gestartet!");

  }

} catch (error) {
  console.error("❌ Fehler beim Ausführen:", error.message);
}

})();