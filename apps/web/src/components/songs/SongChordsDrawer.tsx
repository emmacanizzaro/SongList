"use client";

import { ChordSheet } from "@/components/songs/ChordSheet";
import { TranspositionControl } from "@/components/songs/TranspositionControl";
import { songsApi } from "@/lib/api";
import { transposeLyrics } from "@/lib/transposition";
import { Song } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

interface Props {
  songId: string;
  /** Tonalidad predeterminada (keyOverride de la reunión, si existe) */
  defaultKey?: string;
  onClose: () => void;
}

export function SongChordsDrawer({ songId, defaultKey, onClose }: Props) {
  const { data: song, isLoading } = useQuery<Song>({
    queryKey: ["song", songId],
    queryFn: () => songsApi.get(songId).then((r) => r.data),
  });

  const originalKey =
    song?.versions?.find((v) => v.type === "ORIGINAL")?.key ??
    song?.originalKey ??
    "C";

  const [currentKey, setCurrentKey] = useState<string>(
    defaultKey ?? originalKey,
  );

  // Cuando la canción carga, inicializar la tonalidad
  useEffect(() => {
    if (song) {
      setCurrentKey(defaultKey ?? originalKey);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [song?.id]);

  const originalVersion = song?.versions?.find((v) => v.type === "ORIGINAL");

  const lyricsToShow = useMemo(() => {
    if (!originalVersion) return null;
    if (currentKey === originalKey) return originalVersion.lyricsChords;
    return transposeLyrics(
      originalVersion.lyricsChords,
      originalKey,
      currentKey,
    );
  }, [originalVersion, originalKey, currentKey]);

  // Cerrar con Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  // Bloquear scroll del body mientras el drawer está abierto
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel lateral */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={song ? `Acordes: ${song.title}` : "Acordes"}
        className="fixed inset-y-0 right-0 z-50 flex w-full max-w-xl flex-col bg-white shadow-2xl"
      >
        {/* Header */}
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
          <div>
            {isLoading ? (
              <div className="h-5 w-40 animate-pulse rounded bg-slate-200" />
            ) : (
              <>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                  Acordes
                </p>
                <h2 className="mt-1 text-lg font-bold text-slate-900">
                  {song?.title}
                </h2>
                {song?.artist && (
                  <p className="text-sm text-slate-400">{song.artist}</p>
                )}
              </>
            )}
          </div>
          <button
            onClick={onClose}
            className="shrink-0 rounded-xl p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Transposición */}
        {song && (
          <div className="shrink-0 border-b border-slate-100 px-6 py-4">
            <TranspositionControl
              originalKey={originalKey}
              currentKey={currentKey}
              onKeyChange={setCurrentKey}
            />
          </div>
        )}

        {/* Contenido */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {isLoading && (
            <div className="space-y-4">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="h-4 animate-pulse rounded bg-slate-100"
                  style={{ width: `${60 + (i % 3) * 15}%` }}
                />
              ))}
            </div>
          )}

          {!isLoading && !originalVersion && (
            <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
              <p className="text-sm font-medium text-slate-500">
                Esta canción no tiene versión original con acordes.
              </p>
              <p className="text-xs text-slate-400">
                Agrégala desde el detalle de la canción.
              </p>
            </div>
          )}

          {!isLoading && lyricsToShow && (
            <ChordSheet
              lyricsChords={lyricsToShow}
              currentKey={currentKey}
              fontSize="sm"
            />
          )}
        </div>
      </aside>
    </>
  );
}
