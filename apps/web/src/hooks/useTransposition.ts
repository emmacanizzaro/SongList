import { useState, useEffect, useMemo } from 'react';
import { Song } from '@/types';
import { transposeLyrics, ALL_KEYS } from '@/lib/transposition';

interface UseTranspositionReturn {
  currentKey: string;
  setKey: (key: string) => void;
  semitonesDiff: number;
  transposedLyrics: string | null;
  isTransposing: boolean;
  resetToOriginal: () => void;
}

/**
 * useTransposition — Gestiona el estado de transposición de una canción.
 *
 * La transposición ocurre INSTANTÁNEAMENTE en el cliente (sin llamada al
 * servidor) usando el mismo algoritmo que el backend. El servidor es
 * usado opcionalmente para guardar versiones persistentes.
 */
export function useTransposition(song: Song | undefined): UseTranspositionReturn {
  const originalKey = song?.versions?.find((v) => v.type === 'ORIGINAL')?.key
    ?? song?.originalKey
    ?? 'C';

  const [currentKey, setCurrentKey] = useState<string>(originalKey);

  // Sincronizar con la canción cuando cambia
  useEffect(() => {
    setCurrentKey(originalKey);
  }, [originalKey]);

  const semitonesDiff = useMemo(() => {
    const orig = ALL_KEYS.indexOf(originalKey);
    const curr = ALL_KEYS.indexOf(currentKey);
    if (orig === -1 || curr === -1) return 0;
    const diff = curr - orig;
    if (diff > 6) return diff - 12;
    if (diff < -6) return diff + 12;
    return diff;
  }, [originalKey, currentKey]);

  const transposedLyrics = useMemo(() => {
    const originalVersion = song?.versions?.find((v) => v.type === 'ORIGINAL');
    if (!originalVersion || currentKey === originalKey) return null;

    return transposeLyrics(
      originalVersion.lyricsChords,
      originalKey,
      currentKey,
    );
  }, [song, currentKey, originalKey]);

  return {
    currentKey,
    setKey: setCurrentKey,
    semitonesDiff,
    transposedLyrics,
    isTransposing: false, // La transposición es síncrona en el cliente
    resetToOriginal: () => setCurrentKey(originalKey),
  };
}
