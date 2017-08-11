import * as fs from 'fs';
import harServerUrl from "./harServerUrl.js"
import Config from "./config.js";
import Logger from "./logger.js";
var azure = require('azure-storage');

export default class AzureStorageHarLookup {
  HarFiles: string[] = []; 

  private azureStorageAccountName: string = Config.Instance().AzureStorageAccountName;
  private azureStorageAccessKey: string = Config.Instance().AzureStorageAccessKey;
  private azureStorageContainerName: string = Config.Instance().AzureStorageContainerName;
  private blobService;

  constructor(azureOverride=undefined) {
    this.initialize(azureOverride);
  }
  
  private static _instance: AzureStorageHarLookup = null;

  public static Instance(): AzureStorageHarLookup {
    if (AzureStorageHarLookup._instance === null) {
      AzureStorageHarLookup._instance = new AzureStorageHarLookup();
    }

    return AzureStorageHarLookup._instance;
  }

  protected initialize(azureOverride) {
    if (this.azureStorageAccountName.length > 0) {
      this.blobService = azure.createBlobService(this.azureStorageAccountName, this.azureStorageAccessKey);
    }
    else if (azureOverride) {
      this.blobService = azureOverride.createBlobService();
    }
  }

  public LoadFile(filename: string, onDownloaded) {
    this.blobService.getBlobToText(this.azureStorageContainerName, filename, (function (err, blobContent, blob) {
      if (!err) {
        onDownloaded(blobContent);
      }
      else {
        Logger.Instance().Log('error', 'Error downloading har file from Azure storage: ' + err.message);
        onDownloaded(null);
      }
    }).bind(this));
  }
}
