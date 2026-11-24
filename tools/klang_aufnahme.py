"""Instrumenten-Samples aus einer SoundFont erzeugen (D66).
Voraussetzung: sudo apt-get install fluidsynth musescore-general-soundfont ; pip install mido ; ffmpeg
Aufruf: python3 tools/klang_aufnahme.py <name> <GM-Programm> <tiefster> <höchster> [Sekunden] [kbit/s]
   oder: python3 tools/klang_aufnahme.py alle   (alle Instrumente des Spiels, siehe LISTE)
→ klang/<name>/o<Ton>.mp3 (je 3 Halbtöne ein Ton, mono, auf −2 dB normalisiert, ohne eigenen Hall)"""
import mido, subprocess, sys, os, tempfile, re
SF = '/usr/share/sounds/sf3/MuseScore_General.sf3'
LISTE = [  # Name, GM-Programm, Tonumfang, Länge in s, kbit/s
    ('orgel', 19, 36, 81, 3.8, 96), ('trompete', 56, 54, 84, 3.2, 64), ('posaune', 57, 36, 72, 3.2, 64), ('chor', 52, 40, 81, 3.8, 64),
    ('violine', 40, 55, 90, 3.2, 64), ('bratsche', 41, 48, 78, 3.2, 64), ('cello', 42, 36, 69, 3.2, 64), ('floete', 73, 60, 96, 3.0, 64),
    ('glocken', 9, 60, 96, 2.4, 64), ('spieluhr', 10, 60, 96, 2.4, 64)]

def aufnehmen(name, prog, lo, hi, dauer=3.8, kbit=96):
  out = os.path.join(os.path.dirname(__file__), '..', 'klang', name); os.makedirs(out, exist_ok=True)
  tmp = tempfile.mkdtemp(); toene = []
  for n in range(lo, hi + 1, 3):
    toene.append(n)
    m = mido.MidiFile(ticks_per_beat=480); t = mido.MidiTrack(); m.tracks.append(t)
    t += [mido.MetaMessage('set_tempo', tempo=500000), mido.Message('program_change', program=prog),
          mido.Message('control_change', control=91, value=0), mido.Message('control_change', control=93, value=0),
          mido.Message('note_on', note=n, velocity=100), mido.Message('note_off', note=n, velocity=0, time=int(480 * 2 * dauer))]
    mid, wav, wav2 = f'{tmp}/{n}.mid', f'{tmp}/{n}.wav', f'{tmp}/{n}b.wav'; m.save(mid)
    subprocess.run(['fluidsynth', '-ni', '-g', '0.9', '-R', '0', '-C', '0', '-r', '44100', '-F', wav, SF, mid], check=True, capture_output=True)
    subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', wav, '-af', f'silenceremove=start_periods=1:start_threshold=-60dB,atrim=0:{dauer},afade=t=out:st={dauer - .3}:d=0.3', '-ac', '1', wav2], check=True)
    peak = float(re.search(r'max_volume: (-?[\d.]+) dB', subprocess.run(['ffmpeg', '-i', wav2, '-af', 'volumedetect', '-f', 'null', '-'], capture_output=True, text=True).stderr).group(1))
    subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', wav2, '-af', f'volume={-2 - peak}dB', '-b:a', f'{kbit}k', f'{out}/o{n}.mp3'], check=True)
  print('OK', name, toene)
  return toene

if __name__ == '__main__':
  if sys.argv[1] == 'alle':
    for e in LISTE: aufnehmen(*e)
  else:
    aufnehmen(sys.argv[1], int(sys.argv[2]), int(sys.argv[3]), int(sys.argv[4]), *(float(x) for x in sys.argv[5:7]))
