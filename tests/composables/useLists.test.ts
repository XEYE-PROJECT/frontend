import { registerEndpoint } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import { useListsApi } from '~/composables/useLists'

const list = { id: 7, name: 'Herramientas', description: null, public: true, elementCount: 2 }
let lastQuery: Record<string, string> = {}

registerEndpoint('/backend/lists', (event) => {
  lastQuery = Object.fromEntries(new URL(event.node.req.url ?? '', 'http://x').searchParams)
  return { items: [list], total: 1, offset: Number(lastQuery.offset ?? 0), limit: 25 }
})
registerEndpoint('/backend/lists/7', () => list)
registerEndpoint('/backend/lists/999', () => {
  throw createError({ statusCode: 404, statusMessage: 'Not Found' })
})

describe('useListsApi', () => {
  it('list pasa offset/limit/q como query y devuelve la página', async () => {
    const api = useListsApi()
    const page = await api.list({ offset: 25, limit: 25, q: 'herr' })
    expect(page.items[0]?.name).toBe('Herramientas')
    expect(page.total).toBe(1)
    expect(lastQuery).toMatchObject({ offset: '25', limit: '25', q: 'herr' })
  })

  it('all pide las primeras 200 y devuelve solo items', async () => {
    const api = useListsApi()
    const items = await api.all()
    expect(items).toHaveLength(1)
    expect(lastQuery.limit).toBe('200')
  })

  it('get devuelve la lista y un 404 se propaga como error con estado', async () => {
    const api = useListsApi()
    expect((await api.get(7)).id).toBe(7)
    await expect(api.get(999)).rejects.toMatchObject({ status: 404 })
  })
})
