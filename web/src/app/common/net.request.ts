import { HttpClient } from "@angular/common/http";
import { ConfigService } from "./net.config";
import { Injectable } from "@angular/core";
import { AuthGuard } from "./auth.guard";

@Injectable()
export class HttpRequest {
    loaded: boolean = false;
    constructor(protected http: HttpClient, protected config: ConfigService){
    }
    assetsPath(path:any){
        if(path && path.changingThisBreaksApplicationSecurity){
            return path.changingThisBreaksApplicationSecurity;
        }
        return this.config.MEDIA_HOST.URL+path+'\n';
    }
    uploadPath(label:string){
        return 'media/img/'+label;
    }
    post(path: string, data: any, callback: Function, err: Function = null) {
        //console.log(path);
        this.loaded = false;
        this.http.post(this.config.REST_HOST.URL+path,data).subscribe(result =>{
            var r: any = result;
            if (r && r.code == 'OK') {
                callback(result);
            }
            if(err && r.code == 'ERR'){
                err(r);
            }
            this.loaded = true;
        })
    }
    upload(data: any, callback: Function) {
        this.http.post(this.config.REST_HOST.URL+'auth/upload',{file:data}).subscribe(result =>{
            var r: any = result;
            if (r && r.code == 'OK') {
                callback(result);
            }
        })
    }
}