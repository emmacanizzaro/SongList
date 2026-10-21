"use client";

import { useAuth } from "@/hooks/useAuth";
import { adminApi } from "@/lib/api";
import { AdminChurch, PlanType } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { Loader2, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const PLAN_OPTIONS: Array<{ value: PlanType; label: string }> = [
  { value: "FREE", label: "Prueba gratuita (FREE)" },
  { value: "PRO", label: "Pro · USD 9.99" },
  { value: "ENTERPRISE", label: "Enterprise · USD 19.99" },
  { value: "UNLIMITED", label: "Ilimitado (interno)" },
];

const ACCESS_LABELS = {
  active: { text: "Activa", className: "bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200" },
  trial_expired: { text: "Prueba vencida", className: "bg-amber-50 text-amber-900 dark:bg-amber-950 dark:text-amber-100" },
  period_expired: { text: "Plan vencido", className: "bg-amber-50 text-amber-900 dark:bg-amber-950 dark:text-amber-100" },
} as const;

/** ISO date -> value for <input type="date"> (yyyy-mm-dd). */
function toInputDate(iso: string | null) {
  return iso ? iso.slice(0, 10) : "";
}

/** <input type="date"> value -> ISO at the end of that day, or null when empty. */
function fromInputDate(value: string) {
  return value ? new Date(`${value}T23:59:59`).toISOString() : null;
}

export default function AdminPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) router.push("/login");
  }, [user, router]);

  const { data, isLoading, error } = useQuery<AdminChurch[]>({
    queryKey: ["admin-churches"],
    queryFn: () => adminApi.listChurches().then((r) => r.data),
    enabled: Boolean(user),
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-brand-700" />
      </div>
    );
  }

  if (error) {
    const forbidden = isAxiosError(error) && error.response?.status === 403;
    return (
      <div
        role="alert"
        className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-200"
      >
        {forbidden
          ? "Esta sección es solo para el administrador de la plataforma."
          : "No se pudo cargar la lista de iglesias."}
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <header className="flex items-center gap-3">
        <ShieldCheck className="h-6 w-6 text-brand-600 dark:text-brand-400" aria-hidden />
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
            Administración de la plataforma
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {data?.length ?? 0} iglesias · Cambia el plan cuando una iglesia te pague.
          </p>
        </div>
      </header>

      <ul className="space-y-4">
        {data?.map((church) => (
          <li key={church.id}>
            <ChurchRow church={church} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function ChurchRow({ church }: { church: AdminChurch }) {
  const queryClient = useQueryClient();
  const sub = church.subscription;
  const [plan, setPlan] = useState<PlanType>(sub?.plan ?? "FREE");
  const [trialEndsAt, setTrialEndsAt] = useState(toInputDate(sub?.trialEndsAt ?? null));
  const [paidUntil, setPaidUntil] = useState(toInputDate(sub?.currentPeriodEnd ?? null));

  const mutation = useMutation({
    mutationFn: () =>
      adminApi.updateSubscription(church.id, {
        plan,
        ...(plan === "FREE" ? { trialEndsAt: fromInputDate(trialEndsAt) } : {}),
        ...(plan === "PRO" || plan === "ENTERPRISE"
          ? { currentPeriodEnd: fromInputDate(paidUntil) }
          : {}),
      }),
    onSuccess: () => {
      toast.success(`Plan de ${church.name} actualizado`);
      queryClient.invalidateQueries({ queryKey: ["admin-churches"] });
    },
    onError: () => toast.error("No se pudo actualizar el plan"),
  });

  const access = sub ? ACCESS_LABELS[sub.access] : null;
  const fieldId = (name: string) => `${church.id}-${name}`;

  return (
    <article className="card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="truncate text-base font-semibold text-slate-900 dark:text-white">
            {church.name}
          </h2>
          <p className="truncate text-sm text-slate-500 dark:text-slate-400">
            {church.owner ? `${church.owner.name} · ${church.owner.email}` : "Sin administrador"}
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {church._count.memberships} integrantes · {church._count.songs} canciones ·{" "}
            {church._count.meetings} reuniones
          </p>
        </div>
        {access && (
          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${access.className}`}>
            {access.text}
          </span>
        )}
      </div>

      <form
        className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
        onSubmit={(event) => {
          event.preventDefault();
          mutation.mutate();
        }}
      >
        <div>
          <label htmlFor={fieldId("plan")} className="block text-xs font-medium text-slate-600 dark:text-slate-300">
            Plan
          </label>
          <select
            id={fieldId("plan")}
            value={plan}
            onChange={(event) => setPlan(event.target.value as PlanType)}
            className="input mt-1 w-full"
          >
            {PLAN_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {plan === "FREE" && (
          <div>
            <label htmlFor={fieldId("trial")} className="block text-xs font-medium text-slate-600 dark:text-slate-300">
              Prueba hasta
            </label>
            <input
              id={fieldId("trial")}
              type="date"
              value={trialEndsAt}
              onChange={(event) => setTrialEndsAt(event.target.value)}
              className="input mt-1 w-full"
            />
          </div>
        )}

        {(plan === "PRO" || plan === "ENTERPRISE") && (
          <div>
            <label htmlFor={fieldId("paid")} className="block text-xs font-medium text-slate-600 dark:text-slate-300">
              Pagado hasta (vacío = sin vencimiento)
            </label>
            <input
              id={fieldId("paid")}
              type="date"
              value={paidUntil}
              onChange={(event) => setPaidUntil(event.target.value)}
              className="input mt-1 w-full"
            />
          </div>
        )}

        {plan === "UNLIMITED" && (
          <p className="self-center text-xs text-slate-500 dark:text-slate-400">
            Sin límites ni vencimiento.
          </p>
        )}

        <button type="submit" disabled={mutation.isPending} className="btn-primary">
          {mutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              Guardando...
            </>
          ) : (
            "Guardar"
          )}
        </button>
      </form>
    </article>
  );
}
