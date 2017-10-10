import Config from "./config.js";
import * as queryString from 'query-string';
import * as urlParser from "url"
import * as XRegExp from "xregexp";
import Logger from "./logger.js";

export default class harServerUrl {
    constructor(url: string) {
        var parsedUrl = urlParser.parse(url);
        this.SanitizeUrl(parsedUrl);
        this.OriginalUrl = parsedUrl.path;
        if (parsedUrl.query) {
            this.QueryString = parsedUrl.query;
        }
        else {
            this.QueryString = '';
        }
    }

    private config: Config = Config.Instance();
    private queryParams: Object;
    public OriginalUrl: string;
    public Path: string;
    public QueryString: string;

    public Equals(otherUrl: harServerUrl): boolean {
        if (this.Path !== otherUrl.Path) {
            return false;
        }

        return this.PropertiesMatch(this.queryParams, otherUrl.queryParams);
    }

    public PropertiesMatch(obj1: Object, obj2: Object): boolean {
        if (Object.keys(obj1).length !== Object.keys(obj2).length) {
            Logger.Instance().Log("info", "key length mismatch");
            return false;
        }
        
        for (var key in obj1) {
            if (obj1[key] === null || obj2[key] === null) { // one of our values are null - this would break the if block underneath
                if (obj1[key] === null && obj2[key] === null) {
                    continue; // both values are null, they match, so continue to the next key
                }

                Logger.Instance().Log("info", "shitty mismatch");
                return false;
            }

            if (obj1[key].constructor === Array && obj2[key].constructor === Array) {
                if (!this.PropertiesMatch(obj1[key], obj2[key])) {
                    Logger.Instance().Log("info", "property mismatch");
                    return false;
                }
            }
            else if (obj1[key] !== obj2[key]) {
                Logger.Instance().Log("info", "key mismatch");
                return false;
            }    
        }

        return true;
    }

    private SanitizeUrl(parsedUrl) {
        this.queryParams = queryString.parse(parsedUrl.query);

        var queryParamsToIgnore = this.config.QueryParamsToIgnore.split(',');
        queryParamsToIgnore.push('harfileid');
        for (var toIgnoreKey in queryParamsToIgnore) {
            var toIgnoreValue = queryParamsToIgnore[toIgnoreKey];
            for (var queryParamKey in this.queryParams) {
                if (queryParamKey.toLowerCase() === toIgnoreValue.toLowerCase() && this.queryParams[queryParamKey]) {
                    delete this.queryParams[queryParamKey];
                }
            }
        }

        this.Path = this.ReplaceUrlComponents(parsedUrl.pathname);
    }
  
    private ReplaceUrlComponents(path: string): string {
        for (var i=0; i<this.config.UrlReplacements.length; i++) {
            var urlReplacement = this.config.UrlReplacements[i];
            var regex = XRegExp(urlReplacement['regex'], 'g');
            path = XRegExp.replace(path, regex, urlReplacement['replacement']);
        }

        return path;
    }
}