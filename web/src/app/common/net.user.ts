import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
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
    clear(){
        if(this.token){
            localStorage.removeItem('token');
        }
        if(this.profile){
            localStorage.removeItem('profile');
        }
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
    get admin(){
        return this.profile && this.profile.permit == 100;
    }
    logined(){
        return this.state == '_CHECKED';
    }
    register(){
        this.router.navigate(['/login']);
    }
    favor(){
        this.router.navigate(['/favor']);
    }

    home(){
        this.router.navigate(['/tickets']);
    }
}