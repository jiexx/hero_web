import { Injectable, InjectionToken } from "@angular/core";
import { environment } from "environments/environment";

@Injectable()
export class ConfigService {
    url = /* environment['URL'] ? environment['URL'] : */ 'http://app.justitbe.com:8999/'
    public MEDIA_HOST = {
       /*  URL: "http://49.234.15.176:8999/" */
       /*  URL: 'http://127.0.0.1:8999/' */
        URL: this.url/* 'http://app.justitbe.com:8999/' */
    };
    public REST_HOST = {
        /* URL: "http://49.234.15.176:8999/" */
        /* URL: "http://localhost:8999/" */
        URL:  this.url/* 'http://app.justitbe.com:8999/' */
    }
    public FONT_HOST = {
        URL: this.url/* "http://app.justitbe.com:8999/" */
        /* URL: "http://localhost:8999/" */
    }
    
    constructor(){
        console.log(this.url)
    }
}