import {app, shell, BrowserWindow, dialog, ipcMain,webContents} from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import RegisterListeners from './msg'
import {checkEnv, prepare} from "./spleeter/spleeter";

function createWindow() {
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
    prepareEnv(mainWindow).then(()=>{
      mainWindow.webContents.send('env', checkEnv())
    })
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  RegisterListeners()
  createWindow()

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
const prepareEnv =  async (mainWindow) => {
  const env = checkEnv()
  if (!env.status) {
    const re = dialog.showMessageBoxSync({
      type: 'warning',
      title: 'Environment Warning',
      message: env.message + "\nDo you want to prepare the environment?\nIf no app will exit.",
      buttons: ['Prepare', 'Cancel']

    })
    if (re === 0) {
      dialog.showMessageBox({
        type: 'info',
        title: 'Preparing Environment',
        message: 'This may take a while\nUp to 30 minutes',
      })
      await prepare()
      dialog.showMessageBoxSync({
        type: 'info',
        title: 'Environment Prepared',
        message: 'Environment has been prepared successfully',
      })
    } else {
      app.quit()
    }
  }
}
// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.