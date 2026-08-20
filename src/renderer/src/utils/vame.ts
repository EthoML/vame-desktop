// Backend lifecycle helpers. Previously these went through Electron IPC and
// polled the Python server; now they poll the Flask endpoints directly.
import { get, post } from './requests'

const RETRY_MS = 500
const MAX_RETRIES = 40 // ~20s of connection retries before giving up
const READY_POLL_MS = 3000

/** Stops a poll loop. Return it from a React effect so unmount cancels the loop. */
export type Cancel = () => void

type PollOptions = {
  intervalMs: number
  maxAttempts?: number
  onGiveUp?: () => void
}

// Poll `probe` until it reports ready, then fire `onReady` once. Cancelling
// prevents both the next tick and a callback from an in-flight probe.
const pollUntil = (
  probe: () => Promise<boolean>,
  onReady: () => void,
  { intervalMs, maxAttempts = Infinity, onGiveUp }: PollOptions
): Cancel => {
  let cancelled = false
  let timer: ReturnType<typeof setTimeout> | null = null
  let attempts = 0

  const tick = async () => {
    let ready = false
    try {
      ready = await probe()
    } catch (e) {
      console.error('poll probe threw:', e)
    }
    if (cancelled) return
    if (ready) {
      onReady()
      return
    }
    attempts += 1
    if (attempts >= maxAttempts) {
      onGiveUp?.()
      return
    }
    timer = setTimeout(tick, intervalMs)
  }

  tick()

  return () => {
    cancelled = true
    if (timer) clearTimeout(timer)
  }
}

// Fires once the backend HTTP server answers.
export const onConnected = (callback: () => void): Cancel =>
  pollUntil(async () => (await get('connected')).success, callback, {
    intervalMs: RETRY_MS,
    maxAttempts: MAX_RETRIES,
    onGiveUp: () => alert("Can't connect to the VAME server."),
  })

// Fires once VAME is importable (the /ready request itself blocks while the
// (potentially slow) `import vame` completes the first time).
export const onVAMEReady = (callback: () => void): Cancel =>
  pollUntil(async () => (await get('ready')).success, callback, {
    intervalMs: RETRY_MS,
    maxAttempts: MAX_RETRIES,
    onGiveUp: () => alert("Can't load VAME."),
  })

// Fires once the given project has no step currently running. Retries on
// transient failures — a single error must not leave the caller's form blocked
// forever. Unbounded, so callers must cancel on unmount.
export const onProjectReady = (project: string, callback: () => void): Cancel =>
  pollUntil(
    async () => {
      const res = await post<{ is_ready: boolean }>('project_ready', { project })
      if (!res.success) {
        console.error('project_ready poll failed:', res.error)
        return false
      }
      return !!res.data?.is_ready
    },
    callback,
    { intervalMs: READY_POLL_MS }
  )
