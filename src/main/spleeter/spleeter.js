import PythonEnvironment from "./PythonEnvironment";
import * as path from "node:path";
import {app} from "electron";

const {existsSync} = require("node:fs");
const {copyFileSync} = require("fs");
const ffmpeg = require("ffmpeg-ffprobe-static");

const prepare = async () => {
  try {
    const py = new PythonEnvironment('dse')
    const envWorking = py.createEnvironment()
    console.log(envWorking)
    if (!envWorking.status) {
      console.log('Error creating environment')
      return {status: false, message: envWorking.message};
    }

    const filePath = path.resolve(app.getAppPath(), 'resources', 'pythonTest.py');
    copyFileSync(filePath, app.getPath('userData') + '/pythonTest.py');
    const scriptPath = app.getPath('userData') + '/pythonTest.py'
    const res = await py.runCommand('python ' + `"${scriptPath}"`);
    console.log(res);
    const res1 = await py.runCommand('pip list');
    console.log(res1);
    const res2 = await py.runCommand('pip install musdb museval spleeter');
    console.log(res2);

    const isFfmpegInstalled = existsSync(py.isWindows() ? "ffmpeg.exe" : "ffmpeg");
    if (!isFfmpegInstalled) {
      copyFileSync(ffmpeg.ffmpegPath, py.isWindows() ? "ffmpeg.exe" : "ffmpeg");
      copyFileSync(ffmpeg.ffprobePath, py.isWindows() ? "ffprobe.exe" : "ffprobe");
    }

    return {status: true, message: 'Environment prepared successfully'};
  } catch (error) {
    console.error('Wystąpił błąd podczas przygotowywania środowiska:', error);
    let errForUser
    if (error.message.includes(" Failed to establish a new connection")) {
      errForUser = "Internet error!\nProbably no internet connection\nEnv can't be downloaded"
    } else {
      errForUser = error.message
    }
    return {status: false, message: errForUser};
  }
}

const checkEnv = () => {
  if (existsSync('dse')) {
    const py = new PythonEnvironment('dse')
    const binDir = py.isWindows() ? 'Scripts' : 'bin'
    const spleeterDir = `dse/${binDir}/${py.isWindows() ? 'spleeter.exe' : 'spleeter'}`
    const ffmpegDir = py.isWindows() ? 'ffmpeg.exe' : 'ffmpeg'
    if (existsSync(spleeterDir)) {
      console.log('spleeter is installed')
      if (existsSync(ffmpegDir)) {
        console.log('ffmpeg is installed')
        return {status: true, message: 'spleeter and ffmpeg are installed'}
      } else {
        console.log('ffmpeg is not installed')
        return {status: false, message: 'ffmpeg is not installed'}
      }
    } else {
      return {status: false, message: 'spleeter is not installed'}
    }
  }
  return {status: false, message: 'env does not exist'}

}
const run = (input, out, model) => {
  const py = new PythonEnvironment('dse')
  const command = `spleeter separate -o "${out}" -p ${model} "${input}"`
  console.log(command)
  const res = py.runCommand(command)
  console.log(res)
  return res
}
export {prepare, checkEnv, run}
