export interface ElectronAPI {
    saveFile: (defaultName: string, data: string) => Promise<string | null>;
}

declare global {
    interface Window {
        electron: ElectronAPI;
    }
}