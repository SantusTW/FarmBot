// ==UserScript==
// @name         Auto Confirm Troops
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Automatically clicks the confirm button when sending troops
// @author       You
// @match        https://des1.die-staemme.de/game.php?village=*&screen=place&try=confirm*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Wait for the button to exist
    function clickConfirmButton() {
        const button = document.getElementById("troop_confirm_submit");
        if (button) {
            button.click();
        } else {
            // Try again in 100ms if button isn't there yet
            setTimeout(clickConfirmButton, 100);
        }
    }

    // Start checking
    clickConfirmButton();
})();