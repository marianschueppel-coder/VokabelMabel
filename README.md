# Vokabeln – Karteikasten-App

Eine eigenständige Vokabel-Lern-App (Leitner-System) zum Installieren auf dem iPhone-Homescreen. Läuft komplett im Browser, keine Cloud, keine Anmeldung – deine Vokabeln liegen lokal auf deinem Gerät.

## Enthaltene Dateien

```
vokabeln-app/
├── index.html          ← die App selbst
├── manifest.json        ← macht die App "installierbar"
├── service-worker.js    ← Offline-Unterstützung
├── icons/
│   ├── icon-192.png
│   ├── icon-512.png
│   ├── icon-512-maskable.png
│   ├── icon-180.png      ← Homescreen-Icon für iOS
│   └── favicon-32.png
└── google-sheets-backend/
    └── Code.gs           ← optional: Code für den Google-Sheets-Abgleich (wird NICHT hochgeladen,
                              sondern in Apps Script eingefügt, siehe unten)
```

Diese Struktur muss beim Hochladen erhalten bleiben (der `icons`-Ordner muss ein Unterordner bleiben). Der Ordner `google-sheets-backend` ist nur Referenzmaterial für Schritt "Google Sheets Backup" unten – der landet nicht auf GitHub Pages, sondern wird in Google Apps Script eingefügt.

## In 5 Minuten auf GitHub Pages veröffentlichen

