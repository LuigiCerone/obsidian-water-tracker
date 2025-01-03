import { Notice, TFile } from "obsidian";
import { KEY_NAME } from "./constants";
import { WaterTrackerSettings } from "./settings";
import * as yaml from "js-yaml";
import {
    getDailyNote,
    getAllDailyNotes,
} from 'obsidian-daily-notes-interface'
import moment from 'moment';
import { createLog, DrinkLog, logToText } from "./logger";


export async function getOutputFile(settings: WaterTrackerSettings): Promise<TFile | void> {
    let outputFile;

    if (settings.enableDailyFile === true) {
        outputFile = getDailyNote(moment() as any, getAllDailyNotes())
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

export async function updateProperty(outputFile: TFile, appSettings: WaterTrackerSettings): Promise<string> {

    const content = await this.app.vault.read(outputFile);

    const frontmatterRegex = /^---\n([\s\S]*?)\n---/;
    const match = content.match(frontmatterRegex);

    let newFrontmatter = "";
    let restOfFile = content;

    if (match) {
        restOfFile = content.slice(match[0].length).trim();

        const frontmatterObject = this.app.metadataCache.getFileCache(outputFile)?.frontmatter || {};
        frontmatterObject[KEY_NAME] += appSettings.cupSize;

        const yamlContent = yaml.dump(frontmatterObject);
        newFrontmatter = `---\n${yamlContent}\n---\n${restOfFile}`;
    } else {
        const newFrontmatterObject = { [KEY_NAME]: appSettings.cupSize };
        const yamlContent = yaml.dump(newFrontmatterObject);
        newFrontmatter = `---\n${yamlContent}\n---\n`;
    }

    return newFrontmatter;
}

export async function updateLog(outputFile: TFile, appSettings: WaterTrackerSettings) {
    const logToWrite: DrinkLog = createLog(appSettings);

    const logText = await logToText(logToWrite);

    if (logText) {
        await this.app.vault.append(outputFile, `\n${logText}`)
    }
}