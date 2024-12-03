import { Notice, Plugin, } from 'obsidian';
import { DEFAULT_SETTINGS, MyPluginSettings, SampleSettingTab } from './settings';
import { computeDelta } from './utils';


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
		const activeFile = this.app.workspace.getActiveFile();
		if (!activeFile) {
			console.error("No active file found.");
			return;
		}

		const newContent = await computeDelta(activeFile, this.settings);

		await this.app.vault.modify(activeFile, newContent);
		new Notice('One drink added');
	}

	async onload() {
		await this.loadSettings();

		await this.refreshRibbon();

		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		// const statusBarItemEl = this.addStatusBarItem();
		// statusBarItemEl.setText('Status Bar Text');

		// This adds a simple command that can be triggered anywhere
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

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this));

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
			console.log('click', evt);
		});

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));
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
