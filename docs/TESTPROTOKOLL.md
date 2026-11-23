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

## Runde 5 – Prototyp v5 (ausstehend)
**Zu prüfen:**
- Wird das Glasur-Blech mit Anleitung und Vorschau verständlich?
- Ist der Einstieg über Level 1–5 angenehm?
- Weiteres Feedback zu Rezeptbuch, Melodien und Backstube aus Runde 4
