import { App, Modal, Notice, normalizePath } from 'obsidian';

import { SyncPlugin } from './SyncPlugin';

export enum SyncModel {
    None,
    Sync,
    Restore
}

enum StatType {
    Folder = 'folder',
    File = 'file'
}

export class SyncModal extends Modal {
    syncModel: SyncModel;
    plugin: SyncPlugin;

    constructor(app: App, syncModel: SyncModel, plugin: SyncPlugin) {
        super(app);

        this.syncModel = syncModel;
        this.plugin = plugin;
    }

    get configFolder() {
        const p = normalizePath(this.plugin.settings.configFolderPath || this.app.vault.configDir);
        return p.endsWith('/') ? p.substring(0, p.length - 1) : p;
    }

    get commonFolder() {
        const p =  normalizePath(this.plugin.settings.commonFolderPath);
        return p.endsWith('/') ? p.substring(0, p.length - 1) : p;
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

    async syncConfig(contentEl?: HTMLElement) {
        try {
            this.logNormal('Check if ConfigFolder exists (检查 ConfigFolder 是否存在) ...', contentEl);
            // const isConfigFolderExisted = this.fs.existsSync(this.configFolder);
            const isConfigFolderExisted = await this.app.vault.adapter.exists(this.configFolder, true);
            if (!isConfigFolderExisted) {
                this.logSuccess('ConfigFolder does not exist, no need to back up (ConfigFolder 不存在，无需备份) .', contentEl);
                return;
            }

            this.logNormal('Reset CommonFolder (重置 CommonFolder 中) ...', contentEl);
            // const isCommonFolderExisted = this.fs.existsSync(this.commonFolder);
            const isCommonFolderExisted = await this.app.vault.adapter.exists(this.commonFolder, true);
            if (isCommonFolderExisted) {
                // this.fs.rmSync(this.commonFolder, { force: true, recursive: true });
                await this.app.vault.adapter.rmdir(this.commonFolder, true);
            }
            // this.fs.mkdirSync(this.commonFolder,  { recursive: true });
            await this.app.vault.adapter.mkdir(this.commonFolder);
            this.logSuccess('Reset CommonFolder successfully (重置 CommonFolder 成功) .', contentEl);

            this.logNormal('Back up ConfigFolder (备份 ConfigFolder 中) ...', contentEl);
            // this.fs.cpSync(this.configFolder, this.commonFolder, { recursive: true });
            await this.recursiveCopy(this.configFolder, this.commonFolder);
            this.logSuccess('Backup ConfigFolder successful (备份 ConfigFolder 成功) .', contentEl);
        } catch (e) {
            this.logFail(e.message, contentEl);
        }
    }

    async restoreConfig(contentEl: HTMLElement) {
        try {
            this.logNormal('Check if CommonFolder exists (检查 CommonFolder 是否存在) ...', contentEl);
            // const isCommonFolderExisted = this.fs.existsSync(this.commonFolder);
            const isCommonFolderExisted = await this.app.vault.adapter.exists(this.commonFolder, true);
            if (!isCommonFolderExisted) {
                this.logSuccess('CommonFolder does not exist and cannot be restored (CommonFolder 不存在，无法恢复) .', contentEl);
                return;
            }

            this.logNormal('Reset ConfigFolder (重置 ConfigFolder 中) ...', contentEl);
            // const isConfigFolderExisted = this.fs.existsSync(this.configFolder);
            const isConfigFolderExisted = await this.app.vault.adapter.exists(this.configFolder, true);
            if (isConfigFolderExisted) {
                // this.fs.rmSync(this.configFolder, { force: true, recursive: true });
                await this.app.vault.adapter.rmdir(this.configFolder, true);
            }
            // this.fs.mkdirSync(this.configFolder,  { recursive: true });
            await this.app.vault.adapter.mkdir(this.configFolder);
            this.logSuccess('Reset ConfigFolder successfully (重置 ConfigFolder 成功) .', contentEl);

            this.logNormal('Restore ConfigFolder (恢复 ConfigFolder 中) ...', contentEl);
            // this.fs.cpSync(this.commonFolder, this.configFolder, { recursive: true });
            await this.recursiveCopy(this.commonFolder, this.configFolder);
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

    async recursiveCopy(src: string, dest: string) {
        const stat = await this.app.vault.adapter.stat(src);

        if (stat?.type === StatType.Folder) {
            if (!(await this.app.vault.adapter.exists(dest, true))) {
                await this.app.vault.adapter.mkdir(dest);
            }

            const { folders, files } = await this.app.vault.adapter.list(src);
            await Promise.all([...folders, ...files].map(async (item) => {
                await this.recursiveCopy(item, item.replace(src, dest));
            }));
            return;
        }

        await this.app.vault.adapter.copy(src, dest);
    }
}
