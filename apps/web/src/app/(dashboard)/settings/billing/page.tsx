"use client";

import { useAuth } from "@/hooks/useAuth";
import { subscriptionsApi } from "@/lib/api";
import { PlanType, SubscriptionEntitlements } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, Check, MessageCircle, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { APP_NAME } from "@/constants/brand";

// Cobro manual: la iglesia contacta al administrador, paga por transferencia o
// Mercado Pago y el administrador activa el plan desde /admin.
const SALES_WHATSAPP = process.env.NEXT_PUBLIC_SALES_WHATSAPP;
const SALES_EMAIL = process.env.NEXT_PUBLIC_SALES_EMAIL;

const PLAN_LABELS: Record<PlanType, string> = {
  FREE: "Prueba gratuita",
  PRO: "Pro",
  ENTERPRISE: "Enterprise",
  UNLIMITED: "Ilimitado",
};

const PLAN_CARDS: Array<{
  plan: Exclude<PlanType, "UNLIMITED">;
  title: string;
  description: string;
  price: string;
  priceNote: string;
  features: string[];
}> = [
  {
    plan: "FREE",
    title: "Prueba gratuita",
    description: `Para conocer ${APP_NAME} con tu equipo.`,
    price: "Gratis",
    priceNote: "30 días",
    features: [
      "Hasta 10 integrantes",
      "Hasta 20 canciones",
      "6 instrumentos",
      "Historial de 3 meses",
    ],
  },
  {
    plan: "PRO",
    title: "Pro",
    description: "Para equipos activos que tocan todas las semanas.",
    price: "USD 9.99",
    priceNote: "/mes",
    features: [
      "Hasta 30 integrantes",
      "Hasta 50 canciones",
      "Hasta 30 instrumentos",
      "Historial completo",
      "Exportación PDF y compartir por enlace",
      "Soporte por email",
    ],
  },
  {
    plan: "ENTERPRISE",
    title: "Enterprise",
    description: "Para ministerios grandes con varios equipos.",
    price: "USD 19.99",
    priceNote: "/mes",
    features: [
      "Hasta 60 integrantes",
      "Hasta 150 canciones",
      "Instrumentos ilimitados",
      "Varios equipos",
      "Todo lo de Pro",
      "Soporte prioritario",
    ],
  },
];

function contactHref(plan: PlanType, churchName?: string) {
  const text = `Hola, quiero activar el plan ${PLAN_LABELS[plan]} de ${APP_NAME}${
    churchName ? ` para ${churchName}` : ""
  }.`;
  if (SALES_WHATSAPP) {
    return `https://wa.me/${SALES_WHATSAPP}?text=${encodeURIComponent(text)}`;
  }
  if (SALES_EMAIL) {
    return `mailto:${SALES_EMAIL}?subject=${encodeURIComponent(
      `Plan de ${APP_NAME}`,
    )}&body=${encodeURIComponent(text)}`;
  }
  return null;
}

function daysUntil(dateIso: string) {
  return Math.ceil((new Date(dateIso).getTime() - Date.now()) / 86_400_000);
}

function formatDate(dateIso?: string | null) {
  return dateIso ? new Date(dateIso).toLocaleDateString("es-AR") : "—";
}

