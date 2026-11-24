# Testprotokoll

Hier steht jede Testrunde: was getestet wurde, das Feedback und was daraus folgte.
Keine personenbezogenen Daten. Die Spielerin heißt hier nur „Spielerin“, der Auftraggeber „Tester“.

## Runde 1 – Prototyp v1 (23.11.2026)
**Getestet:** Gewürzregal mit 3–9 Zutaten, 2 leeren Gläsern und statischem Umfüllen, auf dem Handy des Testers über den claude.ai-Link.

**Feedback:**
- Läuft, ist aber „sehr simpel“.
- Zu wenige Gläser. Das Vorbild-Spiel der Spielerin hat etwa 8 Flaschen.
- Viel zu leicht. Die Spielerin löst deutlich schwierigere Kombinationen und würde sich langweilen.
- Das Umfüllen wirkt nicht dynamisch.

**Folge:** v2 (siehe Entscheidung D13).

## Runde 2 – Prototyp v2 (23.11.2026)
**Getestet:** Start mit 6 Zutaten in 8 Gläsern, stark gemischte Level und Umfüll-Animation. Diesmal über GitHub Pages.

**Feedback:**
- Das Einstiegslevel ist „schon etwas spannend“. Als Einstieg ist die Schwierigkeit gut.
- Animation: Der Tester sieht keine, der Inhalt springt als Block um.
- Geräusche erwünscht.
- Weitere Effekte und Ideen soll Claude entscheiden: kein Nachbau, sondern ein eigenes, interessantes Spiel.
- Der Spielstand soll beim erneuten Öffnen erhalten bleiben.

**Analyse Animation:** Im Headless-Test läuft die Animation. Vermutete Ursachen:
1. Das Handy hatte noch die alte Version im Cache (GitHub Pages cacht bis zu 10 Minuten).
2. Am Handy war „Animationen reduzieren“ an (bei Android oft durch den Energiesparmodus). v2 hat die Animation dann bewusst übersprungen.

**Folge:** v3 (siehe Entscheidungen D14–D17). Die Versionsnummer steht jetzt in der Fußzeile, damit man sieht, welche Version läuft.

## Runde 3 – Prototyp v3 (23.11.2026)
**Getestet:** Animation immer an, Geräusche, Melodie-Gläser, Fortsetzen im Level. Aufruf mit `?v=3`, um den Cache zu umgehen.

**Feedback:** „Das funktioniert jetzt.“ Die Animation ist sichtbar. Weiter mit den nächsten Mechaniken.

**Folge:** v4 mit Glasur-Blech, Rezeptbuch und Backstube-Startseite (D19–D22).

## Runde 4 – Prototyp v4 (23.11.2026)
**Automatisch geprüft:**
- Regal-Level 1–60 lösbar.
- Blech-Level 1–40: Der Löser findet den Bestwert, die Lösung glasiert alles.
- Rezeptbuch-Level 1–30 gültig.
- Blech und Rezeptbuch in Level 1 per Skript komplett durchgespielt, inklusive Gewinn-Dialog und Sternen.

**Zu prüfen durch den Tester:**
- Glasur-Blech: Ist das Form-Muster verständlich (Legende)? Wie ist die Schwierigkeit? Sind die Tipps hilfreich?
- Rezeptbuch: Passt das Tempo? Erkennt man die Lieder? Stimmen die Melodien (Stille Nacht, Morgen kommt der Weihnachtsmann, Jingle Bells, Deck the Halls)?
- Backstube: Funktioniert der Wechsel zwischen den Stationen? Öffnet das Spiel beim Neustart dort, wo man war?

**Feedback (Zwischenstand):** Glasur-Blech: „glasieren ist lustig, aber ich versteh es nicht“.
Das Prinzip mit den wechselnden Nachbarn erschließt sich ohne Erklärung nicht.

**Folge:** v5 (D24). Anleitung, Vorschau beim Drücken, 3×3-Einstieg und Vorstellung jeder neuen Form.

## Runde 5 – Prototyp v5 (23.11.2026)
**Getestet:** Glasur-Blech mit Anleitung, Vorschau beim Drücken und 3×3-Einstieg.

**Feedback:**
- „Die Erklärung ist nützlich!“ Die Regeln sind jetzt verstanden.
- Aber: „Ich weiß nicht, wie ich das lösen soll. Erscheint mir wie Rubik's Cube.“ Lights-Out ist ohne Strategie kaum intuitiv lösbar.
- Entscheidung des Testers: Das Blech **behalten**, weil es interessant ist, aber einen Lernmodus einbauen, der das Vorgehen Schritt für Schritt erklärt.
- Die Spritzbeutel-Idee (Ein-Strich-Rätsel) gefällt. Sie soll ein **eigener Spielteil** werden: „Man muss Spritzgebäck erstellen.“

