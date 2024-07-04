import { ipcRenderer } from "electron";

type IPCResponse<D> = {
  success: true;
  data: D;
} | {
  success: false;
  error: string;
}

export type Requests = {
  post<R = unknown,T = unknown>(url: string, data: T): Promise<IPCResponse<R>>
  get<R = unknown>(url: string): Promise<IPCResponse<R>>
}

export const post: Requests["post"] = (url, data, options = {}) => ipcRenderer.invoke('vame:post', url, data, options);

export const get: Requests["get"] = (url, options = {}) => ipcRenderer.invoke('vame:get', url, options)