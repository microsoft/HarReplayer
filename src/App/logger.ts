// Copyright (c) Microsoft Corporation. All rights reserved.// Licensed under the MIT license.
import Config from "./config.js";
import * as datetime from "node-datetime";
import * as winston from "winston";

export default class Logger {

    constructor() {
        winston.level = this.config.LoggingLevel;
    }

    private config: Config = Config.Instance();
    private static _instance: Logger = null;

    public static Instance(): Logger {
        if (Logger._instance === null) {
            Logger._instance = new Logger();
        }

        return Logger._instance;
    }

    public Log(level: string, message: string) {
        var dt = datetime.create();
        var formattedDT = dt.format('Y-m-d H:M:S.N');
        var logEntry: string = formattedDT + ': ' + message;
        winston.log(level, logEntry);
    }
}