import type { EmbeddingModels, LaunchTrainingPayload, Training } from '~/types/api'

/** Endpoints de entrenamientos: historial por lista, pendientes y lanzamiento manual. */
export function useTrainingsApi() {
  const { $api } = useNuxtApp()

  return {
    listByList: (listId: number) => $api<Training[]>(`/lists/${listId}/trainings`),
    get: (id: number) => $api<Training>(`/trainings/${id}`),
    /** Entrenamientos pendientes del usuario en todas sus listas (alimenta los avisos). */
    pending: () => $api<Training[]>('/trainings/pending'),
    embeddingModels: () => $api<EmbeddingModels>('/trainings/embedding-models'),
    launch: (id: number, body: LaunchTrainingPayload) =>
      $api<Training>(`/trainings/${id}/launch`, { method: 'POST', body }),
    /** Reentrena la lista ya: reutiliza su entrenamiento pendiente o crea uno y lo lanza. */
    retrain: (listId: number, body: LaunchTrainingPayload) =>
      $api<Training>(`/lists/${listId}/trainings`, { method: 'POST', body }),
  }
}
