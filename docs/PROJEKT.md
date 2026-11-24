# Adventsbackstube – Projektgedächtnis

> **Single Source of Truth.** Weitere Dokumente: [`TESTPROTOKOLL.md`](TESTPROTOKOLL.md) (Testrunden & Feedback), [`IDEEN.md`](IDEEN.md) (Ideen-Backlog).
> Wer (Mensch oder Claude) die Entwicklung fortsetzt, liest zuerst diese Datei.
> Nach jeder Arbeitssitzung: Status, Entscheidungen und Agenda hier aktualisieren.

Stand: 24.11.2026 (Prototyp v16)

## 1. Vision

Ein Adventskalender-Handyspiel als Geschenk. Die Spielerin mag Knobel-/„Daddel“-Spiele
(Flaschen-Sortierspiel, Garten-Spiel mit Klick-Reihenfolgen). Ziel: vom 1.–24. Dezember jeden Tag etwas Neues,
mit genug Inhalt für spürbar lange Spielsessions (ca. 20–30 Min neue Tagesinhalte + Endlos-Modus).

**Leitlinie Schwierigkeit (D28):** Die Spielerin löst gern Rätsel – knifflig ist ausdrücklich erwünscht, aber jedes Rätsel muss
**verständlich, machbar und lösbar** sein. Kein Rätsel, das nur mit Mathematik oder Auswendiglernen geht.

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
| D24 | 23.11. | Glasur-Blech verständlicher: Anleitung, Formen-Vorstellung, Druck-Vorschau, 3×3-Einstieg | Tester: „lustig, aber ich versteh es nicht“ |
| D25 | 23.11. | `main` geschützt: Änderungen nur per **Pull Request**, Auftraggeber merged | Kontrolle darüber, was live geht |
| D26 | 23.11. | Glasur-Blech **behalten** + Strategiekurs „Lösungsweg“ + interaktive „Lernhilfe“ | Tester findet es interessant, aber „wie Rubik's Cube“ – Vorgehen soll erklärt werden |
| D27 | 23.11. | **Spritzbeutel** als 4. Station (Ein-Strich-Rätsel: Spritzgebäck in einem Zug) | Idee aus der Diskussion; sofort verständlich, Gegenpol zum mathematischen Blech |
| D28 | 24.11. | Leitlinie: knifflig ja, aber **verständlich, machbar, lösbar** | Profil der Spielerin (mag Rätsel) |
| D29 | 24.11. | Glasur-Blech: Formen reichen **genau eins nach oben**, Level nur aus Tippern ab Reihe 2 → **Jagd löst jedes Blech**; Rest-Trick entfällt; Kurs neu („Warum das immer klappt“) | Tester: ohne Hilfe kein Vorgehen erkennbar, Rest-Trick undurchschaubar |
| D30 | 24.11. | Spritzbeutel schwerer: 4×4 → 8×8, Start-Stern nur L1–2 | Tester: „lustig und eher einfach“ |
| D31 | 24.11. | **Rest-Trick bleibt** und wird gelehrt: Lehrplan klein → groß (2×2 …5×5), Fingerabdruck-Labor, Rezeptkarte, Kurs mit „Warum“; ersetzt D29 (Rest-Trick abschaffen) | Tester: Rest-Trick behalten, aber durchschaubar machen, „dass man das Denken lernen kann“; Recherche: übliche Lernmethode = Jagd + Tabelle, Tabelle durch Beobachten auf leerem Brett |
| D32 | 24.11. | Rest-Trick-Begriffe erklären (A/B/C, Labor), Schrittliste in der Lernhilfe, Lektionen 3 und 6 als geführte Übungslevel | Tester: „Was ist das Labor? Was ist A?“ |
| D33 | 24.11. | Labor-Vorführung langsam mit Erklärung je Schritt | Tester: „etwas langsamer vorführen, damit man mitgehen kann“ |
| D34 | 24.11. | Optionale Bonus-Lerneinheit „Warum der Rest-Trick funktioniert“ (Folien-Erklärung), angeboten ab Level 10 | Tester: „wieso das funktioniert … als kleine Lerneinheit zwischendurch, optional“ |
| D35 | 24.11. | Ton: iPhone-Stummschalter umgehen (audioSession), Testklang beim Einschalten | Tester hört keinen Ton mehr; Engine im Test intakt → vermutlich Geräteeinstellung |
| D36 | 24.11. | Zutaten fallen realistisch je nach Art (fließen/rieseln/stäuben/purzeln) mit passenden Geräuschen | Tester: „bei flüssigen fließen, bei anderen purzeln … Mohn würde rieseln“ |
| D37 | 24.11. | Ton-Fehlersuche: WebKit-Zustand `interrupted` behandeln, Freischalt-Puffer, Ton-Testseite `#tontest` | Kein Ton in Safari (Mac) und Chrome (iOS) – beide WebKit |
| D38 | 24.11. | „Gewürzregal“ heißt jetzt **„Vorratsregal“** (interne id bleibt `regal`) | Tester: Es sind nicht nur Gewürze (Honig, Kirschen …) |
| D39 | 24.11. | Keine überlappenden Melodien: letztes volles Glas spielt kein Teilstück, Gewinn-Melodie startet nach kurzer Pause und stoppt laufende Klänge | Tester: Teilstück + ganze Melodie überlagern sich |
| D40 | 24.11. | iPhone-Ton-Einstellung (audioSession) nur noch auf iPhone/iPad setzen, nicht auf dem Mac | Ton auf iOS jetzt ok, auf Mac-Safari weiterhin still – Ausschluss einer möglichen Ursache |
| D41 | 24.11. | Liedersammlung auf 10 gemeinfreie Lieder erweitert + Lieder-Prüfseite `#lieder` | Tester: „ruhig eine große Auswahl“, z. B. We Three Kings; Spielerin singt im Chor → Noten müssen stimmen |
| D42 | 24.11. | Ausnahme von der Ein-Repo-Regel: `musikpirat/singen-im-advent.github.io` **nur lesend** als Notenquelle | Vom Auftraggeber ausdrücklich erlaubt; gemeinfreies Liederbuch, frei verbreitbar |
| D43 | 24.11. | 23 Lieder, 19 notengetreu aus dem Liederbuch; Liederkiste.com NICHT als Quelle (Noten nur für private Zwecke, keine Veröffentlichung) | Genauigkeit für eine Chorsängerin; Lizenz sauber |
| D44 | 24.11. | Mehrstimmige Sätze aus dem Liederbuch als Bläsersatz am Levelende; zuerst Tochter Zion, die übrigen 4 folgen mit derselben Methode | Wunsch „gerne mehrstimmig“; Posaunenchor-Bezug; Genauigkeit vor Menge |
| D45 | 24.11. | Midkar.com-MIDIs NICHT verwendet (Download blockiert; Sequenzen/Arrangements ohne Nutzungsrechte, viele moderne geschützte Titel); gemeinfreie Titel daraus als „für später“ notiert | Rechte & Technik |
| D46 | 24.11. | Adventskalender als Startseite; Tagesmenü aus Stations-Aufgaben; Lied des Tages; Rezept-Tage 3/6/10/13/17/20/24; Backstube bleibt zum freien Spielen | Vorschlag mit Standardwerten umgesetzt (Fragen zu Tagesmenü/Rezepttagen offen, leicht änderbar) |
| D47 | 24.11. | Fremde Arrangements (z. B. aus MIDI-Dateien) nie übernehmen; für gemeinfreie Melodien ohne freien Satz schreibt Claude **eigene** vierstimmige Sätze | Rechte; Wunsch nach 4-stimmigem We Three Kings |
| D48 | 24.11. | 6 Rezepte geschrieben (eigene Texte, mit Experimentier-Idee und Sicherheitshinweis beim Frittieren); Rezept zum 24.12. bleibt offen | Auftraggeber will über den 24. noch nachdenken |
| D49 | 24.11. | Ton-Freischaltung nur bei mousedown/click/touchend/keydown (nicht pointerup); blockierter AudioContext wird beim nächsten Antippen neu angelegt | Kein Ton in Safari (Mac) mit v15/16: pointerup zählt dort bei Maus/Trackpad nicht als Nutzeraktion |
| D50 | 24.11. | **Sicherungscode** für den Spielstand: `ABS1-<base64url(JSON)>-<Prüfsumme>`, Kopieren/Zurückholen im Kalender („Spielstand sichern“), Zurückholen mit Bestätigung durch zweites Tippen | Fortschritt liegt nur im Browser; iOS-Startbildschirm-Apps haben eigenen Speicher; Handywechsel. Speicherformat selbst unverändert (CLAUDE.md Regel 9) |
| D51 | 24.11. | **App-Symbol + Manifest** (Lebkuchenstern mit Zuckerguss auf Weihnachtsrot, `icons/`, `manifest.webmanifest`), Anleitung „Als App aufs Handy“ im Kalender. **Kein Service Worker** | Startbildschirm-App ohne Browserleiste; ein Service Worker würde Updates im Advent verzögern (alte Version aus dem Cache) |
| D12 | 23.11. | Persönliche Inhalte (Name, Nachrichten) **verschlüsselt** im Repo; Schlüssel steht nur im Link-Teil nach `#`, den sie bekommt (wird nie an Server übertragen) | Personalisierung trotz öffentlichem Repo |

