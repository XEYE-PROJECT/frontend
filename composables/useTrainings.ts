import type {
  EmbeddingModels,
  LaunchTrainingPayload,
  Page,
  PageQuery,
  Training,
  TrainingCostEstimate,
} from '~/types/api'

/** Endpoints de entrenamientos: historial por lista, pendientes y lanzamiento manual (encolado). */
export function useTrainingsApi() {
  const { $api } = useNuxtApp()

  return {
    /** Historial de la lista, los más recientes primero (`limit` máximo 200). */
    listByList: (listId: number, query: PageQuery = {}) =>
      $api<Page<Training>>(`/lists/${listId}/trainings`, { query }),
    get: (id: number) => $api<Training>(`/trainings/${id}`),
    /** Entrenamientos pendientes del usuario en todas sus listas (alimenta los avisos). */
    pending: () => $api<Training[]>('/trainings/pending'),
    embeddingModels: () => $api<EmbeddingModels>('/trainings/embedding-models'),
    launch: (id: number, body: LaunchTrainingPayload) =>
      $api<Training>(`/trainings/${id}/launch`, { method: 'POST', body }),
    /** Activa un entrenamiento completado como el modelo en uso (debe cubrir los elementos actuales). */
    use: (id: number) => $api<Training>(`/trainings/${id}/use`, { method: 'POST' }),
    /** Reentrena la lista ya: reutiliza su entrenamiento pendiente o crea uno y lo encola (arranca al haber hueco). */
    retrain: (listId: number, body: LaunchTrainingPayload) =>
      $api<Training>(`/lists/${listId}/trainings`, { method: 'POST', body }),
    /** Precio preestablecido de lanzar un entrenamiento de la lista ahora mismo. */
    estimate: (listId: number, regenerateDescriptions = false, noDescriptions = false) =>
      $api<TrainingCostEstimate>(`/lists/${listId}/trainings/estimate`, {
        query: { regenerateDescriptions, noDescriptions },
      }),
  }
}
