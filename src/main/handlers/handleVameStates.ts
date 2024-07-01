import { ipcMain } from "electron";
import { get } from "../libs/requests";

export function vameStatesHandler() {

  const states = {
    connected: false,
    ready: false
  }
  
  ipcMain.handle("vame:connected",async (): Promise<boolean> => {
    if(states.connected) {
      return true
    }
    
    return await get("connected").then(()=>states.connected = true).catch(()=>states.connected = false)
  })

  ipcMain.handle("vame:ready",async (): Promise<boolean> => {
    if(states.ready) {
      return true
    }
    
    return await get("ready").then(()=>{
      states.ready = true
      console.log(`VAME is ready!`)
      return states.ready
    }).catch(()=>states.ready = false)
  })
}