**Folge:** v6 (D26, D27).

## Runde 6 – Prototyp v6 (24.11.2026)
**Automatisch geprüft:**
- Die Lernhilfe löst Blech-Level 1–40 vollständig.
- Spritzbeutel-Level 1–40 haben gültige Wege.
- Per Skript gespielt: Strategiekurs durchgeklickt, Blech Level 8 mit Lernhilfe gelöst (2 Sterne), Spritzbeutel Level 1 mit simuliertem Finger gelöst.

**Zu prüfen durch den Tester:**
- Lösungsweg-Kurs: Ist die Jagd-Methode verständlich?
- Lernhilfe: Helfen die Begründungen? Lernt man dabei etwas?
- Spritzbeutel: Lässt sich der Finger gut steuern? Wie ist die Schwierigkeit mit und ohne Start-Stern (ab Level 7)?

**Feedback:**
- Allgemein: Die Spielerin löst gern Rätsel. Knifflig ist okay, aber es muss machbar, lösbar und verständlich sein.
- Glasieren ist „lustig“, aber ohne die „wirklich sehr gute Hilfe“ wüsste der Tester nicht, wie er vorgehen soll.
- Er möchte es behalten, aber der Weg soll klarer werden. Offen blieb: Warum führt der „Rest-Trick“ zur Lösung? Woher weiß man ohne das Spiel, welche Plätzchen die goldenen sind?
- Spritzbeutel: „lustig und eher einfach. Funktioniert gut.“

**Analyse:** Beim klassischen Lights-Out lässt sich der Rest-Trick nur mit linearer Algebra oder auswendig gelernten Tabellen lösen. Eine bessere Erklärung kann das nicht verständlich machen, man muss das Spiel selbst ändern.

**Folge:** v7 (D28–D30).

## Runde 7 – Prototyp v7 (24.11.2026, nicht live gegangen)
**Automatisch geprüft:**
- Die Jagd löst jedes Blech-Level 1–40 genau in der Zielzahl, ohne Rest.
- Per Skript: Level 14 (alle drei Formen) mit der Lernhilfe gelöst.
- Spritzbeutel bis 8×8 gültig.

**Zu prüfen:**
- Glasur-Blech: Lässt es sich mit der einen Regel („direkt darunter tippen“) ohne Hilfe lösen? Bleibt es trotzdem spannend?
- Spritzbeutel: Ist es jetzt schwer genug?

**Feedback (vor dem Merge):** „Bitte lasse den Rest-Trick im Spiel! Aber mache ihn durchschaubar.“ Vorschläge des Testers: Mit 2×2 ganz simpel anfangen, dann 3×2 und so weiter, damit man das Denken lernen kann. Oder recherchieren, wie man Lights Out lösen lernt, und die Schwierigkeit danach aufbauen. Später sollen schwierigere Probleme Freude am Lösen machen.

