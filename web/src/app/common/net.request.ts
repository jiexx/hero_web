import { HttpClient, HttpHeaders } from "@angular/common/http";
import { ConfigService } from "./net.config";
import { Injectable } from "@angular/core";
import { tap } from "rxjs/operators";


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
    downloadUrl(path: string){
        return this.config.REST_HOST.URL+path
    }
    download(path: string, callback: Function = null, err: Function = null){
        this.http.get(this.config.REST_HOST.URL+path, {responseType: 'text'})
        .subscribe(
            data => callback && callback(data),
            error => err && err(error)
        );
    }
    get(path: string, callback: Function = null, err: Function = null) {
        this.http.get(this.config.REST_HOST.URL+path).subscribe(result =>{
            var r: any = result;
            if (r && r.code == 'OK') {
                callback(result);
            }
            if(err && r.code == 'ERR'){
                err(r);
            }
        })
    }
}