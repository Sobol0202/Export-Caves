// Funktion zum Abrufen der Höhlendaten von der API
async function getCaveData(caveId) {
  const apiUrl = `https://api.katasterjam.si/api/caves/${caveId}`;
  const response = await fetch(apiUrl);
  const data = await response.json();
  return data;
}

// Funktion zum Erstellen der CSV-Datei und zum Download
function downloadCSV(data) {
  let csvContent = "data:text/csv;charset=utf-8,"
    + "caveNumber;name;length;depth;entranceElevation;coordinates\n";

  data.forEach(cave => {
    const coordinates = `${cave.lat},${cave.lng}`;
    const row = [
      cave.caveNumber,
      cave.name,
      cave.length,
      cave.depth,
      cave.entranceElevation,
      coordinates
    ].join(";") + "\n";

    csvContent += row;
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "cave_data.csv");
  document.body.appendChild(link);
  link.click();
}

// Bereich festlegen (Beispiel: Höhlen von ID 1 bis 10 abrufen)
const startId = 1;
const endId = 10;

// Array zum Sammeln der Höhlendaten
const caveDataArray = [];

// Höhlendaten abrufen und sammeln
for (let caveId = startId; caveId <= endId; caveId++) {
  getCaveData(caveId)
    .then(data => {
      caveDataArray.push({
        caveNumber: data.caveNumber,
        name: data.name,
        length: data.length,
        depth: data.depth,
        entranceElevation: data.entranceElevation,
        lat: data.lat,
        lng: data.lng
      });

      // Überprüfen, ob alle Daten abgerufen wurden
      if (caveDataArray.length === endId - startId + 1) {
        // Alle Daten wurden abgerufen, CSV erstellen und herunterladen
        downloadCSV(caveDataArray);
      }
    })
    .catch(error => console.error(`Fehler beim Abrufen der Daten für Höhle ${caveId}:`, error));
}
