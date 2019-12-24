import { HttpClient, HttpHeaders } from "@angular/common/http";
import { ConfigService } from "./net.config";
import { Injectable } from "@angular/core";


@Injectable()
export class HttpRequest{
    constructor(protected http: HttpClient, protected config: ConfigService){
    }
    
    upload(data: any, callback: Function) {
        this.post('auth/upload',{file:data},(result)=>{
            if(callback)callback(result);
        })
    }
    sign(path: string){
        return this.http.post(this.config.REST_HOST.URL+path,{signature:true});
    }
    post(path: string, data: any, callback: Function = null, err: Function = null) {
        this.http.post(this.config.REST_HOST.URL+path,data).subscribe(result =>{
            var r: any = result;
            //console.log(path, result);
            if (r && r.code == 'OK') {
                callback(result);
            }
            if(err && r.code == 'ERR'){
                err(r);
            }
        })
    }

}