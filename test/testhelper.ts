import * as harServer from "../src/App/harserver.js";
import * as express from "express";

export function startServer(configInstance): express {
    return harServer.start(configInstance.ListenPort, configInstance.InjectJavascript, configInstance.CacheLifetime, configInstance.QueryParamsToIgnore, configInstance.AzureStorageAccountName,
        configInstance.AzureStorageAccessKey, configInstance.AzureStorageContainerName, configInstance.HarFilePath, configInstance.LoggingLevel, configInstance.UrlReplacements);
}

export function stopServer() {
    harServer.stop();
}