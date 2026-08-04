// Contratos de API: espejo de los DTO del backend y del microservicio de búsqueda.
// Backend: bearer JWT, JSON camelCase. Búsqueda: X-API-Key, JSON snake_case.

// Backend: usuarios / auth
export type Permission = 'user' | 'admin'

export interface User {
  id: number
  name: string
  surname: string
  email: string
  permission: Permission
  createdAt: string
  updatedAt: string
}

export interface AuthResponse {
  token: string
  tokenType: string
  expiresInMinutes: number
  user: User
}

export interface RegisterPayload {
  name: string
  surname: string
  email: string
  password: string
}

export interface LoginPayload {
  email: string
  password: string
}

export interface UpdateUserPayload {
  name?: string
  surname?: string
  email?: string
  password?: string
}

// Backend: api keys
export interface ApiKey {
  id: number
  name: string
  /** El secreto en claro: se devuelve en cada lectura, trátalo como sensible. */
  apiKey: string
  createdAt: string
  updatedAt: string
}

// Backend: listas
export interface ItemList {
  id: number
  name: string
  description: string | null
  public: boolean
  userId: number
  createdAt: string
  updatedAt: string
}

export interface CreateListPayload {
  name: string
  description?: string | null
  public?: boolean
}

export interface UpdateListPayload {
  name?: string
  description?: string | null
  public?: boolean
}

// Backend: elementos
export interface Element {
  id: number
  listId: number
  text: string
  /** String opaco (JSON o texto plano) que el backend guarda tal cual. */
  params: string | null
  description: string | null
  generatedDescription: string | null
  trained: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateElementPayload {
  text: string
  params?: string | null
  description?: string | null
}

export interface UpdateElementPayload {
  text?: string
  params?: string | null
  description?: string | null
}

/** Entrada de importación masiva; `params` admite cualquier JSON (el backend serializa lo que no sea string). */
export interface ImportElementItem {
  text: string
  params?: unknown
  description?: string | null
}

export interface ImportElementsPayload {
  elements: ImportElementItem[]
}

// Backend: entrenamientos
export type TrainingStatus =
  | 'pending'
  | 'queued'
  | 'initialized'
  | 'optimizing'
  | 'training'
  | 'completed'
  | 'failed'

export interface TrainingOption {
  key: string
  value: unknown
}

export interface TrainingTime {
  optimizingSeconds: number | null
  trainingSeconds: number | null
  totalSeconds: number | null
}

export interface TrainingCost {
  runpod: number | null
  /** Precio fijo por entrenamiento (null en entrenamientos anteriores al cambio). */
  fixed: number | null
  /** Precio por descripciones generadas: n.º planificado x tarifa del LLM. */
  enrichment: number | null
  total: number | null
}

/** Precio preestablecido de lanzar un entrenamiento ahora: fijo + descripciones a generar. */
export interface TrainingCostEstimate {
  descriptionsToGenerate: number
  fixed: number
  enrichment: number
  total: number
}

export interface Training {
  id: number
  listId: number
  userId: number
  instanceId: string | null
  status: TrainingStatus
  options: TrainingOption[] | null
  elementCount: number | null
  /** Elementos con descripción IA al calcular los embeddings (null en entrenamientos antiguos). */
  describedCount: number | null
  model: string | null
  time: TrainingTime | null
  cost: TrainingCost | null
  error: string | null
  inUse: boolean
  hasEmbeddings: boolean
  usable: boolean | null
  createdAt: string
  updatedAt: string
}

export interface EmbeddingModels {
  models: string[]
  defaultModel: string | null
}

export interface LaunchTrainingPayload {
  embeddingModel: string | null
  /** true = el worker regenera las descripciones IA de todos los elementos, ignorando la caché. */
  regenerateDescriptions?: boolean
}

// Backend: sobre de error
export interface ApiError {
  status: number
  error: string
  message: string
  details?: Record<string, string>
  timestamp: string
}

// Microservicio de búsqueda (directo, X-API-Key)
export interface SearchPayload {
  list_name: string
  search_term: string
  limit?: number
  session?: string | null
  register_log?: boolean
  allow_private?: boolean
}

export interface SearchResultItem {
  item: string
  score: number
  params: unknown | null
  text_score?: number
  semantic_score?: number
}

export interface SearchResponse {
  success: boolean
  results: SearchResultItem[]
  total_results: number
  search_term: string
  list_name: string
  duration_ms: number
  error?: string | null
}

/** Sobre de error del servicio de búsqueda ({ error, detail }), distinto al del backend. */
export interface SearchError {
  error: string
  detail?: string
}
