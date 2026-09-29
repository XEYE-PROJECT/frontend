import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it, vi } from 'vitest'
import UiAlert from '~/components/ui/Alert.vue'
import UiBadge from '~/components/ui/Badge.vue'
import UiButton from '~/components/ui/Button.vue'
import UiPagination from '~/components/ui/Pagination.vue'
import StatusBadge from '~/components/trainings/StatusBadge.vue'

describe('UiButton', () => {
  it('renderiza un botón con la variante y propaga el click nativo', async () => {
    const onClick = vi.fn()
    const wrapper = await mountSuspended(UiButton, {
      props: { variant: 'danger' },
      attrs: { onClick },
      slots: { default: () => 'Borrar' },
    })
    const button = wrapper.find('button')
    expect(button.text()).toBe('Borrar')
    expect(button.classes().join(' ')).toContain('bg-danger')
    expect(button.attributes('type')).toBe('button')
    await button.trigger('click')
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('loading desactiva el botón y marca aria-busy', async () => {
    const wrapper = await mountSuspended(UiButton, { props: { loading: true } })
    const button = wrapper.find('button')
    expect(button.attributes('disabled')).toBeDefined()
    expect(button.attributes('aria-busy')).toBe('true')
  })

  it('con `to` es un enlace', async () => {
    const wrapper = await mountSuspended(UiButton, {
      props: { to: '/lists' },
      slots: { default: () => 'Listas' },
    })
    expect(wrapper.find('a').attributes('href')).toBe('/lists')
  })
})

describe('UiBadge y UiAlert', () => {
  it('UiBadge aplica la variante y el punto', async () => {
    const wrapper = await mountSuspended(UiBadge, {
      props: { variant: 'success', dot: true },
      slots: { default: () => 'OK' },
    })
    expect(wrapper.text()).toBe('OK')
    expect(wrapper.classes().join(' ')).toContain('bg-success-soft')
    expect(wrapper.find('.bg-success').exists()).toBe(true)
  })

  it.each(['info', 'success', 'warning', 'danger'] as const)('UiAlert %s', async (variant) => {
    const wrapper = await mountSuspended(UiAlert, {
      props: { variant, title: 'Título' },
      slots: { default: () => 'Cuerpo' },
    })
    expect(wrapper.classes().join(' ')).toContain(`bg-${variant}-soft`)
    expect(wrapper.text()).toContain('Título')
    expect(wrapper.text()).toContain('Cuerpo')
  })
})

describe('UiPagination', () => {
  it('no renderiza nada si todo cabe en una página', async () => {
    const wrapper = await mountSuspended(UiPagination, { props: { total: 10, pageSize: 25 } })
    expect(wrapper.find('nav').exists()).toBe(false)
  })

  it('muestra elipsis y emite la página elegida dentro de los límites', async () => {
    const onUpdate = vi.fn()
    const wrapper = await mountSuspended(UiPagination, {
      props: { total: 500, pageSize: 25, modelValue: 10 },
      attrs: { 'onUpdate:modelValue': onUpdate },
    })
    expect(wrapper.text()).toContain('…')
    const buttons = wrapper.findAll('button')
    // Primer botón = anterior; último = siguiente.
    await buttons[0]!.trigger('click')
    await buttons[buttons.length - 1]!.trigger('click')
    expect(onUpdate.mock.calls.map((c) => c[0])).toEqual([9, 11])
  })

  it('desactiva anterior en la primera página', async () => {
    const wrapper = await mountSuspended(UiPagination, {
      props: { total: 100, pageSize: 25, modelValue: 1 },
    })
    expect(wrapper.findAll('button')[0]!.attributes('disabled')).toBeDefined()
  })
})

describe('TrainingsStatusBadge', () => {
  it.each([
    ['completed', 'bg-success-soft'],
    ['failed', 'bg-danger-soft'],
    ['training', 'bg-warning-soft'],
    ['queued', 'bg-surface-2'],
  ] as const)('%s → %s', async (status, cls) => {
    const wrapper = await mountSuspended(StatusBadge, { props: { status } })
    expect(wrapper.find('span').classes().join(' ')).toContain(cls)
    expect(wrapper.text().length).toBeGreaterThan(0)
  })
})
