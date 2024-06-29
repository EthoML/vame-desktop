import { BrowserWindow, shell } from "electron"
import { is } from "@electron-toolkit/utils"
import { join } from "path"

import { runChildProcess } from "./handleChildProcess"

import icon from '../../resources/icon.png?asset'
import main from '../../resources/python/main?asset&asarUnpack'


export function createWindow(): BrowserWindow {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {

    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])

    runChildProcess('python', [join(__dirname, '../../src/services/main.py')])
      .stdout.on('data', (data) => {
        if (data?.toString().includes("Running on")) {
          mainWindow.webContents.send('vame:started')
        }
      });

  } else {

    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))

    runChildProcess(join(main))
      .stdout.on('data', (data) => {
        if (data?.toString().includes("Running on")) {
          mainWindow.webContents.send('vame:started')
        }
      });

  }

  return mainWindow
}