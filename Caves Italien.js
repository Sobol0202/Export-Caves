// Hilfsfunktion für die Wartezeit (100ms)
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Funktion zum Extrahieren der gewünschten Daten von einer Seite
async function fetchCaveData(id) {
    try {
        const response = await fetch(`https://www.catastogrotte.it/grotta/${id}/`);
        if (!response.ok) return false;

        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        // Den Namen der Höhle aus dem h1-Element extrahieren (Entfernt den Inhalt des div-Tags)
        const h1Element = doc.querySelector('h1');
        let caveName = false;
        if (h1Element) {
            caveName = h1Element.childNodes[2] ? h1Element.childNodes[2].textContent.trim() : false;
        }

        // Die Listen (alle dl-Elemente) holen
        const dlElements = doc.querySelectorAll('dl');

        // Falls es keine dl-Elemente gibt, gib false zurück
        if (!dlElements.length) return false;

        // Erste Liste (Dislivello, Sviluppo, Profondità)
        let dislivello = false, sviluppo = false, profondita = false;
        const firstList = dlElements[0];
        firstList.querySelectorAll('dt').forEach((dt) => {
            const dd = dt.nextElementSibling ? dt.nextElementSibling.textContent.trim() : false;
            switch (dt.textContent.trim()) {
                case 'Dislivello':
                    dislivello = dd;
                    break;
                case 'Sviluppo':
                    sviluppo = dd;
                    break;
                case 'Profondità':
                    profondita = dd;
                    break;
            }
        });

        // Suche nach Lat. (WGS84) und Long. (WGS84) in allen Listen
        let lat = false, long = false;
        dlElements.forEach((list) => {
            list.querySelectorAll('dt').forEach((dt) => {
                const dd = dt.nextElementSibling ? dt.nextElementSibling.textContent.trim() : false;
                switch (dt.textContent.trim()) {
                    case 'Lat. (WGS84)':
                        lat = dd ? dd.replace('.', ',') : false; // Ersetzt den Punkt durch ein Komma für Excel
                        break;
                    case 'Long. (WGS84)':
                        long = dd ? dd.replace('.', ',') : false; // Ersetzt den Punkt durch ein Komma für Excel
                        break;
                }
            });
        });

        // Ausgabe in der Konsole, dass die Höhle erfolgreich abgerufen wurde
        console.log(`Höhle ID: ${id}, Name: ${caveName || 'unbekannt'} erfolgreich abgerufen.`);

        // Rückgabe der Daten als Objekt
        return {
            id,
            caveName,
            dislivello,
            sviluppo,
            profondita,
            lat,
            long
        };
    } catch (err) {
        console.error(`Fehler beim Laden von Höhle ${id}:`, err);
        return false;
    }
}

// Funktion zum Erstellen der CSV-Datei
function downloadCSV(data) {
    const csvContent = [
        ['ID', 'Name', 'Dislivello', 'Sviluppo', 'Profondità', 'Lat.', 'Long.'].join(';'),  // Header
        ...data.map(cave => [
            cave.id,
            cave.caveName || 'FALSE',
            cave.dislivello || 'FALSE',
            cave.sviluppo || 'FALSE',
            cave.profondita || 'FALSE',
            cave.lat || 'FALSE',
            cave.long || 'FALSE'
        ].join(';'))
    ].join('\n');

    // Erstellen und Download der CSV-Datei
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'caves_data.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Hauptfunktion, die die Höhleninformationen sammelt und die CSV-Datei erstellt
async function fetchCavesData(startId, endId) {
    const data = [];
    for (let id = startId; id <= endId; id++) {
        const caveData = await fetchCaveData(id);
        if (caveData) data.push(caveData);
        // Wartezeit von 500ms nach jeder Abfrage
        await delay(500);
    }
    downloadCSV(data);
}

// IDs für Start und Ende festlegen (Beispiele: 1 bis 5)
const startId = 10001;
const endId = 15000;

// Daten abholen und CSV herunterladen
fetchCavesData(startId, endId);
