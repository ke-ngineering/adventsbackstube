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

## Runde 3 – Prototyp v3 (ausstehend)
**Zu prüfen:**
- Zeigt die Fußzeile „Prototyp v3“?
- Ist die Animation sichtbar?
- Wie wirken die Geräusche und die Melodie-Gläser?
- Geht nach dem Schließen und erneuten Öffnen der Stand mitten im Level weiter?
