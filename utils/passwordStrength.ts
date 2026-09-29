// Indicador de fortaleza de contraseña (solo orientativo, en cliente). La política real la
// aplica el backend: 8–72 caracteres, no común, no contiene el email y no filtrada (HIBP).

export type StrengthLevel = 0 | 1 | 2 | 3 | 4

export interface PasswordStrength {
  /** 0 = vacía/inválida … 4 = muy fuerte. */
  level: StrengthLevel
  /** Bytes UTF-8 (BCrypt solo tiene en cuenta 72). */
  bytes: number
}

const COMMON = new Set([
  'password',
  'password1',
  'password123',
  'contraseña',
  '12345678',
  '123456789',
  'qwertyuiop',
  'qwerty123',
  'iloveyou',
  'admin123',
  'welcome1',
  'abcd1234',
  '11111111',
])

export function passwordBytes(value: string): number {
  return new TextEncoder().encode(value).length
}

export function passwordStrength(value: string, email = ''): PasswordStrength {
  const bytes = passwordBytes(value)
  if (value.length < 8 || bytes > 72) return { level: 0, bytes }
  const lower = value.toLowerCase()
  if (COMMON.has(lower)) return { level: 1, bytes }
  const local = email.toLowerCase().split('@')[0] ?? ''
  if (local.length >= 4 && lower.includes(local)) return { level: 1, bytes }

  // Entropía aproximada: tamaño del alfabeto ^ longitud, penalizando repeticiones.
  let alphabet = 0
  if (/[a-z]/.test(value)) alphabet += 26
  if (/[A-Z]/.test(value)) alphabet += 26
  if (/\d/.test(value)) alphabet += 10
  if (/[^A-Za-z0-9]/.test(value)) alphabet += 33
  const unique = new Set(value).size
  const effectiveLength = Math.min(value.length, unique * 1.5)
  const bits = effectiveLength * Math.log2(Math.max(alphabet, 2))

  if (bits < 36) return { level: 1, bytes }
  if (bits < 50) return { level: 2, bytes }
  if (bits < 70) return { level: 3, bytes }
  return { level: 4, bytes }
}