export default function BillingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const isAdmin = user?.currentRole === "ADMIN";

  useEffect(() => {
    if (!user) router.push("/login");
  }, [user, router]);

  const {
    data: entitlements,
    isLoading,
    isError,
  } = useQuery<SubscriptionEntitlements>({
    queryKey: ["subscription-entitlements"],
    queryFn: () => subscriptionsApi.entitlements().then((r) => r.data),
    enabled: Boolean(user),
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-brand-700" />
      </div>
    );
  }

  if (isError || !entitlements) {
    return (
      <div
        role="alert"
        className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-200"
      >
        No se pudo cargar la información de tu plan.
      </div>
    );
  }

  const isUnlimited = entitlements.plan === "UNLIMITED";

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <section className="relative overflow-hidden rounded-[32px] bg-slate-950 px-6 py-8 text-white shadow-[0_28px_60px_rgba(15,23,42,0.22)] sm:px-8 lg:px-10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(188,132,47,0.22),transparent_24%),radial-gradient(circle_at_bottom_left,rgba(31,77,143,0.28),transparent_30%)]" />
        <div className="relative">
          <p className="eyebrow bg-white/10 text-slate-200">Suscripción</p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
            Tu plan
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
            Revisa tu plan actual, tus límites y cómo pasarte a un plan pago
            cuando tu equipo lo necesite.
          </p>
        </div>
      </section>

      <AccessBanner entitlements={entitlements} />

      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="space-y-4" aria-labelledby="current-plan-title">
          <div className="card p-6">
            <h2
              id="current-plan-title"
              className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white"
            >
              <Sparkles className="h-4 w-4 text-accent-500" aria-hidden />
              Estado actual
            </h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Metric
                label="Plan"
                value={PLAN_LABELS[entitlements.plan]}
                accent
              />
              {entitlements.plan === "FREE" && (
                <Metric
                  label="Prueba hasta"
                  value={formatDate(entitlements.trialEndsAt)}
                />
              )}
              {(entitlements.plan === "PRO" ||
                entitlements.plan === "ENTERPRISE") && (
                <Metric
                  label="Pagado hasta"
                  value={
                    entitlements.currentPeriodEnd
                      ? formatDate(entitlements.currentPeriodEnd)
                      : "Sin vencimiento"
                  }
                />
              )}
              {isUnlimited && <Metric label="Vencimiento" value="Nunca" />}
            </div>
          </div>

          <div className="card p-6">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
              Consumo
            </h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Metric
                label="Integrantes"
                value={formatQuota(
                  entitlements.quotas.members.used,
                  entitlements.quotas.members.limit,
                )}
              />
              <Metric
                label="Canciones"
                value={formatQuota(
                  entitlements.quotas.songs.used,
                  entitlements.quotas.songs.limit,
                )}
              />
              <Metric
                label="Instrumentos"
                value={formatQuota(
                  entitlements.quotas.instruments.used,
                  entitlements.quotas.instruments.limit,
                )}
              />
              <Metric
                label="Historial"
                value={
                  entitlements.limits.historyMonths === -1
                    ? "Completo"
                    : `${entitlements.limits.historyMonths} meses`
                }
              />
            </div>
          </div>
        </section>

        {!isUnlimited && (
          <section
            className="grid gap-4 xl:grid-cols-3"
            aria-label="Planes disponibles"
          >
            {PLAN_CARDS.map((card) => {
              const isCurrent = entitlements.plan === card.plan;
              const href =
                card.plan !== "FREE" && isAdmin
                  ? contactHref(card.plan)
                  : null;

              return (
                <article
                  key={card.plan}
                  className={`card flex flex-col p-6 ${
                    isCurrent ? "ring-2 ring-brand-500 dark:ring-brand-400" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                        {card.title}
                      </h3>
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
                    <span className="ml-1 text-sm font-medium text-slate-500 dark:text-slate-400">
                      {card.priceNote}
                    </span>
                  </p>

                  <ul className="mt-6 space-y-3 text-sm text-slate-600 dark:text-slate-300">
                    {card.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <Check
                          className="mt-0.5 h-4 w-4 shrink-0 text-brand-600 dark:text-brand-400"
                          aria-hidden
                        />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-auto border-t border-slate-200 pt-6 dark:border-slate-800">
                    {isCurrent ? (
                      <span className="btn-secondary w-full">Plan actual</span>
                    ) : card.plan === "FREE" ? (
                      <span className="btn-secondary w-full opacity-60">
                        Incluido al registrarse
                      </span>
                    ) : href ? (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary w-full"
                      >
                        <MessageCircle className="h-4 w-4" aria-hidden />
                        Solicitar {card.title}
                      </a>
                    ) : (
                      <p className="text-center text-xs text-slate-500 dark:text-slate-400">
                        {isAdmin
                          ? `Contacta al equipo de ${APP_NAME} para activarlo.`
                          : "Solo un administrador de tu iglesia puede cambiar el plan."}
                      </p>
                    )}
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </div>
    </div>
  );
}

function AccessBanner({
  entitlements,
}: {
  entitlements: SubscriptionEntitlements;
}) {
  if (entitlements.access !== "active") {
    return (
      <div
        role="alert"
        className="flex items-start gap-3 rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-100"
      >
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
        <p>
          {entitlements.access === "trial_expired"
            ? "Tu prueba gratuita terminó. Puedes ver tus canciones y reuniones, pero para crear o editar necesitas un plan pago."
            : "El período de tu plan venció. Puedes ver tus datos, pero para crear o editar necesitas renovarlo."}
        </p>
      </div>
    );
  }

  if (entitlements.plan === "FREE" && entitlements.trialEndsAt) {
    const days = daysUntil(entitlements.trialEndsAt);
    return (
      <div
        role="status"
        className="rounded-2xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-brand-900 dark:border-brand-900 dark:bg-brand-950/40 dark:text-brand-100"
      >
        {days <= 1
          ? "Tu prueba gratuita termina hoy."
          : `Te quedan ${days} días de prueba gratuita.`}
      </div>
    );
  }

  return null;
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
      <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
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

function formatQuota(used: number, limit: number) {
  if (limit === -1) return `${used} / Sin límite`;
  return `${used} / ${limit}`;
}
