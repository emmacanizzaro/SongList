"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TranspositionService = void 0;
const common_1 = require("@nestjs/common");
const CHROMATIC_SHARP = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const CHROMATIC_FLAT = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
const ENHARMONIC = {
    'Cb': 'B', 'Db': 'C#', 'Eb': 'D#', 'Fb': 'E',
    'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#',
};
const FLAT_PREFERENCE = new Set([
    'F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb',
    'Dm', 'Gm', 'Cm', 'Fm', 'Bbm', 'Ebm',
]);
const NOTE_PATTERN = /^([A-G][b#]?)/;
let TranspositionService = class TranspositionService {
    transposeLyrics(lyricsChords, options) {
        const { fromKey, toKey } = options;
        const semitones = this.getInterval(fromKey, toKey);
        if (semitones === 0)
            return lyricsChords;
        const preferFlat = FLAT_PREFERENCE.has(toKey);
        return lyricsChords.replace(/\[([^\]]+)\]/g, (_match, chord) => {
            return `[${this.transposeChord(chord, semitones, preferFlat)}]`;
        });
    }
    transposeChord(chord, semitones, preferFlat) {
        if (semitones === 0)
            return chord;
        const rootMatch = chord.match(NOTE_PATTERN);
        if (!rootMatch)
            return chord;
        const root = rootMatch[1];
        const rest = chord.slice(root.length);
        const bassSlashIdx = rest.lastIndexOf('/');
        let quality = rest;
        let bassNote = null;
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
    transposeNote(note, semitones, preferFlat = false) {
        const index = this.noteToIndex(note);
        if (index === -1)
            return note;
        const newIndex = ((index + semitones) % 12 + 12) % 12;
        return preferFlat ? CHROMATIC_FLAT[newIndex] : CHROMATIC_SHARP[newIndex];
    }
    getInterval(fromKey, toKey) {
        const fromRoot = this.extractRootFromKey(fromKey);
        const toRoot = this.extractRootFromKey(toKey);
        const fromIndex = this.noteToIndex(fromRoot);
        const toIndex = this.noteToIndex(toRoot);
        if (fromIndex === -1 || toIndex === -1)
            return 0;
        return ((toIndex - fromIndex) + 12) % 12;
    }
    getAllTranspositions(lyricsChords, originalKey) {
        const results = [];
        for (let semitones = 0; semitones < 12; semitones++) {
            const newKey = this.transposeNote(this.extractRootFromKey(originalKey), semitones, FLAT_PREFERENCE.has(originalKey));
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
    extractChords(lyricsChords) {
        const matches = lyricsChords.match(/\[([^\]]+)\]/g) ?? [];
        const chords = matches.map((m) => m.slice(1, -1));
        return [...new Set(chords)];
    }
    noteToIndex(note) {
        const normalized = ENHARMONIC[note] ?? note;
        return CHROMATIC_SHARP.indexOf(normalized);
    }
    extractRootFromKey(key) {
        const match = key.match(NOTE_PATTERN);
        return match ? match[1] : key;
    }
};
exports.TranspositionService = TranspositionService;
exports.TranspositionService = TranspositionService = __decorate([
    (0, common_1.Injectable)()
], TranspositionService);
//# sourceMappingURL=transposition.service.js.map