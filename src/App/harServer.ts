// Copyright (c) Microsoft Corporation. All rights reserved.// Licensed under the MIT license.
import Entry from "./harFile/entry.js";
import Config from "./config.js";
import Logger from "./logger.js";
import HarFile from "./harFile/harFile.js";
import HarFileList from "./harFileList.js";
import harServerUrl from "./harServerUrl.js";
import * as fs from "fs";
import * as express from "express";
import * as urlParser from "url"
import * as queryString from 'query-string';
import Header from "./HarFile/header.js";

var https = require('https');
var http = require('http');
var compression = require('compression');

var httpServer, httpsServer = null;
var config: Config = Config.Instance();
var harFileList: HarFileList;

export function start(listenPort: number, listenPortSSL: number, sslKeyLocation: string, sslCertLocation: string, injectJavascript: string, cacheLifetime: number, queryParamsToIgnore: string, azureStorageAccountName: string,
 azureStorageAccessKey: string, azureStorageContainerName: string, harfilepath: string, loggingLevel: string, urlReplacements: any): express {

  setConfigFromArgs(listenPort, listenPortSSL, sslKeyLocation, sslCertLocation, injectJavascript, cacheLifetime, queryParamsToIgnore, azureStorageAccountName, azureStorageAccessKey, azureStorageContainerName, harfilepath, loggingLevel, urlReplacements);

  var app = express();
  app.use(compression());
  this.harFileList = new HarFileList();
  module.exports.stop();
  
  function sendResponse(responseObj, responseBytes: Buffer, harFileEntry: Entry) {

    for (var i=0; i<harFileEntry.Response.Headers.length; i++) {
      var header: Header = harFileEntry.Response.Headers[i];
      if (header.name !== 'Content-Encoding') { //Prevent "ERR_CONTENT_DECODING_FAILED".  This happens when setting content-encoding response header.
        if (header.name === 'Content-Length')
          {
            responseObj.setHeader(header.name, responseBytes.length);
          }
          else {
            responseObj.setHeader(header.name, header.value);
          }
      }
    }

    responseObj.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    responseObj.setHeader('Expires', '-1');
    responseObj.setHeader('Pragma', 'no-cache');
    responseObj.statusCode = 200;
    responseObj.end(responseBytes);
  }
  
  function setConfigFromArgs(listenPort: number, listenPortSSL: number, sslKeyLocation: string, sslCertLocation: string, injectJavascript: string, cacheLifetime: number, queryParamsToIgnore: string, azureStorageAccountName: string,
    azureStorageAccessKey: string, azureStorageContainerName: string, harfilepath: string, loggingLevel: string, urlReplacements: any) {

    if (listenPort) {
      config.ListenPort = listenPort;
    }

    if (listenPortSSL) {
      config.ListenPortSSL = listenPortSSL;
    }

    if (sslKeyLocation) {
      config.SSLKeyLocation = sslKeyLocation;
    }

    if (sslCertLocation) {
      config.SSLCertLocation = sslCertLocation;
    }

    if (injectJavascript) {
      config.InjectJavascript = injectJavascript;
    }

    if (cacheLifetime) {
      config.CacheLifetime = cacheLifetime;
    }

    if (queryParamsToIgnore) {
      config.QueryParamsToIgnore = queryParamsToIgnore;
    }

    if (azureStorageAccountName) {
      config.AzureStorageAccountName = azureStorageAccountName;
    }

    if (azureStorageAccessKey) {
      config.AzureStorageAccessKey = azureStorageAccessKey;
    }

    if (azureStorageContainerName) {
      config.AzureStorageContainerName = azureStorageContainerName;
    }
    
    if (harfilepath) {
      config.HarFilePath = harfilepath;
    }

    if (loggingLevel) {
      config.LoggingLevel = loggingLevel;
    }

    if (urlReplacements) {
      config.UrlReplacements = urlReplacements;
    }
  }

  const requestHandler = (request, response) => {
    if (request.path === '/pinghealth') {
      response.end();
    }
    else {
      var harFileName: string = getHarFileNameFromHeaders(request);
      if (!harFileName) {  
        var originIPAddress: string = request.ip;
        if (originIPAddress) {
          harFileName = getHarFileNameFromUrlParams(request.url);
          if (harFileName) {
            this.harFileList.MapIpAddressToHarFilename(originIPAddress, harFileName);
          }
          else {
            harFileName = this.harFileList.GetHarFilenameFromIpAddress(originIPAddress);
          }
        }
      }

      if (harFileName) {                  
        if (request.path === '/bootstrap') {
          Logger.Instance().Log('info', 'Bootstrap for har file: ' + harFileName);
          var onBootstrapped = function(cacheFile) {
            if (cacheFile) {
              response.end();
              Logger.Instance().Log('info', 'bootstrap complete');
            }
            else {
              Logger.Instance().Log('error', 'bootstrap failed to load har file');
              sendErrorResponse(response);
            }
          }

          this.harFileList.BootstrapHarFile(harFileName, onBootstrapped);
        }
        else {
          var onFoundHarFileEntry = function(entry: Entry) {
            if (entry) {
              Logger.Instance().Log("info", request.url);
              sendResponse(response, entry.Response.contentBytes(), entry);
            }
            else {
              Logger.Instance().Log('warn', 'Couldn\'t find har file entry for request url: ' + request.url);
              sendErrorResponse(response);
            }
          }

          this.harFileList.FindHarFileRequest(request.url, harFileName, onFoundHarFileEntry);
        }
      }
      else {        
        Logger.Instance().Log('error', 'Unable to get har file name from header or ip address');
        sendErrorResponse(response);
      }
    }
  }

  function sendErrorResponse(response) {
    response.statusCode = 404;
    response.end();
  }

  function getHarFileNameFromUrlParams(url: string): string {
    const queryParamKey = "harfileid";
    var parsedUrl = urlParser.parse(url);
    var queryParams = queryString.parse(parsedUrl.query);
    if (Array.isArray(queryParams[queryParamKey])) {
      return queryParams[queryParamKey][0];
    }
    else {
      return <string>queryParams[queryParamKey];
    }
  }

  function getHarFileNameFromHeaders(request): string {
    for (var header in request.headers) {
      if (header.toLowerCase() === 'x-harfileid') {
        return request.headers[header];
      }
    }

    return null;
  }

  function postHandler(request, response) {
    response.statusCode = 404;
    response.end();
  }
  
  app.get('*', requestHandler);
  app.post('*', postHandler);
  

  function appCallback(err, listenPort: number, protocol: string) {
    if (err) {
      return Logger.Instance().Log('error', 'Can\'t listen on port' + listenPort);
    }

    Logger.Instance().Log('info', protocol + ' server is listening on ' + listenPort);
  }
  
  httpServer = http.createServer(app).listen(config.ListenPort, (err) => appCallback(err, config.ListenPort, "HTTP"))
  
  if (fs.existsSync(config.SSLKeyLocation) && fs.existsSync(config.SSLCertLocation)) {
    var httpsOptions = {
      key: fs.readFileSync(config.SSLKeyLocation),
      cert: fs.readFileSync(config.SSLCertLocation)
    };

    httpsServer = https.createServer(httpsOptions, app).listen(config.ListenPortSSL, (err) => appCallback(err, config.ListenPortSSL, "HTTPS"))
  }
  else {
    Logger.Instance().Log('info', 'Couldn\'t find certificate files - SSL not available.')
  }

  return app;
}

export function stop() {
  config.Save();

  function stopServer(server, protocol) {
    if (server != null) {
      server.close();
      server = null;
      
      Logger.Instance().Log('info', protocol + ' server connection closed');
    }
  }

  stopServer(httpServer, 'HTTP');
  stopServer(httpsServer, 'HTTPS');
  
}
