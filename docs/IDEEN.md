# Ideen-Backlog

Leitlinie: kein Nachbau bekannter Spiele, sondern ein **eigenes Spiel** rund um die Themen der Spielerin:
Backen, Musik/Chor/Posaunenchor, Handarbeit, Menschen, München & Hamburg.

Status: ✅ umgesetzt · 🔨 in Arbeit · 💡 Idee · ❌ verworfen

## Kernideen mit eigenem Charakter
| Status | Idee | Warum interessant |
|---|---|---|
| ✅ | **Melodie-Gläser**: Jedes volle Glas spielt das nächste Stück eines Adventslieds als Glockenspiel. Ist das Level gelöst, erklingt das ganze Lied als Posaunenchor. | Verbindet das Knobeln mit Musik und Chor und ist so in keinem Sortierspiel bekannt. Motiviert, das Level „zu Ende zu hören“. |
| 💡 | **Liederbuch**: Jeder Adventstag bringt ein neues gemeinfreies Lied. Gesammelte Lieder lassen sich im Liederbuch anhören. | Sammelanreiz, Bezug zum Chor |
| 💡 | **Instrument freischalten**: zuerst Glockenspiel, später Posaune, Orgel, Spieluhr | Belohnung ohne Mehraufwand bei den Inhalten |
| 💡 | **Kundschaft des Tages**: kleine Figuren (z. B. eine Hamburger Möwe, ein Münchner Dackel) kommen in die Backstube, jede mit einer Stimmung und einem Plätzchenwunsch. Wer ihre Bestellung backt, hellt ihre Laune auf. | Menschen und Gefühle als Thema, kleine Geschichten, Wärme |
| 💡 | **Bestellzettel**: Ein Rezept verlangt bestimmte Zutaten (z. B. Zimt, Mandeln, Zucker für Zimtsterne). Werden diese Gläser zuerst gefüllt, gibt es Bonussterne. | Zusätzliche Strategieebene im selben Spiel |
| 💡 | **Plätzchendose / Backstube wächst**: Sterne füllen eine Dose. Die Küche bekommt nach und nach Deko (Lichterkette, Adventskranz, Schwibbogen). | Sichtbarer Fortschritt über 24 Tage |

## Wendungen fürs Vorratsregal (eine neue pro Woche)
| Status | Idee |
|---|---|
| 💡 | **Verdeckte Zutaten**: Untere Schichten sind als „?“ verdeckt, bis sie freiliegen. |
| 💡 | **Kühlschrank-Glas**: Ein Glas ist gefroren und taut erst nach 3 vollen Gläsern auf. |
| 💡 | **Gewürzmischung**: Ein Spezialglas nimmt zwei bestimmte Zutaten an (z. B. Zimt und Nelke = Lebkuchengewürz). |
| 💡 | **Backofen-Uhr**: Bonus, wenn das Level in N Zügen gelöst ist (Zielzahl vom Solver). |
| 💡 | **Joker „Extraglas“**: einmal pro Tag ein zusätzliches leeres Glas |

## Weitere Mechaniken (laut Plan)
| Status | Idee |
|---|---|
| ✅ | **Glasur-Blech** (Lights-Out-Prinzip): Antippen glasiert ein Plätzchen und seine Nachbarn. Eigene Wendung: Die Form bestimmt das Muster (Taler, Zimtstern, Spritzgebäck). |
| ✅ | **Omas Rezeptbuch** (Reihenfolge merken): Zutaten leuchten auf und müssen nachgetippt werden. Eigene Wendung: Jedes zweite Level ist ein echtes Lied. |
| 💡 | **Strickmuster** (Handarbeit): Farbreihen zu einem Muster anordnen, eventuell als spätere Mechanik |

## Technik & Komfort
| Status | Idee |
|---|---|
| ✅ | Geräusche synthetisch über Web Audio (Antippen, Rieseln, Fehlversuch), Ton-Schalter |
| ✅ | Spielstand inklusive angefangenem Level im Browser speichern |
| 💡 | Spielstand-Code zum Sichern und Wiederherstellen |
| 💡 | Leichte Vibration beim vollen Glas (falls das Handy es unterstützt) |
| ✅ | Hinweis-Knopf im Glasur-Blech (kostet einen Stern) · 💡 auch fürs Vorratsregal |

