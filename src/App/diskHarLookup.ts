import * as fs from 'fs';
import harServerUrl from "./harServerUrl.js"
import Config from "./config.js";
import Logger from "./logger.js";
var azure = require('azure-storage');

export default class DiskHarLookup {
  
  private harFilesFolder: string = Config.Instance().HarFilePath;
  private static _instance: DiskHarLookup = null;

  public static Instance(): DiskHarLookup {
    if (DiskHarLookup._instance === null) {
      DiskHarLookup._instance = new DiskHarLookup();
    }

    return DiskHarLookup._instance;
  }

  public LoadFile(filename: string, onDownloaded) {
    var harFilePath = this.harFilesFolder + '\\' + filename;
    fs.readFile(harFilePath, function read(err, data) {
      if (!err){
        onDownloaded(data);
      }
      else {
        Logger.Instance().Log('error', 'Error reading har file from disk: ' + err.message);
        onDownloaded(null);
      }
    });
  }

  public FindFromRequest(harFileName: string, onHarFileFound) {
    onHarFileFound(harFileName);
  }
}
