'use client'

import { AuthShell, apiErrorMessage } from '@/components/auth/AuthShell'
import { authApi } from '@/lib/api'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useRef, useState } from 'react'

type State = { status: 'loading' | 'ok' | 'error'; message: string }

function VerifyEmail() {
  const token = useSearchParams().get('token') ?? ''
  const [state, setState] = useState<State>({ status: 'loading', message: 'Confirmando tu email...' })
  // Guard against React strict mode running the effect twice: a token works once.
  const started = useRef(false)

  useEffect(() => {
    if (started.current) return
    started.current = true

    if (!/^[0-9a-f]{64}$/.test(token)) {
      setState({ status: 'error', message: 'El enlace no es válido.' })
      return
    }

    authApi
      .verifyEmail(token)
      .then(({ data }) => setState({ status: 'ok', message: data.message }))
      .catch((err) =>
        setState({ status: 'error', message: apiErrorMessage(err, 'No se pudo confirmar tu email.') }),
      )
  }, [token])

  return (
    <div
      role={state.status === 'error' ? 'alert' : 'status'}
      className="space-y-4 text-sm text-slate-600 dark:text-slate-300"
    >
      <p>{state.message}</p>
      {state.status === 'error' && (
        <p>Inicia sesión y usa “Reenviar email” en el aviso de arriba para recibir un enlace nuevo.</p>
      )}
      {state.status !== 'loading' && (
        <Link href="/dashboard" className="btn-primary w-full">
          Ir a SongList
        </Link>
      )}
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <AuthShell title="Confirmación de email">
      <Suspense fallback={null}>
        <VerifyEmail />
      </Suspense>
    </AuthShell>
  )
}
