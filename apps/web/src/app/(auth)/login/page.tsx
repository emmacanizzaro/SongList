"use client";

import { useAuth } from "@/hooks/useAuth";
import { zodResolver } from "@hookform/resolvers/zod";
import { Music2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const schema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "Mínimo 8 caracteres"),
});

type LoginForm = z.infer<typeof schema>;

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: LoginForm) => {
    setError("");
    try {
      await login(data.email, data.password);
      router.push("/dashboard");
    } catch {
      setError("Credenciales incorrectas. Verifica tu email y contraseña.");
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10 dark:bg-slate-950">
      <div className="pointer-events-none absolute inset-0 music-notes-bg opacity-50 dark:opacity-30" />
      <div className="relative w-full max-w-5xl overflow-hidden rounded-[32px] border border-white/50 dark:border-slate-700 bg-white/70 dark:bg-slate-900 shadow-[0_30px_80px_rgba(22,43,73,0.16)] dark:shadow-[0_30px_80px_rgba(0,0,0,0.4)] backdrop-blur-xl lg:grid lg:grid-cols-[1.1fr_0.9fr]">
        <div className="hidden bg-slate-950 p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div>
            <span className="eyebrow bg-white/10 text-slate-200">
              SongList Platform
            </span>
            <h2 className="mt-6 text-4xl font-semibold leading-tight">
              Ordena a tu equipo para servir con calma y claridad.
            </h2>
            <p className="mt-4 max-w-md text-sm leading-6 text-slate-300">
              Canciones, reuniones y músicos en un mismo lugar con una interfaz
              pensada para preparar el servicio sin distracciones.
            </p>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-white/5 p-6">
            <p className="text-sm text-slate-300">
              Lo esencial, visible al instante
            </p>
            <div className="mt-5 grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-2xl font-semibold text-white">+50</p>
                <p className="mt-1 text-slate-400">canciones organizadas</p>
              </div>
              <div>
                <p className="text-2xl font-semibold text-white">3 min</p>
                <p className="mt-1 text-slate-400">para preparar una reunión</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-8 lg:p-10">
          <div className="mb-8">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-[20px] bg-gradient-to-br from-brand-500 to-brand-700 shadow-lg shadow-brand-900/20">
              <Music2 className="h-7 w-7 text-white" />
            </div>
            <h1 className="mt-6 text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
              Bienvenido de nuevo
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
              Accede a tu espacio de trabajo y continúa preparando a tu equipo.
            </p>
          </div>

          <div className="card p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {error && (
                <div className="rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950 px-4 py-3 text-sm text-red-700 dark:text-red-200">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  autoComplete="email"
                  placeholder="juan@iglesia.com"
                  className="input"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-xs text-red-600 mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                  Contraseña
                </label>
                <input
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="input"
                  {...register("password")}
                />
                {errors.password && (
                  <p className="text-xs text-red-600 mt-1">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary w-full disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "Ingresando..." : "Ingresar"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-500 dark:text-slate-400">
              ¿No tienes cuenta?{" "}
              <Link
                href="/register"
                className="text-brand-600 dark:text-brand-400 font-medium hover:underline dark:hover:text-brand-300"
              >
                Registrar iglesia
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
