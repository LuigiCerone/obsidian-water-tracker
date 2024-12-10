import { Notice, TFile } from "obsidian";
import { KEY_NAME } from "./constants";
import { MyPluginSettings } from "./settings";
import * as yaml from "js-yaml";
import {
    getDailyNote,
    getAllDailyNotes,
} from 'obsidian-daily-notes-interface'
import moment from 'moment';


export async function getOutputFile(settings: MyPluginSettings) : Promise<TFile | void> {
    let outputFile;

    if (settings.enableDailyFile){
        outputFile = getDailyNote(moment() as any, getAllDailyNotes())
    } else {
        outputFile = this.app.workspace.getActiveFile();
    }

    if (!outputFile) {
        console.error("No outfile file found.");
        new Notice("No active file found", 3000);
    }

    return outputFile;
}

export async function computeDelta(outputFile: TFile, appSettings: MyPluginSettings) : Promise<string> {
    
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
        const newFrontmatterObject = { [KEY_NAME]: 5 };
        const yamlContent = yaml.dump(newFrontmatterObject);
        newFrontmatter = `---\n${yamlContent}\n---\n`;
    }

    return newFrontmatter;
}