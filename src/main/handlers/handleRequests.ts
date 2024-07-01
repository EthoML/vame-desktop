import { ipcMain } from "electron";
import { get, post } from "../libs/requests";

export function requestHandler(){
  
  ipcMain.handle('vame:get', (_, url: string) => {
    return get(url)
  });
  
  ipcMain.handle('vame:post', (_, url: string, data: Record<string, unknown>) => {
    return post(url, data)
  });
}