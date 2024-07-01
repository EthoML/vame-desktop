import { ElectronAPI } from '@electron-toolkit/preload'
import { type Requests } from "./handlers/requestsHandler"
import { type Folders } from "./handlers/folderHandler"
import { type VameActivities } from "./handlers/activitiesHandler"

declare global {
  interface Window {
    electron: ElectronAPI
    services: {
      vame: VameActivities
      api: Requests,
      folder: Folders,
    }
  }
}
