(async () => {
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    // Alle Haupteinträge sammeln
    const entries = Array.from(document.querySelectorAll('[data-name="entity_field_post_title"] a'));
    const totalEntries = entries.length;

    // Dialog zur Auswahl von Start- und Endindex
    const startInput = prompt(`Es sind ${totalEntries} Einträge verfügbar.\nBitte geben Sie den Startindex ein (0 bis ${totalEntries - 1}):`, "0");
    const endInput = prompt(`Bitte geben Sie den Endindex ein (1 bis ${totalEntries}).\nDer Endindex ist exklusiv, d.h. der letzte Eintrag ist Endindex - 1:`, `${Math.min(10, totalEntries)}`);

    const startIndex = Math.max(0, Math.min(parseInt(startInput, 10), totalEntries - 1));
    const endIndex = Math.max(startIndex + 1, Math.min(parseInt(endInput, 10), totalEntries));

    const selectedEntries = entries.slice(startIndex, endIndex);

    // Daten sammeln
    const results = [];

    for (let i = 0; i < selectedEntries.length; i++) {
        const entry = selectedEntries[i];
        const entryUrl = entry.href;

        try {
            const response = await fetch(entryUrl);
            const text = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(text, 'text/html');

            // Name extrahieren
            const nameElement = doc.querySelector('[data-name="entity_field_post_title"]');
            const name = nameElement ? nameElement.textContent.trim() : 'N/A';

            // Koordinaten extrahieren
            const locationElement = doc.querySelector('[data-name="entity_field_location_address"] a');
            let northCoordinate = 'N/A', eastCoordinate = 'N/A';
            if (locationElement && locationElement.href.includes('https://www.google.com/maps/search/')) {
                const coords = new URL(locationElement.href).searchParams.get('query');
                if (coords) {
                    [northCoordinate, eastCoordinate] = coords.split(',');
                }
            }

            // Ergebnis speichern
            results.push({
                name,
                northCoordinate,
                eastCoordinate,
                url: entryUrl
            });

            console.log(`Erfasst: ${name} (${northCoordinate}, ${eastCoordinate})`);
        } catch (error) {
            console.error(`Fehler beim Abrufen von ${entryUrl}:`, error);
        }

        // 100ms Pause zwischen den Anfragen
        await delay(100);
    }

    // Funktion zum Formatieren der Koordinaten
    const formatCoordinate = (coord) => {
        if (coord === 'N/A') return coord;
        const num = parseFloat(coord);
        if (!isNaN(num)) {
            return "'" + num.toFixed(6);
        }
        return "'" + coord;
    };

    // CSV erstellen mit Semikolon als Trennzeichen
    const csvRows = [
        "Name;Nordkoordinate;Ostkoordinate;URL",
        ...results.map(r => `"${r.name}";${formatCoordinate(r.northCoordinate)};${formatCoordinate(r.eastCoordinate)};"${r.url}"`)
    ];

    const bom = '\uFEFF'; 
    const csvContent = bom + csvRows.join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "grotte_daten.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    console.log("CSV-Datei wurde erstellt und heruntergeladen.");
})();
