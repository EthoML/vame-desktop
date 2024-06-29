import { ipcRenderer } from "electron"
import { get } from "./requests"

export function handleActivities() {
  const states = {
    connected: false,
    ready: false,
  }
  
  const callbacks = {
    connected: [] as (() => void)[],
    ready: [] as (() => void)[]
  }
  
  const on = (key: keyof typeof states, callback: () => void) => {
    if (states[key]) return callback()
      callbacks[key].push(callback)
  }
  
  const resolve = (key: keyof typeof states) => {
    states[key] = true
    for (let i = 0; i < callbacks[key].length; i++) callbacks[key][i]() // Execute all callbacks 
    // while (callbacks[key].length) callbacks[key].shift()!() // Execute all callbacks and remove them
  }
  
  const request = (state: keyof typeof states) => get(state).then(() => resolve(state))
  
  
  const onConnected = (callback: () => void) => on('connected', callback)
  const onVAMEReady = (callback: () => void) => on('ready', callback)
  
  
  ipcRenderer.on("vame:started", () => {
    console.log(`Checking Python server status...`)
    request('connected')
    .catch(() => console.error(`Python server is not active...`))
  })
  
  ipcRenderer.on("vame:close",() => {
    console.error(`Python server was closed!`)
    states.connected = false
  })
  
  onConnected(() => {
    console.log(`Loading VAME library..`)
    request('ready')
    .then(() => console.log(`VAME is ready!`))
    .catch(() => console.error(`Failed to connect to VAME`))
  })

  return {
    onConnected,
    onVAMEReady
  }

}
  