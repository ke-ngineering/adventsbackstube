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

## Runde 9 – Prototyp v9 (ausstehend)
**Zu prüfen:**
- Sind A/B/C und das Abdruck-Labor jetzt klar?
- Hilft die Schrittliste in der Lernhilfe, den Ablauf zu verstehen?
- Fühlen sich die geführten Übungslevel 3 und 6 wie ein gutes Tutorial an?
