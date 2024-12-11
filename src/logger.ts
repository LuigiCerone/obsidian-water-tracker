import moment from "moment";
import { MyPluginSettings } from "./settings";

export type DrinkLog = {
    amount: number
    time: number
}


export function createLog(appSettings: MyPluginSettings): DrinkLog {
    return {
        amount: appSettings.cupSize,
        time: new Date().getTime()
    }
}

export function logToText(logToWrite: DrinkLog) {
    const time = moment(logToWrite.time)
    const emoji = '🥤'

    return `- ${emoji} (water::${logToWrite.amount}) (time:: ${time.format('YYYY-MM-DD HH:mm')})`
}
