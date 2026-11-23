# Adventsbackstube – Projektgedächtnis

> **Single Source of Truth.** Wer (Mensch oder Claude) die Entwicklung fortsetzt, liest zuerst diese Datei.
> Nach jeder Arbeitssitzung: Status, Entscheidungen und Agenda hier aktualisieren.

Stand: 23.11.2026

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
| D12 | 23.11. | Persönliche Inhalte (Name, Nachrichten) **verschlüsselt** im Repo; Schlüssel steht nur im Link-Teil nach `#`, den sie bekommt (wird nie an Server übertragen) | Personalisierung trotz öffentlichem Repo |

## 3. Spielkonzept

### Mechaniken
1. **Gewürzregal** – Zutaten liegen geschichtet in Gläsern (4 pro Glas). Antippen = Glas wählen, zweites Antippen = umfüllen.
   Umfüllen nur auf gleiche Zutat oder ins leere Glas. Ziel: jedes Glas sortenrein. ✅ Prototyp fertig.
   Schwierigkeit: 3 Zutaten + 2 leere Gläser, alle 3 Level +1 Zutat bis 9.
   Geplante Wendungen: festgefrorenes Glas (erst nach X Zügen frei), verdeckte Schichten, Zuglimit.
2. **Glasur-Blech** – Raster aus Plätzchen; Antippen glasiert/entglasiert das Plätzchen und seine 4 Nachbarn.
   Ziel: alle glasiert. Level werden durch zufällige Klicks auf ein fertiges Blech erzeugt → immer lösbar. ⏳
3. **Omas Rezeptbuch** – Zutaten leuchten nacheinander auf, dann nachtippen (Simon-Prinzip), Kette wird länger. ⏳

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
| 23.11. | Konzept, Stil, Repo, Prototyp Gewürzregal | ✅ |
| 24.11. | Feedback zum Prototyp; Mechanik 2 Glasur-Blech | ⏳ |
| 25.11. | Mechanik 3 Rezeptbuch; Kalender-Startseite mit Türchen & Datumssperre | ⏳ |
| 26.11. | Tagesplan 1–24 (Mechanik, Levelzahl, Wendungen, Goodies); Rezeptseiten | ⏳ |
| 27.11. | Persönliche Inhalte einbauen; Spielstand-Backup-Code; PWA-Manifest + Icon | ⏳ |
| 28.11. | Test auf echtem Handy, Feinschliff, Hosting (GitHub Pages) | ⏳ |
| 29.11. | Link verschicken (1. Advent) | ⏳ |
| Dez. | Optional: Inhalte nachliefern | – |

## 6. Technik
- Eine Seite `index.html` (HTML/CSS/JS, keine Abhängigkeiten außer Google Font Fredoka). Später ggf. Aufteilung in Dateien.
- Spielstand: `localStorage`-Key `adventsbackstube.v1` → `{level, best:{level:sterne}}`.
- Level-Generator: Seeded RNG (mulberry32), Seed aus Levelnummer → jedes Level ist für sie immer gleich.
  DFS-Solver prüft Lösbarkeit (Knotenlimit 60k), sonst neuer Versuch; Notfall: Extraglas.
- Hosting-Optionen: GitHub Pages (bevorzugt, Link + „Zum Startbildschirm“) oder claude.ai-Artifact-Link (Vorschau).
- Tests: `tools/` (folgt) – Generator in Node prüfen, Screenshots mit Playwright (390×800).

## 7. Offene Fragen
- Feedback zum Prototyp (Gefühl, Schwierigkeit, Optik)?
- Rezeptauswahl bestätigen / eigene Rezepte?
- Soll der Link schon am 29.11. (1. Advent) kommen, mit einem Vorab-Türchen?
