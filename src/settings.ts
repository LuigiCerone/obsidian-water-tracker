import { App, PluginSettingTab, Setting } from 'obsidian';
import MyPlugin from './main';
import { ICON_NAMES, KEY_STORAGE_LOG_FILE, KEY_STORAGE_PROPERTY } from './constants';

export interface MyPluginSettings {
  selectedIconName: string;
  enableRibbonIcon: boolean;
  cupSize: number;
  storageOption: string;
}

export const DEFAULT_SETTINGS: MyPluginSettings = {
  selectedIconName: 'cup-soda',
  enableRibbonIcon: true,
  cupSize: 250,
  storageOption: KEY_STORAGE_PROPERTY
}

export class SampleSettingTab extends PluginSettingTab {
  plugin: MyPlugin;
  textInputEl: HTMLInputElement | null = null;

  constructor(app: App, plugin: MyPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;

    containerEl.empty();

    containerEl.createEl("h5", { text: "Ribbon bar settings" });

    // Create a toggle to control ribbon icon
    new Setting(containerEl)
      .setName("Enable ribbon icon")
      .setDesc("Toggle to enable or disable icon in ribbon bar.")
      .addToggle(toggle => {
        toggle
          .setValue(this.plugin.settings.enableRibbonIcon)
          .onChange(value => {
            this.plugin.settings.enableRibbonIcon = value;
            this.plugin.saveData(this.plugin.settings);

            // Enable or disable the dropdown based on the toggle state
            dropdown.setDisabled(!value);
            this.plugin.refreshRibbon();
          });
      });

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

    containerEl.createEl("h5", { text: "Cup settings" });

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

        // Save a reference to the input element for reset
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


    containerEl.createEl("h5", { text: "Storage settings" });
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
            console.log("Selected value:", value); // Debugging output
            this.plugin.settings.storageOption = value;
            await this.plugin.saveSettings();
            console.log("Settings saved:", this.plugin.settings.storageOption); // Debugging
          });
      });
  }
}
