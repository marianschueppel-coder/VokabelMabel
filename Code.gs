/**
 * Vokabeln – Google Sheets Backend
 *
 * Einrichtung:
 * 1. Neues Google Sheet anlegen (oder ein bestehendes benutzen).
 * 2. Erweiterungen -> Apps Script.
 * 3. Den kompletten Inhalt dieser Datei dort einfügen (vorhandenen Beispielcode ersetzen).
 * 4. TOKEN unten durch einen eigenen geheimen Code ersetzen (frei erfunden, z. B. "muenster-vok-7x2").
 * 5. Oben rechts "Bereitstellen" -> "Neue Bereitstellung" -> Typ "Web-App".
 *      - Ausführen als: Ich (dein Google-Konto)
 *      - Zugriff: Jeder
 *    Dann "Bereitstellen" und den Berechtigungen zustimmen (eigenes Skript, daher unbedenklich).
 * 6. Die angezeigte Web-App-URL (endet auf /exec) in der App unter
 *    Übersicht -> Google Sheets Backup eintragen, zusammen mit dem gleichen TOKEN.
 *
 * Wichtig: Nach jeder Änderung an diesem Code muss über
 * "Bereitstellen" -> "Bereitstellungen verwalten" -> Stift-Symbol -> "Neue Version" erneut bereitgestellt werden,
 * sonst nutzt die Web-App weiter den alten Stand.
 */

var SHEET_NAME = 'Karten';
var TOKEN = 'vokabeln';
var COLUMNS = ['id', 'front', 'back', 'note', 'box', 'due', 'createdAt', 'updatedAt', 'favorite'];
// Neue Zeile manuell im Sheet eintragen: nur Spalte B (front/Begriff) und
// C (back/Übersetzung) ausfüllen. id, box, due etc. ergänzt das Script bzw. die App automatisch.

function getSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(COLUMNS);
  }
  return sheet;
}

function checkToken_(token) {
  return !TOKEN || token === TOKEN;
}

function jsonOutput_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  var token = (e && e.parameter && e.parameter.token) || '';
  if (!checkToken_(token)) return jsonOutput_({ error: 'unauthorized' });

  var sheet = getSheet_();
  var values = sheet.getDataRange().getValues();
  var headers = values[0];
  var tz = Session.getScriptTimeZone();
  var idColIndex = headers.indexOf('id');        // 0-basiert, für Zugriff auf row[]
  var frontColIndex = headers.indexOf('front');  // 0-basiert

  var cards = [];
  for (var r = 1; r < values.length; r++) {
    var row = values[r];
    if (!row[frontColIndex]) continue; // Zeile ohne Begriff = leer, überspringen

    if (!row[idColIndex]) {
      row[idColIndex] = Utilities.getUuid();
      sheet.getRange(r + 1, idColIndex + 1).setValue(row[idColIndex]); // fehlende ID direkt in der Tabelle nachtragen
    }

    var obj = {};
    headers.forEach(function (h, i) {
      var v = row[i];
      if (v instanceof Date) {
        v = (h === 'due') ? Utilities.formatDate(v, tz, 'yyyy-MM-dd') : v.getTime();
      }
      obj[h] = v;
    });
    cards.push(obj);
  }

  return jsonOutput_({ cards: cards });
}

function doPost(e) {
  var data;
  try {
    data = JSON.parse(e.postData.contents);
  } catch (err) {
    return jsonOutput_({ error: 'invalid-json' });
  }
  if (!checkToken_(data.token || '')) return jsonOutput_({ error: 'unauthorized' });

  var cards = Array.isArray(data.cards) ? data.cards : [];
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);
  try {
    var sheet = getSheet_();
    sheet.clearContents();
    sheet.appendRow(COLUMNS);
    var rows = cards.map(function (c) {
      return COLUMNS.map(function (col) { return (c[col] !== undefined && c[col] !== null) ? c[col] : ''; });
    });
    if (rows.length > 0) {
      sheet.getRange(2, 1, rows.length, COLUMNS.length).setValues(rows);
    }
  } finally {
    lock.releaseLock();
  }

  return jsonOutput_({ ok: true, count: cards.length });
}
