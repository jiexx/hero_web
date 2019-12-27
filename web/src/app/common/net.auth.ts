import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { User } from './net.user';

@Injectable()
export class AuthGuard implements CanActivate  {
    
    constructor(public user: User) { 
    }
    
    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        if(!this.user.logined()) {
            this.user.register();
            return false;
        }
        return true;
    }

}