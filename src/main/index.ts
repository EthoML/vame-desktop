import { app, BrowserWindow } from "electron"
import { electronApp, is, optimizer } from "@electron-toolkit/utils"
import { join } from "path"
import { ChildProcessWithoutNullStreams } from "child_process"

import { runChildProcess } from "./process/runChildProcess"

import { createWindow } from "./handlers/handleWindow"
import { requestHandler } from "./handlers/handleRequests"
import { vameStatesHandler } from "./handlers/handleVameStates"
import { folderHandler } from "./handlers/handleExplorer"

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
let backend: ChildProcessWithoutNullStreams | null = null
let mainWindow: BrowserWindow | null = null

app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId("com.vame-desktop")

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on("browser-window-created", (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  vameStatesHandler()

  requestHandler()

  folderHandler()

  if (is.dev) {
    backend = runChildProcess("python", [join(__dirname, "..","..","src","services","main.py")])

    backend?.stdout.on("data", (data) => {
      if (data?.toString().includes("Running on")) {
        console.log(`[electron]: Python server is active...`)
        if(!mainWindow)
          createWindow()
      }
    });
  } else {
    backend = runChildProcess(join(process.resourcesPath,"python","main", "main"))

    backend?.stdout.on("data", (data) => {
      if (data?.toString().includes("Running on")) {
        console.log(`[electron]: Python server is active...`)
        if(!mainWindow)
          createWindow()
      }
    });
  }

  app.on("activate", function () {
    // On macOS it"s common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it"s common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
})

// App close handler
app.on("before-quit", (event) => {
  if (backend && backend.exitCode === null) {
    event.preventDefault(); // Prevent the default behavior of quitting immediately
    backend.once("exit", (code) => {
      console.log(`[electron]: Process exited with code ${code}`)
      app.exit(code ?? 0); // Quit the app after the child process exits
    });
    backend.kill("SIGTERM"); // Send SIGTERM to the child process
  } else if (backend && backend.exitCode !== null) {
    console.log(`[electron]: Process exited with code ${backend.exitCode}`)
    app.exit(backend.exitCode);
  } else {
    console.log("[electron]: Process exited with code ", 1)
    app.exit(1);
  }
});