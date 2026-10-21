"use client";

import { useAuth } from "@/hooks/useAuth";
import { useEntitlements } from "@/hooks/useEntitlements";
import Link from "next/link";
import { usePathname } from "next/navigation";

const WARN_DAYS = 7;

/**
 * Shown on every dashboard page: warns when the free trial is about to end
 * and explains read-only mode once it (or a paid period) has expired.
 */
export function PlanStatusBanner() {
  const { user } = useAuth();
  const pathname = usePathname();
  const { entitlements } = useEntitlements(Boolean(user));

  // The billing page already shows the full status.
  if (!entitlements || pathname.startsWith("/settings/billing")) return null;

  let message: string | null = null;
  if (entitlements.access === "trial_expired") {
    message = "Tu prueba gratuita terminó: puedes ver tus datos, pero no crear ni editar.";
  } else if (entitlements.access === "period_expired") {
    message = "Tu plan venció: puedes ver tus datos, pero no crear ni editar.";
  } else if (entitlements.plan === "FREE" && entitlements.trialEndsAt) {
    const days = Math.ceil((new Date(entitlements.trialEndsAt).getTime() - Date.now()) / 86_400_000);
    if (days <= WARN_DAYS) {
      message = days <= 1 ? "Tu prueba gratuita termina hoy." : `Te quedan ${days} días de prueba gratuita.`;
    }
  }

  if (!message) return null;

  return (
    <div
      role="status"
      className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-100"
    >
      <span>{message}</span>
      <Link href="/settings/billing" className="font-semibold underline underline-offset-2">
        Ver planes
      </Link>
    </div>
  );
}
