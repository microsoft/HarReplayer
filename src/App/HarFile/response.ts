// Copyright (c) Microsoft Corporation. All rights reserved.// Licensed under the MIT license.
import * as base64 from "base64-js";
import Logger from "./../logger.js";
import Header from "./header.js";

export default class Response {
    constructor(response: string) {
        this.contentBuffer = null;
        if (response.hasOwnProperty('content')) {
            var content = response['content'];
            if (content.hasOwnProperty('mimeType') && content.hasOwnProperty('size') && content.hasOwnProperty('text')) {
                this.content_mimeType = content['mimeType'];
                this.content_size = content['size'];
                this.content_text = content['text'];
                this.content_encoding = content['encoding'];
            }
        }

        if (response.hasOwnProperty('headers')) {
            for (var i=0; i < response["headers"].length; i++) {
                var header: Header = new Header(response["headers"][i]);
                this.Headers.push(header);
            }
        }
    }

    content_mimeType: string;
    content_size: number;
    content_text: string;
    content_encoding: string;
    private contentBuffer: Buffer;
    Headers: Header[] = [];

    public setContentText(contentText: string) {
        this.content_text = contentText;
        this.contentBuffer = null;
    }

    public contentBytes(): Buffer {
        if (this.contentBuffer) {
            return this.contentBuffer;
        }
        else {
            if (this.content_text && this.content_text.length > 0) {
                if (this.content_encoding == "base64") {
                    this.contentBuffer = new Buffer(base64.toByteArray(this.content_text));
                }
                else {
                    this.contentBuffer = new Buffer(this.content_text, 'utf8');
                }
            }

            return this.contentBuffer;
        }
    } 
}