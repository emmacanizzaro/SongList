"use client";

import { useAuth } from "@/hooks/useAuth";
import { subscriptionsApi } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Subscription {
  id: string;
  status: string;
  plan: string;
  currentPeriodEnd?: string;
}

export default function BillingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    fetchSubscription();
  }, [user, router]);

  const fetchSubscription = async () => {
    try {
      const { data } = await subscriptionsApi.get();
      setSubscription(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error loading subscription",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    try {
      const { data } = await subscriptionsApi.portal();
      if (data.portalUrl) {
        window.location.href = data.portalUrl;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error opening portal");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div className="mb-8">
        <span className="eyebrow">Billing</span>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-gray-900 dark:text-white">
          Billing
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Manage your subscription and billing
        </p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-lg text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      {subscription && (
        <div className="card p-8">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Current Plan
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Plan Type
                </label>
                <div className="rounded-xl bg-brand-50 px-4 py-3 font-semibold text-gray-900 dark:text-white">
                  {subscription.plan}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Status
                </label>
                <div className="rounded-xl bg-white px-4 py-3 ring-1 ring-black/5 dark:bg-gray-700">
                  <span className="inline-block rounded-full bg-accent-50 px-3 py-1 text-sm font-medium text-accent-700 dark:text-green-400">
                    {subscription.status}
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Renewal Date
                </label>
                <div className="rounded-xl bg-white px-4 py-3 text-gray-900 ring-1 ring-black/5 dark:bg-gray-700 dark:text-white">
                  {subscription.currentPeriodEnd
                    ? new Date(
                        subscription.currentPeriodEnd,
                      ).toLocaleDateString()
                    : "N/A"}
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <button onClick={handleManageSubscription} className="btn-primary">
              Manage Subscription
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
