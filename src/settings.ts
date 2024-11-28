import { App, PluginSettingTab, Setting } from 'obsidian';
import MyPlugin from './main';
import { ICON_NAMES } from './constants';

export interface MyPluginSettings {
  selectedIconName: string;
}

export const DEFAULT_SETTINGS: MyPluginSettings = {
  selectedIconName: 'cup-soda'
}

export class SampleSettingTab extends PluginSettingTab {
  plugin: MyPlugin;

  constructor(app: App, plugin: MyPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;

    containerEl.empty();

    // Create a dropdown with icon options
    new Setting(containerEl)
      .setName("Select an Icon")
      .setDesc("Choose an icon to use in ribbon bar.")
      .addDropdown(dropdown => {
        ICON_NAMES.forEach(icon => {
          dropdown.addOption(icon, icon);
        });
        dropdown.setValue(this.plugin.settings.selectedIconName)
          .onChange(value => {
            this.plugin.settings.selectedIconName = value;
            this.plugin.saveData(this.plugin.settings);
            this.plugin.addIconToBar();
          })
      });
  }
}
