import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, ActivatedRoute } from '@angular/router';
import { HttpRequest } from './net.request';
import { DclWrapperMessage } from './dcl.wrapper.message';
import { Type } from '@angular/core';
import { Component } from '@angular/compiler/src/core';
import { DomSanitizer } from '@angular/platform-browser';
import { BusService } from './dcl.bus.service';
import { isDataSource } from '@angular/cdk/collections';

class User {
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
        try {
            let u = JSON.parse(localStorage.getItem('profile'));
            u['avatar'] = this.sanitizer.bypassSecurityTrustResourceUrl(u['avatar'] ? this.hr.assetsPath(u['avatar']) : this.hr.assetsPath('media/img/marc.jpg'));
            return u;
        }catch(e){
            return {avatar:this.sanitizer.bypassSecurityTrustResourceUrl(this.hr.assetsPath('media/img/marc.jpg'))};
        }
    }
    constructor(protected hr: HttpRequest, protected sanitizer:DomSanitizer){
        
    }
    updateProfile(data, callback: Function = null){       
        if(data && typeof data == 'object'){
            
            this.hr.post('auth/profile',data, result => {
                console.log(result.data)
                this.profile = result.data;
                if(callback)callback(); 
            });
        }
    }
    static signing: boolean = false;
    sign(callback: Function = null){
        if(!this.token && !User.signing){
            User.signing = true;
            this.hr.post('auth/sign',{}, result => {
                this.token = result.data.token;
                if(callback)callback();
                User.signing = false;
                this.profile = result.data.profile;
            });
        }
    }
}

@Injectable()
export class AuthGuard extends User implements CanActivate  {
    
    constructor(private activatedRoute: ActivatedRoute, private router: Router, protected hr: HttpRequest, protected busService: BusService, protected sanitizer: DomSanitizer) { 
        super(hr,sanitizer);
    }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        this.sign(() =>{
            console.log('done',this.token);
        });
        if(route.url[0].path == 'user-profile') {
            if(!this.logined()) {
                this.register();
                return false;
            }
        }
        return true;
    }

    loadComponentAfterLogin(msg: DclWrapperMessage, login:Type<any>) {
        if(!this.profile || this.profile.STATE !== 'LOGIN'){
            msg.data = new DclWrapperMessage(msg.from, msg.to, msg.component, msg.data);
            msg.component = login;
        }
        this.busService.send(msg);
    }

    logined(){
        return this.state == '_CHECKED';
    }
    
    register(){
        this.router.navigate(['/login']);
    }
    
    checkin(tel: string, code: string){
        this.hr.post('auth/checkin', { tel: tel, code: code }, result => {
            this.profile = result.data;
            this.router.navigate(['/tickets']);
        });
    }
    for401(){
        //this.router.navigate(['/login']);
        this.sign();
    }

}