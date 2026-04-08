// ─────────────────────────────────────────────
//  Algoritmo de transposición de acordes
//  Usado tanto en el API (NestJS) como en la web (Next.js)
// ─────────────────────────────────────────────

export const CHROMATIC_SHARP = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
export const CHROMATIC_FLAT  = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

export const ALL_KEYS = [...CHROMATIC_SHARP, ...CHROMATIC_FLAT.filter(n => n.includes('b'))];

/** Normaliza bemoles a su equivalente con sostenido para cálculo de índice */
const ENHARMONIC: Record<string, string> = {
  Db: 'C#', Eb: 'D#', Fb: 'E', Gb: 'F#', Ab: 'G#', Bb: 'A#', Cb: 'B',
};

/** Tonalidades donde se prefiere la notación con bemoles */
const FLAT_PREFERENCE = new Set(['F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Dm', 'Gm', 'Cm', 'Fm', 'Bbm', 'Ebm']);

/**
 * Obtiene el índice cromático (0–11) de una nota, normalizando enarmónicos.
 */
function noteIndex(note: string): number {
  const normalized = ENHARMONIC[note] ?? note;
  const idx = CHROMATIC_SHARP.indexOf(normalized);
  return idx === -1 ? CHROMATIC_FLAT.indexOf(note) : idx;
}

/**
 * Transpone una nota individual N semitonos.
 */
export function transposeNote(note: string, semitones: number, preferFlat = false): string {
  const idx = noteIndex(note);
  if (idx === -1) return note;
  const newIdx = ((idx + semitones) % 12 + 12) % 12;
  return preferFlat ? CHROMATIC_FLAT[newIdx] : CHROMATIC_SHARP[newIdx];
}

/**
 * Transpone un acorde completo, preservando calidad y nota de bajo (slash chords).
 * Ejemplos: "Am7" → "Bm7", "C/E" → "D/F#"
 */
export function transposeChord(chord: string, semitones: number, preferFlat = false): string {
  // nota raíz: 1–2 caracteres (letra + opcional # o b)
  const rootMatch = chord.match(/^([A-G][#b]?)(.*)/);
  if (!rootMatch) return chord;

  const [, root, rest] = rootMatch;

  // slash chord: "Am/E" → "Am" + "/E"
  const slashMatch = rest.match(/^([^/]*)\/([A-G][#b]?)(.*)$/);
  if (slashMatch) {
    const [, quality, bassNote, afterBass] = slashMatch;
    const newRoot = transposeNote(root, semitones, preferFlat);
    const newBass = transposeNote(bassNote, semitones, preferFlat);
    return `${newRoot}${quality}/${newBass}${afterBass}`;
  }

  return `${transposeNote(root, semitones, preferFlat)}${rest}`;
}

/**
 * Calcula la cantidad de semitonos entre dos tonalidades (0–11).
 */
export function getInterval(fromKey: string, toKey: string): number {
  const from = noteIndex(fromKey.replace('m', ''));
  const to   = noteIndex(toKey.replace('m', ''));
  if (from === -1 || to === -1) return 0;
  return ((to - from) % 12 + 12) % 12;
}

/**
 * Transpone una cadena completa en formato ChordPro.
 * Los acordes están entre corchetes: [C]Amazing [G]grace
 */
export function transposeLyrics(
  lyricsChords: string,
  options: { fromKey: string; toKey: string },
): string {
  const { fromKey, toKey } = options;
  const semitones = getInterval(fromKey, toKey);
  if (semitones === 0) return lyricsChords;

  const preferFlat = FLAT_PREFERENCE.has(toKey);

  return lyricsChords.replace(/\[([^\]]+)\]/g, (_, chord: string) => {
    return `[${transposeChord(chord, semitones, preferFlat)}]`;
  });
}

/**
 * Extrae todos los acordes únicos de una cadena ChordPro.
 */
export function extractChords(lyricsChords: string): string[] {
  const matches = lyricsChords.match(/\[([^\]]+)\]/g) ?? [];
  const unique = new Set(matches.map(m => m.slice(1, -1)));
  return Array.from(unique);
}

/**
 * Devuelve todas las transposiciones posibles (las 12 tonalidades) de un texto ChordPro.
 */
export function getAllTranspositions(
  lyricsChords: string,
  originalKey: string,
): Record<string, string> {
  const result: Record<string, string> = {};
  for (const key of CHROMATIC_SHARP) {
    result[key] = transposeLyrics(lyricsChords, { fromKey: originalKey, toKey: key });
  }
  return result;
}
