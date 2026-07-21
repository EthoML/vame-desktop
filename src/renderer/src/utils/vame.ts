// Backend lifecycle helpers. Previously these went through Electron IPC and
// polled the Python server; now they poll the Flask endpoints directly.
import { get, post } from './requests'

const RETRY_MS = 500
const MAX_RETRIES = 40 // ~20s of connection retries before giving up

// Resolves once the backend HTTP server answers.
export const onConnected = async (callback: () => void, count = 0): Promise<void> => {
  const res = await get('connected')
  if (res.success) {
    callback()
    return
  }
  if (count > MAX_RETRIES) {
    alert("Can't connect to the VAME server.")
    return
  }
  setTimeout(() => onConnected(callback, count + 1), RETRY_MS)
}

// Resolves once VAME is importable (the /ready request itself blocks while the
// (potentially slow) `import vame` completes the first time).
export const onVAMEReady = async (callback: () => void, count = 0): Promise<void> => {
  const res = await get('ready')
  if (res.success) {
    callback()
    return
  }
  if (count > MAX_RETRIES) {
    alert("Can't load VAME.")
    return
  }
  setTimeout(() => onVAMEReady(callback, count + 1), RETRY_MS)
}

// Polls until the given project has no step currently running, then fires.
export const onProjectReady = async (data: string, callback: () => void): Promise<void> => {
  const poll = async () => {
    const res = await post<{ is_ready: boolean }>('project_ready', { project: data })
    if (!res.success) {
      console.error('project_ready poll failed:', res.error)
      return
    }
    if (res.data?.is_ready) {
      callback()
      return
    }
    setTimeout(poll, 1000)
  }
  poll()
}