## 3. Spielkonzept

### Mechaniken
1. **Vorratsregal** (bis v10 „Gewürzregal“, D38) – Zutaten liegen geschichtet in Gläsern (4 pro Glas). Antippen = Glas wählen, zweites Antippen = umfüllen.
   Umfüllen nur auf gleiche Zutat oder ins leere Glas. Ziel: jedes Glas sortenrein. ✅ Prototyp v2.
   Schwierigkeit (v2, nach Feedback „viel zu leicht“): Start mit 6 Zutaten (8 Gläser), steigt bis 12 Zutaten (14 Gläser) ab L25;
   ab L12 jedes 3. Level hohe Gläser (5 Schichten); Generator bevorzugt stark gemischte Level (kaum gleiche Nachbarschichten).
   Umfüll-Animation: Glas fliegt zum Ziel, kippt, Schichten wachsen. v10: **je nach Zutat** (`ING[].kind`): Honig fließt als Strahl (Gluckern), Zucker/Mohn/Lavendel rieseln als Körnchen (Rieseln), Kakao/Zimt stäuben (leises Stäuben), Kirschen/Mandeln/Pistazien/Orangeat/Rosinen/Marzipan purzeln als Stückchen mit Drehung und Hüpfer (Plopp-Geräusche). Testmodus: URL mit `#test` (alle Level springbar).
   Geplante Wendungen: festgefrorenes Glas (erst nach X Zügen frei), verdeckte Schichten, Zuglimit.
