import * as fs from 'fs';

export class JsonFileLoader {
  
  constructor(filepath: string) {
    this.filepath = filepath;
    this.initialize();
    this.Load();
  }

  filepath: string = '';

  protected initialize() {

  }

  public Load() {
    if (!fs.existsSync(this.filepath)) {
      this.Save();
    }
    else {
      var content = fs.readFileSync(this.filepath, 'utf8');
      var json = JSON.parse(content);
      this.deserialize(json);
    }
  }

  protected deserialize(json: string) {
  }

  public Save() {      
    var jsonConfig = this.ToString();
    fs.writeFileSync(this.filepath, jsonConfig)
  }

  public ToString() {
    function omitKeys(obj) {
        var dup = {};
        for (var key in obj) {
          if (key !== 'filepath') {
            dup[key] = obj[key];
          }
        }
        return dup;
    }

    return JSON.stringify(omitKeys(this), null, '\t');
    
  }
}
