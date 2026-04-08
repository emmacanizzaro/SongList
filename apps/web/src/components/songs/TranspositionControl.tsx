"use client";

import { clsx } from "clsx";
import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";

const ALL_KEYS = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
];

const KEY_DISPLAY: Record<string, string> = {
  "C#": "C#/Db",
  "D#": "D#/Eb",
  "F#": "F#/Gb",
  "G#": "G#/Ab",
  "A#": "A#/Bb",
};

interface Props {
  originalKey: string;
  currentKey: string;
  onKeyChange: (key: string) => void;
}

export function TranspositionControl({
  originalKey,
  currentKey,
  onKeyChange,
}: Props) {
  const currentIndex =
    ALL_KEYS.indexOf(currentKey) !== -1
      ? ALL_KEYS.indexOf(currentKey)
      : ALL_KEYS.indexOf(originalKey);

  const isOriginal = currentKey === originalKey;

  const semitonesDiff = (() => {
    const orig = ALL_KEYS.indexOf(originalKey);
    const curr = ALL_KEYS.indexOf(currentKey);
    if (orig === -1 || curr === -1) return 0;
    const diff = curr - orig;
    if (diff > 6) return diff - 12;
    if (diff < -6) return diff + 12;
    return diff;
  })();

  const handlePrev = () => {
    const prevIndex = (currentIndex - 1 + 12) % 12;
    onKeyChange(ALL_KEYS[prevIndex]);
  };

  const handleNext = () => {
    const nextIndex = (currentIndex + 1) % 12;
    onKeyChange(ALL_KEYS[nextIndex]);
  };

  return (
    <div className="card p-4 flex items-center gap-4">
      <span className="text-sm font-semibold text-brand-700 whitespace-nowrap">
        Transposición:
      </span>

      {/* Selector de tonalidad */}
      <div className="flex items-center gap-2">
        <button
          onClick={handlePrev}
          className="w-8 h-8 flex items-center justify-center rounded-xl border border-brand-200 hover:border-brand-500 hover:text-brand-600 transition-colors"
          title="Bajar semitono"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="flex gap-1">
          {ALL_KEYS.map((key) => (
            <button
              key={key}
              onClick={() => onKeyChange(key)}
              className={clsx(
                "w-9 h-9 rounded-xl text-xs font-bold transition-all",
                key === currentKey
                  ? "bg-brand-700 text-white shadow-sm scale-110"
                  : key === originalKey
                    ? "bg-brand-50 text-brand-700 border border-brand-200"
                    : "bg-white/60 text-slate-600 hover:bg-brand-50 border border-transparent",
              )}
              title={`Transponer a ${KEY_DISPLAY[key] ?? key}`}
            >
              {key.replace("#", "♯")}
            </button>
          ))}
        </div>

        <button
          onClick={handleNext}
          className="w-8 h-8 flex items-center justify-center rounded-xl border border-brand-200 hover:border-brand-500 hover:text-brand-600 transition-colors"
          title="Subir semitono"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Estado */}
      <div className="flex items-center gap-2 ml-auto">
        {!isOriginal && (
          <>
            <span
              className={clsx(
                "text-xs font-semibold px-2.5 py-1 rounded-full",
                semitonesDiff > 0
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-accent-50 text-accent-700",
              )}
            >
              {semitonesDiff > 0 ? `+${semitonesDiff}` : semitonesDiff} st
            </span>
            <button
              onClick={() => onKeyChange(originalKey)}
              className="text-xs text-slate-400 hover:text-brand-700 flex items-center gap-1 transition-colors"
              title="Volver al tono original"
            >
              <RotateCcw className="w-3 h-3" />
              Original
            </button>
          </>
        )}
        {isOriginal && (
          <span className="text-xs text-slate-400">
            Tono original: {KEY_DISPLAY[originalKey] ?? originalKey}
          </span>
        )}
      </div>
    </div>
  );
}
