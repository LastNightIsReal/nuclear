type LocalTrack = {
    artist?: string;
    title?: string;

    filename: string;
    path: string;
}

declare const scanFolders = (folders: string[], supportedFormats: string[], onProgress: (progress: number, total: number, lastScanned?: string) => void) => Promise<LocalTrack[]>;
export { scanFolders };
