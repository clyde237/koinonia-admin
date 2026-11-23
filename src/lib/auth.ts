import { createAuthClient } from 'better-auth/react'

export const authClient = createAuthClient({
  baseURL: window.location.origin,
  basePath: '/api/admin/auth',
  fetchOptions: { timeout: 60000, credentials: 'include' },
})

export type AdminUser = {
  id: string
  email: string
  name: string
  role: 'owner' | 'administrator' | 'breakfast_editor'
  mustChangePassword: boolean
  permissions: string[]
}

export async function adminRequest<T>(path: string, body?: unknown): Promise<T> {
  const response = await fetch('/api/admin' + path, {
    method: body === undefined ? 'GET' : 'POST',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(90000),
  })
  const result = await response.json()
  if (!response.ok) {
    if (response.status === 401) window.dispatchEvent(new Event('koinonia:admin-session-expired'))
    throw new Error(result.error || result.message || 'Cette action est indisponible.')
  }
  return result
}

export function authMessage(error: { code?: string; message?: string } | null | undefined) {
  const messages: Record<string, string> = {
    INVALID_EMAIL_OR_PASSWORD: 'Adresse e-mail ou mot de passe incorrect.',
    INVALID_PASSWORD: 'Le mot de passe actuel est incorrect.',
    ADMIN_ACCESS_REQUIRED: 'Ce compte ne dispose pas d’un accès à l’administration.',
    TOO_MANY_ATTEMPTS: 'Trop de tentatives. Patientez avant de réessayer.',
    EMAIL_NOT_VERIFIED: 'Vérifiez votre adresse e-mail pour vous connecter.',
    DATABASE_UNAVAILABLE: 'La base de données est temporairement inaccessible. Réessayez dans quelques secondes.',
    ADMIN_NOT_CONFIGURED: 'L’administration doit être configurée par le responsable technique.',
    AUTH_UNAVAILABLE: 'Le service de connexion est temporairement inaccessible. Réessayez dans quelques secondes.',
  }
  return messages[error?.code ?? ''] || 'Connexion indisponible. Vérifiez votre connexion et réessayez.'
}