## Neu aus v4
| Status | Idee |
|---|---|
| 💡 | Glasur-Blech: weitere Formen, z. B. Herz (wechselt die Spalte) oder Brezel (wechselt nur die Ecken) |
| 💡 | Glasur-Blech: „Doppelglasur“ – manche Plätzchen brauchen zwei Schichten (3 Zustände statt 2) |
| 💡 | Rezeptbuch: „Kanon“-Level, in denen die Folge rückwärts nachgetippt wird |
| 💡 | Rezeptbuch: Liederquiz – nach dem Level aus drei Liedtiteln den richtigen wählen, für einen Bonusstern |
| ✅ | Glasur-Blech: Strategiekurs („Lösungsweg“) + interaktive Lernhilfe mit Begründungen (v6) |
| ✅ | **Spritzbeutel** als eigene Station: Spritzgebäck in einem Zug (v6) |
| 💡 | Spritzbeutel: Formen-Level, bei denen die Spur ein Motiv ergibt (Stern, Brezel, Herz) |
| 💡 | Spritzbeutel: Zwei Teigfarben, bei denen Hell- und Dunkel-Punkte abwechselnd durchlaufen werden müssen |
| ✅ | Glasur-Blech: Rest-Trick lernbar über Lehrplan, Fingerabdruck-Labor und Rezeptkarte (v8); Meisterbleche ab Level 17 |
| 💡 | Spritzbeutel: Zuckerperlen, die man in einer bestimmten Reihenfolge passieren muss |

## Lieder – für später
| Status | Idee |
|---|---|
| ✅ | Vierstimmig: Tochter Zion (v14, Liederbuch), We Three Kings (eigener Satz) |
| 💡 | Eigene vierstimmige Sätze auch für Deck the Halls, Good King Wenceslas, Joy to the World, Jingle Bells … (nach Melodie-Prüfung) |
| 💡 | Vierstimmig nachziehen: Es ist ein Ros entsprungen, Herbei o ihr Gläubigen, Ich steh an deiner Krippe hier, Der Christbaum ist der schönste Baum (Liederbuch S. 37–42, Werkzeuge in `tools/noten/`) |
| 💡 | **Internationale gemeinfreie Lieder** (Anregung: Liste auf midkar.com – deren MIDI-Dateien aber nicht verwenden, keine Nutzungsrechte): God Rest Ye Merry Gentlemen, Greensleeves / What Child Is This, Hark the Herald Angels Sing, I Saw Three Ships, It Came Upon a Midnight Clear, Jolly Old Saint Nicholas. Melodie nach bestem Wissen notieren, als „bitte prüfen“ markieren – oder exakt aus einer vom Tester angehängten MIDI-Datei (nur Melodiestimme) übernehmen. |
| 💡 | Weitere Lieder aus dem Liederbuch: Vom Himmel hoch, In dulci jubilo, Fröhliche Weihnacht überall, Maria durch ein Dornwald ging, Still still still, Was soll das bedeuten |

## Lieder aus den MIDI-Dateien – nicht übernommen (24.11., D55)
- **Urheberrechtlich geschützt** (nicht ins öffentliche Repo): White Christmas, Frosty the Snowman, The Little Drummer Boy, Winter Wonderland.
- **Für später:** Away in a Manger (MIDI zu frei gespielt, Melodie müsste aus einer anderen Quelle kommen), Ebenezer (gemeinfreie Hymne, aber kein Weihnachtslied).
- Adeste Fideles: die MIDI enthält einen vierstimmigen Satz; übernommen wird bewusst nur die Melodie (Herkunft des Satzes unbekannt).

## Musik – offen (v19)
- ~~Carol of the Bells~~ – erledigt mit der Leontowytsch-Partitur (D61).
- **Morning Star**: auf Wunsch entfernt (unbekannt).
- Weitere vierstimmige Sätze aus dem Liederbuch: Es ist ein Ros (S. 40), Ich steh an deiner Krippe (S. 42), Christbaum (S. 37); Herbei (S. 41) gäbe es auch im Liederbuch – derzeit eigener Satz.
