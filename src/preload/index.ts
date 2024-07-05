import { contextBridge } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

import { onConnected, onProjectReady, onVAMEReady } from './handlers/activitiesHandler'
import { open } from './handlers/folderHandler'
import { get, post } from './handlers/requestsHandler'

const services = {
  vame: {
    onConnected,
    onVAMEReady,
    onProjectReady,
  },
  api: {
    post,
    get
  },
  folder: {
    open,
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
