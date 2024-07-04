import { ipcRenderer } from "electron"
import { IPCResponse } from "./types";

export type Folders = {
  open(path: string): Promise<IPCResponse<boolean>>
}

export const open: Folders["open"] = (path) => ipcRenderer.invoke('open', path);
