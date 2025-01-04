(async function() {
    // Hilfsfunktion zum Herunterladen von Dateien
    function downloadCSV(data, filename = 'canyons.csv') {
        const blob = new Blob([data], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // Hilfsfunktion, um einen HTTP-Request auszuführen
    async function fetchHTML(url) {
        const response = await fetch(url);
        const text = await response.text();
        const parser = new DOMParser();
        return parser.parseFromString(text, 'text/html');
    }

    // Tabelle auf der aktuellen Seite auswählen
    const rows = document.querySelectorAll('table.w-full.text-sm.text-left.text-gray-500 tr');

    const results = [['Name', 'ml-1 Text', 'Hover-Span Text']]; // Header für CSV

    for (const row of rows) {
        const linkElement = row.querySelector('th a');
        if (!linkElement) continue; // Überspringe Zeilen ohne Link

        const href = linkElement.href;

        // Detailseite abrufen
        const detailPage = await fetchHTML(href);

        // Gewünschte Werte extrahieren
        const name = detailPage.querySelector('h2')?.textContent.trim() || '';
        const ml1Text = detailPage.querySelector('div.ml-1')?.textContent.trim() || '';
        const hoverText = detailPage.querySelector('span.cursor-pointer.hover\\:text-blue-700')?.textContent.trim() || '';

        // Ergebnisse speichern
        results.push([name, ml1Text, hoverText]);
    }

    // CSV-String generieren, mit Semikolon als Trennzeichen
    const csvContent = results.map(row => row.map(cell => `"${cell}"`).join(';')).join('\n');

    // CSV herunterladen
    downloadCSV(csvContent);
})();
