// ============================================================
// TRANSPOSICIÓN EN EL CLIENTE (sin llamada al servidor)
// Mirror del servicio NestJS para respuesta instantánea en UI
// ============================================================

const CHROMATIC_SHARP = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const CHROMATIC_FLAT  = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

const ENHARMONIC: Record<string, string> = {
  'Cb': 'B', 'Db': 'C#', 'Eb': 'D#', 'Fb': 'E',
  'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#',
};

const FLAT_KEYS = new Set([
  'F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb',
  'Dm', 'Gm', 'Cm', 'Fm', 'Bbm', 'Ebm',
]);

const NOTE_PATTERN = /^([A-G][b#]?)/;

function noteToIndex(note: string): number {
  const normalized = ENHARMONIC[note] ?? note;
  return CHROMATIC_SHARP.indexOf(normalized);
}

function transposeNote(note: string, semitones: number, preferFlat: boolean): string {
  const index = noteToIndex(note);
  if (index === -1) return note;
  const newIndex = ((index + semitones) % 12 + 12) % 12;
  return preferFlat ? CHROMATIC_FLAT[newIndex] : CHROMATIC_SHARP[newIndex];
}

export function transposeChord(chord: string, semitones: number, targetKey: string): string {
  if (semitones === 0) return chord;

  const rootMatch = chord.match(NOTE_PATTERN);
  if (!rootMatch) return chord;

  const root = rootMatch[1];
  const rest = chord.slice(root.length);

  const preferFlat = FLAT_KEYS.has(targetKey);

  // Detectar nota de bajo
  const bassSlash = rest.lastIndexOf('/');
  let quality = rest;
  let bassNote: string | null = null;

  if (bassSlash !== -1) {
    const potentialBass = rest.slice(bassSlash + 1);
    if (NOTE_PATTERN.test(potentialBass)) {
      quality = rest.slice(0, bassSlash);
      bassNote = potentialBass;
    }
  }

  const newRoot = transposeNote(root, semitones, preferFlat);

  if (bassNote) {
    const newBass = transposeNote(bassNote, semitones, preferFlat);
    return `${newRoot}${quality}/${newBass}`;
  }

  return `${newRoot}${quality}`;
}

export function getInterval(fromKey: string, toKey: string): number {
  const fromRoot = fromKey.match(NOTE_PATTERN)?.[1] ?? fromKey;
  const toRoot = toKey.match(NOTE_PATTERN)?.[1] ?? toKey;

  const fromIdx = noteToIndex(fromRoot);
  const toIdx = noteToIndex(toRoot);

  if (fromIdx === -1 || toIdx === -1) return 0;
  return ((toIdx - fromIdx) + 12) % 12;
}

export function transposeLyrics(
  lyricsChords: string,
  fromKey: string,
  toKey: string,
): string {
  const semitones = getInterval(fromKey, toKey);
  if (semitones === 0) return lyricsChords;

  return lyricsChords.replace(/\[([^\]]+)\]/g, (_match, chord: string) => {
    return `[${transposeChord(chord, semitones, toKey)}]`;
  });
}

export function extractChords(lyricsChords: string): string[] {
  const matches = lyricsChords.match(/\[([^\]]+)\]/g) ?? [];
  return [...new Set(matches.map((m) => m.slice(1, -1)))];
}

export const ALL_KEYS = CHROMATIC_SHARP;
