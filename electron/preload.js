// // electron/preload.js (ESM 스타일)
// import { contextBridge } from 'electron'

// // 나중에 fs 등 안전하게 노출할 때 사용
// contextBridge.exposeInMainWorld('electronAPI', {
//   // example: openFile: () => ...
// })


// electron/preload.js (CommonJS)
const { contextBridge } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  // 예시 기능
})
