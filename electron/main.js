// electron/main.js
import { app, BrowserWindow } from 'electron'
import path from 'path'
import { fileURLToPath } from 'url'

// CommonJS에서는 __dirname 이 자동으로 있지만, ESM에선 이렇게 직접 구현해야 해
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)



function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
    },
  })

  win.loadURL('http://localhost:5173') // 개발용 URL
}

app.whenReady().then(() => {
  console.log(path.join(__dirname, 'preload.js'))
  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})
