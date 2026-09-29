// Contratos de API: espejo de los DTO del backend (bearer JWT, JSON camelCase). La consola no
// habla con el microservicio de búsqueda: el playground pasa por el backend.

/** Listado paginado por offset ({items, total, offset, limit}); `limit` máximo 200. */
export interface Page<T> {
  items: T[]
  total: number
  offset: number
  limit: number
}

export interface PageQuery {
  offset?: number
  limit?: number
}

// Backend: usuarios / auth
export type Permission = 'user' | 'admin'

export interface User {
  id: number
  name: string
  surname: string
  email: string
  permission: Permission
  emailVerified: boolean
  locale: 'es' | 'en'
  mfaEnabled: boolean
  /** Proveedor SSO enlazado ('google' | 'microsoft') o null si la cuenta es de contraseña. */
  ssoProvider: string | null
  lastLoginAt: string | null
  createdAt: string
  updatedAt: string
}

/** Sesión abierta (token bearer + usuario). */
export interface AuthResponse {
  token: string
  tokenType: string
  expiresInMinutes: number
  user: User
  /** Solo tras POST /auth/mfa con rememberDevice: token de "dispositivo de confianza" (30 días). */
  mfaTrustToken?: string
}

/**
 * Respuesta de POST /auth/login, /auth/verify-email y /auth/sso/exchange: o bien la sesión, o bien
 * `mfaRequired: true` con el `mfaToken` que hay que devolver en POST /auth/mfa junto al código.
 */
export interface LoginResponse {
  mfaRequired: boolean
  mfaToken?: string
  token?: string
  tokenType?: string
  expiresInMinutes?: number
  user?: User
}

/** GET /auth/config: qué mostrar en los formularios de acceso. */
export interface AuthConfig {
  emailVerificationRequired: boolean
  ssoProviders: string[]
  captchaProvider: 'none' | 'turnstile'
  captchaSiteKey: string | null
}

export interface RegisterPayload {
  name: string
  surname: string
  email: string
  password: string
  locale?: string
  captchaToken?: string | null
}

export interface LoginPayload {
  email: string
  password: string
  captchaToken?: string | null
  /** Token de dispositivo de confianza guardado tras un 2FA anterior. */
  mfaTrustToken?: string | null
}

export interface UpdateUserPayload {
  name?: string
  surname?: string
  locale?: string
}

export interface ChangeEmailPayload {
  email: string
  currentPassword: string
}

export interface ChangePasswordPayload {
  currentPassword: string
  newPassword: string
}

export interface MfaSetup {
  secret: string
  otpauthUri: string
}

export interface MessageResponse {
  message: string
}

// Backend: administración (solo admin)
export interface AdminUser {
  id: number
  name: string
  surname: string
  email: string
  permission: Permission
  emailVerified: boolean
  mfaEnabled: boolean
  ssoProvider: string | null
  /** Búsquedas/min de la cuenta fijadas por un admin; null = el valor por defecto del buscador. */
  searchRateLimitPerMinute: number | null
  failedLoginCount: number
  lockedUntil: string | null
  lastLoginAt: string | null
  createdAt: string
}

export interface AdminUserPage {
  items: AdminUser[]
  total: number
  offset: number
  limit: number
}

export interface AdminUpdateUserPayload {
  permission?: Permission
  emailVerified?: boolean
  unlock?: boolean
  /** Cupo de búsquedas/min de la cuenta (todas sus claves API lo comparten). */
  searchRateLimitPerMinute?: number
  /** Vuelve al valor por defecto del buscador. */
  resetSearchRateLimit?: boolean
}

// Backend: api keys
/** Clave existente: el backend solo guarda su hash; `prefix` identifica la clave sin revelarla. */
export interface ApiKey {
  id: number
  name: string
  prefix: string
  createdAt: string
  updatedAt: string
}

/** Respuesta de POST /api-keys: la ÚNICA vez que existe el valor completo (`apiKey`). */
export interface CreatedApiKey extends ApiKey {
  apiKey: string
}

// Backend: listas
export interface ItemList {
  id: number
  name: string
  description: string | null
  public: boolean
  userId: number
  /** Nº de elementos (lo calcula el backend en el mismo listado). */
  elementCount: number
  createdAt: string
  updatedAt: string
}

/** GET /lists: `q` filtra por nombre/descripción, `public` por visibilidad. */
export interface ListsQuery extends PageQuery {
  q?: string
  public?: boolean
}

/** GET /lists/{id}/elements: `q` filtra por texto/descripción. */
export interface ElementsQuery extends PageQuery {
  q?: string
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
  'pending' | 'queued' | 'initialized' | 'optimizing' | 'training' | 'completed' | 'failed'

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
  /** Posición en la cola (1 = el siguiente) mientras `status === 'queued'`; null en otro caso. */
  queuePosition: number | null
  /** Último callback del worker (latido); null hasta que se lanza. */
  lastHeartbeatAt: string | null
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
  /** true = entrenar sin descripciones IA: solo texto + descripción escrita (gana a regenerar). */
  noDescriptions?: boolean
}

// Backend: sobre de error
export interface ApiError {
  status: number
  error: string
  message: string
  /** Identificador estable (EMAIL_NOT_VERIFIED, ACCOUNT_LOCKED, INVALID_MFA_CODE, RATE_LIMITED…). */
  code?: string
  details?: Record<string, string>
  timestamp: string
}

// Microservicio de búsqueda (directo, X-API-Key)
// Backend: playground de búsqueda (POST /lists/{id}/search). El backend reenvía la consulta al
// servicio de búsqueda por la red interna: la clave API nunca pasa por el navegador y también
// se pueden buscar listas privadas propias.
export interface ConsoleSearchPayload {
  searchTerm: string
  limit?: number
  includeScoreBreakdown?: boolean
}

export interface ConsoleSearchResult {
  item: string
  score: number
  params: unknown | null
  textScore?: number
  semanticScore?: number
}

/** Motivos con los que el buscador avisa de que sirvió con menos calidad. */
export type SearchDegradationReason =
  'no_embeddings' | 'model_unavailable' | 'model_mismatch' | 'stale_data'

export interface ConsoleSearchResponse {
  results: ConsoleSearchResult[]
  totalResults: number
  searchTerm: string
  listName: string
  durationMs: number
  /** true si la búsqueda se sirvió degradada; `degradationReasons` dice por qué. */
  degraded: boolean
  degradationReasons: SearchDegradationReason[]
}
