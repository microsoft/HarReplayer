import config from "../src/app/config";
import * as chai from "chai";

let assert = chai.assert;

describe("Config tests", () => {
    it("validates that config loads properly", () => {
        let configInstance = config.Instance("..\\..\\test\\dependencies\\config.json");

        assert.equal(configInstance.AzureStorageAccessKey === "", true);
        assert.equal(configInstance.AzureStorageAccountName === "", true);
        assert.equal(configInstance.AzureStorageContainerName === "", true);
        assert.equal(configInstance.CacheLifetime === 60, true);
        assert.equal(configInstance.HarFilePath === "test\\dependencies\\", true);
        assert.equal(configInstance.InjectJavascript === "window.Math.random = function() {return 0;}", true);
        assert.equal(configInstance.ListenPort === 8084, true);
        assert.equal(configInstance.ListenPortSSL === 4433, true);
        assert.equal(configInstance.SSLKeyLocation === "sslkeypath", true);
        assert.equal(configInstance.SSLCertLocation === "sslcertpath", true);
        assert.equal(configInstance.LoggingLevel === "info", true);
        assert.equal(configInstance.QueryParamsToIgnore === "", true);
        assert.equal(configInstance.UrlReplacements.length === 2, true);
        assert.equal(configInstance.UrlReplacements[0].regex === "/[0-9a-fA-F]{8}", true);
        assert.equal(configInstance.UrlReplacements[0].replacement === "/00000000", true);
        assert.equal(configInstance.UrlReplacements[1].regex === "/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}", true);
        assert.equal(configInstance.UrlReplacements[1].replacement === "", true);
    });
});