import { app,  BrowserWindow} from 'electron'
import { electronApp, is, optimizer } from '@electron-toolkit/utils'
import { join } from 'path'
import { ChildProcessWithoutNullStreams } from 'child_process'

import { createWindow } from './handlers/handleWindow'
import { requestHandler } from './handlers/handleRequests'
import { vameStatesHandler } from './handlers/handleVameStates'
import { runChildProcess } from './handlers/handleChildProcess'

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
let backend: ChildProcessWithoutNullStreams | null = null

app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })
  
  vameStatesHandler()

  requestHandler()

  const mainWindow = createWindow()

  if (is.dev) {
    backend = runChildProcess('python', [join(__dirname, '../../src/services/main.py')])

    backend.stdout.on('data', (data) => {
      if (data?.toString().includes("Running on")) {
        console.log(`Python server is active...`)
        mainWindow.webContents.send('vame:started')
      }
    });
  } else {
    backend = runChildProcess(join(process.resourcesPath,'python','main'))

    backend.stdout.on('data', (data) => {
      if (data?.toString().includes("Running on")) {
        mainWindow.webContents.send('vame:started')
      }
    });
  }

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// App close handler
app.on('before-quit', (event) => {
  if (backend) {
    backend.once("exit", () => {
      console.log('Child process has exited. Quitting the app...');
      app.exit(0) // Quit the app after the child process exits
    })
    backend.kill("SIGTERM");  // Send SIGTERM to the child process
    event.preventDefault()  // Prevent the default behavior of quitting immediately
  } else {
    console.log('No backend process found. Quitting the app directly...');
    app.exit(0)
  }
});