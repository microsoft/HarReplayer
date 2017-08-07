# HarReplayer
A proxy server that replays responses from HTTP archive (HAR) files

## About the project
This is a node-js web server that loads a HAR file from disk / Azure storage.  

It's useful for accurately measuring the client-side performance of a web page because the server latency is removed from the equation when loading a page from the server.  When loading a HAR file for the first time the responses are cached in RAM so that subsequent loads will no longer need to load the HAR file from disk / Azure storage.  This results in more consistent page load times.

## Installation
Install package 'npm install -g harreplayer' or clone this enlistment onto your machine.

## Modes of operation
Specifying HAR file in url parameter: When loading a page from the server, you can specify the name of the desired HAR file to load in url parameter 'harfileid'.  The HarReplayer will replay the initial response after locating the matching url in the HAR file.  The HarReplayer will map the origin request's IP address to that HAR file so that subsequent ajax requests are matched to the same file.  This method relies upon the origin IP address being constant for every ajax request on a page load.

Specifying HAR file in cookie value: You can specify the name of the desired HAR file to load in a cookie named 'x-harfileid'.  Each ajax request for a page load will need to specify this cookie value for the page to load correctly.  This can be achieved by using a Fiddler proxy or similar to inject the cookie into each request.

## Bootstrapping
The HarReplayer can be bootstrapped so that subsequent requests to it will load the responses from the cache, hence avoiding loading the HAR file from disk / Azure storage again.  This will help achieve more consistent performance when loading a page.

Bootstrapping is achieved by calling the HarReplayer's '/bootstrap' endpoint, specifying the har file to load in either the url parameter or cookie (see "Modes of operation" above).

## Server ping
After launching the HarReplayer, you can verify it's up by calling the HarReplayer's '/pinghealth' endpoint.  This will return HTTP status 200 if that HarReplayer is active and listening.

## Config settings (describes the settings loaded from /config/config.json)
ListenPort: The port you want the HarReplayer to listen on.  Defaults to 8080.

CacheLifetime: The amount of time in seconds to store HAR files in the HarReplayer's cache.  After loading a HAR file from disk / Azure storage, this is the amount of time that the file will remain in the cache since it was last accessed (page load).  Defaults to 60.

InjectJavascript: Use this to inject javascript into your initial response's Html head, prior to serving to client browser.  This can be useful for performance testing, as you can use it to overwrite indeterminate javascript code such as 'window.Math.random' function.  Defaults to 'window.Math.random = function() {return 0;}'

QueryParamsToIgnore: The HarReplayer server will locate which response to serve from the specified HAR file by matching the request url to a response in the file.  There may be cases when you are unsure whether a certain url parameter value may be included in the request, which would cause the match to fail.  You can specify a comma-separated list of query parameters to ignore when performing this matching.

UrlReplacements: A json list of regex replacements to use when url matching.  This feature can be used when the value of a request url parameter is unknown, for example a random GUID.  It will find the request parameter based on the specified regex ('regex'), and replace with the specified string ('replacement').

AzureStorageAccessKey: Azure access key to use when loading HAR files from Azure storage.

AzureStorageAccountName: Azure account name to use when loading HAR files from Azure storage.  If a value is specified here, the HarReplayer will load HAR files from Azure storage, otherwise it will load from disk, using the 'HarFilePath' setting value (see below).

AzureStorageContainerName: Azure container name to use when loading HAR files from Azure storage.

LoggingLevel: The HarReplayer logs information to the console output, using node-js package 'winston' - https://github.com/winstonjs
Use this setting to specify the logging level you wish to use.  Defaults to 'info'.

HarFilePath: The folder to load HAR files from disk.

## Overwriting config settings in command line
The settings in '/config/config.json' can be overwritten by specifying their overrides in the command line when starting the HarReplayer server, e.g. node index.js --listenport 8080
