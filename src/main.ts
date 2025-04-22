import { Notice, Plugin, } from 'obsidian';
import { DEFAULT_SETTINGS, WaterTrackerSettings, WaterTrackerSettingTab } from './settings';
import { updateProperty, updateLog, getOutputFile } from './utils';
import { KEY_STORAGE_LOG_FILE, KEY_STORAGE_PROPERTY } from './constants';


export default class WaterTracker extends Plugin {
	settings: WaterTrackerSettings;

	private ribbonIconEl: HTMLElement | null = null;

	async refreshRibbon() {
		this.ribbonIconEl = this.addRibbonIcon(this.settings.selectedIconName, 'Water tracker', (evt: MouseEvent) => {
			try {
				this.addDrink();
			} catch (error) {
				console.error(error);
				new Notice("Error");
			}
		});
	}

	async addDrink() {
		const outputFile = await getOutputFile(this.settings);
		
		if (!outputFile) {
			return;
		}

		if (this.settings.storageOption == KEY_STORAGE_PROPERTY) {
			await updateProperty(outputFile, this.settings);
		} else if (this.settings.storageOption == KEY_STORAGE_LOG_FILE) {
			await updateLog(outputFile, this.settings);
		}

		new Notice('One drink added');
	}

	async onload() {
		await this.loadSettings();

		await this.refreshRibbon();

		this.addCommand({
			id: 'add-one-drinked',
			name: 'Add one drinked',
			callback: () => {
				try {
					this.addDrink();
				} catch (error) {
					console.error(error);
					new Notice("Error");
				}
			}
		});

		this.addSettingTab(new WaterTrackerSettingTab(this.app, this));
	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
