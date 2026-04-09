"use client";

import { songsApi } from "@/lib/api";
import { Song } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Music2, Plus, Search, Tag, X } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

// Orden cromático para mostrar las tonalidades ordenadas musicalmente
const KEY_ORDER = [
  "C", "C#", "Db", "D", "D#", "Eb", "E", "F",
  "F#", "Gb", "G", "G#", "Ab", "A", "A#", "Bb", "B",
  "Cm", "C#m", "Dbm", "Dm", "D#m", "Ebm", "Em", "Fm",
  "F#m", "Gbm", "Gm", "G#m", "Abm", "Am", "A#m", "Bbm", "Bm",
];

function sortKeys(keys: string[]): string[] {
  return [...keys].sort((a, b) => {
    const ai = KEY_ORDER.indexOf(a);
    const bi = KEY_ORDER.indexOf(b);
    if (ai === -1 && bi === -1) return a.localeCompare(b);
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });
}

export default function SongsPage() {
  const [search, setSearch] = useState("");
  const [keyFilter, setKeyFilter] = useState("");

  const { data: songs = [], isLoading } = useQuery<Song[]>({
    queryKey: ["songs", search],
    queryFn: () => songsApi.list(search || undefined).then((r) => r.data),
  });

  // Tonalidades únicas presentes en el repertorio
  const availableKeys = useMemo(
    () => sortKeys([...new Set(songs.map((s) => s.originalKey))]),
    [songs],
  );

  // Canciones visibles aplicando el filtro de tonalidad
  const visibleSongs = useMemo(
    () => (keyFilter ? songs.filter((s) => s.originalKey === keyFilter) : songs),
    [songs, keyFilter],
  );

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <section className="relative overflow-hidden rounded-[32px] bg-slate-950 px-6 py-8 text-white shadow-[0_28px_60px_rgba(15,23,42,0.22)] sm:px-8 lg:px-10">
        <div className="pointer-events-none absolute inset-0 music-notes-bg opacity-20" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(188,132,47,0.22),transparent_24%),radial-gradient(circle_at_bottom_left,rgba(31,77,143,0.28),transparent_30%)]" />
        <div className="relative flex flex-col gap-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="eyebrow bg-white/10 text-slate-200">Biblioteca</p>
              <h1 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">
                Canciones
              </h1>
              <p className="mt-3 text-sm leading-6 text-slate-300 sm:text-base">
                Mantén tu repertorio ordenado en un espacio visualmente más
                limpio, con los controles arriba y el contenido centrado.
              </p>
            </div>
            <Link
              href="/songs/new"
              className="btn-primary self-start lg:self-auto"
            >
              <Plus className="h-4 w-4" />
              Nueva canción
            </Link>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
            <div className="rounded-[28px] border border-white/10 bg-white/6 p-4 backdrop-blur-md sm:p-5">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                {/* Búsqueda por texto */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Buscar por título, artista o etiqueta..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="input border-white/10 bg-white/90 pl-10 text-slate-900"
                  />
                </div>

                {/* Filtro por tonalidad */}
                <div className="relative shrink-0">
                  <select
                    value={keyFilter}
                    onChange={(e) => setKeyFilter(e.target.value)}
                    className="input appearance-none border-white/10 bg-white/90 pr-8 text-slate-900 lg:w-36"
                  >
                    <option value="">Todas las tonalidades</option>
                    {availableKeys.map((key) => (
                      <option key={key} value={key}>
                        {key}
                      </option>
                    ))}
                  </select>
                  {keyFilter && (
                    <button
                      onClick={() => setKeyFilter("")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-slate-400 hover:text-slate-700"
                      aria-label="Limpiar filtro de tonalidad"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                {/* Contador */}
                <div className="rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-sm text-slate-200 shrink-0">
                  {visibleSongs.length}{" "}
                  {visibleSongs.length === 1 ? "canción" : "canciones"}
                  {keyFilter && (
                    <span className="ml-1 font-semibold text-accent-300">
                      en {keyFilter}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur-md">
              <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">
                Flujo recomendado
              </p>
              <p className="mt-3 text-sm leading-6 text-slate-200">
                Carga primero la letra con acordes en versión original. Desde el
                detalle luego podrás transponer y generar variantes.
              </p>
              <Link
                href="/songs/new"
                className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-accent-300 transition-colors hover:text-accent-200"
              >
                Abrir alta de canción
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card animate-pulse p-4">
              <div className="mb-2 h-4 w-1/3 rounded bg-brand-100" />
              <div className="h-3 w-1/4 rounded bg-brand-50" />
            </div>
          ))}
        </div>
      ) : visibleSongs.length === 0 ? (
        <div className="card px-8 py-16 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-brand-50 dark:bg-brand-900/20">
            <Music2 className="h-8 w-8 text-brand-600 dark:text-brand-300" />
          </div>
          <h3 className="font-semibold text-slate-700 dark:text-slate-100">
            {search || keyFilter
              ? "No se encontraron resultados"
              : "Aún no hay canciones"}
          </h3>
          <p className="mt-1 text-sm text-slate-400">
            {keyFilter
              ? `No hay canciones en tonalidad ${keyFilter}`
              : search
                ? "Intenta otra búsqueda"
                : "Agrega tu primera canción para comenzar"}
          </p>
          {keyFilter ? (
            <button
              onClick={() => setKeyFilter("")}
              className="btn-secondary mt-5 inline-flex"
            >
              <X className="h-4 w-4" />
              Limpiar filtro
            </button>
          ) : (
            !search && (
              <Link href="/songs/new" className="btn-primary mt-5 inline-flex">
                <Plus className="h-4 w-4" />
                Agregar canción
              </Link>
            )
          )}
        </div>
      ) : (
        <div className="grid gap-3 xl:grid-cols-2">
          {visibleSongs.map((song) => (
            <Link
              key={song.id}
              href={`/songs/${song.id}`}
              className="card group flex items-center justify-between gap-4 p-4 transition-all hover:-translate-y-0.5 hover:border-brand-400"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-brand-700">
                  <span className="text-xs font-bold text-white">
                    {song.originalKey}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-slate-900 transition-colors group-hover:text-brand-700 dark:text-white dark:group-hover:text-brand-300">
                    {song.title}
                  </p>
                  {song.artist && (
                    <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">
                      {song.artist}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-end gap-2">
                {song.tags.slice(0, 2).map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 rounded-full border border-brand-100 bg-brand-50 px-2 py-1 text-xs text-brand-700 dark:border-brand-800 dark:bg-brand-900/20 dark:text-brand-300"
                  >
                    <Tag className="h-3 w-3" />
                    {tag}
                  </span>
                ))}
                {song.bpm && (
                  <span className="text-xs tabular-nums text-slate-400 dark:text-slate-500">
                    {song.bpm} BPM
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}


  const { data: songs = [], isLoading } = useQuery<Song[]>({
    queryKey: ["songs", search],
    queryFn: () => songsApi.list(search || undefined).then((r) => r.data),
  });

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <section className="relative overflow-hidden rounded-[32px] bg-slate-950 px-6 py-8 text-white shadow-[0_28px_60px_rgba(15,23,42,0.22)] sm:px-8 lg:px-10">
        <div className="pointer-events-none absolute inset-0 music-notes-bg opacity-20" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(188,132,47,0.22),transparent_24%),radial-gradient(circle_at_bottom_left,rgba(31,77,143,0.28),transparent_30%)]" />
        <div className="relative flex flex-col gap-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="eyebrow bg-white/10 text-slate-200">Biblioteca</p>
              <h1 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">
                Canciones
              </h1>
              <p className="mt-3 text-sm leading-6 text-slate-300 sm:text-base">
                Mantén tu repertorio ordenado en un espacio visualmente más
                limpio, con los controles arriba y el contenido centrado.
              </p>
            </div>
            <Link
              href="/songs/new"
              className="btn-primary self-start lg:self-auto"
            >
              <Plus className="h-4 w-4" />
              Nueva canción
            </Link>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
            <div className="rounded-[28px] border border-white/10 bg-white/6 p-4 backdrop-blur-md sm:p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Buscar por título, artista o etiqueta..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="input border-white/10 bg-white/90 pl-10 text-slate-900"
                  />
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-sm text-slate-200">
                  {songs.length} canciones visibles
                </div>
              </div>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur-md">
              <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">
                Flujo recomendado
              </p>
              <p className="mt-3 text-sm leading-6 text-slate-200">
                Carga primero la letra con acordes en versión original. Desde el
                detalle luego podrás transponer y generar variantes.
              </p>
              <Link
                href="/songs/new"
                className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-accent-300 transition-colors hover:text-accent-200"
              >
                Abrir alta de canción
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card animate-pulse p-4">
              <div className="mb-2 h-4 w-1/3 rounded bg-brand-100" />
              <div className="h-3 w-1/4 rounded bg-brand-50" />
            </div>
          ))}
        </div>
      ) : songs.length === 0 ? (
        <div className="card px-8 py-16 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-brand-50 dark:bg-brand-900/20">
            <Music2 className="h-8 w-8 text-brand-600 dark:text-brand-300" />
          </div>
          <h3 className="font-semibold text-slate-700 dark:text-slate-100">
            {search ? "No se encontraron resultados" : "Aún no hay canciones"}
          </h3>
          <p className="mt-1 text-sm text-slate-400 dark:text-slate-400">
            {search
              ? "Intenta otra búsqueda"
              : "Agrega tu primera canción para comenzar"}
          </p>
          {!search && (
            <Link href="/songs/new" className="btn-primary mt-5 inline-flex">
              <Plus className="h-4 w-4" />
              Agregar canción
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-3 xl:grid-cols-2">
          {songs.map((song) => (
            <Link
              key={song.id}
              href={`/songs/${song.id}`}
              className="card group flex items-center justify-between gap-4 p-4 transition-all hover:-translate-y-0.5 hover:border-brand-400"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-brand-700">
                  <span className="text-xs font-bold text-white">
                    {song.originalKey}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-slate-900 transition-colors group-hover:text-brand-700 dark:text-white dark:group-hover:text-brand-300">
                    {song.title}
                  </p>
                  {song.artist && (
                    <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">
                      {song.artist}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-end gap-2">
                {song.tags.slice(0, 2).map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 rounded-full border border-brand-100 bg-brand-50 px-2 py-1 text-xs text-brand-700 dark:border-brand-800 dark:bg-brand-900/20 dark:text-brand-300"
                  >
                    <Tag className="h-3 w-3" />
                    {tag}
                  </span>
                ))}
                {song.bpm && (
                  <span className="text-xs tabular-nums text-slate-400 dark:text-slate-500">
                    {song.bpm} BPM
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
