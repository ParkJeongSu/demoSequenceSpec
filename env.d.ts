/// <reference types="vite/client" />
interface ElectronAPI {
  saveToFile: (data: any) => Promise<{ success: boolean; path?: string; error?: string }>
  loadFromFile: () => Promise<{ success: boolean; data?: any; error?: string }>
}

interface Window {
  electronAPI: ElectronAPI
}
