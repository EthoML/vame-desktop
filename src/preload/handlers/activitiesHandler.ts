import { ipcRenderer } from "electron"

export type VameActivities = {
  onConnected: (callback: () => void, count?: number) => Promise<void>
  onVAMEReady: (callback: () => void, count?: number) => Promise<void>
  onProjectReady: (data: string, callback: () => void) => Promise<void>
}

export const onConnected: VameActivities["onConnected"] = async (callback, count = 0) => {
  const connected = await ipcRenderer.invoke("vame:connected")
  if (connected.success) {
    callback()
  } else if (count > 3) {
    alert("Can't connect with Python server")
  } else {
    setTimeout(() => onConnected(callback, count + 1), 500)
  }
}

export const onVAMEReady: VameActivities["onVAMEReady"] = async (callback: () => void, count = 0) => {
  const ready = await ipcRenderer.invoke("vame:ready")
  if (ready.success) {
    callback()
  } else if (count > 3) {
    alert("Can't connect with VAME")
  } else {
    setTimeout(() => onVAMEReady(callback, count + 1), 500)
  }
}

export const onProjectReady = async (data: string, callback: () => void) => {
  const response = await ipcRenderer.invoke("vame:project:ready",data)
  if (response.success && response.data) {
    callback()
  } else if(!response.success) {
    alert(response.error)
  }
}

ipcRenderer.on("vame:started", () => {
  console.log(`[window]: Checking Python server status...`)

  ipcRenderer.invoke("vame:connected")
    .then((res) => {
      if (res.success) {
        console.log(`[window]: Python server is active...`)
        console.log(`[window]: Loading VAME library...`)

        ipcRenderer.invoke("vame:ready")
          .then((res) => {
            if (res.success) {
              console.log(`[window]: VAME is ready!`)
            } else {
              console.error(`[window]: Failed to connect to VAME`)
            }
          })
      } else {
        console.error(`[window]: Python server is not active...`)
      }
    })
})

