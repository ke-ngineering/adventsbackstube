# Adventsbackstube – Projektgedächtnis

> **Single Source of Truth.** Weitere Dokumente: [`TESTPROTOKOLL.md`](TESTPROTOKOLL.md) (Testrunden & Feedback), [`IDEEN.md`](IDEEN.md) (Ideen-Backlog).
> Wer (Mensch oder Claude) die Entwicklung fortsetzt, liest zuerst diese Datei.
> Nach jeder Arbeitssitzung: Status, Entscheidungen und Agenda hier aktualisieren.

Stand: 23.11.2026 (Prototyp v4)

## 1. Vision

Ein Adventskalender-Handyspiel als Geschenk. Die Spielerin mag Knobel-/„Daddel“-Spiele
(Flaschen-Sortierspiel, Garten-Spiel mit Klick-Reihenfolgen). Ziel: vom 1.–24. Dezember jeden Tag etwas Neues,
mit genug Inhalt für spürbar lange Spielsessions (ca. 20–30 Min neue Tagesinhalte + Endlos-Modus).

**Themenfelder** für Inhalte/Anspielungen: Backen & Kochen, Musik/Chor, Handarbeit, Radfahren; Rezepte aus München und Hamburg.

> **Datenschutz-Regel (D11):** Das Repository ist öffentlich. Keine Namen, keine persönlichen Daten,
> keine identifizierenden Details in Code, Doku oder Commits. Persönliche Inhalte werden nur verschlüsselt
> abgelegt (siehe Abschnitt 4).

## 2. Entscheidungen (Decision Log)

| # | Datum | Entscheidung | Begründung |
|---|-------|--------------|------------|
| D1 | 23.11. | Thema: **Adventsbackstube** | Passt zu Backen/Kochen, Rezepte als Belohnung möglich |
| D2 | 23.11. | **Web-App / PWA** statt nativer Android-App, Auslieferung per Link | Kein Play Store/APK, Updates während des Advents ohne Zutun der Spielerin |
| D3 | 23.11. | **Drei Mechaniken im Wechsel**: Gewürzregal (Sortieren), Glasur-Blech (Lights-Out-Knobel), Omas Rezeptbuch (Reihenfolge merken) | Abwechslung; Gewürzregal ≈ ihr Flaschenspiel, Rezeptbuch ≈ Garten-Reihenfolge |
| D4 | 23.11. | **Prozedurale Level** mit Lösbarkeitsprüfung, deterministisch per Seed | Genug Inhalt für 24 Tage ohne Handarbeit |
| D5 | 23.11. | **Rezepte als Sonder-Goodies**, Mischung München + Hamburg | Ihre Wunschmischung, Biografie-Bezug |
| D6 | 23.11. | **Stil: gemütlich-warm, verspielt** – Butterfliesen, Nussholz, Weihnachtsrot; Nachtmodus pflaumenblau; Schrift Fredoka | Backstube am Adventsabend, nicht altbacken |
| D7 | 23.11. | Persönliches **sparsam** (Name, 3–5 Nachrichten, opt. 1–2 eigene Rezepte, opt. Insider) | Aufwand gering halten |
| D8 | 23.11. | Spielstand in **localStorage** + geplanter „Spielstand sichern“-Code als Backup | Fortschritt bleibt auf ihrem Handy |
| D9 | 23.11. | Projekt lebt in **Git/GitHub**; dieses Dokument ist das Gedächtnis | Entwicklung chat-unabhängig fortsetzbar |
| D10 | 23.11. | Zutaten als farbige Schichten mit Textur (keine Emojis) | Lesbar, auch bei ähnlichen Farben unterscheidbar |
| D11 | 23.11. | Repo **öffentlich** (für kostenloses GitHub Pages), aber **strikt anonym**: keine Namen/persönlichen Daten in Code, Doku, Commits; Commit-Autor „Claude <noreply@anthropic.com>“ | Privatsphäre bei öffentlichem Repo |
| D13 | 23.11. | Gewürzregal deutlich schwerer (6→12 Zutaten, 5er-Gläser) + echte Umfüll-Animation | Feedback: zu wenige Flaschen, zu leicht, zu statisch |
| D14 | 23.11. | Umfüll-Animation **immer an** (ignoriert Systemeinstellung „Animationen reduzieren“); Versionsnummer in Fußzeile | Tester sah keine Animation; Animation ist Kern-Feedback des Spiels |
| D15 | 23.11. | **Geräusche** synthetisch per Web Audio (keine Audiodateien), Ton-Schalter, Einstellung gespeichert | Wunsch des Testers; keine Lizenzfragen, kleine Datei |
| D16 | 23.11. | **Melodie-Gläser**: jedes volle Glas spielt ein Stück eines gemeinfreien Adventslieds (Glockenspiel), Levelende = ganzes Lied als Posaunenchor | Eigene Idee statt Nachbau; Bezug Musik/Chor/Posaunenchor |
| D17 | 23.11. | **Angefangenes Level** wird gespeichert (`save.cur`) und beim Öffnen fortgesetzt | Wunsch: beim erneuten Öffnen weitermachen |
| D18 | 23.11. | Dokumentation erweitert: Testprotokoll + Ideen-Backlog | Alles projektrelevante im Repo, chat-unabhängig |
| D19 | 23.11. | Code in Module aufgeteilt (`js/core.js`, `regal.js`, `blech.js`, `buch.js`, `app.js`, `css/style.css`) | Drei Mechaniken in einer Datei unübersichtlich; Module gemeinsam testbar |
| D20 | 23.11. | **Backstube** als Startseite mit 3 Stationen; Spiel öffnet beim nächsten Start dort, wo sie aufgehört hat | Navigation zwischen Mechaniken; Grundlage für späteren Adventskalender |
| D21 | 23.11. | Glasur-Blech mit **Form-abhängigen Mustern** + exaktem Bestwert | Eigene Idee statt reinem Lights-Out |
| D22 | 23.11. | Rezeptbuch mit **Liedern als Folge**; Melodien-Sammlung erweitert: Morgen kommt der Weihnachtsmann, Jingle Bells, Deck the Halls (alle gemeinfrei) | Musik/Chor-Bezug; Wiedererkennen hilft beim Merken |
| D23 | 23.11. | Claude arbeitet **ausschließlich** im Repo `adventsbackstube` (Regel ganz oben in CLAUDE.md) | Weitere GitHub-Projekte des Auftraggebers schützen |
| D12 | 23.11. | Persönliche Inhalte (Name, Nachrichten) **verschlüsselt** im Repo; Schlüssel steht nur im Link-Teil nach `#`, den sie bekommt (wird nie an Server übertragen) | Personalisierung trotz öffentlichem Repo |

