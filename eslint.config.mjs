// ESLint (flat config) con la base oficial de Nuxt. Prettier va aparte (`pnpm format`):
// eslint-config-prettier desactiva aquí las reglas de formato para que no choquen.
import { createConfigForNuxt } from '@nuxt/eslint-config/flat'
import prettier from 'eslint-config-prettier'

export default createConfigForNuxt({
  features: {
    // Sin reglas estilísticas: el formato lo decide Prettier.
    stylistic: false,
  },
})
  .prepend({
    ignores: ['.nuxt/**', '.output/**', '.nitro/**', 'node_modules/**', 'dist/**', 'coverage/**'],
  })
  .append(
    {
      rules: {
        // Las páginas, layouts y componentes de una sola palabra (Button, Badge, Modal…) se usan
        // siempre con el prefijo del directorio (UiButton, …): la regla no aporta aquí.
        'vue/multi-word-component-names': 'off',
        // Con `defineProps<{ x?: string }>()` un prop opcional ya es `undefined` por diseño;
        // exigir `default` a cada uno solo mete ruido.
        'vue/require-default-prop': 'off',
      },
    },
    prettier,
  )
