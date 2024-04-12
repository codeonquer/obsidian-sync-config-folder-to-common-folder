# Obsidian Sync ConfigFolder to CommonFolder

The development of this plugin was motivated by the following two reasons:

- The config folder for Obsidian must start with a dot (`.`);
- Some synchronization tools used do not support syncing folders that start with a dot (`.`).

Therefore, the plugin was developed to synchronize the contents of the config folder to a common folder with the command `Sync`, and it also supports restoring the config folder from the common folder with the command `Restore`.

The settings for the common folder support both relative and absolute paths, with relative paths based on the root folder of the current Vault.

开发本插件的原因是基于以下两点：

- obsidian 的配置路径必须以 `.` 开头；
- 使用的部分同步工具不支持同步以 `.` 开头的目录；

所以开发该插件将配置目录的内容同步到普通目录之中（`Sync` 命令），也支持将配置目录复原到配置目录之中（`Restore` 命令）。

设置的普通目录支持相对路径和绝对路径，相对路径基于当前 Vault 的根目录。
