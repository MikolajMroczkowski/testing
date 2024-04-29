import {ipcMain, dialog, webContents} from "electron";
import {run,checkEnv} from "./spleeter/spleeter";
import {platform} from "@electron-toolkit/utils";
import {spawn} from "child_process";
const registerListeners = () => {
  ipcMain.on('err', (e,args) => dialog.showErrorBox(args.name, args.message))
  ipcMain.on('check-env', (e,args) => {
    e.reply('env', checkEnv())
  })
  ipcMain.on('run-sep', (e,args) => {
    dialog.showMessageBox({message: 'Separation completed', title: 'Success'})
    console.log(args.dir)
    console.log(platform)
    //open folder in explorer
    let explorer;
    if(platform.isWindows){
      explorer = "explorer"
    }
    else if(platform.isLinux){
      explorer = "xdg-open"
    }
    else if(platform.isMacOS){
      explorer = "open"
    }
    spawn(explorer, [args.dir], { detached: true }).unref();

  })
  ipcMain.handle('split', async (e,args) => {
    return new Promise((resolve)=>{
      const {input,output,model} = args
      if(!input || !output || !model) {
        resolve({status: false, message: 'input, output and model must be provided'})
      }
      run(input,output,model).then((data)=>{
        resolve("OK")
      })
    })
  })
  ipcMain.handle('select-output', (e,args) => {
    return dialog.showOpenDialog({properties: ['openDirectory']})
  })
  ipcMain.handle('select-input', (e,args) => {
    return dialog.showOpenDialog({properties: ['openFile']})
  })
}
export default registerListeners
