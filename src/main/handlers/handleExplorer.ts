import { ipcMain, shell } from "electron"

export function folderHandler() {
  ipcMain.handle('open', (_, path: string) => {
    try {
      shell.openPath(path)
      return { success: true, data: true }
    } catch (e) {
      let message = "Unkown error."
      if (typeof e === "string")
        message = e
      return { success: false, error: message }
    }
  });
}