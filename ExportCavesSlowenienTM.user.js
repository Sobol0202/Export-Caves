// ==UserScript==
// @name         Höhleninformationen kopieren und zur nächsten Höhle wechseln
// @namespace    www.katasterjam.si
// @version      1.5
// @description  Fügt einen Button auf der Website hinzu, um Höhleninformationen in die Zwischenablage zu kopieren und zur nächsten Höhle zu wechseln.
// @author       Sobol
// @match        https://www.katasterjam.si/caves/*
// @grant        GM_setClipboard
// ==/UserScript==

(function() {
    'use strict';

    function extractCaveInfo() {
        // Finde alle Tabellen auf der Seite
        var tables = document.querySelectorAll('.table');

        var caveID, caveName, caveLength, caveDepth, wgs84, entranceElevation;

        // Durchsuche alle Tabellen nach den erforderlichen Informationen
        tables.forEach(function(table) {
            var rows = table.querySelectorAll('tr');
            rows.forEach(function(row) {
                var cells = row.querySelectorAll('td, th');
                if (cells.length === 2) {
                    var cellText = cells[0].innerText.trim();
                    switch (cellText) {
                        case 'Cave ID number':
                            caveID = cells[1].innerText.trim();
                            break;
                        case 'Cave name':
                            caveName = cells[1].innerText.trim();
                            break;
                        case 'Length':
                            caveLength = cells[1].innerText.trim();
                            break;
                        case 'Cave depth':
                            caveDepth = cells[1].innerText.trim();
                            break;
                        case 'Entrance elevation [m a.s.l.]':
                            entranceElevation = cells[1].innerText.trim();
                            break;
                        case 'WGS-84:':
                            wgs84 = cells[1].innerText.trim();
                            break;
                    }
                }
            });
        });

        // Erstelle den Text für die Zwischenablage
        var clipboardText =
            caveID + '\t' +
            caveName + '\t' +
            caveLength + '\t' +
            caveDepth + '\t' +
            entranceElevation + '\t' +
            wgs84;

        // Kopiere den Text in die Zwischenablage
        GM_setClipboard(clipboardText, 'text');

        // Hinweis für den Benutzer
        //alert('Höhleninformationen wurden in die Zwischenablage kopiert. Du kannst sie nun in Excel oder einem anderen Programm einfügen.');

        // Extrahiere die aktuelle Höhlennummer aus der URL und erhöhe sie um 1
        var currentCaveNumber = parseInt(window.location.href.match(/\/(\d+)$/)[1]);
        var nextCaveNumber = currentCaveNumber + 1;

        // Erstelle die URL für die nächste Höhle
        var nextCaveURL = window.location.href.replace(/\/\d+$/, '/' + nextCaveNumber);

        // Navigiere zur nächsten Höhle
        window.location.href = nextCaveURL;
    }

    function createButton() {
        var button = document.createElement('button');
        button.textContent = 'Höhleninformationen kopieren und zur nächsten Höhle wechseln';
        button.style.position = 'fixed';
        button.style.right = '50%';
        button.style.transform = 'translateX(50%)';
        button.style.top = '10px';
        button.style.zIndex = '9999';
        button.addEventListener('click', extractCaveInfo);

        document.body.appendChild(button);
    }

    // Füge den Button zur Seite hinzu
    createButton();
})();
