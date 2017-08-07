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

  private ListBlobs(continuationToken, onLoadedAllBlobs, harFileName: string, harFilenames: string[]) {
    var onBlobsFound = (function(err, result, response) {
      if (!err) {
        for (var entry in result.entries) {
          harFilenames.push(result.entries[entry].name);
        }

        if (result.continuationToken) {
          this.ListBlobs(result.continuationToken, onLoadedAllBlobs, harFileName, harFilenames);
        }
        else {
          onLoadedAllBlobs(harFilenames, harFileName);
        }
      }
      else {
        Logger.Instance().Log('error', 'Error getting har file list from Azure storage: ' + err.message);
        onLoadedAllBlobs(harFilenames, harFileName);
      }
    }).bind(this);

    if (harFilenames.length === 0) {
      this.blobService.listBlobsSegmented(this.azureStorageContainerName, continuationToken, onBlobsFound);
    }
    else {
      onLoadedAllBlobs(harFilenames, harFileName);
    }
  }

  public FindFromRequest(harFileName: string, onHarFileFound) {
    
    var onLoadedAllBlobs = function(harFilenames: string[], harFileName: string) {
      var harFileFound: boolean = false;

      for (var entry in harFilenames) {
        var harFilename: string = harFilenames[entry];
        if (harFilename == harFileName) {
          harFileFound = true;
          onHarFileFound(harFilename);
          break;
        }
      }

      if (!harFileFound) {
          Logger.Instance().Log('error', 'Couldn\'t find har file in Azure storage with filename: ' + harFileName);
          onHarFileFound(null);
      }
    }

    this.ListBlobs(null, onLoadedAllBlobs, harFileName, this.HarFiles);
  }
}
