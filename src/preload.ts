import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electron', {
    saveFile: (defaultName: string, data: string) => {
        ipcRenderer.invoke('save-file', { defaultName, data });
    }
})
