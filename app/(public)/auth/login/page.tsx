// app/login/page.tsx
'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Loader2, LogIn, AlertCircle, CheckCircle2 } from 'lucide-react'
import { loginUser } from '@/actions/auth/login'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

/* ────────────────────────────────────────────────────────────────────────────
   COMPONENTE: LoginPage
   Diseñado mobile-first con targets táctiles amplios, feedback visual
   inmediato, y estados de carga claros. Usa los tokens neutros del panel
   (no la paleta de marca de la landing pública) para que no compita con el
   resto del dashboard.
   ─────────────────────────────────────────────────────────────────────────── */

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error' | null; text: string }>({
    type: null,
    text: '',
  })

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      if (!email.trim() || !password.trim()) {
        setMessage({ type: 'error', text: 'Ingresa tu email y contraseña' })
        return
      }

      setLoading(true)
      setMessage({ type: null, text: '' })

      try {
        await loginUser(email.trim(), password)
        setMessage({ type: 'success', text: '¡Bienvenido de vuelta!' })
        setTimeout(() => router.push('/dashboard'), 600)
      } catch (err: unknown) {
        const error = err as { message?: string }
        setMessage({
          type: 'error',
          text: error?.message || 'Credenciales incorrectas. Intenta de nuevo.',
        })
      } finally {
        setLoading(false)
      }
    },
    [email, password, router]
  )

  return (
    <div className="flex min-h-dvh items-center justify-center bg-muted/30 px-4 py-6 text-foreground sm:px-6">
      <div className="w-full max-w-sm">
        {/* ── Header ── */}
        <div className="mb-6 text-center">
          <h1 className="text-xl font-semibold tracking-tight text-balance sm:text-2xl">
            Iniciar sesión
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Panel de administración de tu negocio
          </p>
        </div>

        {/* ── Formulario ── */}
        <div className="rounded-2xl border bg-card p-5 shadow-sm sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium text-foreground">
                Correo electrónico
              </Label>
              <Input
                id="email"
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                autoComplete="email"
                autoFocus
                required
                className={cn(
                  'h-12 rounded-xl text-base',
                  message.type === 'error' && !email && 'border-destructive focus-visible:ring-destructive/20'
                )}
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm font-medium text-foreground">
                Contraseña
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  className={cn(
                    'h-12 rounded-xl pr-12 text-base',
                    message.type === 'error' && !password && 'border-destructive focus-visible:ring-destructive/20'
                  )}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-1 top-1/2 size-10 -translate-y-1/2 rounded-lg text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? (
                    <EyeOff className="size-4" aria-hidden />
                  ) : (
                    <Eye className="size-4" aria-hidden />
                  )}
                </Button>
              </div>
            </div>

            {/* Mensaje de estado */}
            {message.text && (
              <div
                className={cn(
                  'flex items-start gap-2.5 rounded-xl px-4 py-3 text-sm font-medium',
                  message.type === 'error'
                    ? 'border border-destructive/20 bg-destructive/10 text-destructive'
                    : message.type === 'success'
                      ? 'border border-success/20 bg-success/10 text-success'
                      : 'border border-border bg-muted text-foreground'
                )}
              >
                {message.type === 'error' ? (
                  <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden />
                ) : message.type === 'success' ? (
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" aria-hidden />
                ) : null}
                <span>{message.text}</span>
              </div>
            )}

            {/* Botón submit */}
            <Button
              type="submit"
              disabled={loading}
              className="h-12 w-full rounded-xl text-sm font-semibold transition-transform active:scale-[0.97]"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
                  <span>Verificando...</span>
                </>
              ) : (
                <>
                  <LogIn className="mr-2 size-4" aria-hidden />
                  <span>Ingresar</span>
                </>
              )}
            </Button>
          </form>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-xs text-muted-foreground">
            Acceso exclusivo para administradores.
          </p>
          <p className="mt-4 text-xs text-muted-foreground">
            ¿Tienes un negocio?{' '}
            <a
              href="https://dejuarez.mx"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-foreground underline underline-offset-2 hover:text-primary"
            >
              Conoce ChangarroOS
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}