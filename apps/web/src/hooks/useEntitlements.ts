"use client";

import { subscriptionsApi } from "@/lib/api";
import { SubscriptionEntitlements } from "@/types";
import { useQuery } from "@tanstack/react-query";

export function useEntitlements(enabled = true) {
  const query = useQuery<SubscriptionEntitlements>({
    queryKey: ["subscription-entitlements"],
    queryFn: () => subscriptionsApi.entitlements().then((r) => r.data),
    enabled,
  });

  return {
    ...query,
    entitlements: query.data,
    canExportPdf: Boolean(query.data?.features.canExportPdf),
    canShareLinks: Boolean(query.data?.features.canShareLinks),
    canMultiTeam: Boolean(query.data?.features.canMultiTeam),
  };
}
