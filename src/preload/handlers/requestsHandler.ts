import { ipcRenderer } from "electron";

export type Requests = {
  post<T = unknown, R = unknown>(url: string, data: Record<string, T>): Promise<R | void>
  get<R = unknown>(url: string): Promise<R | void>
}

export const post: Requests["post"] = (url, data, options = {}) => ipcRenderer.invoke('vame:post', url, data, options);

export const get: Requests["get"] = (url, options = {}) => ipcRenderer.invoke('vame:get', url, options)