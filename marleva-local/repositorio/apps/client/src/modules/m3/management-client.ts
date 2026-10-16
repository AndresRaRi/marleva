import { parseOffer, type CatalogOffer } from './catalog-client';
export type OfferInput = Omit<
  CatalogOffer,
  'id' | 'version_id' | 'version' | 'seller' | 'photos' | 'updated_at'
>;
export interface ManagedVersion extends OfferInput {
  id: string;
  number: number;
  state: string;
  reason: string | null;
  photos: { id: string; position: number }[];
}
export interface ManagedOffer {
  id: string;
  seller_id: string;
  revision: number;
  paused: boolean;
  public_version_id: string | null;
  versions: ManagedVersion[];
}
export interface ManagedContext {
  actor_id: string;
  reviewer: boolean;
  mfa: boolean;
  csrf_token: string | null;
  sellers: { id: string; name: string }[];
}
export class ManagementError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string,
  ) {
    super(message);
  }
}
function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    throw new ManagementError('No pudimos leer la respuesta.', 503);
  return value as Record<string, unknown>;
}
function id(value: unknown): string {
  if (
    typeof value !== 'string' ||
    !/^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/u.test(value)
  )
    throw new ManagementError('La respuesta está incompleta.', 503);
  return value;
}
export function inputOf(value: OfferInput): OfferInput {
  return {
    title: value.title,
    description: value.description,
    kind: value.kind,
    category: value.category,
    price_cents: value.price_cents,
    unit: value.unit,
    stock: value.stock,
    made_to_order: value.made_to_order,
    developments: value.developments,
    modalities: value.modalities,
    response_minutes: value.response_minutes,
    preparation_minutes: value.preparation_minutes,
    food: value.food
      ? {
          ingredients: value.food.ingredients,
          allergens: value.food.allergens,
          storage: value.food.storage,
        }
      : null,
  };
}
function version(value: unknown, offerId: string, sellerId: string): ManagedVersion {
  const row = record(value),
    versionId = id(row.id);
  if (
    !Number.isSafeInteger(row.number) ||
    Number(row.number) < 1 ||
    !['draft', 'pending', 'approved', 'correction', 'rejected'].includes(String(row.state)) ||
    (row.reason !== null && typeof row.reason !== 'string') ||
    !Array.isArray(row.photos) ||
    row.photos.length > 6
  )
    throw new ManagementError('La versión recibida está incompleta.', 503);
  const data = parseOffer({
    ...row,
    id: offerId,
    version_id: versionId,
    version: row.number,
    seller: { id: sellerId, name: '' },
    updated_at: '2000-01-01T00:00:00.000000Z',
    photos: [],
  });
  const photos = row.photos.map((raw) => {
    const p = record(raw);
    if (!Number.isInteger(p.position) || Number(p.position) < 1 || Number(p.position) > 6)
      throw new ManagementError('Las fotos recibidas no son válidas.', 503);
    return { id: id(p.id), position: Number(p.position) };
  });
  if (
    new Set(photos.map((p) => p.id)).size !== photos.length ||
    new Set(photos.map((p) => p.position)).size !== photos.length
  )
    throw new ManagementError('Las fotos recibidas no son válidas.', 503);
  return {
    ...inputOf(data),
    id: versionId,
    number: Number(row.number),
    state: String(row.state),
    reason: row.reason as string | null,
    photos,
  };
}
function managedOffer(value: unknown): ManagedOffer {
  const row = record(value),
    offerId = id(row.id),
    sellerId = id(row.seller_id);
  if (
    !Number.isSafeInteger(row.revision) ||
    Number(row.revision) < 1 ||
    typeof row.paused !== 'boolean' ||
    !Array.isArray(row.versions) ||
    row.versions.length === 0
  )
    throw new ManagementError('La oferta recibida está incompleta.', 503);
  return {
    id: offerId,
    seller_id: sellerId,
    revision: Number(row.revision),
    paused: row.paused,
    public_version_id: row.public_version_id === null ? null : id(row.public_version_id),
    versions: row.versions.map((v) => version(v, offerId, sellerId)),
  };
}
function context(value: unknown): ManagedContext {
  const row = record(value);
  if (
    typeof row.reviewer !== 'boolean' ||
    typeof row.mfa !== 'boolean' ||
    (row.csrf_token !== null && typeof row.csrf_token !== 'string') ||
    !Array.isArray(row.sellers)
  )
    throw new ManagementError('No pudimos verificar tu sesión.', 503);
  return {
    actor_id: id(row.actor_id),
    reviewer: row.reviewer,
    mfa: row.mfa,
    csrf_token: row.csrf_token as string | null,
    sellers: row.sellers.map((raw) => {
      const s = record(raw);
      if (typeof s.name !== 'string')
        throw new ManagementError('No pudimos leer el oferente.', 503);
      return { id: id(s.id), name: s.name };
    }),
  };
}
async function failure(response: Response): Promise<ManagementError> {
  let message =
    response.status === 401
      ? 'Inicia sesión para continuar.'
      : 'No pudimos guardar los cambios. Vuelve a intentar.';
  const data = await response.json().catch(() => null);
  if (data && typeof data.mensaje === 'string') message = data.mensaje;
  return new ManagementError(
    message,
    response.status,
    typeof data?.codigo === 'string' ? data.codigo : undefined,
  );
}
async function readResponse(response: Response, binary: boolean): Promise<unknown> {
  if (!response.ok) throw await failure(response);
  if (!binary) return response.json();
  if (!response.headers.get('Content-Type')?.startsWith('image/jpeg'))
    throw new ManagementError('No pudimos cargar la foto.', 503);
  const blob = await response.blob();
  if (blob.size > 5000000) throw new ManagementError('No pudimos cargar la foto.', 503);
  return blob;
}
function csrfHeaders(token: string | null, method: string): Record<string, string> {
  if (token && method !== 'GET') return { 'x-csrf-token': token };
  return {};
}
function credentials(auth: Record<string, string>): RequestCredentials {
  return auth.Authorization ? 'omit' : 'include';
}
export class ManagementClient {
  private csrfToken: string | null = null;
  constructor(
    private readonly base = 'http://127.0.0.1:3104',
    private readonly sessionHeaders: () => Promise<Record<string, string>> = async () => ({}),
    private readonly transport: typeof fetch = fetch,
  ) {}
  newId(): string {
    if (typeof globalThis.crypto?.randomUUID !== 'function')
      throw new ManagementError('No pudimos preparar la solicitud. Vuelve a intentar.', 503);
    return globalThis.crypto.randomUUID();
  }
  private async request(
    path: string,
    method: string,
    body: BodyInit | undefined,
    headers: Record<string, string>,
    signal: AbortSignal,
    binary = false,
  ): Promise<unknown> {
    const controller = new AbortController(),
      abort = () => controller.abort();
    signal.addEventListener('abort', abort, { once: true });
    if (signal.aborted) abort();
    const timer = setTimeout(abort, 8000);
    try {
      const auth = await this.sessionHeaders();
      const response = await this.transport.call(globalThis, this.base + path, {
        method,
        body,
        headers: {
          ...headers,
          ...auth,
          ...csrfHeaders(this.csrfToken, method),
        },
        credentials: credentials(auth),
        signal: controller.signal,
      });
      return await readResponse(response, binary);
    } catch (error) {
      if (error instanceof ManagementError || signal.aborted) throw error;
      throw new ManagementError(
        'No pudimos conectar. Tus datos se conservan; vuelve a intentar.',
        503,
      );
    } finally {
      clearTimeout(timer);
      signal.removeEventListener('abort', abort);
    }
  }
  async context(signal: AbortSignal) {
    const value = context(await this.request('/v1/offers/context', 'GET', undefined, {}, signal));
    this.csrfToken = value.csrf_token;
    return value;
  }
  async list(scope: 'own' | 'review', cursor: string | null, signal: AbortSignal) {
    const query = new URLSearchParams({ scope });
    if (cursor) query.set('cursor', cursor);
    const row = record(
      await this.request('/v1/offers?' + query.toString(), 'GET', undefined, {}, signal),
    );
    if (
      !Array.isArray(row.items) ||
      row.items.length > 50 ||
      (row.next_cursor !== null && typeof row.next_cursor !== 'string')
    )
      throw new ManagementError('No pudimos leer las ofertas.', 503);
    return { items: row.items.map(managedOffer), next_cursor: row.next_cursor as string | null };
  }
  async detail(offerId: string, signal: AbortSignal) {
    return managedOffer(
      await this.request('/v1/offers/' + id(offerId), 'GET', undefined, {}, signal),
    );
  }
  async command(
    operation: 'create' | 'edit' | 'submit' | 'decide' | 'pause',
    offerId: string,
    body: unknown,
    key: string,
    signal: AbortSignal,
  ) {
    const suffix = {
      create: '',
      edit: '',
      submit: '/submit',
      decide: '/decisions',
      pause: '/pause',
    }[operation];
    const path = operation === 'create' ? '/v1/offers' : '/v1/offers/' + id(offerId) + suffix;
    const result = record(
      await this.request(
        path,
        operation === 'edit' ? 'PATCH' : 'POST',
        JSON.stringify(body),
        { 'Content-Type': 'application/json', 'Idempotency-Key': id(key) },
        signal,
      ),
    );
    if (!Number.isSafeInteger(result.revision) || Number(result.revision) < 1)
      throw new ManagementError(
        'No pudimos leer el resultado. Reintenta con la misma solicitud.',
        503,
      );
    return {
      id: id(result.id),
      revision: Number(result.revision),
      version_id: id(result.version_id),
      state: String(result.state),
    };
  }
  async upload(
    offer: ManagedOffer,
    versionId: string,
    file: File,
    position: number,
    photoId: string,
    signal: AbortSignal,
  ) {
    if (!['image/jpeg', 'image/png'].includes(file.type) || file.size < 8 || file.size > 5000000)
      throw new ManagementError('Usa fotos JPEG o PNG de hasta 5 MB.', 422);
    return this.request(
      `/v1/offers/${id(offer.id)}/versions/${id(versionId)}/photos/${id(photoId)}?position=${position}`,
      'PUT',
      file,
      { 'Content-Type': file.type },
      signal,
    );
  }
  async photo(offerId: string, photoId: string, signal: AbortSignal): Promise<string> {
    const blob = (await this.request(
      `/v1/offers/${id(offerId)}/photos/${id(photoId)}/detail`,
      'GET',
      undefined,
      {},
      signal,
      true,
    )) as Blob;
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      const abort = () => reader.abort();
      signal.addEventListener('abort', abort, { once: true });
      reader.onload = () => {
        signal.removeEventListener('abort', abort);
        resolve(String(reader.result));
      };
      reader.onerror = () => {
        signal.removeEventListener('abort', abort);
        reject(new ManagementError('No pudimos cargar la foto.', 503));
      };
      reader.onabort = () => {
        signal.removeEventListener('abort', abort);
        reject(new ManagementError('Se canceló la foto.', 503));
      };
      if (signal.aborted) {
        abort();
        reject(new ManagementError('Se canceló la foto.', 503));
        return;
      }
      reader.readAsDataURL(blob);
    });
  }
}
