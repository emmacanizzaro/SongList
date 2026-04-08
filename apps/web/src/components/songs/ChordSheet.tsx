"use client";

import { useMemo } from "react";

interface Props {
  lyricsChords: string;
  currentKey: string;
  fontSize?: "sm" | "base" | "lg";
}

/**
 * ChordSheet — Renderiza letra + acordes en formato ChordPro.
 *
 * Formato de entrada: "[C]Amazing [G]grace how [Am]sweet the [F]sound"
 * Cada sección separada por línea en blanco es una estrofa.
 * Las líneas con solo acordes (sin texto entre corchetes) son líneas de acordes.
 */
export function ChordSheet({
  lyricsChords,
  currentKey,
  fontSize = "base",
}: Props) {
  const sections = useMemo(
    () => parseLyricsChords(lyricsChords),
    [lyricsChords],
  );

  const fontSizeClass = {
    sm: "text-sm",
    base: "text-base",
    lg: "text-lg",
  }[fontSize];

  return (
    <div
      className={`font-mono ${fontSizeClass} leading-loose space-y-8 select-text`}
    >
      {sections.map((section, sIdx) => (
        <section key={sIdx}>
          {section.label && (
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
              {section.label}
            </p>
          )}
          {section.lines.map((line, lIdx) => (
            <ChordSheetLine key={lIdx} line={line} />
          ))}
        </section>
      ))}
    </div>
  );
}

// ── Renders una línea con acordes encima de la letra ──────────

function ChordSheetLine({ line }: { line: ParsedLine }) {
  if (line.parts.length === 0) return <br />;

  // Construir dos filas: acordes arriba, texto abajo
  const chordRow: string[] = [];
  const textRow: string[] = [];

  let chordRowStr = "";
  let textRowStr = "";

  for (const part of line.parts) {
    const chord = part.chord ?? "";
    const text = part.text;

    const colWidth = Math.max(chord.length + 1, text.length);
    chordRowStr += chord.padEnd(colWidth);
    textRowStr += text.padEnd(colWidth);
  }

  // Si no hay acordes en la línea, solo mostramos texto
  const hasChords = line.parts.some((p) => p.chord);

  return (
    <div className="mb-1">
      {hasChords && (
        <div className="whitespace-pre text-brand-700 font-bold text-sm leading-tight tracking-wide">
          {chordRowStr}
        </div>
      )}
      <div className="whitespace-pre text-gray-800">{textRowStr || " "}</div>
    </div>
  );
}

// ── Parser de formato ChordPro ────────────────────────────────

interface ParsedPart {
  chord?: string;
  text: string;
}

interface ParsedLine {
  parts: ParsedPart[];
}

interface ParsedSection {
  label?: string;
  lines: ParsedLine[];
}

function parseLyricsChords(input: string): ParsedSection[] {
  // Dividir por líneas en blanco → secciones
  const rawSections = input.split(/\n\n+/);
  const sections: ParsedSection[] = [];

  for (const rawSection of rawSections) {
    const lines = rawSection.split("\n");
    const label = extractSectionLabel(lines[0]);
    const contentLines = label ? lines.slice(1) : lines;

    const parsedLines: ParsedLine[] = contentLines.map(parseLine);

    sections.push({ label: label ?? undefined, lines: parsedLines });
  }

  return sections;
}

function parseLine(line: string): ParsedLine {
  const parts: ParsedPart[] = [];
  const regex = /\[([^\]]+)\]([^\[]*)/g;
  let match: RegExpExecArray | null;
  let lastIndex = 0;

  // Texto antes del primer acorde
  const firstBracket = line.indexOf("[");
  if (firstBracket > 0) {
    parts.push({ text: line.slice(0, firstBracket) });
    lastIndex = firstBracket;
  }

  while ((match = regex.exec(line)) !== null) {
    parts.push({ chord: match[1], text: match[2] ?? "" });
    lastIndex = regex.lastIndex;
  }

  // Texto residual
  if (lastIndex < line.length && firstBracket === -1) {
    parts.push({ text: line });
  }

  return { parts };
}

function extractSectionLabel(line: string): string | null {
  const match = line.match(/^\[?\/?([A-ZÁÉÍÓÚ][a-záéíóú ]+)\]?:?\s*$/);
  if (match) return match[1];
  // Secciones comunes
  if (
    /^(Intro|Verso|Estrofa|Coro|Bridge|Pre-Coro|Puente|Final|Outro):?$/i.test(
      line.trim(),
    )
  ) {
    return line.trim();
  }
  return null;
}
