import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable, EMPTY, Subject, from } from 'rxjs';
import { User } from './auth.guard';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
    constructor(private user: User){

    }
    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        //console.log(request.url)
        if (this.user.token) {
            request = request.clone({ setHeaders: {  Authorization: `Bearer ${this.user.token}` }/* , setParams: {version: `2`} */ });
            return next.handle(request);
        }else if(request.body['signature']){
            return next.handle(request);
        }else if(!this.user.token){
            return this.user.sign((t)=>{
                request = request.clone({ setHeaders: {  Authorization: `Bearer ${t}` }});
                return next.handle(request);
            }) as Observable<HttpEvent<any>>;
        }
        
    }
}