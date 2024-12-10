import { Notice, Plugin, } from 'obsidian';
import { DEFAULT_SETTINGS, MyPluginSettings, SampleSettingTab } from './settings';
import { computeDelta, getOutputFile } from './utils';
import { KEY_STORAGE_PROPERTY } from './constants';


export default class MyPlugin extends Plugin {
	settings: MyPluginSettings;

	private ribbonIconEl: HTMLElement | null = null;

	async refreshRibbon() {
		if (!this.settings.enableRibbonIcon) {
			if (this.ribbonIconEl) {
				this.ribbonIconEl.remove();
				this.ribbonIconEl = null;
			}
			return;
		}

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

		let newContent = "";
		if (this.settings.storageOption == KEY_STORAGE_PROPERTY) {
			newContent = await computeDelta(outputFile, this.settings);
		} else {
			console.log('TODO');
		}

		await this.app.vault.modify(outputFile, newContent);
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

		this.addSettingTab(new SampleSettingTab(this.app, this));
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
