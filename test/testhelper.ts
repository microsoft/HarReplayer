// Copyright (c) Microsoft Corporation. All rights reserved.// Licensed under the MIT license.
import * as harServer from "../src/App/harserver.js";
import * as express from "express";

export function startServer(configInstance): express {
    return harServer.start(configInstance.ListenPort, configInstance.ListenPortSSL, configInstance.SSLKeyLocation, configInstance.SSLCertLocation, configInstance.InjectJavascript, configInstance.CacheLifetime, configInstance.QueryParamsToIgnore, configInstance.AzureStorageAccountName,
        configInstance.AzureStorageAccessKey, configInstance.AzureStorageContainerName, configInstance.HarFilePath, configInstance.LoggingLevel, configInstance.UrlReplacements);
}

export function stopServer() {
    harServer.stop();
}