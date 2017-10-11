// Copyright (c) Microsoft Corporation. All rights reserved.// Licensed under the MIT license.
export default class Header {
    constructor(response: string) {
            if (response.hasOwnProperty('name') && response.hasOwnProperty('value')) {
                this.name = response['name'];
                this.value = response['value'];
            }
    }

    name: string;
    value: string;
}