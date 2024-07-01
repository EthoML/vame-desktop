import { ipcRenderer } from "electron"

export type Folders = {
  open(path: string): Promise<boolean>
}

export const open: Folders["open"] = (path) => ipcRenderer.invoke('open', path);
