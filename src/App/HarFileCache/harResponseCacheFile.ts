// Copyright (c) Microsoft Corporation. All rights reserved.// Licensed under the MIT license.
import Config from "./../config.js";
import Entry from "./../harFile/entry.js";
import HarFile from "./../harFile/harFile.js";
import harServerUrl from "./../harServerUrl.js"
import * as XRegExp from "xregexp";
var StringBuilder = require('string-builder');

export default class HarResponseCacheFile {
  constructor(harFile: HarFile) {
    this.harFile = harFile;    
    this.config = Config.Instance();
    this.injectedJavascript = false;
  }

  private config: Config;
  private injectedJavascript: boolean;
  public lastAccessTime: number;

  harResponseCacheEntries: Array<string | Entry> = [];
  public harFile: HarFile;

  public UpdateLastAccessTime() {
    var now: Date = new Date();
    this.lastAccessTime = now.getTime();
  }

  public Expired(): Boolean {
    var now: Date = new Date();
    return (now.getTime() - (this.config.CacheLifetime * 1000)) > this.lastAccessTime;
  }

  public LoadCacheFileEntry(url: harServerUrl): Entry {
    this.UpdateLastAccessTime();
    var cacheKey: string = url.Path + '?' + url.QueryString;
    if (!this.harResponseCacheEntries[cacheKey]) {
      var entry: Entry = this.LoadEntry(url);
      if (entry) {
        if (!this.injectedJavascript) {
          if (this.InjectJavascript(entry)) {
            this.injectedJavascript = true;
          }
        }
        
        this.harResponseCacheEntries[cacheKey] = entry;
      }
    }

    return this.harResponseCacheEntries[cacheKey];
  }

  public Bootstrap() {
    this.harResponseCacheEntries = [];
    for (var idxEntry in this.harFile.Log.Entries) {
      var entry: Entry = this.harFile.Log.Entries[idxEntry];
      var cacheKey: string = entry.Request.url.Path + '?' + entry.Request.url.QueryString;
      this.harResponseCacheEntries[cacheKey] = entry;
    }
  }

  private LoadEntry(url: harServerUrl) {
      return this.harFile.FindRequest(url);
  }

  private InjectJavascript(entry: Entry) {
    if (this.config.InjectJavascript.length > 0) {
      if (entry.Response.content_mimeType.indexOf('html') > 0) {
        var sb = new StringBuilder();
        var idxStartHtml = entry.Response.content_text.indexOf('<head');
        if (idxStartHtml >= 0) {
          var idxJsInsertionPoint = entry.Response.content_text.indexOf('>', idxStartHtml);
          if (idxJsInsertionPoint >= 0) {
            sb.append(entry.Response.content_text.substring(0, idxJsInsertionPoint + 1));
            sb.append('<script type="text/javascript">');
            sb.append('//<![CDATA[\r\n');
            sb.append(this.config.InjectJavascript);
            sb.append('\r\n//]]>');
            sb.append('</script>');
            sb.append(entry.Response.content_text.substring(idxJsInsertionPoint + 1, entry.Response.content_text.length));
            entry.Response.setContentText(sb.toString());
            return true;
          }
        }
      }
    }

    return false;
  }
}