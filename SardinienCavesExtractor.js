// Funktion zum Herunterladen von Daten als CSV
function downloadCSV(data, filename) {
  const csvContent = "data:text/csv;charset=utf-8," + data.map(row => row.join(";")).join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
}

// Funktion zum Abrufen von Höhlendaten für eine bestimmte ID
async function getHohlenData(id) {
  try {
    console.log(`Abrufen von Daten für ID ${id}...`);

    const url = `https://m.catastospeleologicoregionale.sardegna.it/scheda-catastale/${id}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Fehlerhafte Serverantwort (${response.status}): ${response.statusText}`);
    }

    console.log(`Daten für ID ${id} erfolgreich abgerufen.`);

    const htmlString = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');

    // Extrahiere die Informationen aus den .ui-block-a-Elementen
    const data = Array.from(doc.querySelectorAll('.ui-block-a')).map(el => ({
      label: el.querySelector('.label')?.textContent?.trim(),
      record: el.querySelector('.record')?.textContent?.trim()
    }));

    console.log('Extrahierte Daten:', data);

    return {
      id,
      data,
    };
  } catch (error) {
    console.error(`Fehler beim Abrufen der Daten für ID ${id}:`, error);
    throw error;
  }
}

// Hauptfunktion zum Sammeln und Herunterladen von Daten für einen Bereich von IDs
async function collectAndDownloadData(startId, endId) {
  const collectedData = [];

  // Füge die Bezeichnungen der Eigenschaften in die erste Zeile hinzu
  collectedData.push(['Numero', 'Nome', 'Comune', 'Località', 'Ambito catastale', 'Zona carsica', 'IGM', 'Latitudine WGS84', 'Longitudine WGS84', 'Quota', 'Scheda pos.', 'Lunghezza', 'Sviluppo spaziale', 'Svil. planimetrico', 'Dislivello negativo', 'Dislivello positivo', 'Dislivello totale', 'Morfologia ingresso', 'Idrologia ingresso', 'Geologia', 'Rilevatori', 'Gruppi', 'Compilatore', 'Anno rilievo', 'Anno compilazione', 'Descrizione', 'Grotta chiusa', 'Grotta marina', 'Rischio ambientale', 'Grotta di miniera', 'Itinerario', 'Ultimo Aggiornamento']);

  for (let id = startId; id <= endId; id++) {
    const paddedId = String(id).padStart(4, '0'); // Sorge für eine vierstellige ID mit vorgestellten Nullen
    await new Promise(resolve => setTimeout(resolve, 100)); // Warte 100 ms zwischen den Anfragen
    try {
      const hohleData = await getHohlenData(paddedId);

      // Füge die extrahierten Informationen zur Sammlung hinzu
      const rowData = [
        hohleData.id,
        ...collectedData[0].slice(1).map(property => {
          const matchingItem = hohleData.data.find(item => item.label === property);
          return matchingItem ? matchingItem.record : 'Error';
        })
      ];

      collectedData.push(rowData);
    } catch (error) {
      console.error(`Fehler beim Abrufen der Daten für ID ${paddedId}:`, error);
    }
  }

  // Herunterladen der gesammelten Daten als CSV
  downloadCSV(collectedData, "hohlen_daten.csv");

  console.log("Daten sammeln und herunterladen abgeschlossen.");
}

// Beispiel: Sammeln und Herunterladen von Daten für den Bereich von ID 1 bis 10
collectAndDownloadData(1, 10);
