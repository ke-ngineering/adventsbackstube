# Notenwerkzeuge – Melodien und Chorsätze aus dem Liederbuch ablesen

Quelle (gemeinfrei, nur lesend erlaubt, siehe CLAUDE.md und D42):
`git clone --depth 1 https://github.com/musikpirat/singen-im-advent.github.io` → `Singen_im_Advent_-_Auflage_3.pdf`.
Das PDF **nicht** ins Repo kopieren.

## Ablauf
1. Seite in hoher Auflösung rendern: `pdftoppm -f 43 -l 43 -r 300 -png Singen_im_Advent_-_Auflage_3.pdf hi`
   (gedruckte Seitenzahl = PDF-Seite; Inhaltsverzeichnis: `pdftotext -layout …`).
2. Hilfslinien mit Tonnamen über die Notensysteme legen und Ausschnitte erzeugen:
   `python3 tools/noten/raster.py hi-43.png tbtbtb tz`
   (Schlüssel je Notensystem von oben: `t` = Violin-, `b` = Bassschlüssel). Ergebnis: `tz00.png`, `tz01.png` … je Zeile links/rechts.
   Rote Punktlinien = Notenlinien, grüne = Zwischenräume; Namen ohne Vorzeichen → Tonart beachten.
3. Optional Tonhöhen automatisch messen (findet nicht alle Köpfe, gut zur Kontrolle):
   `python3 tools/noten/notenkoepfe.py hi-43.png tbtbtb`
4. Noten als `[MIDI, Dauer in Achteln]` in `js/core.js` eintragen (mehrstimmig: `voices:[S, A, T, B]`).
5. `python3 tools/test_generator.py` prüft: alle Stimmen gleich lang, Tonumfang, Stimmkreuzungen (als Hinweis).
6. Auf der Prüfseite `#lieder` anhören („▶ 4-stimmig“).

Linienabstand bei 300 dpi: 18 px (Halbton-Schritt der Notenposition = 9 px).
