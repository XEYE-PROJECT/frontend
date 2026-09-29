import { describe, expect, it } from 'vitest'
import {
  embeddingModelName,
  formatCost,
  formatDate,
  hueFromString,
  initials,
  isEmbeddingsOnly,
  isValidJson,
  prettyParams,
} from '~/utils/format'

describe('format', () => {
  it('formatDate devuelve — para valores vacíos o inválidos', () => {
    expect(formatDate(null, 'es')).toBe('—')
    expect(formatDate('no es una fecha', 'en')).toBe('—')
    expect(formatDate('2026-07-07T10:00:00Z', 'en')).toContain('2026')
  })

  it('formatCost usa euros y hasta 4 decimales', () => {
    expect(formatCost(null, 'es')).toBe('—')
    expect(formatCost(0.1234, 'en')).toBe('€0.1234')
  })

  it('embeddingModelName saca el modelo del JSON opaco del worker', () => {
    expect(embeddingModelName('{"embedding_model":"MiniLM","strategy":"default"}')).toBe('MiniLM')
    expect(embeddingModelName('legacy-plain-string')).toBe('legacy-plain-string')
    expect(embeddingModelName(null)).toBe('—')
  })

  it('isEmbeddingsOnly detecta la estrategia sin LLM', () => {
    expect(isEmbeddingsOnly([{ key: 'strategy', value: 'embeddings_only' }])).toBe(true)
    expect(isEmbeddingsOnly([{ key: 'strategy', value: 'default' }])).toBe(false)
    expect(isEmbeddingsOnly(null)).toBe(false)
  })

  it('prettyParams e isValidJson', () => {
    expect(prettyParams('{"a":1}')).toBe('{\n  "a": 1\n}')
    expect(prettyParams('no json')).toBe('no json')
    expect(prettyParams(null)).toBe('')
    expect(isValidJson('')).toBe(true)
    expect(isValidJson('{"ok":true}')).toBe(true)
    expect(isValidJson('{')).toBe(false)
  })

  it('hueFromString es determinista y está en [0, 360)', () => {
    expect(hueFromString('Herramientas')).toBe(hueFromString('Herramientas'))
    expect(hueFromString('x')).toBeGreaterThanOrEqual(0)
    expect(hueFromString('x')).toBeLessThan(360)
  })

  it('initials', () => {
    expect(initials('Joan', 'Martorell')).toBe('JM')
    expect(initials(' ana ', null)).toBe('A')
    expect(initials('', '')).toBe('·')
  })
})
