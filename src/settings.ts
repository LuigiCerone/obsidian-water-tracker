import { App, PluginSettingTab, Setting } from 'obsidian';
import WaterTracker from './main';
import { ICON_NAMES, KEY_STORAGE_LOG_FILE, KEY_STORAGE_PROPERTY } from './constants';

export interface WaterTrackerSettings {
  selectedIconName: string;
  cupSize: number;
  storageOption: string;
  enableDailyFile: boolean;
}

export const DEFAULT_SETTINGS: WaterTrackerSettings = {
  selectedIconName: 'cup-soda',
  cupSize: 250,
  storageOption: KEY_STORAGE_PROPERTY,
  enableDailyFile: false
}

export class WaterTrackerSettingTab extends PluginSettingTab {
  plugin: WaterTracker;
  textInputEl: HTMLInputElement | null = null;

  constructor(app: App, plugin: WaterTracker) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;

    containerEl.empty();

    // Create a dropdown with icon options
    let dropdown = new Setting(containerEl)
      .setName("Select an icon")
      .setDesc("Choose which icon to use in ribbon bar.")
      .addDropdown(dropdown => {
        ICON_NAMES.forEach(icon => {
          dropdown.addOption(icon, icon);
        });
        dropdown.setValue(this.plugin.settings.selectedIconName)
          .onChange(value => {
            this.plugin.settings.selectedIconName = value;
            this.plugin.saveData(this.plugin.settings);
            this.plugin.refreshRibbon();
          })
      });


    new Setting(containerEl)
      .setName("Cup size")
      .setDesc("Set the size of the drinking cup")
      .addText(text => {
        text.inputEl.type = "number";
        text.inputEl.step = "1";
        text.inputEl.min = "50";
        text.inputEl.max = "4000";

        text.inputEl.value = this.plugin.settings.cupSize.toString();

        text.onChange(async (value) => {
          const numValue = parseInt(value, 10);
          if (!isNaN(numValue) && numValue > 0) {
            this.plugin.settings.cupSize = numValue;
            await this.plugin.saveData(this.plugin.settings);
          }
        });

        this.textInputEl = text.inputEl;
      })
      .addExtraButton(button => {
        button
          .setIcon("reset")
          .setTooltip("Reset to default cup size")
          .onClick(async () => {
            this.plugin.settings.cupSize = DEFAULT_SETTINGS.cupSize;
            await this.plugin.saveData(this.plugin.settings);

            this.textInputEl!.value = DEFAULT_SETTINGS.cupSize.toString();
          });
      });


    new Setting(containerEl)
      .setName('Storage')
      .setHeading();
    
    // Create a toggle to enable daily file logging
    new Setting(containerEl)
      .setName("Enable daily file")
      .setDesc("Toggle to enable or disable daily file usage.")
      .addToggle(toggle => {
        toggle
          .setValue(this.plugin.settings.enableDailyFile)
          .onChange(value => {
            this.plugin.settings.enableDailyFile = value;
            this.plugin.saveData(this.plugin.settings);
          });
      });

    // Create a dropdown with logging options
    new Setting(containerEl)
      .setName("Choose storage method")
      .setDesc("Select where to save your drink log entries: either in a property field or a separate log file")
      .addDropdown(dropdown => {
        dropdown
          .addOptions({
            [KEY_STORAGE_PROPERTY]: 'Property',
            [KEY_STORAGE_LOG_FILE]: 'Log file'
          })
          .setValue(this.plugin.settings.storageOption)
          .onChange(async value => {
            this.plugin.settings.storageOption = value;
            await this.plugin.saveSettings();
          });
      });
  }
}
