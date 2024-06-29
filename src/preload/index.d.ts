import { ElectronAPI } from '@electron-toolkit/preload'
import { PythonAPI } from "./index"

declare global {
  interface Window {
    electron: ElectronAPI
    services: {
      api: PythonAPI
    }
  }
}
