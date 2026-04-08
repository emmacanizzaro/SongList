"use client";

import { useAuth } from "@/hooks/useAuth";
import { churchApi } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  ArrowRight,
  Calendar,
  Music2,
  Plus,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const { user } = useAuth();

  const { data: stats } = useQuery({
    queryKey: ["church-stats"],
    queryFn: () => churchApi.getStats().then((r) => r.data),
  });

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
      <section className="relative overflow-hidden rounded-[32px] bg-slate-950 px-6 py-8 text-white shadow-[0_28px_60px_rgba(15,23,42,0.22)] sm:px-8 lg:px-10">
        <div className="pointer-events-none absolute inset-0 music-notes-bg opacity-20" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(188,132,47,0.22),transparent_24%),radial-gradient(circle_at_bottom_left,rgba(31,77,143,0.28),transparent_30%)]" />
        <div className="relative flex flex-col gap-8">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div className="max-w-2xl">
              <span className="eyebrow bg-white/10 text-slate-200">
                Panel principal
              </span>
              <h1 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">
                Bienvenido, {user?.name?.split(" ")[0]}.
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
                Visualiza próximas reuniones, biblioteca musical y estado
                general del equipo desde un tablero más claro, centrado y
                preparado para trabajar rápido.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 xl:justify-end">
              <Link href="/songs/new" className="btn-primary">
                <Plus className="h-4 w-4" />
                Nueva canción
              </Link>
              <Link
                href="/meetings/new"
                className="btn-secondary border-white/10 bg-white/8 text-white hover:bg-white/12"
              >
                <Calendar className="h-4 w-4" />
                Nueva reunión
              </Link>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
            <div className="rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur-md">
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-slate-300">
                <Sparkles className="h-3.5 w-3.5" />
                Centro de control
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <QuickAction
                  href="/songs"
                  title="Biblioteca"
                  description="Ordena, busca y explora tu repertorio"
                />
                <QuickAction
                  href="/meetings"
                  title="Reuniones"
                  description="Programa servicios y orden de canciones"
                />
                <QuickAction
                  href="/settings"
                  title="Equipo"
                  description="Ajustes y gestión del grupo"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-1">
              <HeroMetric
                label="Próxima semana"
                value={`${stats?.upcomingMeetings?.length ?? 0} reuniones`}
              />
              <HeroMetric
                label="Biblioteca"
                value={`${stats?.songsCount ?? 0} canciones`}
              />
              <HeroMetric
                label="Equipo"
                value={`${stats?.membersCount ?? 0} miembros`}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Resumen operativo
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Accesos rápidos a los módulos que más vas a tocar durante la semana.
          </p>
        </div>
        <Link
          href="/songs/new"
          className="inline-flex items-center gap-2 text-sm font-medium text-brand-700 transition-colors hover:text-brand-600 dark:text-brand-300 dark:hover:text-brand-200"
        >
          Empezar cargando repertorio
          <ArrowRight className="h-4 w-4" />
        </Link>
      </section>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          icon={<Music2 className="h-5 w-5 text-brand-700" />}
          label="Canciones"
          value={stats?.songsCount ?? 0}
          href="/songs"
        />
        <StatCard
          icon={<Calendar className="h-5 w-5 text-violet-600" />}
          label="Reuniones"
          value={stats?.meetingsCount ?? 0}
          href="/meetings"
        />
        <StatCard
          icon={<Users className="h-5 w-5 text-emerald-600" />}
          label="Miembros"
          value={stats?.membersCount ?? 0}
          href="/settings/members"
        />
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-slate-900 dark:text-white">
              Próximas reuniones
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Mantén visible lo inmediato y entra directo a cada servicio.
            </p>
          </div>
          <Link
            href="/meetings"
            className="inline-flex items-center gap-1 text-sm text-brand-600 transition-colors hover:text-brand-700 dark:text-brand-300 dark:hover:text-brand-200"
          >
            Ver todas <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {stats?.upcomingMeetings?.length === 0 && (
          <div className="card px-8 py-14 text-center text-slate-400 dark:text-slate-400">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-brand-50 dark:bg-brand-900/20">
              <Calendar className="h-8 w-8 text-brand-600 dark:text-brand-300" />
            </div>
            <p className="text-base font-medium text-slate-700 dark:text-slate-200">
              No hay reuniones programadas
            </p>
            <p className="mt-2 text-sm">
              Crea la primera reunión y empieza a organizar tu semana.
            </p>
            <Link href="/meetings/new" className="btn-primary mt-5 inline-flex">
              <Plus className="h-4 w-4" />
              Crear primera reunión
            </Link>
          </div>
        )}

        <div className="grid gap-4 xl:grid-cols-2">
          {stats?.upcomingMeetings?.map((meeting: any) => (
            <Link
              key={meeting.id}
              href={`/meetings/${meeting.id}`}
              className="card group flex items-center justify-between gap-4 p-5 transition-all hover:-translate-y-0.5 hover:border-brand-300"
            >
              <div>
                <p className="text-sm font-semibold text-slate-900 transition-colors group-hover:text-brand-700 dark:text-white dark:group-hover:text-brand-300">
                  {meeting.title}
                </p>
                <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                  {format(new Date(meeting.date), "EEEE d 'de' MMMM", {
                    locale: es,
                  })}
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-400 dark:text-slate-500">
                <span>{meeting.meetingSongs?.length ?? 0} canciones</span>
                <span>{meeting._count?.assignments ?? 0} músicos</span>
                <ArrowRight className="h-4 w-4" />
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

function QuickAction({
  href,
  title,
  description,
}: {
  href: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-2xl border border-white/10 bg-white/6 p-4 transition hover:bg-white/10"
    >
      <p className="text-sm font-semibold text-white">{title}</p>
      <p className="mt-1 text-xs leading-5 text-slate-300">{description}</p>
    </Link>
  );
}

function StatCard({
  icon,
  label,
  value,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="card p-5 transition-all hover:-translate-y-0.5 hover:border-brand-300"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50">
          {icon}
        </div>
        <TrendingUp className="w-4 h-4 text-accent-500" />
      </div>
      <p className="text-3xl font-semibold tracking-tight text-slate-900">
        {value}
      </p>
      <p className="mt-1 text-sm text-slate-500">{label}</p>
    </Link>
  );
}

function HeroMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 backdrop-blur-sm">
      <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">
        {label}
      </p>
      <p className="mt-2 text-lg font-semibold text-white">{value}</p>
    </div>
  );
}
