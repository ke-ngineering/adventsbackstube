# Testplan zum Selbst-Abarbeiten (ab v18)

Ziel: das **Spielerlebnis** prüfen, also nicht nur ob alles funktioniert, sondern ob es Spaß macht, verständlich ist und die Schwierigkeit passt.
Bitte Auffälligkeiten mit **Tag/Spiel/Level + was passiert ist + was du erwartet hättest** notieren und Claude schicken.
Claude trägt die Ergebnisse in `TESTPROTOKOLL.md` ein.

## 0. Vorbereitung

| Was | Wie |
|---|---|
| **Sauberer Start** | Link in einem **privaten Fenster** öffnen (Safari: Ablage → Neues privates Fenster; iPhone: Tabs → „Privat“). Nach dem Schließen ist alles weg. |
| **Ein bestimmter Tag** | `https://ke-ngineering.github.io/adventsbackstube/#test&tag=5` – das Spiel tut so, als wäre der 5. Dezember. Türchen 1–5 sind offen, alles Spätere zu. Ausgepackt wird wie echt. |
| **Alles offen** | `…/#test` – alle Türchen offen, alle Spiele und Wendungen sofort da (zum schnellen Herumprobieren). |
| **Zurücksetzen** | Im Testmodus unten im Kalender: „Teststand zurücksetzen“ (zweimal tippen). |
| **Version** | Unten in der Fußzeile muss die aktuelle Version stehen (z. B. „Prototyp v18“). Sonst Seite neu laden. |
| **Geräte** | Mindestens: dein iPhone (Safari), ein Android-Handy oder Chrome, Mac-Safari. Hell- und Dunkelmodus je einmal. |

Tipp: Teste die echte Reise **einmal am Stück** mit `#test&tag=N` und zähle N jeweils hoch (1, 2, 3 …), ohne zurückzusetzen. Dann erlebst du den Advent wie sie, nur im Zeitraffer.

## 1. Der erste Eindruck (ohne Testmodus)

- [ ] Normale Adresse öffnen (ohne `#test`): Kalender mit dunkler Backstube oben und „Noch N Tage …“.
- [ ] Türchen antippen → schüttelt sich, Hinweis „öffnet sich am … Dezember“.
- [ ] Es gibt **keine** Übungsküche vor dem 1.12. (gewollt: erst die Türchen packen aus). Fühlt sich das richtig an oder enttäuschend?
- [ ] „So funktioniert’s“ lesen: Ist die Logik **Türchen = Neues, Übungsküche = Ausgepacktes** sofort klar?
- [ ] „Als App aufs Handy“: Anleitung befolgen. Erscheint das Lebkuchenstern-Symbol auf dem Startbildschirm? Öffnet die App ohne Browserleiste?

## 2. Die Reise durch den Advent (je Tag mit `#test&tag=N`)

Für **jeden Tag** kurz prüfen:
- [ ] Szene mit Krümel liest sich gut (Länge, Ton, Humor)?
- [ ] „Heute neu“ ist verständlich – weiß man danach, was zu tun ist?
- [ ] Tagesmenü: Dauer insgesamt (Ziel 20–40 Minuten)? Zu viel / zu wenig?
- [ ] Tagesrätsel ★: Motiv erkennbar? Spürbar besonders und kniffliger, aber lösbar?
- [ ] Belohnung: Plätzchen fliegt ein, Lied erklingt, Rezept (an Rezepttagen) öffnet sich.
- [ ] Bild der Backstube oben im Kalender hat sich verändert?

| Tag | Besonders prüfen |
|---|---|
| 1 | Begrüßung erscheint. Vorratsregal neu. Erste Kerze am Kranz. |
| 2 | Glasur-Blech mit Lernstunde. Herz-Blech als Tagesrätsel – ohne Lernhilfe lösbar? |
| 3 | „Meine Rezepte“ erscheint, Vanillekipferl. |
| 4 | Spritzbeutel neu. Stern-Motiv. |
| 5 | **Neues Spiel Lichterkette**: Erklärung verständlich? Drehen per Tippen angenehm? |
| 6 | Nikolaus + 2. Kerze. Stiefel-Blech. Braune Kuchen. |
| 7 | Omas Rezeptbuch: Lied des Tages nachspielen. |
| 8 | Stern-Pinsel taucht jetzt im Glasur-Blech auf. |
| 9 | **Neues Spiel Ausstecher**: Ziehen und Drehen auf dem Handy flüssig? Rastet die Form gut ein? |
| 10 | Geheimgläser im Regal: verständlich? Zu gemein? |
| 11 | **Neues Spiel Zuckerstreusel**: Zahlenregel verständlich? Wischen über mehrere Felder klappt? Tannenbaum erkennbar? |
| 12 | Kirschen der Reihe nach im Spritzbeutel. |
| 13 | 3. Kerze, Hamburg-Tag, Franzbrötchen. |
| 14 | **Neues Spiel Marktschlitten**: Schieben mit dem Finger angenehm? Lädt das Level schnell genug (kurze Pause beim Start)? |
| 15 | Stangen-Pinsel im Glasur-Blech. |
| 16 | Bunte Lämpchen in der Lichterkette. |
| 17 | München-Tag, Brezn-Spritzweg, Auszogne. |
| 18 | Größere Teigplatten im Ausstecher. |
| 19 | Bunte Streusel: Regel mit den Farben verstanden? Rentier erkennbar? |
| 20 | 4. Kerze. Eisgläser im Regal: Zahl auf dem Eis verständlich? |
| 21 | Großer Markt (längere Schiebe-Rätsel). |
| 22 | Meisterblech. |
| 23 | Generalprobe: 4 Mini-Rätsel nacheinander. Fortschritt (✓) gut sichtbar? |
| 24 | Festrätsel, Bratapfel-Wolke, Backstube festlich (Stern auf dem Baum), Dose voll. **Fühlt sich das Ende wie ein Abschluss an?** |

