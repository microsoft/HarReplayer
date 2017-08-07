import Entry from "./harFile/entry.js";
import HarFile from "./harFile/harFile.js";
import Config from "./config.js";
import Logger from "./logger.js";
import HarResponseCache from "./HarFileCache/harResponseCache.js";
import HarResponseCacheFile from "./HarFileCache/HarResponseCacheFile.js";
import harServerUrl from "./harServerUrl.js"

export default class HarFileList {

  harResponseCache: HarResponseCache = new HarResponseCache();
  private config: Config = Config.Instance();

  public FindHarFileRequest(requestUrl: string, harFileName: string, onFoundHarFileEntry) {
   
    var urlToFindObj: harServerUrl = null;
    var urlRequestObj: harServerUrl = new harServerUrl(requestUrl);
    
    var onLoaded = function(cacheFile: HarResponseCacheFile) {
      var entry: Entry = null;
      if (cacheFile) {
        entry = cacheFile.LoadCacheFileEntry(urlRequestObj);
      }
      else { // error: file should have loaded
        Logger.Instance().Log('error', 'Failed to load har file');
      }

      onFoundHarFileEntry(entry);
    }
      
    this.harResponseCache.LoadCacheFile(harFileName, onLoaded);
  }

  public MapIpAddressToHarFilename(ipAddress: string, harFilename: string) {
    this.harResponseCache.MapIpAddressToHarFilename(ipAddress, harFilename);
  }

  public GetHarFilenameFromIpAddress(ipAddress: string) {
    return this.harResponseCache.GetHarFilenameFromIpAddress(ipAddress);
  }

  public BootstrapHarFile(harFileName: string, onBootstrapped) {
    var onLoaded = function(cacheFile: HarResponseCacheFile) {
      if (cacheFile) {
        cacheFile.Bootstrap();
      }

      onBootstrapped(cacheFile);
    }

    this.harResponseCache.LoadCacheFile(harFileName, onLoaded);
  }
}
