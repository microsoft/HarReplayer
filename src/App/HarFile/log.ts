import HarFile from "./harFile.js";
import Entry from "./entry.js";

export default class Log {
    constructor(log: string, harFile: HarFile) {
        this.myHarFile = harFile;
        if (log.hasOwnProperty('entries')) {
            for (var i=0; i < log["entries"].length; i++) {
                var entry: Entry = new Entry(log["entries"][i], harFile);
                if (entry.IsGetRequest() && entry.ContainsValidResponse()) {
                    this.Entries.push(entry);
                }
            }
        }
    }

    myHarFile: HarFile;
    Entries: Entry[] = [];
}