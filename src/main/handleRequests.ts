import axios, { AxiosError } from "axios";
import { ipcMain } from "electron";

async function post<T = unknown, R = unknown>(url: string, params: T, options = {}): Promise<R | void> {
  try {
    const response = await axios.post(`http://0.0.0.0:8080/${url}`, params, options)
    const { data } = response;
    return data;
  } catch (error) {
    if(error instanceof AxiosError){
      console.log(error.message)
    } else {
      console.log(error)
    }
  }
}
async function get<R = unknown>(url: string, options = {}): Promise<R | void> {
  try {
    const response = await axios.get(`http://0.0.0.0:8080/${url}`, options)
    const { data } = response;
    return data
  } catch (error) {
    if(error instanceof AxiosError){
      console.log(error.message)
    } else {
      console.log(error)
    }
  }
}

export function requestHandler(){
  
  ipcMain.handle('vame:get', (_, url: string) => {
    return get(url)
  });
  
  ipcMain.handle('vame:post', (_, url: string, data: Record<string, unknown>) => {
    return post(url, data)
  });
}