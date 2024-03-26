export interface ISyncPluginSettings {
    configFolderPath: string;
	commonFolderPath: string;
	autoSaveInterval: number;
}

export const DEFAULT_CONFIG_FOLDER_PATH = '.obsidian';
export const DEFAULT_COMMON_FOLDER_PATH = './configBackupFolder';
export const DEFAULT_INTERVAL = 0;

export const DEFAULT_SETTINGS: ISyncPluginSettings = {
    configFolderPath: DEFAULT_CONFIG_FOLDER_PATH,
    commonFolderPath: DEFAULT_COMMON_FOLDER_PATH,
	autoSaveInterval: DEFAULT_INTERVAL
};