## 3. Die Spiele einzeln (Übungsküche, `#test`)

Für **jedes Spiel** ein paar Level spielen, auch einmal ein höheres (mit „›“ springen):

| Spiel | Prüfen |
|---|---|
| Vorratsregal | Animationen (fließen, rieseln, purzeln). Schwierigkeit steigt spürbar? Geheimgläser und Eisgläser in höheren Leveln. |
| Glasur-Blech | Lernhilfe, Labor, Rezeptkarte wie gewohnt. Ohne Stern/Stange vor Tag 8/15 (mit `#test&tag=5` prüfen). |
| Spritzbeutel | Spur ziehen, zurückziehen, Kirschen in höheren Leveln. |
| Lichterkette | Größere Netze ab Level 6+. Tipp-Knopf hilfreich? Gewinn-Funkeln. |
| Omas Rezeptbuch | Lieder erkannt? Tempo ok? |
| Ausstecher | Formen gehen nicht verloren, wenn man daneben loslässt? Gelegte Form antippen → zurück in die Schale. |
| Zuckerstreusel | Erledigte Zahlen werden blass. Bild erscheint am Ende. Ab Level 16 Zufallsmuster – noch schön? |
| Marktschlitten | Kürzester Weg wird angezeigt; 3 Sterne nur bei kürzestem Weg – zu streng? |

Allgemein:
- [ ] Sterne fair verteilt?
- [ ] „Neu starten“, „Tipp“ und „Wie geht das?“ funktionieren überall.
- [ ] Spiel verlassen und wieder öffnen: geht es an derselben Stelle weiter?

## 4. Musik und Ton

- [ ] Ton an/aus oben rechts.
- [ ] `…/#lieder` öffnen: Jedes Lied mit ▶ anhören. **Klingt die Besetzung passend?** (Posaunenchor, Chor, Streichquartett, Flöten, Orgel, Spieluhr, Jazz-Trio, Glockenspiel). Gibt es ein Lied, das schief klingt?
- [ ] Neue Lieder prüfen: I Saw Three Ships, Hark! The Herald Angels Sing, Kommt und lasst uns Christum ehren, God Rest Ye Merry Gentlemen, Morning Star, Deck the Halls (jetzt mit ganzer Strophe). Carol of the Bells ist aus dem Gedächtnis – bitte besonders prüfen.
- [ ] Vierstimmig („▶ 4-stimmig“): Tochter Zion (Posaunenchor), We Three Kings (Streichquartett).
- [ ] Jazz-Trio (Jingle Bells, We Wish You, Deck the Halls, God Rest Ye): Swing und Besen hörbar, nicht zu laut?
- [ ] Ton auf iPhone mit **Stummschalter an** (sollte trotzdem klingen), Mac-Safari, Android.
- [ ] Ruckelt es bei langen Liedern auf dem Handy? (Viele Instrumente werden live erzeugt.)

## 5. Speichern und Sicherheit

- [ ] Spielstand bleibt nach Schließen und erneutem Öffnen erhalten.
- [ ] „Spielstand sichern“: Code kopieren → im privaten Fenster „Zurückholen“ → Fortschritt ist da.
- [ ] Startbildschirm-App (iPhone) hat eigenen Speicher: Code von Safari in die App übertragen.

## 6. Gesamteindruck (die wichtigste Frage)

- [ ] Freut man sich auf das nächste Türchen? Was ist das Highlight, was nervt?
- [ ] Ist die Schwierigkeit „knifflig, aber machbar, lösbar und verständlich“?
- [ ] Passt der Stil (gemütlich-warm, verspielt)?
- [ ] Gibt es etwas, das sie persönlich besonders freuen würde und noch fehlt?
