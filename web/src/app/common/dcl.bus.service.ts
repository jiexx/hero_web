import { Injectable } from '@angular/core';
import { Router, NavigationStart, ActivatedRoute } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { Message } from './dcl.message';
import { Location } from '@angular/common';

@Injectable()
export class BusService {
    private subject = new Subject<any>();
    private keepAfterNavigationChange = false;

    constructor(private router: Router/* ,private activatedRoute: ActivatedRoute */, private location: Location) {
        // clear alert message on route change
        // router.events.subscribe(event => {
        //     if (event instanceof NavigationStart) {
        //         if (this.keepAfterNavigationChange) {
        //             // only keep for a single location change
        //             this.keepAfterNavigationChange = false;
        //         } else {
        //             // clear alert
        //             this.subject.next();
        //         }
        //     }
        // });
    }

    getObservable(): Observable<any> {
        return this.subject.asObservable();
    }

    _subscribed = {};
    subscribe(that: any){
        if(Object.prototype.toString.call(that)=='[object Object]'){
            this._subscribed[that.constructor.name] = true;
        }else if(Object.prototype.toString.call(that)=='[object String]'){
            this._subscribed[that] = true;
        }
    }
    isSubscribed(that: any){
        if(Object.prototype.toString.call(that)=='[object Object]'){
            return this._subscribed[that.constructor.name];
        }else if(Object.prototype.toString.call(that)=='[object String]'){
            return this._subscribed[that];
        }
    }

    send(message: Message) {
        // this.router.navigate(
        //     [(typeof message.to === 'string' || message.to instanceof String? message.to : message.to.constructor.name)],
        //     { relativeTo: this.activatedRoute, skipLocationChange: true }
        // );
        //var url = typeof message.to === 'string' || message.to instanceof String? message.to : message.to.constructor.name;
        //var data = (message as any).data;
        //this.location.replaceState(this.router.serializeUrl(this.router.createUrlTree([url,data])));
        this.subject.next(message);
    }

    receive(that: any, callback) {
        if(that /* && that.busService */ && !this.isSubscribed(that) ) {
            this.subscribe(that);
            return /* that.busService */this.getObservable().subscribe(message => {
                // if(message){
                //     console.log(message.to, that.name, that);
                // }
                if(message  && message.to && (
                    message.to.name == that.constructor.name || 
                    message.to.name == that ||
                    message.to == that || 
                    message.to == that.constructor.name ||
                    message.to == that.name
                ) ) {
                    callback.call(that, message);
                }
            });
        }
    }
}