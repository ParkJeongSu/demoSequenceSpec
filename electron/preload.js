// electron/preload.js (CommonJS)
const { contextBridge ,ipcRenderer } = require('electron')

console.log('[preload] loaded')

contextBridge.exposeInMainWorld('electronAPI', {

  saveToFile: async (data) => {
    return await ipcRenderer.invoke('save-file', data)
  },
  loadFromFile: async () => {
    return await ipcRenderer.invoke('load-file')
  }
})
