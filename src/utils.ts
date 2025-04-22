import { Notice, TFile } from "obsidian";
import { KEY_NAME } from "./constants";
import { WaterTrackerSettings } from "./settings";
import {
    getDailyNote,
    getAllDailyNotes,
} from 'obsidian-daily-notes-interface'
import { moment } from 'obsidian';
import { createLog, DrinkLog, logToText } from "./logger";


export async function getOutputFile(settings: WaterTrackerSettings): Promise<TFile | void> {
    let outputFile;

    if (settings.enableDailyFile === true) {
        outputFile = getDailyNote(moment(), getAllDailyNotes())
    } else {
        outputFile = this.app.workspace.getActiveFile();
    }

    if (!outputFile) {
        if (settings.enableDailyFile) {
            console.error("No daily file found.");
            new Notice("No daily file found", 3000);
        } else {
            console.error("No active file found.");
            new Notice("No active file found", 3000);
        }
    }

    return outputFile;
}

export async function updateProperty(outputFile: TFile, appSettings: WaterTrackerSettings): Promise<void> {
    await this.app.fileManager.processFrontMatter(outputFile, (frontmatter: { [key: string]: unknown }) => {
        if (typeof frontmatter[KEY_NAME] !== 'number') {
            frontmatter[KEY_NAME] = 0;
        }
        frontmatter[KEY_NAME] = (frontmatter[KEY_NAME] as number) + appSettings.cupSize;
    });
}

export async function updateLog(outputFile: TFile, appSettings: WaterTrackerSettings) {
    const logToWrite: DrinkLog = createLog(appSettings);

    const logText = await logToText(logToWrite);

    if (logText) {
        await this.app.vault.append(outputFile, `\n${logText}`)
    }
}