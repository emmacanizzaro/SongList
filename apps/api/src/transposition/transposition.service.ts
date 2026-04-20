import { Injectable } from '@nestjs/common';

// ============================================================
// MOTOR DE TRANSPOSICIÓN DE ACORDES - SONGLIST SAAS
// ============================================================
// Soporta:
//  - Notas con bemol y sostenido: C#, Db, Bb, F#, etc.
//  - Acordes complejos: Cmaj7, Dm7, G#sus4, F#m/C#, Am/G, etc.
//  - Formato ChordPro: [C]Amazing [G7]grace
//  - Preferencia automática de bemol/sostenido según tonalidad

// --- Escalas cromáticas ---
const CHROMATIC_SHARP = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const CHROMATIC_FLAT  = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

// Normalización de enarmónicos (bemol → sostenido para cálculo de índice)
const ENHARMONIC: Record<string, string> = {
  'Cb': 'B', 'Db': 'C#', 'Eb': 'D#', 'Fb': 'E',
  'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#',
};

// Tonalidades que prefieren notación con bemoles
const FLAT_PREFERENCE = new Set([
  'F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb',
  'Dm', 'Gm', 'Cm', 'Fm', 'Bbm', 'Ebm',
]);

// Todas las notas válidas como raíz de acorde (orden importa: notas largas primero)
const NOTE_PATTERN = /^([A-G][b#]?)/;

export interface TransposeOptions {
  fromKey: string;
  toKey: string;
}

@Injectable()
export class TranspositionService {
  /**
   * Transpone todo el texto de letra+acordes en formato ChordPro.
   * Ejemplo: "[C]Amazing [G]grace" → "[D]Amazing [A]grace" (C→D, +2 semitonos)
   */
  transposeLyrics(lyricsChords: string, options: TransposeOptions): string {
    const { fromKey, toKey } = options;
    const semitones = this.getInterval(fromKey, toKey);

    if (semitones === 0) return lyricsChords;

    const preferFlat = FLAT_PREFERENCE.has(toKey);

    return lyricsChords.replace(/\[([^\]]+)\]/g, (_match, chord: string) => {
      return `[${this.transposeChord(chord, semitones, preferFlat)}]`;
    });
  }

  /**
   * Transpone un acorde individual.
   * Soporta: C, Cm, C#, C#m7, Cmaj7, Csus4, C/E, Cm7/Bb, etc.
   */
  transposeChord(chord: string, semitones: number, preferFlat?: boolean): string {
    if (semitones === 0) return chord;

    // Extraer nota raíz
    const rootMatch = chord.match(NOTE_PATTERN);
    if (!rootMatch) return chord; // No es un acorde

    const root = rootMatch[1];
    const rest = chord.slice(root.length);

    // Detectar nota de bajo (/X al final)
    const bassSlashIdx = rest.lastIndexOf('/');
    let quality = rest;
    let bassNote: string | null = null;

    if (bassSlashIdx !== -1) {
      const potentialBass = rest.slice(bassSlashIdx + 1);
      if (NOTE_PATTERN.test(potentialBass)) {
        quality = rest.slice(0, bassSlashIdx);
        bassNote = potentialBass;
      }
    }

    const useFlatNotation = preferFlat ?? FLAT_PREFERENCE.has(root);

    const newRoot = this.transposeNote(root, semitones, useFlatNotation);

    if (bassNote) {
      const newBass = this.transposeNote(bassNote, semitones, useFlatNotation);
      return `${newRoot}${quality}/${newBass}`;
    }

    return `${newRoot}${quality}`;
  }

  /**
   * Transpone una nota individual dado un número de semitonos.
   */
  transposeNote(note: string, semitones: number, preferFlat = false): string {
    const index = this.noteToIndex(note);
    if (index === -1) return note;

    const newIndex = ((index + semitones) % 12 + 12) % 12;

    return preferFlat ? CHROMATIC_FLAT[newIndex] : CHROMATIC_SHARP[newIndex];
  }

  /**
   * Calcula el intervalo en semitonos entre dos tonalidades.
   * Ejemplo: C→G = 7, C→Bb = 10
   */
  getInterval(fromKey: string, toKey: string): number {
    const fromRoot = this.extractRootFromKey(fromKey);
    const toRoot = this.extractRootFromKey(toKey);

    const fromIndex = this.noteToIndex(fromRoot);
    const toIndex = this.noteToIndex(toRoot);

    if (fromIndex === -1 || toIndex === -1) return 0;

    return ((toIndex - fromIndex) + 12) % 12;
  }

  /**
   * Genera las 12 transposiciones posibles de una canción.
   * Útil para mostrar selector visual de tonalidad.
   */
  getAllTranspositions(
    lyricsChords: string,
    originalKey: string,
  ): Array<{ key: string; lyricsChords: string }> {
    const results: Array<{ key: string; lyricsChords: string }> = [];

    for (let semitones = 0; semitones < 12; semitones++) {
      const newKey = this.transposeNote(
        this.extractRootFromKey(originalKey),
        semitones,
        FLAT_PREFERENCE.has(originalKey),
      );
      results.push({
        key: newKey,
        lyricsChords: semitones === 0
          ? lyricsChords
          : this.transposeLyrics(lyricsChords, {
              fromKey: originalKey,
              toKey: newKey,
            }),
      });
    }

    return results;
  }

  /**
   * Detecta todos los acordes únicos en un texto ChordPro.
   */
  extractChords(lyricsChords: string): string[] {
    const matches = lyricsChords.match(/\[([^\]]+)\]/g) ?? [];
    const chords = matches.map((m) => m.slice(1, -1));
    return [...new Set(chords)];
  }

  // ──────────────────────────────────────────────
  // HELPERS PRIVADOS
  // ──────────────────────────────────────────────

  private noteToIndex(note: string): number {
    const normalized = ENHARMONIC[note] ?? note;
    return CHROMATIC_SHARP.indexOf(normalized);
  }

  /** Extrae la nota raíz de una tonalidad (e.g. "F#m" → "F#", "Bb" → "Bb") */
  private extractRootFromKey(key: string): string {
    const match = key.match(NOTE_PATTERN);
    return match ? match[1] : key;
  }
}
