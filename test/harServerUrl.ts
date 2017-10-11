// Copyright (c) Microsoft Corporation. All rights reserved.// Licensed under the MIT license.
import * as chai from "chai";
import harServerUrl from "../src/app/harServerUrl.js"
import config from "../src/app/config";

let assert = chai.assert;
let configInstance = config.Instance("..\\..\\test\\dependencies\\config.json");

describe("harServerUrl validation", () => {
    
    it("validates url param matching", function() {
        var url1: harServerUrl = new harServerUrl('/search?q=robots');
        var url2: harServerUrl = new harServerUrl('/search?q=robots');
        assert.equal(url1.Equals(url2), true, true);

        url1 = new harServerUrl('/search');
        url2 = new harServerUrl('/search');
        assert.equal(url1.Equals(url2), true, true);

        url1 = new harServerUrl('/search?q=robots');
        url2 = new harServerUrl('/search');
        assert.equal(url1.Equals(url2), false, true);

        url1 = new harServerUrl('/search?q=robots');
        url2 = new harServerUrl('/search?q=spiders');
        assert.equal(url1.Equals(url2), false, true);

        url1 = new harServerUrl('/search?q=robots,transformers');
        url2 = new harServerUrl('/search?q=robots');
        assert.equal(url1.Equals(url2), false, true);        
    });
});