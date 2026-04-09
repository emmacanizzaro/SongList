export interface TransposeOptions {
    fromKey: string;
    toKey: string;
}
export declare class TranspositionService {
    transposeLyrics(lyricsChords: string, options: TransposeOptions): string;
    transposeChord(chord: string, semitones: number, preferFlat?: boolean): string;
    transposeNote(note: string, semitones: number, preferFlat?: boolean): string;
    getInterval(fromKey: string, toKey: string): number;
    getAllTranspositions(lyricsChords: string, originalKey: string): Array<{
        key: string;
        lyricsChords: string;
    }>;
    extractChords(lyricsChords: string): string[];
    private noteToIndex;
    private extractRootFromKey;
}
