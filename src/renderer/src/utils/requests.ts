// HTTP layer for talking to the Flask backend.
//
// In production the frontend is served by Flask itself, so requests are
// same-origin (relative URLs). In dev, the Vite dev server runs on a different
// port, so we target the backend directly (CORS is allowed for localhost).
export const API_BASE: string = import.meta.env.DEV
  ? ((import.meta.env.VITE_API_BASE as string | undefined) ?? 'http://localhost:8641')
  : ''

export type ApiResponse<D> =
  | { success: true; data: D }
  | { success: false; error: string }

const buildUrl = (url: string): string => {
  const path = url.startsWith('/') ? url : `/${url}`
  return `${API_BASE}${path}`
}

const parseBody = async (res: Response): Promise<unknown> => {
  const contentType = res.headers.get('content-type') ?? ''
  if (contentType.includes('application/json')) {
    return res.json()
  }
  return res.text()
}

const errorFrom = (body: unknown, status: number): string => {
  if (typeof body === 'string' && body) return body
  if (body && typeof body === 'object' && 'message' in body) {
    return String((body as { message: unknown }).message)
  }
  return `HTTP ${status}`
}

export async function get<R = unknown>(url: string): Promise<ApiResponse<R>> {
  try {
    const res = await fetch(buildUrl(url), { method: 'GET' })
    const body = await parseBody(res)
    if (!res.ok) return { success: false, error: errorFrom(body, res.status) }
    return { success: true, data: body as R }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : String(e) }
  }
}

export async function post<R = unknown, T = unknown>(
  url: string,
  data: T,
  signal?: AbortSignal
): Promise<ApiResponse<R>> {
  try {
    const res = await fetch(buildUrl(url), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data ?? {}),
      signal
    })
    const body = await parseBody(res)
    if (!res.ok) return { success: false, error: errorFrom(body, res.status) }
    return { success: true, data: body as R }
  } catch (e) {
    // Let aborts propagate so callers can tell cancellation from a real failure.
    if (e instanceof DOMException && e.name === 'AbortError') throw e
    return { success: false, error: e instanceof Error ? e.message : String(e) }
  }
}
