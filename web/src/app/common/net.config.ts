import { Injectable, InjectionToken } from "@angular/core";

@Injectable()
export class ConfigService {
    public MEDIA_HOST = {
       /*  URL: "http://49.234.15.176:8999/" */
       /*  URL: 'http://127.0.0.1:8999/' */
        URL: 'http://app.justitbe.com:8999/'
    };
    public REST_HOST = {
        /* URL: "http://49.234.15.176:8999/" */
        /* URL: "http://localhost:8999/" */
        URL: 'http://app.justitbe.com:8999/'
    }
    public FONT_HOST = {
        URL: "http://app.justitbe.com:8999/"
        /* URL: "http://localhost:8999/" */
    }
    constructor(){
    }
}