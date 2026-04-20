"use client";

import { SongChordsDrawer } from "@/components/songs/SongChordsDrawer";
import { useAuth } from "@/hooks/useAuth";
import { churchApi, instrumentsApi, meetingsApi, songsApi } from "@/lib/api";
import { formatLongSpanishDateWithYear } from "@/lib/dates";
import { Instrument, Meeting, MeetingSong, Membership } from "@/types";
import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import clsx from "clsx";
import {
  ArrowLeft,
  BookOpen,
  GripVertical,
  Loader2,
  Plus,
  Printer,
  Share2,
  Trash2,
  UserPlus,
  Users2,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

export default function MeetingDetailPage() {
  const { user } = useAuth();
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [songId, setSongId] = useState("");
  const [keyOverride, setKeyOverride] = useState("");
  const [songNotes, setSongNotes] = useState("");
  const [assignUserId, setAssignUserId] = useState("");
  const [assignInstrumentId, setAssignInstrumentId] = useState("");
  const [chordsDrawer, setChordsDrawer] = useState<{
    songId: string;
    defaultKey?: string;
  } | null>(null);

  const { data: meeting, isLoading } = useQuery<Meeting>({
    queryKey: ["meeting", id],
    queryFn: () => meetingsApi.get(id).then((r) => r.data),
  });

  const { data: songs = [] } = useQuery({
    queryKey: ["songs-for-meeting"],
    queryFn: () => songsApi.list().then((r) => r.data),
  });

  const { data: members = [] } = useQuery<Membership[]>({
    queryKey: ["church-members"],
    queryFn: () => churchApi.getMembers().then((r) => r.data),
  });

  const { data: instruments = [] } = useQuery<Instrument[]>({
    queryKey: ["instruments"],
    queryFn: () => instrumentsApi.list().then((r) => r.data),
  });

  const assignedUserIds = useMemo(
    () => new Set(meeting?.assignments.map((a) => a.userId) ?? []),
    [meeting],
  );

  const availableMembers = useMemo(
    () => members.filter((m) => !assignedUserIds.has(m.userId)),
    [members, assignedUserIds],
  );

  const availableSongs = useMemo(() => {
    if (!meeting) return songs;
    const includedIds = new Set(
      meeting.meetingSongs.map((item) => item.songId),
    );
    return songs.filter((song: any) => !includedIds.has(song.id));
  }, [meeting, songs]);

  const canEditMeetings = user?.currentRole !== "READER";

  // ── Drag & Drop ───────────────────────────────────────────
  const [orderedSongs, setOrderedSongs] = useState<MeetingSong[]>([]);

  useEffect(() => {
    if (meeting) setOrderedSongs(meeting.meetingSongs);
  }, [meeting]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const reorderMutation = useMutation({
    mutationFn: (orderedSongIds: string[]) =>
      meetingsApi.reorderSongs(id, orderedSongIds),
    onError: () => {
      if (meeting) setOrderedSongs(meeting.meetingSongs);
      toast.error("No se pudo reordenar");
    },
  });

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setOrderedSongs((prev) => {
      const oldIndex = prev.findIndex((ms) => ms.id === active.id);
      const newIndex = prev.findIndex((ms) => ms.id === over.id);
      const next = arrayMove(prev, oldIndex, newIndex);
      reorderMutation.mutate(next.map((ms) => ms.songId));
      return next;
    });
  }

  const shareMutation = useMutation({
    mutationFn: () => meetingsApi.generateShare(id),
    onSuccess: (res) => {
      const token = res.data.shareToken;
      const url = `${window.location.origin}/public/meetings/${token}`;
      navigator.clipboard.writeText(url);
      toast.success("¡Link copiado al portapapeles!");
      queryClient.invalidateQueries({ queryKey: ["meeting", id] });
    },
  });

  const addSongMutation = useMutation({
    mutationFn: () =>
      meetingsApi.addSong(id, {
        songId,
        keyOverride: keyOverride || undefined,
        notes: songNotes || undefined,
      }),
    onSuccess: async () => {
      toast.success("Canción agregada a la reunión");
      setSongId("");
      setKeyOverride("");
      setSongNotes("");
      await queryClient.invalidateQueries({ queryKey: ["meeting", id] });
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message?.join?.(", ") ||
        error?.response?.data?.message ||
        "No se pudo agregar la canción";
      toast.error(message);
    },
  });

  const removeSongMutation = useMutation({
    mutationFn: (meetingSongId: string) =>
      meetingsApi.removeSong(id, meetingSongId),
    onSuccess: async () => {
      toast.success("Canción eliminada de la reunión");
      await queryClient.invalidateQueries({ queryKey: ["meeting", id] });
    },
    onError: () => {
      toast.error("No se pudo eliminar la canción");
    },
  });

  const assignMutation = useMutation({
    mutationFn: () =>
      meetingsApi.assign(id, {
        userId: assignUserId,
        instrumentId: assignInstrumentId,
      }),
    onSuccess: async () => {
      toast.success("Músico asignado");
      setAssignUserId("");
      setAssignInstrumentId("");
      await queryClient.invalidateQueries({ queryKey: ["meeting", id] });
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || "No se pudo asignar el músico";
      toast.error(message);
    },
  });

  const unassignMutation = useMutation({
    mutationFn: (assignmentId: string) =>
      meetingsApi.unassign(id, assignmentId),
    onSuccess: async () => {
      toast.success("Músico removido de la reunión");
      await queryClient.invalidateQueries({ queryKey: ["meeting", id] });
    },
    onError: () => {
      toast.error("No se pudo remover el músico");
    },
  });

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/3" />
        <div className="h-64 bg-gray-100 rounded-xl mt-8" />
      </div>
    );
  }

  if (!meeting) return <div>Reunión no encontrada</div>;

  return (
    <>
      {chordsDrawer && (
        <SongChordsDrawer
          songId={chordsDrawer.songId}
          defaultKey={chordsDrawer.defaultKey}
          onClose={() => setChordsDrawer(null)}
        />
      )}
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <Link
          href="/meetings"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 transition-colors hover:text-brand-700 dark:text-slate-400 dark:hover:text-brand-300"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a reuniones
        </Link>

        <section className="relative overflow-hidden rounded-[32px] bg-slate-950 px-6 py-8 text-white shadow-[0_28px_60px_rgba(15,23,42,0.22)] sm:px-8 lg:px-10">
          <div className="pointer-events-none absolute inset-0 music-notes-bg opacity-20" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(188,132,47,0.22),transparent_24%),radial-gradient(circle_at_bottom_left,rgba(31,77,143,0.28),transparent_30%)]" />
          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="eyebrow bg-white/10 text-slate-200">Reunión</p>
              <h1 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">
                {meeting.title}
              </h1>
              <p className="mt-2 text-sm text-slate-300 sm:text-base">
                {formatLongSpanishDateWithYear(new Date(meeting.date))}
              </p>
            </div>
            {canEditMeetings ? (
              <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
                <Link
                  href={`/meetings/${id}/print`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary border-white/10 bg-white/8 text-white hover:bg-white/12"
                >
                  <Printer className="h-4 w-4" />
                  Imprimir setlist
                </Link>
                <button
                  onClick={() => shareMutation.mutate()}
                  disabled={shareMutation.isPending}
                  className="btn-secondary border-white/10 bg-white/8 text-white hover:bg-white/12"
                >
                  {shareMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Compartiendo...
                    </>
                  ) : (
                    <>
                      <Share2 className="h-4 w-4" />
                      {meeting.shareToken ? "Copiar link" : "Compartir"}
                    </>
                  )}
                </button>
              </div>
            ) : (
              <span className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-xs font-medium text-slate-200">
                Visualizador
              </span>
            )}
          </div>
        </section>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-3 lg:col-span-2">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-slate-900 dark:text-white">
                Lista de canciones
              </h2>
            </div>

            <div className="card p-4 sm:p-5">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                Agregar canción
              </p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <select
                  className="input"
                  value={songId}
                  onChange={(event) => setSongId(event.target.value)}
                  disabled={!canEditMeetings}
                >
                  <option value="">Selecciona una canción...</option>
                  {availableSongs.map((song: any) => (
                    <option key={song.id} value={song.id}>
                      {song.title}
                    </option>
                  ))}
                </select>
                <input
                  className="input"
                  placeholder="Tonalidad opcional (ej: D)"
                  value={keyOverride}
                  onChange={(event) => setKeyOverride(event.target.value)}
                  disabled={!canEditMeetings}
                />
                <input
                  className="input sm:col-span-2"
                  placeholder="Nota opcional para esta reunión"
                  value={songNotes}
                  onChange={(event) => setSongNotes(event.target.value)}
                  disabled={!canEditMeetings}
                />
              </div>
              <button
                disabled={
                  !songId || addSongMutation.isPending || !canEditMeetings
                }
                onClick={() => addSongMutation.mutate()}
                className="btn-primary mt-3 w-full disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {addSongMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Agregando...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    {canEditMeetings ? "Agregar a la reunión" : "Solo lectura"}
                  </>
                )}
              </button>
            </div>

            {meeting.meetingSongs.length === 0 ? (
              <div className="card p-8 text-center text-sm text-gray-400 dark:text-slate-400">
                No hay canciones. Agrega la primera.
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={canEditMeetings ? handleDragEnd : undefined}
              >
                <SortableContext
                  items={orderedSongs.map((ms) => ms.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-2">
                    {orderedSongs.map((ms, idx) => (
                      <SortableSongRow
                        key={ms.id}
                        ms={ms}
                        index={idx + 1}
                        canEdit={canEditMeetings}
                        onRemove={() => removeSongMutation.mutate(ms.id)}
                        isRemoving={removeSongMutation.isPending}
                        onViewChords={() =>
                          setChordsDrawer({
                            songId: ms.songId,
                            defaultKey: ms.keyOverride ?? ms.song.originalKey,
                          })
                        }
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Users2 className="h-4 w-4 text-brand-600 dark:text-brand-400" />
              <h2 className="font-semibold text-slate-900 dark:text-white">
                Músicos asignados
              </h2>
              <span className="ml-auto rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                {meeting.assignments.length}
              </span>
            </div>

            {/* Formulario de asignación */}
            {canEditMeetings && (
              <div className="card p-4 sm:p-5">
                <p className="flex items-center gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-200">
                  <UserPlus className="h-4 w-4 text-brand-600" />
                  Asignar músico
                </p>
                <div className="mt-3 space-y-2">
                  <select
                    className="input"
                    value={assignUserId}
                    onChange={(e) => setAssignUserId(e.target.value)}
                  >
                    <option value="">Selecciona un miembro...</option>
                    {availableMembers.map((m) => (
                      <option key={m.userId} value={m.userId}>
                        {m.user.name}
                      </option>
                    ))}
                  </select>
                  <select
                    className="input"
                    value={assignInstrumentId}
                    onChange={(e) => setAssignInstrumentId(e.target.value)}
                  >
                    <option value="">Selecciona un instrumento...</option>
                    {instruments.map((inst) => (
                      <option key={inst.id} value={inst.id}>
                        {inst.icon ? `${inst.icon} ` : ""}
                        {inst.name}
                      </option>
                    ))}
                  </select>
                  <button
                    disabled={
                      !assignUserId ||
                      !assignInstrumentId ||
                      assignMutation.isPending
                    }
                    onClick={() => assignMutation.mutate()}
                    className="btn-primary w-full disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {assignMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Asignando...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4" />
                        Asignar
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Lista de asignaciones */}
            {meeting.assignments.length === 0 ? (
              <div className="card p-6 text-center text-sm text-slate-400 dark:text-slate-500">
                Sin músicos asignados aún
              </div>
            ) : (
              <div className="space-y-2">
                {meeting.assignments.map((a) => (
                  <div key={a.id} className="card flex items-center gap-3 p-3">
                    <span className="text-xl shrink-0">
                      {a.instrument.icon ?? "🎵"}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                        {a.user.name}
                      </p>
                      <p className="text-xs text-slate-400 dark:text-slate-500">
                        {a.instrument.name}
                      </p>
                    </div>
                    {canEditMeetings && (
                      <button
                        onClick={() => unassignMutation.mutate(a.id)}
                        disabled={unassignMutation.isPending}
                        className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950 dark:hover:text-red-300 shrink-0"
                        title="Remover músico"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// ── Fila de canción con drag & drop ──────────────────────────

interface SortableSongRowProps {
  ms: MeetingSong;
  index: number;
  canEdit: boolean;
  onRemove: () => void;
  isRemoving: boolean;
  onViewChords: () => void;
}

function SortableSongRow({
  ms,
  index,
  canEdit,
  onRemove,
  isRemoving,
  onViewChords,
}: SortableSongRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: ms.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={clsx(
        "card flex items-center gap-3 p-3 transition-shadow",
        isDragging &&
          "opacity-50 shadow-xl ring-2 ring-brand-400 dark:ring-brand-500",
      )}
    >
      <button
        {...(canEdit ? { ...attributes, ...listeners } : {})}
        className={clsx(
          "rounded p-1 touch-none transition-colors",
          canEdit
            ? "cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-500 dark:hover:text-slate-300"
            : "invisible",
        )}
        tabIndex={-1}
        aria-label="Arrastrar para reordenar"
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-brand-700 text-xs font-bold text-white shrink-0">
        {index}
      </span>
      <div className="flex-1 min-w-0">
        <Link
          href={`/songs/${ms.songId}`}
          className="text-sm font-medium text-slate-900 transition-colors hover:text-brand-700 dark:text-white dark:hover:text-brand-300"
        >
          {ms.song.title}
        </Link>
        <p className="text-xs text-slate-400 dark:text-slate-500">
          Tono: {ms.keyOverride ?? ms.song.originalKey}
          {ms.notes && ` · ${ms.notes}`}
        </p>
      </div>
      <button
        onClick={onViewChords}
        className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-brand-50 hover:text-brand-600 shrink-0"
        title="Ver acordes"
      >
        <BookOpen className="h-4 w-4" />
      </button>
      <button
        onClick={onRemove}
        disabled={isRemoving || !canEdit}
        className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950 dark:hover:text-red-300 disabled:pointer-events-none disabled:opacity-40 shrink-0"
        title="Quitar canción"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}
