import { ipcMain, shell } from "electron"

export function folderHandler() {
  ipcMain.handle('open', (_, path: string) => {
    shell.openPath(path)
    return true
  });
}