import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, ActivatedRoute } from '@angular/router';
import { HttpRequest } from './net.request';
import { switchMap } from 'rxjs/operators';

@Injectable()
export class User {
    set token(t:string){
        localStorage.setItem('token',t);
    }
    get token(){
        return localStorage.getItem('token');
    }
    get state(){
        return this.profile.state//localStorage.getItem('state');  
    }
    set profile(t:any){
        localStorage.setItem('profile',JSON.stringify(t));
    }
    get profile(): any{
        return JSON.parse(localStorage.getItem('profile')) || {};
    }
    constructor( protected router: Router, protected hr: HttpRequest){
    }
    updateProfile(profile, callback: Function = null){       
        if(profile && typeof profile == 'object'){
            this.hr.post('auth/profile',profile, result => {
                this.profile = result.data;
                if(callback)callback(); 
            });
        }
    }
    checkin(tel: string, code: string, callback: Function = null){
        this.hr.post('auth/checkin', { tel: tel, code: code }, result => {
            this.profile = result.data;
            this.home();
            if(callback)callback(); 
        });
    }
    sign(callback: Function = null){
        return this.hr.sign('auth/sign').pipe(switchMap((result: any)=>{
            //console.log(result);
            this.token = result.data.token;
            this.profile = result.data.profile;
            if(callback) return callback(this.token);
        }));
    }
    logined(){
        return this.state == '_CHECKED';
    }
    register(){
        this.router.navigate(['/login']);
    }

    home(){
        this.router.navigate(['/tickets']);
    }
}

@Injectable()
export class AuthGuard implements CanActivate  {
    
    constructor(public user: User) { 
    }
    
    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        if(route.url[0].path == 'user-profile') {
            if(!this.user.logined()) {
                this.user.register();
                return false;
            }
        }
        return true;
    }

}