# Klangaufnahmen (Instrumenten-Samples)

Je Instrument ein Ton im Abstand einer kleinen Terz (`<instrument>/o<MIDI-Ton>.mp3`), aufgenommen mit FluidSynth aus der
Klangsammlung **MuseScore General** (Debian-Paket `musescore-general-soundfont`):

| Ordner | Instrument (General-MIDI-Programm) | Einsatz im Spiel |
|---|---|---|
| `orgel` | Kirchenorgel (19) | Orgelstücke |
| `trompete`, `posaune` | Trompete (56), Posaune (57) | Posaunenchor (Sopran/Alt bzw. Tenor/Bass) |
| `chor` | Chor „Aah“ (52) | Chorsätze |
| `violine`, `bratsche`, `cello` | Violine (40), Viola (41), Cello (42) | Streichquartett |
| `floete` | Flöte (73) | Flöten, Gigue |
| `glocken` | Glockenspiel (9) | Glockenspiel-Lieder |
| `spieluhr` | Spieluhr (10) | Spieluhr-Lieder |

Fehlt eine Aufnahme oder scheitert das Laden, spielt das Spiel automatisch den nachgebauten Klang (D67).

Lizenz der Klangsammlung: **MIT** (Teile gemeinfrei bzw. CC0).
Fluid (R3) GM SoundFont © 2000–2002, 2008 Frank Wen; Mono-Fassung © 2014–2017 Michael Cowgill;
Anpassung für MuseScore General © 2018–2021 S. Christian Collins.

> Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
> documentation files (the "Software"), to deal in the Software without restriction, including without limitation
> the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to
> permit persons to whom the Software is furnished to do so, subject to the following conditions: The above copyright
> notice and this permission notice shall be included in all copies or substantial portions of the Software.
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.

Erzeugt mit `python3 tools/klang_aufnahme.py alle` (siehe dort).
