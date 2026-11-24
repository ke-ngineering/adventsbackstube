# Musikdaten der Adventsbackstube

Alle Lieder des Spiels in gängigen Austauschformaten, zur späteren Verwendung (D62).
**Nicht von Hand bearbeiten**: Die Dateien werden aus `js/core.js` erzeugt mit

```
node tools/musik_export.js
```

| Ordner/Datei | Inhalt | Öffnen mit |
|---|---|---|
| `midi/*.mid` | MIDI Typ 1, eine Spur je Stimme (Sopran/Alt/Tenor/Bass) bzw. beim Jazz-Trio Melodie, Begleitung, Kontrabass, Besen. Instrumente als General-MIDI, Tempo wie im Spiel | MuseScore, GarageBand, jede DAW |
| `abc/*.abc` | ABC-Notation (Text), mehrstimmige Lieder mit `V:`-Stimmen. Ohne Tonart-Vorzeichnung, Vorzeichen stehen an den Noten | abcjs.net, EasyABC, MuseScore (Import), [abc.rectanglered.com](https://abc.rectanglered.com) |
| `lieder.json` | Rohdaten wie im Spiel: Noten als `[MIDI-Tonhöhe, Dauer in Achteln]`, Akkorde, Stimmen, Tempo, Besetzung | eigene Programme |

## Herkunft und Rechte
- Alle **Melodien** sind gemeinfrei (Volkslieder bzw. Komponisten vor 1900). Quellen stehen in jeder Datei (`N:` bzw. `quelle`).
- **Liederbuch „Singen im Advent“** (gemeinfrei): Melodien und der Satz von „Tochter Zion“.
- **Good King Wenceslas**: Satz von Thomas Helmore (1853), **Carol of the Bells**: Satz von M. Leontowytsch (1914) – beide gemeinfrei, abgelesen aus IMSLP-Partituren.
- **We Three Kings** sowie **O du fröhliche, Herbei, Hark!, Stille Nacht, Joy to the World**: eigene Sätze (mit `tools/satz/`).
- **Fuge über „Es kommt ein Schiff geladen“**: eigene Komposition (Bauplan in `tools/satz/fuge.py`).
- **Jazz-Trio** (Jingle Bells, We Wish You, Deck the Halls, God Rest Ye): eigene Akkordfolgen; Bass und Begleitung erzeugt das Spiel daraus.
- Aus fremden MIDI-Dateien wurden nur gemeinfreie Melodien übernommen, keine Arrangements.
