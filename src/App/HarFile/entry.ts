import HarFile from "./harFile.js";
import Request from "./request.js";
import Response from "./response.js";

export default class Entry {
    constructor(entry: string, harFile: HarFile) {
        this.myHarFile = harFile;
        if (entry.hasOwnProperty('request') && entry.hasOwnProperty('response')) {
            this.Request = new Request(entry["request"]);
            this.Response = new Response(entry["response"]);
        }
    }

    Request: Request;
    Response: Response;
    myHarFile: HarFile;

    public ContainsValidResponse(): boolean {
        var contentBuffer: Buffer = this.Response.contentBytes();
        if (contentBuffer) {
            return contentBuffer.length > 0;
        }

        return false;
    }

    public IsGetRequest(): boolean {
        return this.Request !== null && this.Request.method === "GET";
    }
}