**Recherche:** Üblich ist die Lösung in zwei Schritten: Lichter Reihe für Reihe nach unten jagen, dann die letzte Reihe über eine Tabelle lösen, also bestimmte Felder der obersten Reihe drücken und nochmal jagen. Solche Tabellen entstehen, wenn man auf einem leeren Brett ein Licht der obersten Reihe nach unten jagt und beobachtet, was übrig bleibt (Wikipedia, Jaap's Puzzle Page, GNOME Lights Off). Lehrmaterial empfiehlt, mit 2×2, 2×3, 3×3 und 2×4 zu beginnen (Duke CompSci 101).

**Analyse der Blechgrößen** (nur Taler, Fingerabdrücke berechnet):
- 2×2 und 4×2: Der Abdruck ist das Feld direkt darunter, ideal als Einstieg.
- 4×3: Einzelpunkte, spiegelverkehrt.
- 3×3: Abdrücke müssen kombiniert werden.
- 3×2, 4×4 und 5×3: Nach der Jagd bleibt nie ein lösbarer Rest. Für Rest-Lektionen ungeeignet.

**Folge:** v8 (D31).

## Runde 8 – Prototyp v8 (24.11.2026)
**Automatisch geprüft:**
- Jede Blech-Stufe von 1 bis 40 erzeugt (Lehrplan-Level je mit Modus, Ziel und Minimum).
- Die Lernhilfe löst alle 40 Level genau in der Zielzahl.
- Per Skript: Lektion 2 → Labor → Abdruck A auf 2×2 gespeichert. Level 9 (3×3, Kombination A+C) mit Lernhilfe gelöst.

**Zu prüfen:**
- Lernt man mit Lektion, Labor und Rezeptkarte den Rest-Trick so, dass man ihn ab dem 3×3-Level selbst anwenden kann?
- Ist das Tempo des Lehrplans richtig?

**Feedback:** „Sehr schön! Das ist ein richtiges Knobelspiel. Ich checke noch nicht wirklich, wie es geht, aber ich mag es irgendwie.“
Stolperstein in der Lernhilfe: „Das ist der Fingerabdruck von A – probier es im Labor aus! Tippe oben A“ – **Was ist das Labor? Was ist A?**

**Folge:** v9 (D32).

## Runde 9 – Prototyp v9 (24.11.2026)
**Zu prüfen:**
- Sind A/B/C und das Abdruck-Labor jetzt klar?
- Hilft die Schrittliste in der Lernhilfe, den Ablauf zu verstehen?
- Fühlen sich die geführten Übungslevel 3 und 6 wie ein gutes Tutorial an?

**Feedback:**
- „Das Labor ist cool!“ Beim „Jagen“ soll es aber langsamer vorführen, damit man mitgehen kann.
- „Jetzt verstehe ich, wie die Lösungsmechanik laufen soll. Das macht Spaß!“ Warum es funktioniert, ist noch nicht ganz klar. Wunsch: eine optionale kleine Lerneinheit später zwischendurch.
- Spritzgebäck: „okay! Funktioniert, nicht zu schwer.“
- Ton: Der Tester hört keinen Sound mehr, vor ein paar Versionen war noch etwas zu hören.

**Analyse Ton:** Im automatischen Test startet die Ton-Engine bei jedem Antippen ohne Fehler (AudioContext „running“). Wahrscheinlich liegt es am Gerät: Beim iPhone schaltet der Stummschalter Web Audio stumm, bei Android zählt die Medienlautstärke. Auch ein ausgeschalteter Ton-Knopf im Spiel kommt infrage.

**Folge:** v10 (D33–D35).

## Runde 10 – Prototyp v10 (ausstehend)
**Zwischenfeedback:** Der Tester spielt auf dem Laptop in **Safari** (Mac), auf dem iPhone in **Chrome**. In beiden ist kein Ton zu hören. Beide Browser nutzen WebKit.
Wunsch zum Gewürzregal: Flüssige Zutaten sollen fließen, andere herunterpurzeln (grobe wie Kirschen) oder rieseln (Mohn).

**Analyse Ton:** WebKit kann den AudioContext in den Zustand `interrupted` versetzen. Der Code hat bisher nur `suspended` fortgesetzt, das war ein echter Fehler. Behoben, dazu Freischalt-Puffer und Ton-Testseite (D37).

**Zu prüfen:** Labor-Tempo, Bonus-Lerneinheit, Ton (Ton-Test `#tontest`), die neuen Fall-Effekte im Gewürzregal.

**Feedback v10:**
- „Sehr schön die Geräusche.“ Auf iOS in Chrome sind sie jetzt hörbar, der WebKit-Fix wirkt.
- Name: Im Gewürzregal sind nicht nur Gewürze (Honig, Kirschen …). Umbenennen?
- Beim letzten Zug erklingt das letzte Melodie-Teilstück und gleichzeitig die ganze Melodie. Das überlagert sich.
- Auf dem MacBook in Safari ist weiterhin kein Ton zu hören.

**Folge:** v11 (D38–D40). Für Mac-Safari wird das Ergebnis des Ton-Tests gebraucht.

## Runde 11 – Prototyp v11 (24.11.2026)
**Feedback:**
- Ton-Test auf dem Mac in Safari: Alle drei Testtöne sind hörbar, ohne geänderte Einstellungen. Danach meldet der Tester: „Sound geht jetzt!“ Der WebKit-Fix aus v10 und v11 wirkt auf Mac und iOS.
- Wunsch: eine große Auswahl alter, gemeinfreier Weihnachtslieder, z. B. „Star of wonder, star of night …“ (We Three Kings).

**Analyse:** Exakte Notenquellen ließen sich aus der Arbeitsumgebung nicht verlässlich abrufen. Webseiten werden nur zusammengefasst gelesen, und dabei wurden Noten verfälscht. Die neuen Lieder sind deshalb aus dem Gedächtnis notiert und werden über die Prüfseite verifiziert.

**Folge:** v12 (D41).

## Runde 12 – Prototyp v12 (24.11.2026)
**Feedback:** Der Tester schlägt liederkiste.com als Quelle vor und erlaubt, das fremde öffentliche Repository des Liederbuchs „Singen im Advent“ zu lesen.

**Analyse:**
- Liederkiste: keine Noten im Textformat. Die Notenblätter sind nur für private oder gemeinnützige Nutzung freigegeben, nicht zur Veröffentlichung, deshalb nicht verwendet.
- „Singen im Advent“: gemeinfrei und frei verbreitbar. Das Repository enthält nur das PDF (44 Seiten, Noten als Grafik). Claude hat die Noten aus den gerenderten Seiten abgelesen und eigene Versionen damit abgeglichen.

**Folge:** v13 (D42, D43): 23 Lieder, davon 19 aus dem Liederbuch.

## Runde 13 – Prototyp v13 (ausstehend)
**Zu prüfen:** Lieder auf `#lieder` anhören, vor allem die 4 „bitte prüfen“-Lieder.

**Zwischenfeedback:** Der Tester schlägt midkar.com mit MIDI-Listen internationaler Weihnachtslieder vor, gern auch mehrstimmig.
**Analyse:** Der Download aus der Arbeitsumgebung ist blockiert (HTTP 403). Die Seite nennt keine Nutzungsrechte. Mehrstimmige Sequenzen sind Arrangements Dritter, und viele Titel sind modern und geschützt.
**Entscheidung des Testers:** a) Mehrstimmig aus dem freien Liederbuch jetzt umsetzen, b) internationale Lieder „für später“ notieren.
**Folge:** v14 (D44, D45).

