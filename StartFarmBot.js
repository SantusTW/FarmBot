// ==UserScript==
// @name         StartFarmBot
// @namespace    http://tampermonkey.net/
// @version      2025-04-22
// @description  try to take over the world!
// @author       You
// @match        https://des1.die-staemme.de/game.php?village=*&screen=place
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

// Koordinaten im Umkreis berechnen
function getSurroundingCoords(centerX, centerY, radius) {
  const coords = [];
  for (let dx = -radius; dx <= radius; dx++) {
    for (let dy = -radius; dy <= radius; dy++) {
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance <= radius && !(dx === 0 && dy === 0)) {
        coords.push({ x: centerX + dx, y: centerY + dy });
      }
    }
  }
  return coords;
}

// Sleep-Funktion
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Barbarendörfer suchen
async function findBarbarianVillages(centerX, centerY, radius, storageKey) {
  const coordsToCheck = getSurroundingCoords(centerX, centerY, radius);
  const validbbs = [];

  const inputField = document.querySelector('.target-input-field');
  if (!inputField) {
    console.error("❌ Input-Feld nicht gefunden!");
    return;
  }

  for (const coord of coordsToCheck) {
    const coordString = `${coord.x}|${coord.y}`;
    inputField.value = coordString;
    inputField.dispatchEvent(new Event('input', { bubbles: true }));

    await sleep(100); // ggf. anpassen

    if (document.body.innerHTML.includes('<strong>Besitzer:</strong> Barbaren <strong>')) {
      validbbs.push(coordString);
      console.log(`✅ Barbarendorf gefunden bei ${coordString}`);
    } else {
      console.log(`❌ Kein Barbar bei ${coordString}`);
    }
  }

  localStorage.setItem(storageKey, JSON.stringify(validbbs));
  farmBarbarians(storageKey);
}

// ===================
// START & CHECK LOGIK
// ===================
try {
   console.log('Start');
   let radius = parseInt(prompt("🧭 Gib den Farm Radius ein:"), 10);
    if (isNaN(radius) || radius < 1) {
        return;
    }

  const { x, y } = getStartCoordFromHeader();
  const originCoord = `${x}|${y}`;

  const radiusstorageKey = `radius_${originCoord}`;
  const oldRadius = localStorage.getItem(radiusstorageKey);
  if(oldRadius != radius){
      localStorage.setItem(radiusstorageKey, radius);
  }

  const storageKey = `bb_${originCoord}_${radius}`;

  const existingData = localStorage.getItem(storageKey);

    if (existingData) {
         farmBarbarians(storageKey);
    }else{
        findBarbarianVillages(x, y, radius, storageKey);
    }

} catch (error) {
  console.error("❌ Fehler beim Ausführen:", error.message);
}

})();