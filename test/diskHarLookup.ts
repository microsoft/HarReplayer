// Copyright (c) Microsoft Corporation. All rights reserved.// Licensed under the MIT license.
import HarFile from "../src/app/harFile/harFile.js";
import config from "../src/app/config";
import DiskHarLookup from "../src/app/diskHarLookup.js";
import * as chai from "chai";

let assert = chai.assert;

describe("Disk har lookup tests", () => {
    it("validates har files can be loaded from disk", function(done) {
        let configInstance = config.Instance("..\\..\\test\\dependencies\\config.json");
        let disklookup = DiskHarLookup.Instance();

        var onHarFileFound = (function() {
            var onDownloaded = (function(content: string) {
                assert.equal(content !== null, true);
                var jsonObj = JSON.parse(content);
                var harFile: HarFile = new HarFile("harfilename", jsonObj);
                assert.equal(harFile.filename === "harfilename", true);
                assert.equal(harFile.Log.Entries.length === 66, true);
                done();
            });

            var content = disklookup.LoadFile("harfile", onDownloaded);
        });
        
        disklookup.FindFromRequest("harfile", onHarFileFound);
    });
});