## 3. Spielkonzept

### Mechaniken
1. **Gewürzregal** – Zutaten liegen geschichtet in Gläsern (4 pro Glas). Antippen = Glas wählen, zweites Antippen = umfüllen.
   Umfüllen nur auf gleiche Zutat oder ins leere Glas. Ziel: jedes Glas sortenrein. ✅ Prototyp v2.
   Schwierigkeit (v2, nach Feedback „viel zu leicht“): Start mit 6 Zutaten (8 Gläser), steigt bis 12 Zutaten (14 Gläser) ab L25;
   ab L12 jedes 3. Level hohe Gläser (5 Schichten); Generator bevorzugt stark gemischte Level (kaum gleiche Nachbarschichten).
   Umfüll-Animation: Glas fliegt zum Ziel, kippt, Strahl fließt, Schichten wachsen. Testmodus: URL mit `#test` (alle Level springbar).
   Geplante Wendungen: festgefrorenes Glas (erst nach X Zügen frei), verdeckte Schichten, Zuglimit.
2. **Glasur-Blech** ✅ v4 – Raster aus Plätzchen; Antippen wechselt Plätzchen + Nachbarn (glasiert ↔ unglasiert). Ziel: alle glasiert.
   **Eigene Wendung:** Die Form bestimmt das Muster – Taler = Kreuz, Zimtstern = schräg, Spritzgebäck = waagerechte 5er-Reihe
   (Legende mit Mini-Schema). Level rückwärts erzeugt (immer lösbar); GF(2)-Löser liefert exakten Bestwert (3 Sterne) und Tipps
   (kosten je 1 Stern). Jeder Tipper spielt die nächste Note eines Lieds. Größe 4×4 → 7×7; Formen ab L4 (Stern), L10 (Spritzgebäck).
3. **Omas Rezeptbuch** ✅ v4 – Zutaten-Schalen spielen Töne vor, nachtippen; Folge wächst Zeile für Zeile bis zur Ziellänge (6 → 18).
   **Eigene Wendung:** Ungerade Level = echtes Adventslied (Schalen = Tonleiter, aufsteigend sortiert), gerade Level = zufällige Folge.
   Fehler wiederholen die Zeile (kein Game Over), kosten aber Sterne. „Nochmal hören“ jederzeit.

### Advents-Rahmen (geplant)
- Kalender-Startseite mit 24 Türchen; Türchen öffnet sich ab dem jeweiligen Datum (lokales Datum).
- Pro Tag 8–12 Level, Mechanik im Wechsel; Schwierigkeit steigt über den Advent.
- Sterne (3 = ohne Rückgängig) füllen sichtbar einen Plätzchenteller / die Backstube.
- Alle 3–4 Tage ein **Rezept-Goodie**; Nikolaus (6.12.) und 24.12. Spezial.
- Jede Woche eine neue Wendung in einer Mechanik.
- Endlos-Modus für alle freigeschalteten Mechaniken.
- Testmodus (z. B. `#test`) zum Durchklicken aller Tage vor dem 1.12.

