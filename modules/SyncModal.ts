import { App, Modal, Notice } from 'obsidian';

import { SyncPlugin } from './SyncPlugin';

export enum SyncModel {
	None,
	Sync,
	Restore
}

export class SyncModal extends Modal {
	syncModel: SyncModel;
	plugin: SyncPlugin;

	constructor(app: App, syncModel: SyncModel, plugin: SyncPlugin) {
		super(app);

		this.syncModel = syncModel;
		this.plugin = plugin;
	}

	get fs() {
		// @ts-ignore
		return this.app.vault.adapter.fs;
	}

	get path() {
		// @ts-ignore
		return this.app.vault.adapter.path;
	}

	get basePath() {
		// @ts-ignore
		return this.app.vault.adapter.basePath;
	}

	get configFolder() {
        const configDir = this.plugin.settings.configFolderPath || this.app.vault.configDir;
		return this.path.join(this.basePath, configDir);
	}

    get commonFolderPath() {
		return this.plugin.settings.commonFolderPath;
	}

	get commonFolder() {
		return this.path.isAbsolute(this.commonFolderPath)
			? this.commonFolderPath
			: this.path.join(this.basePath, this.commonFolderPath)
	}

	logNormal (text: string, contentEl?: HTMLElement, ) {
		if (contentEl) {
			contentEl.createDiv({ text })
		} else {
            new Notice(text, 3000);
        }
	}

	logSuccess (text: string, contentEl?: HTMLElement) {
		if (contentEl) {
			contentEl.createDiv({ text, attr: { style: 'color: green;' } })
		} else {
            const fragment = document.createDocumentFragment();
            fragment.appendChild(
                fragment.createSpan({
                    text,
                    attr: {
                        style: 'color: green;'
                    }
                })
            );
            new Notice(fragment, 3000);
        }
	}

	logFail (text: string, contentEl?: HTMLElement) {
		if (contentEl) {
			contentEl.createDiv({ text, attr: { style: 'color: red;' } })
		} else {
            const fragment = document.createDocumentFragment();
            fragment.appendChild(
                fragment.createSpan({
                    text,
                    attr: {
                        style: 'color: red;'
                    }
                })
            );
            new Notice(fragment, 0);
        }
	}

	syncConfig(contentEl?: HTMLElement) {
		try {
			this.logNormal('Check if ConfigFolder exists (检查 ConfigFolder 是否存在) ...', contentEl);
			const isConfigFolderExisted = this.fs.existsSync(this.configFolder);
			if (!isConfigFolderExisted) {
				this.logSuccess('ConfigFolder does not exist, no need to back up (ConfigFolder 不存在，无需备份) .', contentEl);
				return;
			}

			this.logNormal('Reset CommonFolder (重置 CommonFolder 中) ...', contentEl);
			const isCommonFolderExisted = this.fs.existsSync(this.commonFolder);
			if (isCommonFolderExisted) {
				this.fs.rmSync(this.commonFolder, { force: true, recursive: true });
			}
			this.fs.mkdirSync(this.commonFolder,  { recursive: true });
			this.logSuccess('Reset CommonFolder successfully (重置 CommonFolder 成功) .', contentEl);

			this.logNormal('Back up ConfigFolder (备份 ConfigFolder 中) ...', contentEl);
			this.fs.cpSync(this.configFolder, this.commonFolder, { recursive: true });
			this.logSuccess('Backup ConfigFolder successful (备份 ConfigFolder 成功) .', contentEl);
		} catch (e) {
			this.logFail(e.message, contentEl);
		}
	}

	restoreConfig(contentEl: HTMLElement) {
		try {
			this.logNormal('Check if CommonFolder exists (检查 CommonFolder 是否存在) ...', contentEl);
			const isCommonFolderExisted = this.fs.existsSync(this.commonFolder);
			if (!isCommonFolderExisted) {
				this.logSuccess('CommonFolder does not exist and cannot be restored (CommonFolder 不存在，无法恢复) .', contentEl);
				return;
			}

			this.logNormal('Reset ConfigFolder (重置 ConfigFolder 中) ...', contentEl);
			const isConfigFolderExisted = this.fs.existsSync(this.configFolder);
			if (isConfigFolderExisted) {
				this.fs.rmSync(this.configFolder, { force: true, recursive: true });
			}
			this.fs.mkdirSync(this.configFolder,  { recursive: true });
			this.logSuccess('Reset ConfigFolder successfully (重置 ConfigFolder 成功) .', contentEl);

			this.logNormal('Restore ConfigFolder (恢复 ConfigFolder 中) ...', contentEl);
			this.fs.cpSync(this.commonFolder, this.configFolder, { recursive: true });
			this.logSuccess('Restore ConfigFolder successfully (恢复 ConfigFolder 成功) .', contentEl);
		} catch (e) {
			this.logFail(e.message, contentEl);
		}
	}

	onOpen() {
		window.setTimeout(() => {
			const { contentEl } = this;

			if (this.syncModel === SyncModel.Restore) {
				this.restoreConfig(contentEl);
				return;
			}

			this.syncConfig(contentEl);
		}, 300);
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}
