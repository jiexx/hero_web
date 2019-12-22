import { Injectable } from "@angular/core";

@Injectable()
export class ConfigService {
    public MEDIA_HOST = {
        URL: "http://49.234.15.176:8999/"
        /* URL: 'http://127.0.0.1:8999/' */
        /* URL: 'http://app.justitbe.com/' */
    };
    public REST_HOST = {
        URL: "http://49.234.15.176:8999/"
        /* URL: "http://localhost:8999/" */
        /* URL: 'http://app.justitbe.com/' */
    }
    public FONT_HOST = {
        URL: "http://49.234.15.176:8999/css/fonts.css"
        /* URL: "http://localhost:8999/css/fonts.css" */
    }
    public __DEV__: boolean = true;
    constructor(){
    }
}