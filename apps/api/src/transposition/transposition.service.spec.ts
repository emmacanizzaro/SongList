import { TranspositionService } from "./transposition.service";

describe("TranspositionService", () => {
  let service: TranspositionService;

  beforeEach(() => {
    service = new TranspositionService();
  });

  it("transposeNote should move semitones correctly", () => {
    expect(service.transposeNote("C", 2)).toBe("D");
    expect(service.transposeNote("A", 3)).toBe("C");
  });

  it("transposeChord should preserve quality and bass", () => {
    expect(service.transposeChord("F#m7/C#", 2)).toBe("G#m7/D#");
    expect(service.transposeChord("Bbmaj7", 2, true)).toBe("Cmaj7");
  });

  it("transposeLyrics should transform ChordPro content", () => {
    const source = "[C]Amazing [G]grace";
    expect(
      service.transposeLyrics(source, {
        fromKey: "C",
        toKey: "D",
      }),
    ).toBe("[D]Amazing [A]grace");
  });
});
