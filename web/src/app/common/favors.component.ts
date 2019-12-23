import { Component, Input, OnInit } from "@angular/core";
import { AuthGuard } from "./auth.guard";
import { HttpRequest } from "./net.request";
import { kMaxLength } from "buffer";
import { PageEvent } from "@angular/material";
import { BusService } from "./dcl.bus.service";
import { MsgDialogComponent } from "./dialog.msg.component";
import { InfoDialogComponent } from "./dialog.info.component";
import { DialogMessage } from "./dcl.dialog.message";
import { TicketComponent } from "./tikets.component";

@Component({
    providers:[TicketComponent ],
    selector: 'favors',
    template:
`<mat-list>
    <mat-list-item *ngFor="let favor of favors.list; let i = index" [ngClass]="(favor.favors_0.state==0)?'readed':'unread'" >
        <span mat-list-icon style="width:auto;height:auto"><img style="width:4rem;border-radius:4px" src={{ticket.dest(favor.tickets_1.E)}}></span>
        <h5 mat-line><button mat-icon-button color="warn" (click)="active(favor.favors_0, favor.tickets_1, i)" ><mat-icon >where_to_vote</mat-icon></button>{{ticket.destname(favor.tickets_1.E)}}({{favor.tickets_1.end}})</h5>
        <h6 mat-line>{{favor.favors_0.createtime.replace(' ','日')}}关注</h6>
        <span>{{favor.favors_0.price}}</span>
        <button mat-icon-button >
            <mat-icon (click)="toggle(favor.tickets_1, i)">{{closed?'expand_more':'expand_less'}}</mat-icon>
        </button>
    </mat-list-item>
</mat-list>
<mat-list>
    <mat-list-item *ngFor="let favor of subFavors.list; let i = index" [ngClass]="(favor.favors_0.state==0)?'readed':'unread'" >
        <h4 mat-line>{{ticket.destname(favor.tickets_1.E)}}({{favor.tickets_1.end}})<small>|{{favor.favors_0.createtime.replace(' ','日')}}通知</small></h4>
        <p mat-line><small>出发{{ticket.airport(favor.tickets_1.B)}}|{{favor.tickets_1.depart.replace('T',' ')}}—到达{{favor.tickets_1.arrive.replace('T',' ')}}</small></p>
        <p mat-line >
            航班<small *ngFor="let flight of ticket.flights(favor.tickets_1.flight); let i = index"><a href={{ticket.link(flight)}} target="_blank"><img style="width:15px" src={{ticket.company(flight)}}>{{ticket.cname(flight)}}{{favor.tickets_1.flight.split(',')[i]}}</a></small>
            <small *ngIf="favor.tickets_1.stops && favor.tickets_1.stops!='null'">经停{{favor.tickets_1.stops}}</small>
        </p>
        <span>{{favor.tickets_1.price}}</span>
        <button mat-icon-button >
            <mat-icon (click)="active(favor.favors_0, i)">close</mat-icon>
        </button>
    </mat-list-item>
</mat-list>
<mat-paginator  [length]="pgNumber" [pageSize]="10" (page)="page($event, closed)"> </mat-paginator>
`,
    styles: [
`.unread {
    margin-bottom: 1rem;
    box-shadow: 0 4px 20px 0px rgba(0, 0, 0, 0.14), 0 7px 10px -5px rgba(244, 67, 54, 0.4);
    border: 0;
    border-radius: 3px;
}
.readed{
    margin-bottom: 1rem;
    color: darkgray;
    border: 0;
    border-radius: 3px;
}
`
    ]
})
export class FavorsComponent implements OnInit {
    favors = {list: [], pgNumber: 0};
    subFavors = {list: [], pgNumber: 0};
    pgNumber: number = 0;
    closed = true;

    constructor(public hr: HttpRequest, public ticket: TicketComponent) {

    }
    ngOnInit() {
        this.hr.post('favor/list', { page: 0 }, result => {
            this.favors['list'] = result.data;
        });
        
        this.hr.post('favor/count',{}, result => {
            this.favors = Object.assign(this.favors, {});
            this.favors['pgNumber'] = parseInt(result.data);
        });
    }
    toggle(ticket, i){
        if(this.closed) {
            this.hr.post('favor/list', { page: 0, active: true, E: ticket.E }, result => {
                this.subFavors['list'] = result.data;
                //console.log(0,i-1)
                this.favors.list.splice(0,i);
                this.favors.list.splice(i+1);
            });
            
            this.hr.post('favor/count',{active: true, E: ticket.E}, result => {
                this.subFavors = Object.assign(this.subFavors, {});
                this.subFavors['pgNumber'] = parseInt(result.data);
                this.closed = false;
                this.pgNumber = this.subFavors['pgNumber']; 
            });
        }else {
            this.hr.post('favor/list', { page: 0 }, result => {
                this.favors['list'] = result.data;
                this.subFavors.list.splice(0);
            });
            
            this.hr.post('favor/count',{}, result => {
                this.favors = Object.assign(this.favors, {});
                this.favors['pgNumber'] = parseInt(result.data);
                this.closed = true;
                this.pgNumber = this.favors['pgNumber'];
            });
        }
        
    }
    page($event, favors) {
        this.hr.post('favor/list', { page: $event ? $event.pageIndex : 0 }, result => {
            favors['list'] = result.data;
        });
    }
    active(favor, ticket, i){
        this.hr.post('favor/active', { favorid: favor.id, E: ticket.E }, result => {
            this.closed = true;
            this.favors['list'].splice(i, 1);
            this.pgNumber = this.favors['pgNumber'];
            this.subFavors.list.splice(0);
        });
    }
    notify(favor, i){
        this.hr.post('favor/clear', { }, result => {
        });
    }

}