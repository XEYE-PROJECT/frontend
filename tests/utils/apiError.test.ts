import { describe, expect, it } from 'vitest'
import { apiErrorMessage, errorCode, fieldErrors, retryAfterSeconds } from '~/utils/apiError'

const t = (key: string, params?: Record<string, string | number>) =>
  params ? `${key}:${JSON.stringify(params)}` : key

describe('apiErrorMessage', () => {
  it('prefiere el message del sobre ApiError del backend', () => {
    const e = { status: 409, data: { status: 409, code: 'CONFLICT', message: 'Ya existe' } }
    expect(apiErrorMessage(e, t)).toBe('Ya existe')
  })

  it('tolera cuerpos antiguos con detail o error', () => {
    expect(apiErrorMessage({ status: 400, data: { detail: 'Detalle' } }, t)).toBe('Detalle')
    expect(apiErrorMessage({ status: 400, data: { error: 'Fallo' } }, t)).toBe('Fallo')
  })

  it('traduce por estado cuando no hay mensaje', () => {
    expect(apiErrorMessage({ status: 401 }, t)).toBe('errors.unauthorized')
    expect(apiErrorMessage({ statusCode: 404 }, t)).toBe('errors.notFound')
    expect(apiErrorMessage({ response: { status: 503 } }, t)).toBe('errors.unavailable')
    expect(apiErrorMessage({ status: 500 }, t)).toBe('errors.generic')
  })

  it('sin estado es un error de red', () => {
    expect(apiErrorMessage(new TypeError('fetch failed'), t)).toBe('errors.network')
  })

  it('un 429 lleva los segundos del Retry-After', () => {
    const headers = new Headers({ 'Retry-After': '30' })
    const e = { status: 429, response: { status: 429, headers } }
    expect(retryAfterSeconds(e)).toBe(30)
    expect(apiErrorMessage(e, t)).toBe('errors.rateLimited:{"seconds":30}')
    expect(apiErrorMessage({ status: 429 }, t)).toBe('errors.rateLimited:{"seconds":60}')
  })
})

describe('errorCode y fieldErrors', () => {
  it('extrae el código estable y los detalles por campo', () => {
    const e = { data: { code: 'VALIDATION_FAILED', details: { name: 'must not be blank' } } }
    expect(errorCode(e)).toBe('VALIDATION_FAILED')
    expect(fieldErrors(e)).toEqual({ name: 'must not be blank' })
  })

  it('devuelve undefined / {} cuando no hay datos', () => {
    expect(errorCode(null)).toBeUndefined()
    expect(fieldErrors({ status: 500 })).toEqual({})
  })
})
