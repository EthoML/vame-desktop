import { contextBridge } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { handleActivities } from './utils'
import { get, post, Requests } from './utils/requests'

export type PythonAPI = {
  post: Requests["post"]
  get:Requests["get"]
  onConnected: (callback: () => void) => void
  onVAMEReady: (callback: () => void) => void
}

const {onConnected,onVAMEReady} = handleActivities()

const services = {
  api: {
    onConnected,
    onVAMEReady,
    post,
    get
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('services', services)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.services = services
}
