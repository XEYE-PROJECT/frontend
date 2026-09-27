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
