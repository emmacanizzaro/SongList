"use strict";
// ─────────────────────────────────────────────
//  Algoritmo de transposición de acordes
//  Usado tanto en el API (NestJS) como en la web (Next.js)
// ─────────────────────────────────────────────
Object.defineProperty(exports, "__esModule", { value: true });
exports.ALL_KEYS = exports.CHROMATIC_FLAT = exports.CHROMATIC_SHARP = void 0;
exports.transposeNote = transposeNote;
exports.transposeChord = transposeChord;
exports.getInterval = getInterval;
exports.transposeLyrics = transposeLyrics;
exports.extractChords = extractChords;
exports.getAllTranspositions = getAllTranspositions;
exports.CHROMATIC_SHARP = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
exports.CHROMATIC_FLAT = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
exports.ALL_KEYS = [...exports.CHROMATIC_SHARP, ...exports.CHROMATIC_FLAT.filter(n => n.includes('b'))];
/** Normaliza bemoles a su equivalente con sostenido para cálculo de índice */
const ENHARMONIC = {
    Db: 'C#', Eb: 'D#', Fb: 'E', Gb: 'F#', Ab: 'G#', Bb: 'A#', Cb: 'B',
};
/** Tonalidades donde se prefiere la notación con bemoles */
const FLAT_PREFERENCE = new Set(['F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Dm', 'Gm', 'Cm', 'Fm', 'Bbm', 'Ebm']);
/**
 * Obtiene el índice cromático (0–11) de una nota, normalizando enarmónicos.
 */
function noteIndex(note) {
    const normalized = ENHARMONIC[note] ?? note;
    const idx = exports.CHROMATIC_SHARP.indexOf(normalized);
    return idx === -1 ? exports.CHROMATIC_FLAT.indexOf(note) : idx;
}
/**
 * Transpone una nota individual N semitonos.
 */
function transposeNote(note, semitones, preferFlat = false) {
    const idx = noteIndex(note);
    if (idx === -1)
        return note;
    const newIdx = ((idx + semitones) % 12 + 12) % 12;
    return preferFlat ? exports.CHROMATIC_FLAT[newIdx] : exports.CHROMATIC_SHARP[newIdx];
}
/**
 * Transpone un acorde completo, preservando calidad y nota de bajo (slash chords).
 * Ejemplos: "Am7" → "Bm7", "C/E" → "D/F#"
 */
function transposeChord(chord, semitones, preferFlat = false) {
    // nota raíz: 1–2 caracteres (letra + opcional # o b)
    const rootMatch = chord.match(/^([A-G][#b]?)(.*)/);
    if (!rootMatch)
        return chord;
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
function getInterval(fromKey, toKey) {
    const from = noteIndex(fromKey.replace('m', ''));
    const to = noteIndex(toKey.replace('m', ''));
    if (from === -1 || to === -1)
        return 0;
    return ((to - from) % 12 + 12) % 12;
}
/**
 * Transpone una cadena completa en formato ChordPro.
 * Los acordes están entre corchetes: [C]Amazing [G]grace
 */
function transposeLyrics(lyricsChords, options) {
    const { fromKey, toKey } = options;
    const semitones = getInterval(fromKey, toKey);
    if (semitones === 0)
        return lyricsChords;
    const preferFlat = FLAT_PREFERENCE.has(toKey);
    return lyricsChords.replace(/\[([^\]]+)\]/g, (_, chord) => {
        return `[${transposeChord(chord, semitones, preferFlat)}]`;
    });
}
/**
 * Extrae todos los acordes únicos de una cadena ChordPro.
 */
function extractChords(lyricsChords) {
    const matches = lyricsChords.match(/\[([^\]]+)\]/g) ?? [];
    const unique = new Set(matches.map(m => m.slice(1, -1)));
    return Array.from(unique);
}
/**
 * Devuelve todas las transposiciones posibles (las 12 tonalidades) de un texto ChordPro.
 */
function getAllTranspositions(lyricsChords, originalKey) {
    const result = {};
    for (const key of exports.CHROMATIC_SHARP) {
        result[key] = transposeLyrics(lyricsChords, { fromKey: originalKey, toKey: key });
    }
    return result;
}
//# sourceMappingURL=transposition.js.map