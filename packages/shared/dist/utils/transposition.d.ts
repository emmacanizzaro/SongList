export declare const CHROMATIC_SHARP: string[];
export declare const CHROMATIC_FLAT: string[];
export declare const ALL_KEYS: string[];
/**
 * Transpone una nota individual N semitonos.
 */
export declare function transposeNote(note: string, semitones: number, preferFlat?: boolean): string;
/**
 * Transpone un acorde completo, preservando calidad y nota de bajo (slash chords).
 * Ejemplos: "Am7" → "Bm7", "C/E" → "D/F#"
 */
export declare function transposeChord(chord: string, semitones: number, preferFlat?: boolean): string;
/**
 * Calcula la cantidad de semitonos entre dos tonalidades (0–11).
 */
export declare function getInterval(fromKey: string, toKey: string): number;
/**
 * Transpone una cadena completa en formato ChordPro.
 * Los acordes están entre corchetes: [C]Amazing [G]grace
 */
export declare function transposeLyrics(lyricsChords: string, options: {
    fromKey: string;
    toKey: string;
}): string;
/**
 * Extrae todos los acordes únicos de una cadena ChordPro.
 */
export declare function extractChords(lyricsChords: string): string[];
/**
 * Devuelve todas las transposiciones posibles (las 12 tonalidades) de un texto ChordPro.
 */
export declare function getAllTranspositions(lyricsChords: string, originalKey: string): Record<string, string>;
//# sourceMappingURL=transposition.d.ts.map