import { describe, expect, it } from 'vitest'
import { ElementImportError, parseElementsImport } from '~/utils/elementImport'

describe('parseElementsImport', () => {
  it('acepta objetos y strings sueltos', () => {
    const items = parseElementsImport(
      JSON.stringify([
        { text: ' martillo ', description: 'Mango de madera', params: { precio: 12.5 } },
        { text: 'destornillador', description: '  ' },
        'alicates',
      ]),
    )
    expect(items).toEqual([
      { text: 'martillo', description: 'Mango de madera', params: { precio: 12.5 } },
      { text: 'destornillador', description: null, params: null },
      { text: 'alicates' },
    ])
  })

  it.each([
    ['{', 'InvalidJson'],
    ['{"text":"x"}', 'NotArray'],
    ['[]', 'Empty'],
  ])('rechaza %s con %s', (raw, key) => {
    expect(() => parseElementsImport(raw)).toThrowError(ElementImportError)
    try {
      parseElementsImport(raw)
    } catch (e) {
      expect((e as ElementImportError).key).toBe(key)
    }
  })

  it('señala la posición del elemento sin texto', () => {
    try {
      parseElementsImport('[{"text":"ok"},{"description":"sin texto"}]')
      throw new Error('should have thrown')
    } catch (e) {
      expect(e).toBeInstanceOf(ElementImportError)
      expect((e as ElementImportError).key).toBe('MissingText')
      expect((e as ElementImportError).index).toBe(2)
      expect((e as ElementImportError).message).toBe('elements.importErrorMissingText')
    }
  })
})
