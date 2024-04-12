import { App, PluginSettingTab, Setting } from 'obsidian';

import { DEFAULT_CONFIG_FOLDER_PATH, DEFAULT_COMMON_FOLDER_PATH, DEFAULT_INTERVAL } from './settings';
import { SyncPlugin } from './SyncPlugin';

export class SyncSettingTab extends PluginSettingTab {
	plugin: SyncPlugin;

	constructor(app: App, plugin: SyncPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

        new Setting(containerEl)
			.setName('Config folder path')
			.setDesc('Customize the path filled in ConfigFolder, which needs to be consistent with the one in Files and links->Override config folder (自定义填入 ConfigFolder 的路径，需要和 文件与链接->切换配置文件夹 中的保持一致)')
			.addText(text => text
				.setPlaceholder(DEFAULT_CONFIG_FOLDER_PATH)
				.setValue(this.plugin.settings.configFolderPath)
				.onChange(async (value) => {
					this.plugin.settings.configFolderPath = value || DEFAULT_CONFIG_FOLDER_PATH;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Common folder path')
			.setDesc('Customize the path to be filled in ConfigFolder for synchronization. The relative path needs to start with ./ or ../ (自定义填入 ConfigFolder 同步的路径，相对路径需要以 ./ 或者 ../ 开头)')
			.addText(text => text
				.setPlaceholder(DEFAULT_COMMON_FOLDER_PATH)
				.setValue(this.plugin.settings.commonFolderPath)
				.onChange(async (value) => {
					this.plugin.settings.commonFolderPath = value || DEFAULT_COMMON_FOLDER_PATH;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Auto save interval')
			.setDesc('Customize the auto save time interval in seconds, 0 means off (自定义自动保存的时间间隔，单位是秒，0 代表关闭). Need to be restarted to take effect (修改都需要重启生)')
			.addText(text => text
				.setPlaceholder(String(DEFAULT_INTERVAL))
				.setValue(String(this.plugin.settings.autoSaveInterval))
				.onChange(async (value) => {
					this.plugin.settings.autoSaveInterval = Number(value) || DEFAULT_INTERVAL;
					await this.plugin.saveSettings();
				}));
	}
}
