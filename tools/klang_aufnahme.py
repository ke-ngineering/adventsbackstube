"""Instrumenten-Samples aus einer SoundFont erzeugen (D66).
Voraussetzung: sudo apt-get install fluidsynth musescore-general-soundfont ; pip install mido ; ffmpeg
Aufruf: python3 tools/klang_aufnahme.py orgel 19 36 81
→ klang/orgel/o<Ton>.mp3 (je 3 Halbtöne ein Ton, 3,8 s, mono, normalisiert, ohne eigenen Hall)"""
import mido, subprocess, sys, os, tempfile
SF = '/usr/share/sounds/sf3/MuseScore_General.sf3'
name, prog, lo, hi = sys.argv[1], int(sys.argv[2]), int(sys.argv[3]), int(sys.argv[4])
out = os.path.join(os.path.dirname(__file__), '..', 'klang', name); os.makedirs(out, exist_ok=True)
tmp = tempfile.mkdtemp()
for n in range(lo, hi + 1, 3):
    m = mido.MidiFile(ticks_per_beat=480); t = mido.MidiTrack(); m.tracks.append(t)
    t += [mido.MetaMessage('set_tempo', tempo=500000), mido.Message('program_change', program=prog),
          mido.Message('control_change', control=91, value=0), mido.Message('control_change', control=93, value=0),
          mido.Message('note_on', note=n, velocity=100), mido.Message('note_off', note=n, velocity=0, time=480 * 7)]
    mid, wav = f'{tmp}/{n}.mid', f'{tmp}/{n}.wav'; m.save(mid)
    subprocess.run(['fluidsynth', '-ni', '-g', '0.9', '-R', '0', '-C', '0', '-r', '44100', '-F', wav, SF, mid], check=True, capture_output=True)
    subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', wav, '-af', 'silenceremove=start_periods=1:start_threshold=-60dB,atrim=0:3.8,afade=t=out:st=3.5:d=0.3,volume=3.5',
                    '-ac', '1', '-b:a', '96k', f'{out}/o{n}.mp3'], check=True)
print('OK', name, list(range(lo, hi + 1, 3)))
