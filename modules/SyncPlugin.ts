import { Plugin } from 'obsidian';

import { ISyncPluginSettings, DEFAULT_SETTINGS } from './settings';
import { SyncModal, SyncModel } from './SyncModal';
import { SyncSettingTab } from './SyncSettingTab';

export class SyncPlugin extends Plugin {
	settings: ISyncPluginSettings;

	async onload() {
		await this.loadSettings();

		this.addCommand({
			id: 'sync-config-folder-to-common-folder',
			name: 'Sync ConfigFolder to CommonFolder',
			callback: () => {
				new SyncModal(this.app, SyncModel.Sync, this).open();
			}
		});

		this.addCommand({
			id: 'restore-config-folder-from-common-folder',
			name: 'Restore ConfigFolder from CommonFolder',
			callback: () => {
				new SyncModal(this.app, SyncModel.Restore, this).open();
			}
		});

		this.addSettingTab(new SyncSettingTab(this.app, this));

		if (this.settings.autoSaveInterval) {
			// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
			this.registerInterval(window.setInterval(() => console.log('setInterval'), this.settings.autoSaveInterval * 1000));
		}
	}

	onunload() {

	}

	async loadSettings() {
		const originData = await this.loadData();
		console.log('sync-config-folder-to-common-folder loadData ', originData);
		this.settings = Object.assign({}, DEFAULT_SETTINGS, originData);
		console.log('sync-config-folder-to-common-folder loadSettings ', this.settings);
	}

	async saveSettings() {
		console.log('sync-config-folder-to-common-folder saveData ', this.settings);
		await this.saveData(this.settings);
	}
}
