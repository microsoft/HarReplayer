// Copyright (c) Microsoft Corporation. All rights reserved.// Licensed under the MIT license.
import Config from "./../config.js";
import Entry from "./../harFile/entry.js";
import HarFile from "./../harFile/harFile.js";
import HarResponseCacheFile from "./HarResponseCacheFile.js";
import AzureStorageHarLookup from "./../azureStorageHarLookup.js";
import DiskHarLookup from "./../diskHarLookup.js";
import HarServerUrl from "./../harServerUrl.js";
import Logger from "./../logger.js";

export default class HarResponseCache {
  constructor() {
    this.config = Config.Instance();
    this.usingAzureStorage = this.config.AzureStorageAccountName.length > 0;
    setInterval(this.CleanCache, 5000, this); // delete old entries every five seconds.
  }

  private config: Config;
  harResponseCacheFiles: Array<string | HarResponseCacheFile> = [];
  harResponseFilenamesByIP: Array<string | string> = [];
  private azureStorageHarLookup: AzureStorageHarLookup = AzureStorageHarLookup.Instance();
  private diskHarLookup: DiskHarLookup = DiskHarLookup.Instance();
  private usingAzureStorage: boolean;

  public CleanCache(harResponseCache: HarResponseCache) {
    for (var i = 0; i < Object.keys(harResponseCache.harResponseCacheFiles).length; i++) {
      var key = Object.keys(harResponseCache.harResponseCacheFiles)[i];
      if (harResponseCache.harResponseCacheFiles[key].Expired()) {
        delete harResponseCache.harResponseCacheFiles[key];
        harResponseCache.RemoveEntriesFromIpAddressHarFilenameMapping(key);
      }
    }  
  }

  public RemoveEntriesFromIpAddressHarFilenameMapping(harFilename: string) {
    for (var i = 0; i < Object.keys(this.harResponseFilenamesByIP).length; i++) {
      var key = Object.keys(this.harResponseFilenamesByIP)[i];
      if (this.harResponseFilenamesByIP[key] === harFilename) {
        delete this.harResponseFilenamesByIP[key];
      }
    }
  }

  public MapIpAddressToHarFilename(ipAddress: string, harFilename: string) {
    this.harResponseFilenamesByIP[ipAddress] = harFilename;
  }

  public GetHarFilenameFromIpAddress(ipAddress: string): string {
    return this.harResponseFilenamesByIP[ipAddress];
  }

  public LoadCacheFile(harFileName: string, onLoaded) {
    if (!this.harResponseCacheFiles[harFileName]) {
      
      var onHarFileFound = (function(harFileName: string) {
        if (harFileName) {            
            var onDownloaded = (function(content: string) {
            if (content) {
              var jsonObj = JSON.parse(content);
              var harFile: HarFile = new HarFile(harFileName, jsonObj); //not in cache: load from azure storage
              var cacheFile = new HarResponseCacheFile(harFile);
              this.harResponseCacheFiles[harFileName] = cacheFile;

              onLoaded(cacheFile);
            }
            else { // error downloading file
              onLoaded(null);
            }
          }).bind(this);

          Logger.Instance().Log('info', 'Loading har file: ' + harFileName);
          if (this.usingAzureStorage) {
            var content = this.azureStorageHarLookup.LoadFile(harFileName, onDownloaded);
          }
          else {
            var content = this.diskHarLookup.LoadFile(harFileName, onDownloaded);
          }
        }
        else { // matching har file not found in Azure storage
          onLoaded(null);
        }
      }).bind(this);

      if (this.usingAzureStorage)
      {
        onHarFileFound(harFileName); // don't bother finding the file, just attempt download immediately (Bugfix Issue #2)
      }
      else {
        this.diskHarLookup.FindFromRequest(harFileName, onHarFileFound);
      }
    }
    else {
      onLoaded(this.harResponseCacheFiles[harFileName]);
    }
  }
}
