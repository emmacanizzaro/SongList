'use client'

import { AuthShell, apiErrorMessage } from '@/components/auth/AuthShell'
import { authApi } from '@/lib/api'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

const schema = z
  .object({
    password: z.string().min(8, 'Mínimo 8 caracteres').max(128, 'Máximo 128 caracteres'),
    confirm: z.string(),
  })
  .refine((data) => data.password === data.confirm, {
    message: 'Las contraseñas no coinciden',
    path: ['confirm'],
  })
type Form = z.infer<typeof schema>

function ResetPasswordForm() {
  const token = useSearchParams().get('token') ?? ''
  const [done, setDone] = useState('')
  const [error, setError] = useState('')
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Form>({ resolver: zodResolver(schema) })

  if (!/^[0-9a-f]{64}$/.test(token)) {
    return (
      <div role="alert" className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
        <p>El enlace no es válido. Pide uno nuevo.</p>
        <Link href="/forgot-password" className="btn-primary w-full">
          Pedir un enlace nuevo
        </Link>
      </div>
    )
  }

  if (done) {
    return (
      <div role="status" className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
        <p>{done}</p>
        <Link href="/login" className="btn-primary w-full">
          Iniciar sesión
        </Link>
      </div>
    )
  }

  const onSubmit = async ({ password }: Form) => {
    setError('')
    try {
      const { data } = await authApi.resetPassword(token, password)
      setDone(data.message)
    } catch (err) {
      setError(apiErrorMessage(err, 'No se pudo cambiar la contraseña.'))
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      {(['password', 'confirm'] as const).map((field) => (
        <div key={field}>
          <label htmlFor={`reset-${field}`} className="mb-1 block text-sm font-medium text-gray-700 dark:text-slate-300">
            {field === 'password' ? 'Contraseña nueva' : 'Repite la contraseña'}
          </label>
          <input
            id={`reset-${field}`}
            type="password"
            autoComplete="new-password"
            className="input"
            aria-invalid={Boolean(errors[field])}
            aria-describedby={errors[field] ? `reset-${field}-error` : undefined}
            {...register(field)}
          />
          {errors[field] && (
            <p id={`reset-${field}-error`} role="alert" className="mt-1 text-xs text-red-600">
              {errors[field]?.message}
            </p>
          )}
        </div>
      ))}
      {error && (
        <div role="alert" className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-200">
          <p>{error}</p>
          <Link href="/forgot-password" className="font-medium underline">
            Pedir un enlace nuevo
          </Link>
        </div>
      )}
      <button type="submit" disabled={isSubmitting} className="btn-primary w-full disabled:opacity-60">
        {isSubmitting ? 'Guardando...' : 'Guardar contraseña'}
      </button>
    </form>
  )
}

export default function ResetPasswordPage() {
  return (
    <AuthShell title="Elige una contraseña nueva">
      <Suspense fallback={null}>
        <ResetPasswordForm />
      </Suspense>
    </AuthShell>
  )
}
