import * as harServer from "./src/App/harserver.js";

var listenPort: number = null;
var cacheLifetime: number = null;
var injectJavascript: string = null;
var queryParamsToIgnore: string = null;
var azureStorageAccountName: string = null;
var azureStorageAccessKey: string = null;
var azureStorageContainerName: string = null;
var harfilepath: string = null;
var loggingLevel: string = null;

for (var arg in process.argv) {    
    var index: number = parseInt(arg);
    if (process.argv.length > index + 1) {
        if (process.argv[arg].toLowerCase() == '--listenport') {
            listenPort = parseInt(process.argv[index + 1]);
        }
        else if (process.argv[arg].toLowerCase() == '--injectjavascript') {
            injectJavascript = process.argv[index + 1];
        }
        else if (process.argv[arg].toLowerCase() == '--cachelifetime') {
            cacheLifetime = parseInt(process.argv[index + 1]);
        }
        else if (process.argv[arg].toLowerCase() == '--queryparamstoignore') {
            queryParamsToIgnore = process.argv[index + 1];
        }
        else if (process.argv[arg].toLowerCase() == '--azurestorageaccountname') {
            azureStorageAccountName = process.argv[index + 1];
        }
        else if (process.argv[arg].toLowerCase() == '--azurestorageaccesskey') {
            azureStorageAccessKey = process.argv[index + 1];
        }
        else if (process.argv[arg].toLowerCase() == '--azurestoragecontainername') {
            azureStorageContainerName = process.argv[index + 1];
        }
        else if (process.argv[arg].toLowerCase() == '--harfilepath') {
            harfilepath = process.argv[index + 1];
        }
        else if (process.argv[arg].toLowerCase() == '--logginglevel') {
            loggingLevel = process.argv[index + 1];
        }
    }
}

harServer.start(listenPort, injectJavascript, cacheLifetime, queryParamsToIgnore, azureStorageAccountName, azureStorageAccessKey, azureStorageContainerName, harfilepath, loggingLevel, null);