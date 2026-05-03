'use client'

import { useAuth } from '@/hooks/useAuth'
import { churchApi } from '@/lib/api'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import { Music2 } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

const schema = z.object({
  name: z.string().min(2, 'Mínimo 2 caracteres').max(100),
  email: z.string().email('Email inválido'),
  password: z
    .string()
    .min(8, 'Mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
    .regex(/[0-9]/, 'Debe contener al menos un número'),
  churchName: z.string().min(2, 'Mínimo 2 caracteres').max(100).optional(),
})

type RegisterForm = z.infer<typeof schema>

const FEATURES = [
  'Gestión de canciones con acordes',
  'Transposición automática de tonalidad',
  'Programación de reuniones semanales',
  'Asignación de músicos por instrumento',
  '14 días de prueba Pro gratis',
]

function RegisterPageContent() {
  const { register: authRegister } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState('')
  const inviteToken = searchParams.get('invite') ?? ''

  const { data: inviteData, isLoading: loadingInvite } = useQuery({
    queryKey: ['public-invite', inviteToken],
    queryFn: () => churchApi.getInvitePublic(inviteToken).then((r) => r.data),
    enabled: Boolean(inviteToken),
    retry: false,
  })

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({ resolver: zodResolver(schema) })

  useEffect(() => {
    if (!inviteData?.email) return

    setValue('email', inviteData.email)
    setValue('churchName', inviteData.churchName)
  }, [inviteData, setValue])

  const onSubmit = async (data: RegisterForm) => {
    setError('')

    // Si hay token de invitación, nunca enviar churchName
    const payload = inviteToken
      ? {
          name: data.name,
          email: data.email,
          password: data.password,
          inviteToken,
        }
      : data

    if (!inviteToken && !data.churchName) {
      setError('Debes indicar el nombre de la iglesia.')
      return
    }

    try {
      await authRegister(payload)
      router.push('/dashboard')
    } catch {
      setError('No se pudo crear la cuenta. Verifica los datos e intenta nuevamente.')
    }
  }

  return (
    <div className="relative flex min-h-screen overflow-hidden dark:bg-slate-950">
      <div className="pointer-events-none absolute inset-0 music-notes-bg opacity-40 dark:opacity-25" />
      {/* Panel izquierdo: form */}
      <div className="relative z-10 flex flex-1 items-center justify-center px-6 py-12 lg:px-10">
        <div className="w-full max-w-md rounded-[30px] border border-white/50 dark:border-slate-700 bg-white/78 dark:bg-slate-900 p-8 shadow-[0_24px_70px_rgba(22,43,73,0.12)] dark:shadow-[0_24px_70px_rgba(0,0,0,0.3)] backdrop-blur-xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 shadow-lg shadow-brand-900/20">
              <Music2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="block text-xl font-semibold text-slate-900 dark:text-white">
                SongList
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Workspace para alabanza
              </span>
            </div>
          </div>

          <span className="eyebrow">Comienza gratis</span>
          <h1 className="mb-1 mt-5 text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
            {inviteToken ? 'Activa tu invitación' : 'Crea tu cuenta'}
          </h1>
          <p className="mb-8 text-sm leading-6 text-slate-500 dark:text-slate-400">
            {inviteToken
              ? loadingInvite
                ? 'Verificando invitación...'
                : `Te unirás a ${inviteData?.churchName ?? 'la iglesia invitada'}`
              : 'Registra tu iglesia y empieza en minutos'}
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div
                role="alert"
                className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-200 text-sm rounded-lg px-4 py-3"
              >
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                Tu nombre
              </label>
              <input
                id="register-name"
                type="text"
                placeholder="Juan García"
                className="input"
                aria-describedby={errors.name ? 'register-name-error' : undefined}
                {...register('name')}
              />
              {errors.name && (
                <p id="register-name-error" role="alert" className="text-xs text-red-600 mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>

            {inviteToken ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                  Iglesia
                </label>
                <input
                  type="text"
                  className="input"
                  value={inviteData?.churchName ?? 'Invitación'}
                  disabled
                />
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                  Nombre de la iglesia
                </label>
                <input
                  id="register-churchName"
                  type="text"
                  placeholder="Iglesia Casa de Gracia"
                  className="input"
                  aria-describedby={errors.churchName ? 'register-churchName-error' : undefined}
                  {...register('churchName')}
                />
                {errors.churchName && (
                  <p
                    id="register-churchName-error"
                    role="alert"
                    className="text-xs text-red-600 mt-1"
                  >
                    {errors.churchName.message}
                  </p>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                Email
              </label>
              <input
                id="register-email"
                type="email"
                autoComplete="email"
                placeholder="juan@iglesia.com"
                className="input"
                disabled={Boolean(inviteToken)}
                aria-describedby={errors.email ? 'register-email-error' : undefined}
                {...register('email')}
              />
              {errors.email && (
                <p id="register-email-error" role="alert" className="text-xs text-red-600 mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                Contraseña
              </label>
              <input
                id="register-password"
                type="password"
                placeholder="********"
                className="input"
                aria-describedby={errors.password ? 'register-password-error' : undefined}
                {...register('password')}
              />
              {errors.password && (
                <p id="register-password-error" role="alert" className="text-xs text-red-600 mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            <button type="submit" className="btn btn-primary w-full mt-4" disabled={isSubmitting}>
              {isSubmitting ? 'Creando cuenta...' : 'Crear cuenta'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 dark:bg-slate-950" />}>
      <RegisterPageContent />
    </Suspense>
  )
}
