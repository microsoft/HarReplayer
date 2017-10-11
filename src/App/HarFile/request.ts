// Copyright (c) Microsoft Corporation. All rights reserved.// Licensed under the MIT license.
import * as urlParser from "url"
import harServerUrl from "./../harServerUrl.js"

export default class Request {
    constructor(request: string) {        
        if (request.hasOwnProperty('url') && request.hasOwnProperty('method')) {
            this.url = new harServerUrl(request['url']);
            this.method = request['method'];
        }
    }

    url: harServerUrl;
    method: string;
}