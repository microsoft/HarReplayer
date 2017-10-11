// Copyright (c) Microsoft Corporation. All rights reserved.// Licensed under the MIT license.
import * as fs from "fs";
import Config from "./../config.js";
import Log from "./log.js";
import harServerUrl from "./../harServerUrl.js"

export default class HarFile {

  constructor(filename: string, content: string) {
    this.config = Config.Instance();

    if (content.hasOwnProperty('log')) {
      this.Log = new Log(content['log'], this);
      this.filename = filename;
    }
  }

  filename: string;
  Log: Log;
  private config: Config;

  public FindRequest(url: harServerUrl) {
    for (var i = 0; i < this.Log.Entries.length; i++) {
      var entry = this.Log.Entries[i]
      if (url.Equals(entry.Request.url)) {
          return entry;
      }
    }

    return null;
  }
}