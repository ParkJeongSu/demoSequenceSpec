// electron/main.js
import { app, BrowserWindow ,ipcMain } from 'electron'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

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
      nodeIntegration: false,
    },
  })

  win.loadURL('http://localhost:5173') // 개발용 URL
  // win.loadFile(path.join(__dirname, '../dist/index.html'))  // ← 경로 맞추기
}

app.whenReady().then(() => {
  console.log(path.join(__dirname, 'preload.js'))
  console.log('PRELOAD PATH:', path.join(__dirname, 'preload.js'))

  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

const getDataFilePath = () =>
  path.join(app.getPath('userData'), 'project-data.json')

/**
 * 저장 요청 핸들러
 */
ipcMain.handle('save-file', async (_event, data) => {
  try {
    const filePath = getDataFilePath()
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8')
    console.log('[main] 저장 성공:', filePath)
    return { success: true, path: filePath }
  } catch (err) {
    console.error('[main] 저장 실패:', err)
    return { success: false, error: err.message }
  }
})

/**
 * 불러오기 요청 핸들러
 */
ipcMain.handle('load-file', async () => {
  try {
    const filePath = getDataFilePath()
    if (!fs.existsSync(filePath)) {
      console.warn('[main] 파일 없음:', filePath)
      return { success: false, error: '파일 없음' }
    }

    const raw = fs.readFileSync(filePath, 'utf-8')
    const parsed = JSON.parse(raw)
    console.log('[main] 불러오기 성공:', parsed)
    return { success: true, data: parsed }
  } catch (err) {
    console.error('[main] 불러오기 실패:', err)
    return { success: false, error: err.message }
  }
})
