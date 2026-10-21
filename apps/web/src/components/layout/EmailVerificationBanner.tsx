'use client'

import { useAuth } from '@/hooks/useAuth'
import { authApi } from '@/lib/api'
import { useMutation, useQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { apiErrorMessage } from '@/components/auth/AuthShell'

/** Asks the user to confirm their email once email delivery is enabled. */
export function EmailVerificationBanner() {
  const { user } = useAuth()
  const { data } = useQuery({
    queryKey: ['account-status'],
    queryFn: () => authApi.accountStatus().then((r) => r.data),
    enabled: Boolean(user),
    staleTime: 5 * 60_000,
  })

  const resend = useMutation({
    mutationFn: () => authApi.resendVerification(),
    onSuccess: ({ data }) => toast.success(data.message),
    onError: (err) => toast.error(apiErrorMessage(err, 'No se pudo reenviar el email.')),
  })

  if (!data || data.emailVerified || !data.emailDeliveryEnabled) return null

  return (
    <div
      role="status"
      className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-brand-900 dark:border-brand-900 dark:bg-brand-950/40 dark:text-brand-100"
    >
      <span>Confirma tu email con el enlace que te enviamos para proteger tu cuenta.</span>
      <button
        type="button"
        onClick={() => resend.mutate()}
        disabled={resend.isPending}
        className="font-semibold underline underline-offset-2 disabled:opacity-60"
      >
        {resend.isPending ? 'Enviando...' : 'Reenviar email'}
      </button>
    </div>
  )
}
