import config from "../src/app/config";
var sinon = require('sinon');  
import AzureStorageHarLookup from "../src/app/azureStorageHarLookup.js";
import * as chai from "chai";
let assert = chai.assert;


describe("Azure storage har lookup tests", () => {
    
    let testFilename: string = 'testfilename';

    function createMockObj() {
        var result = {entries: []};
        result.entries["entry"] = {name: testFilename};

        var blobServiceStub = {
            getBlobToText: sinon.stub().callsArgWith(2, null, 'blobcontent', null),
            listBlobsSegmented: sinon.stub().callsArgWith(2, null, result, null)
        };

        var azureStub = {
            createBlobService: sinon.stub().returns(blobServiceStub)
        };

        return azureStub;
    }

    var subject: AzureStorageHarLookup = new AzureStorageHarLookup(createMockObj());

    it("validates har files can be loaded from Azure storage", function(done) {

        var onDownloaded = (function(content: string) {
            assert.equal(content === "blobcontent", true);
            done();
        });
        
        subject.LoadFile("testfilename", onDownloaded);
    });
});