import type { ImportElementItem } from '~/types/api'

/** Fallo de parseo con sufijo i18n para las claves `elements.importError*`. */
export class ElementImportError extends Error {
  constructor(
    public key: 'InvalidJson' | 'NotArray' | 'Empty' | 'MissingText',
    public index?: number,
  ) {
    super(`elements.importError${key}`)
  }
}

/**
 * Parsea un fichero JSON de importación a elementos. Acepta un array de objetos
 * (`{ text, description?, params? }`, como los ejemplos del training-service)
 * o de strings sueltos (solo texto). Lanza {@link ElementImportError}.
 */
export function parseElementsImport(raw: string): ImportElementItem[] {
  let data: unknown
  try {
    data = JSON.parse(raw)
  } catch {
    throw new ElementImportError('InvalidJson')
  }
  if (!Array.isArray(data)) throw new ElementImportError('NotArray')
  if (data.length === 0) throw new ElementImportError('Empty')

  return data.map((entry, index) => {
    if (typeof entry === 'string' && entry.trim()) return { text: entry.trim() }
    if (entry && typeof entry === 'object' && !Array.isArray(entry)) {
      const { text, description, params } = entry as Record<string, unknown>
      if (typeof text === 'string' && text.trim()) {
        return {
          text: text.trim(),
          description: typeof description === 'string' && description.trim() ? description : null,
          params: params ?? null,
        }
      }
    }
    throw new ElementImportError('MissingText', index + 1)
  })
}
