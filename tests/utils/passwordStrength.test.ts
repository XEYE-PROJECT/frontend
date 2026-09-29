import { describe, expect, it } from 'vitest'
import { passwordBytes, passwordStrength } from '~/utils/passwordStrength'

describe('passwordStrength', () => {
  it('nivel 0 si es corta o supera los 72 bytes de BCrypt', () => {
    expect(passwordStrength('abc').level).toBe(0)
    expect(passwordStrength('ñ'.repeat(40)).level).toBe(0) // 80 bytes
  })

  it('nivel 1 para contraseñas comunes o que contienen el email', () => {
    expect(passwordStrength('password123').level).toBe(1)
    expect(passwordStrength('joanmartorell2026', 'joanmartorell@x.es').level).toBe(1)
  })

  it('crece con la longitud y la variedad', () => {
    expect(passwordStrength('aaaaaaaa').level).toBe(1)
    expect(passwordStrength('correct horse battery staple').level).toBe(4)
    expect(passwordStrength('Tr0ub4dor&3').level).toBeGreaterThanOrEqual(2)
  })

  it('cuenta bytes UTF-8', () => {
    expect(passwordBytes('abc')).toBe(3)
    expect(passwordBytes('ñ')).toBe(2)
  })
})
