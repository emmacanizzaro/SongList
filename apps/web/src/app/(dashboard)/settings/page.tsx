"use client";

import { useAuth } from "@/hooks/useAuth";
import { churchApi } from "@/lib/api";
import { Membership } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link2, ShieldCheck, Trash2, UserPlus, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface ChurchStats {
  membersCount: number;
  songsCount: number;
  meetingsCount: number;
}

export default function SettingsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"EDITOR" | "READER">("READER");
  const [generatedInviteLink, setGeneratedInviteLink] = useState("");

  useEffect(() => {
    if (!user) router.push("/login");
  }, [user, router]);

  const canManageMembers = user?.currentRole === "ADMIN";

  const { data: stats, isLoading: loadingStats } = useQuery<ChurchStats>({
    queryKey: ["settings-stats"],
    queryFn: () => churchApi.getStats().then((r) => r.data),
  });

  const { data: members = [], isLoading: loadingMembers } = useQuery<
    Membership[]
  >({
    queryKey: ["church-members"],
    queryFn: () => churchApi.getMembers().then((r) => r.data),
  });

  const inviteMutation = useMutation({
    mutationFn: () =>
      churchApi.invite(inviteEmail.trim().toLowerCase(), inviteRole),
    onSuccess: async () => {
      toast.success("Integrante agregado correctamente");
      setInviteEmail("");
      setInviteRole("READER");
      await queryClient.invalidateQueries({ queryKey: ["church-members"] });
      await queryClient.invalidateQueries({ queryKey: ["settings-stats"] });
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message?.join?.(", ") ||
        error?.response?.data?.message ||
        "No se pudo agregar el integrante";
      toast.error(message);
    },
  });

  const inviteLinkMutation = useMutation({
    mutationFn: () =>
      churchApi.createInviteLink(inviteEmail.trim().toLowerCase(), inviteRole),
    onSuccess: async (response) => {
      const token = response.data.token;
      const link =
        response.data.inviteUrl ??
        `${window.location.origin}/register?invite=${token}`;
      setGeneratedInviteLink(link);
      await navigator.clipboard.writeText(link);
      toast.success(
        response.data.emailSent
          ? "Correo enviado y enlace copiado"
          : "Enlace de invitación copiado",
      );
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message?.join?.(", ") ||
        error?.response?.data?.message ||
        "No se pudo generar el enlace de invitación";
      toast.error(message);
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({
      memberId,
      role,
    }: {
      memberId: string;
      role: "EDITOR" | "READER";
    }) => churchApi.updateMemberRole(memberId, role),
    onSuccess: async () => {
      toast.success("Rol actualizado");
      await queryClient.invalidateQueries({ queryKey: ["church-members"] });
    },
    onError: () => {
      toast.error("No se pudo actualizar el rol");
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: (memberId: string) => churchApi.removeMember(memberId),
    onSuccess: async () => {
      toast.success("Integrante eliminado");
      await queryClient.invalidateQueries({ queryKey: ["church-members"] });
      await queryClient.invalidateQueries({ queryKey: ["settings-stats"] });
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || "No se pudo eliminar el integrante";
      toast.error(message);
    },
  });

  if (loadingStats || loadingMembers) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-brand-700" />
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div className="mb-8">
        <span className="eyebrow">Configuración</span>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-gray-900 dark:text-white">
          Equipo y permisos
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Gestiona integrantes como Editor o Visualizador desde una sola vista.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card p-5">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Integrantes
          </p>
          <p className="mt-2 text-3xl font-semibold text-brand-700 dark:text-brand-300">
            {stats?.membersCount ?? 0}
          </p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Canciones
          </p>
          <p className="mt-2 text-3xl font-semibold text-slate-900 dark:text-white">
            {stats?.songsCount ?? 0}
          </p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Reuniones
          </p>
          <p className="mt-2 text-3xl font-semibold text-accent-700 dark:text-accent-300">
            {stats?.meetingsCount ?? 0}
          </p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="card p-6 sm:p-8">
          <div className="mb-4 flex items-center gap-2">
            <Users className="h-5 w-5 text-brand-700 dark:text-brand-300" />
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Integrantes de la iglesia
            </h2>
          </div>

          <div className="space-y-3">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 dark:bg-slate-900"
              >
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">
                    {member.user.name}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {member.user.email}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-slate-600 ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-700">
                    {member.role === "ADMIN"
                      ? "Admin"
                      : member.role === "EDITOR"
                        ? "Editor"
                        : "Visualizador"}
                  </span>

                  {canManageMembers && member.role !== "ADMIN" && (
                    <>
                      <select
                        className="input h-9 px-3 py-1 text-xs"
                        value={member.role}
                        onChange={(event) =>
                          updateRoleMutation.mutate({
                            memberId: member.id,
                            role: event.target.value as "EDITOR" | "READER",
                          })
                        }
                      >
                        <option value="EDITOR">Editor</option>
                        <option value="READER">Visualizador</option>
                      </select>

                      <button
                        onClick={() => removeMemberMutation.mutate(member.id)}
                        className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950 dark:hover:text-red-300"
                        title="Eliminar integrante"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <aside className="space-y-6">
          <div className="card p-6">
            <div className="mb-3 flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-accent-600 dark:text-accent-300" />
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                Agregar integrante
              </h3>
            </div>

            {canManageMembers ? (
              <div className="space-y-3">
                <input
                  type="email"
                  className="input"
                  placeholder="email@iglesia.com"
                  value={inviteEmail}
                  onChange={(event) => setInviteEmail(event.target.value)}
                />
                <select
                  className="input"
                  value={inviteRole}
                  onChange={(event) =>
                    setInviteRole(event.target.value as "EDITOR" | "READER")
                  }
                >
                  <option value="EDITOR">Editor (puede crear/editar)</option>
                  <option value="READER">Visualizador (solo lectura)</option>
                </select>

                <button
                  className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={!inviteEmail || inviteMutation.isPending}
                  onClick={() => inviteMutation.mutate()}
                >
                  <UserPlus className="h-4 w-4" />
                  {inviteMutation.isPending
                    ? "Agregando..."
                    : "Agregar integrante"}
                </button>

                <button
                  className="btn-secondary w-full disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={!inviteEmail || inviteLinkMutation.isPending}
                  onClick={() => inviteLinkMutation.mutate()}
                >
                  <Link2 className="h-4 w-4" />
                  {inviteLinkMutation.isPending
                    ? "Generando enlace..."
                    : "Generar enlace de invitación"}
                </button>

                {generatedInviteLink && (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
                    <p className="font-medium">Enlace generado:</p>
                    <p className="mt-1 break-all">{generatedInviteLink}</p>
                  </div>
                )}

                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Si el backend tiene correo configurado, SongList enviará la
                  invitación automáticamente. Si no, puedes compartir el enlace
                  manualmente y seguirá funcionando igual.
                </p>
              </div>
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Solo el rol Admin puede gestionar integrantes y permisos.
              </p>
            )}
          </div>

          <div className="card p-6">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
              <ShieldCheck className="h-4 w-4 text-brand-600 dark:text-brand-300" />
              Permisos
            </div>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
              <li>1. Editor: puede crear/editar canciones y reuniones.</li>
              <li>2. Visualizador: solo puede ver reuniones y contenido.</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
