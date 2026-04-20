"use client";

import { useAuth } from "@/hooks/useAuth";
import { subscriptionsApi } from "@/lib/api";
import { PlanType, Subscription } from "@/types";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Check, CreditCard, Loader2, Sparkles } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import toast from "react-hot-toast";

const PLAN_CARDS: Array<{
  plan: PlanType;
  title: string;
  description: string;
  price: string;
  features: string[];
}> = [
  {
    plan: "FREE",
    title: "Free",
    description: "Para equipos pequeños que recién empiezan.",
    price: "$0",
    features: [
      "Hasta 5 integrantes",
      "Hasta 50 canciones",
      "6 instrumentos",
      "Historial de 3 meses",
    ],
  },
  {
    plan: "PRO",
    title: "Pro",
    description: "Para equipos activos que necesitan operar sin fricción.",
    price: "$19",
    features: [
      "Integrantes y canciones ilimitadas",
      "Hasta 30 instrumentos",
      "Historial completo",
      "Exportación PDF y soporte por email",
    ],
  },
  {
    plan: "ENTERPRISE",
    title: "Enterprise",
    description: "Para ministerios grandes con estructura avanzada.",
    price: "Custom",
    features: [
      "Todo lo de Pro",
      "Instrumentos ilimitados",
      "Multi-team",
      "Soporte prioritario",
    ],
  },
];

function BillingPageContent() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isAdmin = user?.currentRole === "ADMIN";

  useEffect(() => {
    if (!user) router.push("/login");
  }, [user, router]);

  useEffect(() => {
    if (searchParams.get("success") === "true") {
      toast.success(
        "Checkout completado. Stripe actualizará tu plan en breve.",
      );
    }
    if (searchParams.get("canceled") === "true") {
      toast("Checkout cancelado.");
    }
  }, [searchParams]);

  const {
    data: subscription,
    isLoading,
    isError,
  } = useQuery<Subscription>({
    queryKey: ["subscription"],
    queryFn: () => subscriptionsApi.get().then((r) => r.data),
    enabled: Boolean(user),
  });

  const checkoutMutation = useMutation({
    mutationFn: (plan: PlanType) => subscriptionsApi.checkout(plan),
    onSuccess: (response) => {
      window.location.href = response.data.checkoutUrl;
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || "No se pudo iniciar el checkout";
      toast.error(message);
    },
  });

  const portalMutation = useMutation({
    mutationFn: () => subscriptionsApi.portal(),
    onSuccess: (response) => {
      window.location.href = response.data.portalUrl;
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ||
        "No se pudo abrir el portal de Stripe";
      toast.error(message);
    },
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-brand-700" />
      </div>
    );
  }

  if (isError || !subscription) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
        No se pudo cargar la información de billing.
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <section className="relative overflow-hidden rounded-[32px] bg-slate-950 px-6 py-8 text-white shadow-[0_28px_60px_rgba(15,23,42,0.22)] sm:px-8 lg:px-10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(188,132,47,0.22),transparent_24%),radial-gradient(circle_at_bottom_left,rgba(31,77,143,0.28),transparent_30%)]" />
        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="eyebrow bg-white/10 text-slate-200">Billing</p>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
              Plan y facturación
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
              Controla tu plan actual, revisa límites reales y sube de nivel
              cuando tu equipo lo necesite.
            </p>
          </div>
          {isAdmin ? (
            <button
              onClick={() => portalMutation.mutate()}
              disabled={portalMutation.isPending}
              className="btn-secondary self-start border-white/10 bg-white/8 text-white hover:bg-white/12 lg:self-auto"
            >
              {portalMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Abriendo portal...
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4" />
                  Gestionar suscripción
                </>
              )}
            </button>
          ) : (
            <span className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-xs font-medium text-slate-200">
              Solo Admin puede gestionar billing
            </span>
          )}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="space-y-4">
          <div className="card p-6">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
              <Sparkles className="h-4 w-4 text-accent-500" />
              Estado actual
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Metric label="Plan" value={subscription.plan} accent />
              <Metric label="Estado" value={subscription.status} />
              <Metric
                label="Renovación"
                value={
                  subscription.currentPeriodEnd
                    ? new Date(
                        subscription.currentPeriodEnd,
                      ).toLocaleDateString("es-ES")
                    : "No disponible"
                }
              />
              <Metric
                label="Export PDF"
                value={subscription.limits.canExportPdf ? "Sí" : "No"}
              />
            </div>
          </div>

          <div className="card p-6">
            <div className="text-sm font-semibold text-slate-900 dark:text-white">
              Límites aplicados
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Metric
                label="Integrantes"
                value={formatLimit(subscription.limits.maxMembers)}
              />
              <Metric
                label="Canciones"
                value={formatLimit(subscription.limits.maxSongs)}
              />
              <Metric
                label="Instrumentos"
                value={formatLimit(subscription.limits.maxInstruments)}
              />
              <Metric
                label="Historial"
                value={
                  subscription.limits.historyMonths === -1
                    ? "Ilimitado"
                    : `${subscription.limits.historyMonths} meses`
                }
              />
            </div>
          </div>
        </section>

        <section className="grid gap-4 xl:grid-cols-3">
          {PLAN_CARDS.map((card) => {
            const isCurrent = subscription.plan === card.plan;
            const isUpgradeBlocked =
              card.plan === "FREE" || !isAdmin || isCurrent;

            return (
              <article
                key={card.plan}
                className={`card flex flex-col p-6 ${
                  isCurrent ? "ring-2 ring-brand-500 dark:ring-brand-400" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold text-slate-900 dark:text-white">
                      {card.title}
                    </p>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      {card.description}
                    </p>
                  </div>
                  {isCurrent && (
                    <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700 dark:bg-brand-950/40 dark:text-brand-300">
                      Actual
                    </span>
                  )}
                </div>

                <p className="mt-6 text-3xl font-semibold text-slate-900 dark:text-white">
                  {card.price}
                  {card.plan !== "ENTERPRISE" && (
                    <span className="text-sm font-medium text-slate-400">
                      /mes
                    </span>
                  )}
                </p>

                <div className="mt-6 space-y-3 text-sm text-slate-600 dark:text-slate-300">
                  {card.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-600 dark:text-brand-400" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-6 border-t border-slate-200 pt-6 dark:border-slate-800">
                  <button
                    disabled={isUpgradeBlocked || checkoutMutation.isPending}
                    onClick={() => checkoutMutation.mutate(card.plan)}
                    className={
                      isCurrent
                        ? "btn-secondary w-full"
                        : "btn-primary w-full disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
                    }
                  >
                    {checkoutMutation.isPending &&
                    checkoutMutation.variables === card.plan ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Redirigiendo...
                      </>
                    ) : isCurrent ? (
                      "Plan actual"
                    ) : card.plan === "FREE" ? (
                      "Incluido"
                    ) : card.plan === "ENTERPRISE" ? (
                      "Solicitar upgrade"
                    ) : (
                      "Cambiar a Pro"
                    )}
                  </button>
                </div>
              </article>
            );
          })}
        </section>
      </div>
    </div>
  );
}

export default function BillingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-brand-700" />
        </div>
      }
    >
      <BillingPageContent />
    </Suspense>
  );
}

function Metric({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
        {label}
      </p>
      <p
        className={`mt-1 font-medium ${
          accent
            ? "text-brand-700 dark:text-brand-300"
            : "text-slate-800 dark:text-slate-100"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function formatLimit(limit: number) {
  return limit === -1 ? "Ilimitado" : `${limit}`;
}
