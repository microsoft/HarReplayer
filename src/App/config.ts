import * as fs from 'fs';
import * as base from './jsonFileLoader.js';
var path = require('path');

interface IUrlReplacement extends Array<string | string> { regex: string; replacement: string; }
export default class Config extends base.JsonFileLoader {
  ListenPort: number;
  ListenPortSSL: number;
  SSLKeyLocation: string;
  SSLCertLocation: string;
  CacheLifetime: number;
  InjectJavascript: string;
  QueryParamsToIgnore: string;
  UrlReplacements: IUrlReplacement[];
  AzureStorageAccessKey: string;
  AzureStorageAccountName: string;
  AzureStorageContainerName: string;
  LoggingLevel: string;
  HarFilePath: string;
    
  constructor(configFileOverride = undefined) {
    var configFilePath = '';
    if (configFileOverride) {
      configFilePath = path.join(__dirname, configFileOverride);      
    }
    else {
      configFilePath = path.join(__dirname, '..', '..', 'config', 'config.json');
    }

    super(configFilePath);
  }

  private static _instance: Config = null;

  public static Instance(configFileOverride = undefined): Config {
    if (Config._instance === null || configFileOverride) {
      Config._instance = new Config(configFileOverride);
    }

    return Config._instance;
  }
  
  protected initialize() {
    this.ListenPort = 8080;
    this.ListenPortSSL = 4433;
    this.SSLKeyLocation = '';
    this.SSLCertLocation = '';
    this.CacheLifetime = 60; // one minute
    this.InjectJavascript = '_w.Math.random = function() {return 0;}; var d = new Date(2012, 2, 2); _w.Date = function() { return d; };';
    this.QueryParamsToIgnore = 'clientip,superforkersessionguid,bag';
    this.UrlReplacements = [];
    this.AzureStorageAccessKey = '';
    this.AzureStorageAccountName = '';
    this.AzureStorageContainerName = '';
    this.LoggingLevel = 'error';
    this.HarFilePath = '';
  }

  public Load() {
    super.Load();
    Config._instance = this;
  }

  protected deserialize(json: string) {
    if (json.hasOwnProperty('ListenPort')) {
      this.ListenPort = json['ListenPort'];
    }
    if (json.hasOwnProperty('ListenPortSSL')) {
      this.ListenPortSSL = json['ListenPortSSL'];
    }
    if (json.hasOwnProperty('SSLKeyLocation')) {
      this.SSLKeyLocation = json['SSLKeyLocation'];
    }
    if (json.hasOwnProperty('SSLCertLocation')) {
      this.SSLCertLocation = json['SSLCertLocation'];
    }
    if (json.hasOwnProperty('CacheLifetime')) {
      this.CacheLifetime = json['CacheLifetime'];
    }
    if (json.hasOwnProperty('InjectJavascript')) {
      this.InjectJavascript = json['InjectJavascript'];
    }
    if (json.hasOwnProperty('QueryParamsToIgnore')) {
      this.QueryParamsToIgnore = json['QueryParamsToIgnore'];
    }
    if (json.hasOwnProperty('AzureStorageAccountName')) {
      this.AzureStorageAccountName = json['AzureStorageAccountName'];
    }
    if (json.hasOwnProperty('AzureStorageAccessKey')) {
      this.AzureStorageAccessKey = json['AzureStorageAccessKey'];
    }
    if (json.hasOwnProperty('AzureStorageContainerName')) {
      this.AzureStorageContainerName = json['AzureStorageContainerName'];
    }
    if (json.hasOwnProperty('LoggingLevel')) {
      this.LoggingLevel = json['LoggingLevel'];
    }
    if (json.hasOwnProperty('HarFilePath')) {
      this.HarFilePath = json['HarFilePath'];
    }
    if (json.hasOwnProperty('UrlReplacements')) {
       this.populateFromJson(json['UrlReplacements']);
    }
  }

    protected populateFromJson(jsonArray: Object) {
    for (var i = 0; i < Object.keys(jsonArray).length; i++) {
      var jsonObj = jsonArray[i];
      if (jsonObj.hasOwnProperty('regex') && jsonObj.hasOwnProperty('replacement')) {
        this.UrlReplacements.push(<IUrlReplacement> {regex: jsonObj['regex'], replacement: jsonObj['replacement']});
      }
    }
  }
}