1. **Repository anlegen**
   Auf [github.com](https://github.com) einloggen (kostenloser Account reicht) → oben rechts **+** → **New repository**. Name z. B. `vokabeln-app`, Sichtbarkeit **Public**, dann **Create repository**.

2. **Dateien hochladen**
   Im neuen Repository auf **Add file** → **Upload files** klicken. Zieh den gesamten Inhalt dieses Ordners hinein (inklusive des `icons`-Unterordners – moderne Browser erlauben das Ziehen ganzer Ordner in das Upload-Feld). Unten **Commit changes** klicken.

3. **GitHub Pages aktivieren**
   Im Repository auf **Settings** → links **Pages**. Unter **Build and deployment** → **Source**: `Deploy from a branch` wählen. Bei **Branch**: `main` und Ordner `/ (root)` auswählen → **Save**.

4. **Kurz warten**
   Nach ca. 1–2 Minuten erscheint oben auf der Pages-Einstellungsseite ein grüner Hinweis mit der Live-URL, z. B.:
   `https://<dein-benutzername>.github.io/vokabeln-app/`

5. **Auf dem iPhone installieren**
   Diese URL auf dem iPhone in **Safari** öffnen (wichtig: Safari, nicht Chrome – nur Safari kann Webapps zum Homescreen hinzufügen) → **Teilen**-Symbol → **Zum Home-Bildschirm** → **Hinzufügen**. Die App startet danach im eigenen Fenster ohne Browserleiste, mit eigenem Icon.

## Vokabeln importieren

Im Reiter **Import** kannst du eine Liste einfügen, die du z. B. aus Google Notizen kopiert hast – eine Vokabel pro Zeile, z. B.:
```
Hund - dog
Katze: cat
Brot, bread
```

## Cloud-Synchronisierung (optional)

Da GitHub Pages nur Dateien ausliefert (kein eigener Server, keine Datenbank), gibt es keine "Live"-Verbindung – aber die App kann sich auf Knopfdruck eine Liste von einer öffentlichen Adresse holen. Im Reiter **Import** gibt es dafür ein Adressfeld + **Jetzt synchronisieren**. Neue Zeilen werden ergänzt, geänderte Übersetzungen aktualisiert, dein Lernfortschritt bleibt erhalten. Zwei Wege, so eine Adresse zu bekommen:

**Variante A – Textdatei im GitHub-Repo (empfohlen, zuverlässig)**
1. Im selben Repository **Add file** → **Create new file** → Name z. B. `vokabeln.txt`.
2. Inhalt: eine Vokabel pro Zeile, gleiches Format wie beim manuellen Import (`Hund - dog`).
3. Datei speichern (**Commit new file**), dann öffnen und oben rechts auf **Raw** klicken.
4. Die Adresse aus der Browserzeile kopieren (beginnt mit `raw.githubusercontent.com`) und in der App einfügen.
5. Wenn du die Liste änderst: Datei auf GitHub bearbeiten (auch über die GitHub-App fürs iPhone möglich), speichern, in der App auf **Jetzt synchronisieren** tippen.

**Variante B – Google Sheet als CSV**
1. Google Sheet mit zwei Spalten anlegen: Spalte A = Begriff, Spalte B = Übersetzung, **ohne Kopfzeile**.
2. **Datei → Freigeben → Im Web veröffentlichen**, Format **CSV**, veröffentlichen.
3. Den erzeugten Link kopieren und in der App eintragen.
4. Kann in Einzelfällen an Googles Cross-Origin-Beschränkungen scheitern (siehe Fehlermeldung in der App) – funktioniert dann meist Variante A zuverlässiger.

## Backup

Da die Daten nur lokal in Safari gespeichert werden (nicht in einer Cloud), lohnt sich ein gelegentliches Backup: **Übersicht** → **Exportieren** lädt eine JSON-Sicherung herunter, **Importieren** spielt sie auf einem anderen Gerät oder nach einem Safari-Reset wieder ein.

## Google Sheets Backup (Vokabeln + Lernfortschritt in einer eigenen Tabelle)

Anders als die Cloud-Synchronisierung oben liest diese Variante nicht nur Vokabeln, sondern **speichert auch deinen Kastenstand** – deine Tabelle wird zur vollständigen Cloud-Sicherung, von der aus du auch auf einem zweiten Gerät weiterlernen kannst. Dafür braucht es ein kleines, kostenloses Google Apps Script (kein separates Hosting, läuft direkt in deinem Google-Konto).

1. Neues Google Sheet anlegen.
2. **Erweiterungen → Apps Script** öffnen.
3. Den Inhalt von [`google-sheets-backend/Code.gs`](google-sheets-backend/Code.gs) hineinkopieren (vorhandenen Beispielcode ersetzen).
4. In der ersten Zeile der Variable `TOKEN` einen eigenen geheimen Code eintragen (frei erfunden, z. B. `muenster-vok-7x2`) – schützt die Web-App-Adresse ein Stück weit, ist aber kein echtes Login. Die URL nicht öffentlich teilen.
5. Oben rechts **Bereitstellen → Neue Bereitstellung → Web-App**. „Ausführen als": Ich. „Zugriff": Jeder. Bereitstellen, Berechtigungen bestätigen (Google warnt bei eigenen Skripten routinemäßig – bei „Erweitert" → „Zu … wechseln (unsicher)" bestätigen, es ist dein eigenes Skript).
6. Die angezeigte URL (endet auf `/exec`) kopieren.
7. In der App: **Übersicht → Google Sheets Backup** → URL und den gleichen Code eintragen.
8. **In Cloud sichern** überträgt den aktuellen Stand in dein Sheet (überschreibt dort alles), **Aus Cloud laden** holt den Stand aus dem Sheet zurück in die App (überschreibt lokal alles – mit Sicherheitsabfrage).

Änderst du später den Code in Apps Script, muss über **Bereitstellen → Bereitstellungen verwalten → Stift-Symbol → Neue Version** erneut bereitgestellt werden, sonst bleibt die alte Version aktiv.


## Updates später einspielen

Wenn du später Änderungen an der App möchtest: Datei(en) im Repository ersetzen (**Add file** → **Upload files**, gleicher Dateiname überschreibt die alte Version) – GitHub Pages aktualisiert die Live-Version automatisch nach kurzer Zeit. Die bereits auf dem iPhone gespeicherten Vokabeln bleiben davon unberührt, da sie separat im Browser liegen.
