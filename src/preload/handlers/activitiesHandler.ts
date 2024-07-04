import { ipcRenderer } from "electron"

export type VameActivities = {
  onConnected: (callback: () => void, count?: number) => Promise<void>
  onVAMEReady: (callback: () => void, count?: number) => Promise<void>
}

export const onConnected: VameActivities["onConnected"] = async (callback, count = 0) => {
  const connected = await ipcRenderer.invoke("vame:connected")
  if (connected.success) {
    callback()
  } else if (count > 3) {
    alert("Can't connect with Python server")
  } else {
    setTimeout(()=>onConnected(callback, count + 1),500)
  }
}

export const onVAMEReady: VameActivities["onConnected"] = async (callback: () => void, count = 0) => {
  const ready = await ipcRenderer.invoke("vame:ready")
  if (ready) {
    callback()
  } else if (count > 3) {
    alert("Can't connect with VAME")
  } else {
    setTimeout(()=>onVAMEReady(callback, count + 1),500)
  }
}

ipcRenderer.on("vame:started", () => {
  console.log(`Checking Python server status...`)

  ipcRenderer.invoke("vame:connected")
    .then(()=>{
      console.log(`Python server is active...`)
      console.log(`Loading VAME library...`)

      ipcRenderer.invoke("vame:ready")
        .then(() => console.log(`VAME is ready!`))
        .catch(() => console.error(`Failed to connect to VAME`))
    })
    .catch(() => console.error(`Python server is not active...`))
})

