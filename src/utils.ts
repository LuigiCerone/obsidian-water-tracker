import { TFile } from "obsidian";
import { KEY_NAME } from "./constants";
import yaml from "js-yaml";
import { MyPluginSettings } from "./settings";


export async function computeDelta(activeFile: TFile, appSettings: MyPluginSettings) : Promise<string> {
    const content = await this.app.vault.read(activeFile);

    const frontmatterRegex = /^---\n([\s\S]*?)\n---/;
    const match = content.match(frontmatterRegex);

    let newFrontmatter = "";
    let restOfFile = content;

    if (match) {
        restOfFile = content.slice(match[0].length).trim();

        const frontmatterObject = this.app.metadataCache.getFileCache(activeFile)?.frontmatter || {};
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