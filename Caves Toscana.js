// Funktion zum Abrufen der Daten für eine bestimmte ID
async function fetchData(id) {
  const url = `https://www.speleotoscana.it/programmi_php_mm/scheda_con.php?id=${id}`;
  const response = await fetch(url);
  const data = await response.json();
  return data.data;
}

// Funktion zum Schreiben der Daten in eine CSV-Datei mit Semikolon als Trennzeichen
function writeToCSV(data) {
  let csvContent = "id;nome;svil_spaz;disl_neg;UTMNord_WGS84;UTMEst_WGS84\n";

  data.forEach(entry => {
    csvContent += `${entry.id};${entry.nome};${entry.svil_spaz};${entry.disl_neg};${entry.UTMNord_WGS84};${entry.UTMEst_WGS84}\n`;
  });

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'speleotoscana_data.csv';
  link.click();
}

// Funktion zum Iterieren durch die IDs und Daten abrufen
async function iterateAndFetchData(startId, endId) {
  const data = [];

  for (let id = startId; id <= endId; id++) {
    console.log(`Abrufe Daten für Höhle mit ID ${id}`);
    const entry = await fetchData(id);
    data.push(entry);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wartezeit von 1 Sekunde
  }

  console.log('Datenabruf abgeschlossen. Schreibe in CSV.');
  writeToCSV(data);
}

// Beispiel: Daten von Höhle 1 bis 2426 abrufen und in CSV-Datei schreiben
iterateAndFetchData(1, 2426);