## Runde 14 – Prototyp v14 (ausstehend)
**Zu prüfen:** Tochter Zion vierstimmig. Klingt der Satz stimmig, ist der Bläserklang angenehm?

## Runde 15 – Prototyp v15 (ausstehend)
**Automatisch geprüft:** Geschlossenes Türchen zeigt einen Hinweis. Im Testmodus Türchen 1 geöffnet, „Glasur-Blech 1 Level“ gelöst, und der Fortschritt steht im Tagesmenü (1/1 ✓). Der Gewinn-Dialog bietet „Zum Türchen 1“. Für alle 24 Tage wird ein Lied des Tages gefunden.
**Zu prüfen:** Kalender-Optik, Tagesmenü-Umfang, Ablauf Türchen → Station → zurück.
**Zwischenfeedback:** Der Tester hängt zum Testen eine MIDI-Datei von „We Three Kings“ an (Arrangement eines Dritten). Daraus wurde nur die Melodiestimme ausgelesen, um die eigene Notation zu prüfen. Ergebnis: tongleich, Lied gilt jetzt als geprüft. Das Arrangement wurde nicht übernommen.
Das Rezept zum 24.12. soll gemeinsam überlegt werden.
Wunsch: We Three Kings vierstimmig. Das MIDI-Arrangement (Mannheim Steamroller, sequenziert von Dritten) ist geschützt, deshalb hat Claude einen eigenen Satz geschrieben (D47).

## Runde 16 – v16 in Safari (Mac)
**Feedback:** wieder kein Ton in Safari auf dem Mac.
**Analyse:** Das Freischalt-Ereignis `pointerup` zählt in Safari bei Maus oder Trackpad nicht als Nutzeraktion. Wird der AudioContext dort angelegt, kann er blockiert bleiben. Mit dem Kalender als Startseite hat sich die Reihenfolge der ersten Klicks geändert.
**Folge:** v16.1 (D49). Freischalten nur noch bei mousedown, click, touchend und keydown. Ein blockierter AudioContext wird beim nächsten Antippen neu angelegt.
**Zu prüfen:** Ton in Safari (Mac) nach v16.1. Falls es weiter still bleibt: `#tontest` (Zustand, welche Knöpfe hörbar), Lautsprecher-Symbol im Spiel, Safari-Tab nicht stummgeschaltet.

**Nachtrag Runde 16:** In v15 ging der Ton auf dem Mac, sobald einmal auf der Lieder-Testseite ein Lied abgespielt wurde – danach auch in den Spielen. Das bestätigt die Diagnose: Der Ton war nicht kaputt, sondern nur nicht freigeschaltet (der Knopf auf der Testseite spielt direkt im Klick, die Spiele teils verzögert). v16.1 schaltet jetzt bei jedem Klick frei, bis Safari den Ton wirklich laufen lässt.

## Runde 17 – v17 (24.11.)
**Rückmeldung zu v16.1:** Ton in Safari (Mac) geht jetzt („scheint zu gehen“).
**Neu:** Sicherungscode (Kopieren/Zurückholen), App-Symbol + Manifest, Anleitung „Als App aufs Handy“.
**Automatisch geprüft:** Sicherungscode hin und zurück (inkl. Umlaute, Zeilenumbrüche beim Einfügen), Tippfehler/fremde Texte werden abgelehnt; im Browser: Zurückholen ersetzt den Stand und lädt neu, keine Skriptfehler; Manifest lädt mit 3 Symbolen. Frischer Spielstand ≈ 1,7 kB Code.
**Offen:** Auf echtem iPhone/Android „Zum Home-Bildschirm“ testen. Hinweis: Auf dem iPhone hat die Startbildschirm-App einen **eigenen Speicher** – Spielstand per Code mitnehmen.

