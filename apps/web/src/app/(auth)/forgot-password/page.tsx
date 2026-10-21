'use client'

import { AuthShell, apiErrorMessage } from '@/components/auth/AuthShell'
import { authApi } from '@/lib/api'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

const schema = z.object({ email: z.string().email('Email inválido') })
type Form = z.infer<typeof schema>

export default function ForgotPasswordPage() {
  const [sentMessage, setSentMessage] = useState('')
  const [error, setError] = useState('')
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Form>({ resolver: zodResolver(schema) })

  const onSubmit = async ({ email }: Form) => {
    setError('')
    try {
      const { data } = await authApi.forgotPassword(email.trim().toLowerCase())
      setSentMessage(data.message)
    } catch (err) {
      setError(apiErrorMessage(err, 'No se pudo enviar el enlace. Intenta de nuevo en un minuto.'))
    }
  }

  return (
    <AuthShell title="Recuperar contraseña">
      {sentMessage ? (
        <div role="status" className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
          <p>{sentMessage}</p>
          <p>Revisa también la carpeta de spam. El enlace vence en 1 hora.</p>
          <Link href="/login" className="btn-secondary w-full">
            Volver a iniciar sesión
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Escribe el email de tu cuenta y te enviaremos un enlace para elegir una contraseña
            nueva.
          </p>
          <div>
            <label htmlFor="forgot-email" className="mb-1 block text-sm font-medium text-gray-700 dark:text-slate-300">
              Email
            </label>
            <input
              id="forgot-email"
              type="email"
              autoComplete="email"
              className="input"
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? 'forgot-email-error' : undefined}
              {...register('email')}
            />
            {errors.email && (
              <p id="forgot-email-error" role="alert" className="mt-1 text-xs text-red-600">
                {errors.email.message}
              </p>
            )}
          </div>
          {error && (
            <p role="alert" className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-200">
              {error}
            </p>
          )}
          <button type="submit" disabled={isSubmitting} className="btn-primary w-full disabled:opacity-60">
            {isSubmitting ? 'Enviando...' : 'Enviar enlace'}
          </button>
          <p className="text-center text-sm">
            <Link href="/login" className="font-medium text-brand-600 hover:underline dark:text-brand-400">
              Volver a iniciar sesión
            </Link>
          </p>
        </form>
      )}
    </AuthShell>
  )
}