2. **Glasur-Blech** ✅ v4 – Raster aus Plätzchen; Antippen wechselt Plätzchen + Nachbarn (glasiert ↔ unglasiert). Ziel: alle glasiert.
   **Eigene Wendung:** Die Form bestimmt das Muster – Taler = Kreuz, Zimtstern = schräg, Spritzgebäck = waagerechte 5er-Reihe
   (Legende mit Mini-Schema). Level rückwärts erzeugt (immer lösbar); GF(2)-Löser liefert exakten Bestwert (3 Sterne) und Tipps
   (kosten je 1 Stern). Jeder Tipper spielt die nächste Note eines Lieds. Größe 3×3 (L1–2, 1–2 Züge) → 7×7; Formen ab L6 (Stern), L12 (Spritzgebäck).
   **Verständlichkeit (v5):** Anleitung beim ersten Öffnen + Knopf „Wie geht das?“, neue Formen werden beim ersten Auftreten vorgestellt,
   Vorschau beim Drücken (betroffene Plätzchen rot umrandet, Ausführen erst beim Loslassen), Legende in Worten.
   **Lösungsweg & Lernhilfe (v6):** Knopf „Lösungsweg“ = 5-seitiger Strategiekurs (Grundregeln, Jagd-Methode mit Vorher/Nachher-Bild,
   Sterne & Spritzgebäck, Rest-Trick, Lernhilfe). Knopf „Lernhilfe“ = Spiel denkt mit: markiert das Ziel (rot gestrichelt) und den
   Vorschlag (gold) und begründet ihn. Mit Lernhilfe höchstens 2 Sterne.
   **v8 – Lehrplan mit Rest-Trick (D31, ersetzt D29):** Formen reichen genau eins nach oben (Taler = Kreuz, Zimtstern = oben +
   zwei schräg unten, Spritzgebäck = oben + 2 links + 2 rechts), Bleche sind rechteckig (R×C). Lehrplan in `PLAN` (blech.js):
   L1–2 ausprobieren (2×2, 2×3) · L3–5 Lektion 1 Jagd (3×3, 4×3, 4×4) · L6–11 Lektion 2 Rest-Trick: 2×2 (Abdruck = Feld darunter)
   → 4×2 → 4×3 (Abdrücke spiegelverkehrt) → 3×3 (Abdrücke kombinieren, erzwungen) → 5×4 → klassisches 5×5 · L12–16 Zimtstern und
   Spritzgebäck einführen (erst Jagd, dann Rest) · ab L17 „Meisterbleche“ 6×6/7×7.
   **Fingerabdruck-Labor:** frisch glasiertes Blech, oben tippen, das Spiel jagt animiert → Abdruck wird auf der **Rezeptkarte**
   gespeichert (pro Blech-Typ = Größe + Formen; `save.games.blech.cards`). Mehrere oben → Überlagerung sichtbar.
   **Rezeptkarte** unter dem Blech (Rest-Level), zeigt auch „Jetzt unten übrig“. **Lernhilfe**: Jagd → direkt darunter; Rest →
   passende obere Plätzchen (kleinste Abdruck-Kombination) + Begründung. **Kurs** 7 Seiten (Grundregeln, Jagd, Und unten?,
   Fingerabdrücke, Überlagerung, So geht's + Warum + Profi-Tipp, Lernhilfe); Lektionen öffnen sich automatisch in L3 und L6.
   Ziel (3 Sterne) = Zugzahl Jagd + Rest-Trick + Jagd; „kürzer geht es nicht“ = mathematisches Minimum (Löser).
   Nicht geeignet für Rest-Lektionen (nie ein Rest): 3×2, 4×4, 5×3 (nur Taler).
   **v9 – Begriffe klarer (D32):** Buchstaben A, B, C … deutlich (rote Schildchen) über der obersten Reihe ab Level 6;
   Knopf heißt „Abdruck-Labor“; Lernhilfe zeigt beim Rest-Trick die 4 Schritte mit aktuellem Schritt, erklärt A/B/C, „Warum“,
   und hat einen Knopf „Im Labor ausprobieren“. Lektions-Level 3 und 6 = **Übungslevel**: Lernhilfe automatisch an, ohne Sternabzug.
   **v10 (D33, D34):** Labor jagt **langsam zum Mitgehen** (~1,9 s pro Schritt, Ziel rot + Tipp gold markiert, Text je Schritt;
   Knopf „Schneller“ während der Vorführung). **Bonus-Lerneinheit „Warum es funktioniert“** (optional, 5 Seiten, Folien-Bild:
   Überlagerung, Tipp = Folie, Jagd arbeitet auf jeder Folie getrennt, Rest + Abdruck = nichts, Jagd räumt oben immer auf);
   wird einmalig ab Level 10 angeboten („Später“ möglich) und ist im Kurs auf Seite 6 über „Bonus: Warum?“ erreichbar.
3. **Omas Rezeptbuch** ✅ v4 – Zutaten-Schalen spielen Töne vor, nachtippen; Folge wächst Zeile für Zeile bis zur Ziellänge (6 → 18).
   **Eigene Wendung:** Ungerade Level = echtes Adventslied (Schalen = Tonleiter, aufsteigend sortiert), gerade Level = zufällige Folge.
   Fehler wiederholen die Zeile (kein Game Over), kosten aber Sterne. „Nochmal hören“ jederzeit.
4. **Spritzbeutel** ✅ v6 – Mit dem Finger eine Teigspur durch alle Punkte auf dem Backpapier ziehen: nur waagerecht/senkrecht, jeden
   Punkt genau einmal; Lücken im Papier werden übersprungen. Zurückziehen / Antippen eines Spurpunkts nimmt zurück. Jeder neue Punkt
   spielt die nächste Note des Lieds. Am Ende wird das Gebäck „gebacken“ (goldbraun) und die Enden in Schokolade getaucht.
   Level aus zufälligem Weg (Warnsdorff-Heuristik) → immer lösbar; v7 schwerer (D30): 4×4 → 8×8, 8–30 % Lücken; Start-Stern nur L1–2.
   Tipp zeigt gestrichelt einen möglichen Anfang (kostet einen Stern).

### Advents-Rahmen (v15 umgesetzt: `js/kalender.js`)
- ✅ **Startseite = Adventskalender** mit 24 Türchen (durcheinander angeordnet), Türchen öffnet ab dem jeweiligen Dezembertag (lokales Datum), Verpasstes nachholbar, im Testmodus alle offen. Im November Hinweis „Noch X Tage“ + Link zur Backstube.
- ✅ **Tagesmenü** je Tag 2–4 Aufgaben „Station: N Level“ (Plan in `Kalender.PLAN`); Level zählen, wenn die Station aus dem Türchen gestartet wurde; Gewinn-Dialog meldet Fortschritt, Knopf „Zum Türchen N“.
- ✅ **Lied des Tages** (`SONG_DAYS`, passend zum Datum: 1. Macht hoch die Tür, 6. Lasst uns froh und munter sein, 24. Stille Nacht), erklingt beim ersten Öffnen, „♪ Lied anhören“ (vierstimmig, wenn vorhanden).
- ✅ **Belohnung** nach geschafftem Türchen: Stern im Kalender; Rezept an Tag 3, 6, 10, 13, 17, 20, 24, Willkommen an Tag 1.
- ✅ **Rezepte (v16, `js/rezepte.js`):** 3 Vanillekipferl · 6 Hamburger Braune Kuchen · 10 Elisenlebkuchen · 13 Franzbrötchen · 17 Auszogne · 20 Rote Grütze (Winter) · 24 noch offen (gemeinsam festlegen, Platzhalter). Je Rezept: Menge, Zeit, Herkunft, Zutaten, Schritte, Backtipp, **Experimentier-Idee**; „Rezept kopieren“; Sammlung „Meine Rezepte“ im Kalender (nur freigeschaltete).
- Spielstand: `save.cal = {active, days:{Tag:{opened, done:{station:n}, finished}}}`.

**Ursprüngliche Planung:**
- Kalender-Startseite mit 24 Türchen; Türchen öffnet sich ab dem jeweiligen Datum (lokales Datum).
- Pro Tag 8–12 Level, Mechanik im Wechsel; Schwierigkeit steigt über den Advent.
- Sterne (3 = ohne Rückgängig) füllen sichtbar einen Plätzchenteller / die Backstube.
- Alle 3–4 Tage ein **Rezept-Goodie**; Nikolaus (6.12.) und 24.12. Spezial.
- Jede Woche eine neue Wendung in einer Mechanik.
- Endlos-Modus für alle freigeschalteten Mechaniken.
- Testmodus (z. B. `#test`) zum Durchklicken aller Tage vor dem 1.12.

### Rezept-Goodies (v16 umgesetzt, Tag 17 = Auszogne statt Spitzbuben)
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
| 23.11. | v5/v6: Glasur-Blech verständlich (Anleitung, Kurs, Lernhilfe), 4. Station Spritzbeutel | ✅ |
| 24.11. | v7: Spritzbeutel schwerer · v8: Glasur-Blech mit Lehrplan, Labor, Rezeptkarte | ✅ |
| 24.11. | Kalender mit 24 Türchen & Datumssperre (v15) | ✅ |
| 25.11. | Tagesplan, Wendungen, Rezeptseiten | ⏳ |
| 26.11. | Tagesplan 1–24 (Mechanik, Levelzahl, Wendungen, Goodies); Rezeptseiten | ⏳ |
| 27.11. | Persönliche Inhalte einbauen ⏳; Spielstand-Backup-Code ✅ (v17); PWA-Manifest + Icon ✅ (v17) | ⏳ |
| 28.11. | Test auf echtem Handy, Feinschliff, Hosting (GitHub Pages) | ⏳ |
| 29.11. | Link verschicken (1. Advent) | ⏳ |
| Dez. | Optional: Inhalte nachliefern | – |

## 6. Technik
- `index.html` (Gerüst) + `css/style.css` + `js/core.js` (Spielstand, Zutaten, Klang, Melodien, Hilfen) + je ein Modul pro Mechanik
  (`regal.js`, `blech.js`, `spritz.js`, `buch.js`) + `js/app.js` (Backstube, Levelleiste, Gewinn-Dialog). Keine Abhängigkeiten außer Google Font Fredoka.
- Modul-Schnittstelle: `{id, title, sub, desc, start(level, resume, api), stop()}`; `api` = stage/controls/legend/status/getCur/saveCur/restart/win.
- Cache: Dateien mit `?v=N` einbinden und `VERSION` in core.js hochzählen.
- Spielstand: `localStorage`-Key `adventsbackstube.v1` → `{level, best, cur, sound, last, games:{blech:{level,best,cur}, buch:{…}}}`; Vorratsregal (`regal`) nutzt die obersten Felder (abwärtskompatibel), `last` = zuletzt geöffnete Station. Bleibt im Browser erhalten, solange Browserdaten nicht gelöscht werden / kein privater Modus.
- Klang: Web Audio, alles synthetisch (`Snd`-Modul). iPhone: `navigator.audioSession.type = 'playback'`, damit der Stummschalter Web Audio nicht stummschaltet (Safari 16.4+). Einschalten des Tons spielt einen Testklang. WebKit-Fix: Ton wird bei jedem Zustand ≠ `running` (auch `interrupted`) fortgesetzt, Freischalten mit stillem Puffer beim ersten Antippen, Fortsetzen nach Tab-Wechsel. **Ton-Test:** Seite mit `#tontest` öffnen → Diagnose + 3 Testtöne (Spiel-Klang, einfacher Ton, Audio-Datei). Melodien als `[MIDI-Note, Dauer in Achteln]` in `MELODIES`; nur gemeinfreie Lieder. **Liedersammlung (v13, 23 Lieder):** 19 davon notengetreu aus dem gemeinfreien Liederbuch
  „Singen im Advent“ (PDF aus `musikpirat/singen-im-advent.github.io`, Noten von Claude aus den Notenbildern abgelesen, `src`):
  Stille Nacht, Alle Jahre wieder, O Tannenbaum, Kling Glöckchen, Lasst uns froh und munter sein, Jingle Bells, Ihr Kinderlein kommet,
  Leise rieselt der Schnee, O du fröhliche, Morgen kommt der Weihnachtsmann, We Wish You a Merry Christmas (mit Refrain),
  Süßer die Glocken nie klingen, Macht hoch die Tür, Tochter Zion (mit D.C.), Kommet ihr Hirten, Herbei o ihr Gläubigen (mit Refrain),
  Es ist ein Ros entsprungen, Zu Bethlehem geboren, Es kommt ein Schiff geladen. 3 aus dem Gedächtnis (`ok:false`, im Buch nicht
  enthalten): Deck the Halls, Good King Wenceslas, Joy to the World. We Three Kings: Tonfolge mit der Melodiestimme einer vom
  Tester angehängten MIDI-Datei abgeglichen (Strophe, „Field and fountain“, Refrain tongleich; nur Verzierungen des Arrangements abweichend). Pausen = Note 0; `tones(m)` liefert Töne ohne
  Pausen (für Blech, Spritzbeutel, Rezeptbuch). **Lieder-Prüfseite `#lieder`** zeigt Quelle bzw. „bitte prüfen“.
  Abgleich: Meine Gedächtnis-Versionen von Stille Nacht, Herbei, We Wish und Morgen kommt waren tongenau; O Tannenbaum (Rhythmus 2. Hälfte)
  und Jingle Bells (eine punktierte Note) wurden korrigiert. Weitere Lieder im Buch (z. B. Vom Himmel hoch, In dulci jubilo,
  Fröhliche Weihnacht überall, Maria durch ein Dornwald ging) können bei Bedarf ergänzt werden.
  **Mehrstimmig (v14, D44):** Lieder mit `voices:[S,A,T,B]` erklingen am Levelende als vierstimmiger Bläsersatz (`Snd.choir`,
  jede Stimme in Originallage, Sopran etwas lauter); auf `#lieder` „▶ 4-stimmig“. Fertig: **Tochter Zion** (Liederbuch S. 43,
  Form A–B–A, alle Stimmen mit Rasterhilfe abgelesen, Zusammenklänge geprüft; Takt 7: Bass kreuzt kurz den Tenor – so im Satz),
  **We Three Kings** (eigener Satz von Claude im Choralstil: e-Moll-Strophe mit Kadenz-Quartsextvorhalt, „O“ über D–D7, Refrain G-Dur;
  geprüft: gleiche Längen, keine Stimmkreuzung, auf betonten Zeiten nur Dreiklänge und gewollte Septakkorde).
  **Offen (Werkzeuge in `tools/noten/`):** Es ist ein Ros entsprungen (S. 40, Praetorius – anspruchsvoll, Achtel-Durchgänge),
  Herbei o ihr Gläubigen (S. 41), Ich steh an deiner Krippe hier (S. 42), Der Christbaum ist der schönste Baum (S. 37).
- Level-Generator: Seeded RNG (mulberry32), Seed aus Levelnummer → jedes Level ist für sie immer gleich.
  DFS-Solver prüft Lösbarkeit (Knotenlimit 60k), sonst neuer Versuch; Notfall: Extraglas.
- Hosting-Optionen: GitHub Pages (bevorzugt, Link + „Zum Startbildschirm“) oder claude.ai-Artifact-Link (Vorschau).
- Tests: `python3 tools/test_generator.py` (alle Generatoren/Löser in Node), `tools/screenshots.py` (Playwright, 390 px).

## 7. Offene Fragen
- Kalender: Passt das Tagesmenü (Umfang ~20–40 Min.)? Passen die Rezept-Tage?
- Rezept zum 24.12.: eigenes Rezept gemeinsam ausdenken – Wunsch: Kuchen, fruchtig, luftig mit Joghurt/Frischkäse. Vorschläge (v17): Winterwolke (luftiger Joghurt-Frischkäse-Kuchen mit Glühwein-Kirschen), Bratapfel-Joghurt-Torte, Pavlova-Kranz mit Frischkäsecreme und Granatapfel, Orangen-Joghurt-Gugelhupf
- Nächste Schritte: persönliche Inhalte (verschlüsselt) – Zweck dem Auftraggeber erklärt (Begrüßung mit Spitzname, kleine Briefchen hinter einzelnen Türchen); v17 testen (Sicherungscode, App-Symbol auf iPhone/Android)
- Mehrstimmig: Tochter Zion anhören (`#lieder` → „▶ 4-stimmig“) – klingt der Satz richtig?
- Lieder prüfen (`#lieder`): v. a. die 4 Gedächtnis-Lieder (We Three Kings, Deck the Halls, Good King Wenceslas, Joy to the World)
- Prototyp v10 testen: Lehrplan Glasur-Blech Level 1–11 durchspielen – lernt man den Rest-Trick? Labor verständlich? Spritzbeutel schwer genug?
- Weiterhin offen: Rezeptbuch (Tempo, Lieder erkannt, Melodien korrekt?)
- Wie verteilen sich die 4 Stationen auf die 24 Adventstage? → danach gemeinsam evaluieren, was das eigentliche Spiel braucht (Schwierigkeitskurve, Wendungen, Animation).
- Feedback zum Prototyp (Gefühl, Schwierigkeit, Optik)?
- Rezeptauswahl bestätigen / eigene Rezepte?
- Soll der Link schon am 29.11. (1. Advent) kommen, mit einem Vorab-Türchen?