### Rezept-Goodies (Entwurf, noch abzustimmen)
| Tag | Rezept | Bezug |
|-----|--------|-------|
| 3 | Vanillekipferl | Klassiker, bayerisch-österreichisch |
| 6 | Hamburger Braune Kuchen | Hamburg (Nikolaus-Spezial) |
| 10 | Elisenlebkuchen | Nürnberg/Bayern |
| 13 | Franzbrötchen | Hamburg |
| 17 | Auszogne (bayerisches Schmalzgebäck) | München/Bayern |
| 20 | Rote Grütze (Winterversion) | Norddeutschland |
| 24 | Rezept von dir / ihr gemeinsames | persönlich |

## 4. Persönliche Inhalte (zu sammeln)

Werden **nie im Klartext** ins Repo geschrieben. Ablauf: Auftraggeber nennt Inhalte im Chat → Claude verschlüsselt sie
(AES-GCM, Web Crypto) in `personal.enc.json` → Schlüssel nur im persönlichen Link `…/#k=<schlüssel>`.
Ohne Schlüssel zeigt das Spiel neutrale Standardtexte. Klartext und Schlüssel nirgends speichern außer beim Auftraggeber.

- [ ] Name / Spitzname für die Begrüßung
- [ ] 3–5 kurze Nachrichten + an welchen Tagen
- [ ] optional: 1–2 eigene Rezepte
- [ ] optional: Insider-Witz (z. B. als Zutat oder Plätzchenname)

## 5. Agenda / Roadmap

Ziel: **spielbar ab Di, 1.12.2026**, Link vorher an sie (z. B. am 1. Advent, 29.11.).

| Termin | Meilenstein | Status |
|--------|-------------|--------|
| 23.11. | Konzept, Stil, Repo, Prototyp Gewürzregal (v2: schwerer + Animation; v3: Klang, Melodie-Gläser, Fortsetzen), GitHub Pages live | ✅ |
| 23.11. | Mechanik 2 Glasur-Blech + Mechanik 3 Rezeptbuch, Backstube-Startseite (v4) | ✅ (vorgezogen) |
| 24.11. | Feedback v4; Kalender mit 24 Türchen & Datumssperre | ⏳ |
| 25.11. | Tagesplan, Wendungen, Rezeptseiten | ⏳ |
| 26.11. | Tagesplan 1–24 (Mechanik, Levelzahl, Wendungen, Goodies); Rezeptseiten | ⏳ |
| 27.11. | Persönliche Inhalte einbauen; Spielstand-Backup-Code; PWA-Manifest + Icon | ⏳ |
| 28.11. | Test auf echtem Handy, Feinschliff, Hosting (GitHub Pages) | ⏳ |
| 29.11. | Link verschicken (1. Advent) | ⏳ |
| Dez. | Optional: Inhalte nachliefern | – |

## 6. Technik
- `index.html` (Gerüst) + `css/style.css` + `js/core.js` (Spielstand, Zutaten, Klang, Melodien, Hilfen) + je ein Modul pro Mechanik
  (`regal.js`, `blech.js`, `buch.js`) + `js/app.js` (Backstube, Levelleiste, Gewinn-Dialog). Keine Abhängigkeiten außer Google Font Fredoka.
- Modul-Schnittstelle: `{id, title, sub, desc, start(level, resume, api), stop()}`; `api` = stage/controls/legend/status/getCur/saveCur/restart/win.
- Cache: Dateien mit `?v=N` einbinden und `VERSION` in core.js hochzählen.
- Spielstand: `localStorage`-Key `adventsbackstube.v1` → `{level, best, cur, sound, last, games:{blech:{level,best,cur}, buch:{…}}}`; Gewürzregal nutzt die obersten Felder (abwärtskompatibel), `last` = zuletzt geöffnete Station. Bleibt im Browser erhalten, solange Browserdaten nicht gelöscht werden / kein privater Modus.
- Klang: Web Audio, alles synthetisch (`Snd`-Modul). Melodien als `[MIDI-Note, Dauer in Achteln]` in `MELODIES`; nur gemeinfreie Lieder (derzeit: Stille Nacht, Gruber 1818).
- Level-Generator: Seeded RNG (mulberry32), Seed aus Levelnummer → jedes Level ist für sie immer gleich.
  DFS-Solver prüft Lösbarkeit (Knotenlimit 60k), sonst neuer Versuch; Notfall: Extraglas.
- Hosting-Optionen: GitHub Pages (bevorzugt, Link + „Zum Startbildschirm“) oder claude.ai-Artifact-Link (Vorschau).
- Tests: `python3 tools/test_generator.py` (alle Generatoren/Löser in Node), `tools/screenshots.py` (Playwright, 390 px).

## 7. Offene Fragen
- Prototyp v4 testen: Glasur-Blech (verständlich? Schwierigkeit?) und Rezeptbuch (Tempo? Lieder erkannt? Melodien korrekt?) → danach gemeinsam evaluieren, was das eigentliche Spiel braucht (Schwierigkeitskurve, Wendungen, Animation).
- Feedback zum Prototyp (Gefühl, Schwierigkeit, Optik)?
- Rezeptauswahl bestätigen / eigene Rezepte?
- Soll der Link schon am 29.11. (1. Advent) kommen, mit einem Vorab-Türchen?
