import { Component, OnInit } from "@angular/core";
import { HttpRequest } from "./net.request";
import { TicketComponent } from "./tickets.component";
import { User } from "./net.user";
import { BusService } from "./dcl.bus.service";
import { DialogMessage } from "./dcl.dialog.message";
import { InfoDialogComponent } from "./dialog.info.component";

@Component({
    providers:[TicketComponent ],
    selector: 'favors',
    template:
`
<button mat-icon-button (click)="notify()" *ngIf="user.admin">
    更新 
</button>
<button mat-icon-button (click)="clear()" *ngIf="user.admin">
    清空
</button>
<mat-list>
    <mat-list-item *ngFor="let favor of favors.list; let i = index" [ngClass]="(favor.favors_0.state==0)?'readed':'unread'" >
        <span mat-list-icon style="width:auto;height:auto;margin:auto;"><img style="width:4rem;border-radius:4px" src={{ticket.dest(favor.favors_0.place)}}> </span>
        <h5 mat-line><button mat-icon-button color="warn" (click)="cancel(favor.favors_0, i)" ><mat-icon >where_to_vote</mat-icon></button>{{ticket.destname(favor.favors_0.place)}}(机场代号:{{favor.favors_0.place}})</h5>
        <p mat-line>关注价格: {{favor.favors_0.price}} 时间:{{favor.favors_0.createtime.replace(' ','日')}}</p>
        <button mat-icon-button color="warn">
            <mat-icon (click)="toggle(favor.favors_0.place, i)">{{closed?'expand_more':'expand_less'}}</mat-icon>
        </button>
    </mat-list-item>
</mat-list>
<mat-list>
    <mat-list-item *ngFor="let favor of subFavors.list; let i = index" [ngClass]="(favor.favors_0.state==0)?'readed':'unread'" >
        <p mat-line>{{favor.favors_0.createtime.replace(' ','日')}}通知价格: <b>{{favor.tickets_0.price}}</b></p>
        <p mat-line><small>出发{{ticket.airport(favor.tickets_0.B)}}|{{favor.tickets_0.depart.replace('T',' ')}}—到达{{ticket.airport(favor.tickets_0.E)}}|{{favor.tickets_0.arrive.replace('T',' ')}}</small></p>
        <p mat-line >
            航班<small *ngFor="let flight of ticket.flights(favor.tickets_0.flight); let i = index"><button mat-icon-button class="small" (click)="ticket.link(flight)" color="warn"><img style="width:15px" src={{ticket.company(flight)}}></button>{{ticket.cname(flight)}}|{{favor.tickets_0.flight.split(',')[i]}}</small>
            ({{favor.tickets_0.airline}})
            <small *ngIf="favor.tickets_0.stops && favor.tickets_0.stops!='null'">经停{{favor.tickets_0.stops}}</small>
        </p>
    </mat-list-item>
</mat-list>
<mat-paginator  [length]="pgNumber" [pageSize]="10" (page)="page($event)"> </mat-paginator>
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
    place = '';

    constructor(public hr: HttpRequest, public ticket: TicketComponent, public user: User, public busService: BusService) {

    }
    ngOnInit() {
        this.hr.post('favor/list', { page: 0 }, result => {
            this.favors['list'] = result.data;
        });
        
        this.hr.post('favor/count',{}, result => {
            this.favors = Object.assign(this.favors, {});
            console.log( parseInt(result.data))
            this.favors['pgNumber'] = parseInt(result.data);
            this.pgNumber = this.favors['pgNumber'];
        });
    }
    toggle(place, i){
        if(this.closed) {
            this.hr.post('favor/sublist', { page: i, place: place }, result => {
                this.subFavors['list'] = result.data;
                //console.log(0,i-1)
                this.favors.list.splice(0,i);
                this.favors.list.splice(i+1);
            });
            this.hr.post('favor/subcount',{ place: place }, result => {
                this.subFavors = Object.assign(this.subFavors, {});
                this.subFavors['pgNumber'] = parseInt(result.data);
                this.closed = false;
                this.place = place;
                this.pgNumber = this.subFavors['pgNumber']; 
            });
        }else {
            this.hr.post('favor/list', { page: i }, result => {
                this.favors['list'] = result.data;
                this.subFavors.list.splice(0);
            });
            
            this.hr.post('favor/count',{ }, result => {
                this.favors = Object.assign(this.favors, {});
                this.favors['pgNumber'] = parseInt(result.data);
                this.closed = true;
                this.pgNumber = this.favors['pgNumber'];
            });
        }
        
    }
    page($event) {
        if(this.closed) {
            this.hr.post('favor/list', { page: $event ? $event.pageIndex : 0 }, result => {
                this.favors['list'] = result.data;
            });
        }else {
            this.hr.post('favor/sublist', { page: $event ? $event.pageIndex : 0 , place: this.place}, result => {
                this.subFavors['list'] = result.data;
            });
        }
        
    }
    cancel(favor, i){
        this.busService.send(new DialogMessage(this, InfoDialogComponent, { title: '提示', content: '即将取消关注' },
            function pass(){
                this.hr.post('favor/cancel', { favorid: favor.id, place: favor.place }, result => {
                    this.closed = true;
                    this.favors['list'].splice(i, 1);
                    this.pgNumber = this.favors['pgNumber'];
                    this.subFavors.list.splice(0);
                    this.busService.send(new DialogMessage(this, InfoDialogComponent, { title: '提示', content: '关注已取消' }));
                });
            },
            function fail(){
            }
        ));
        
    }
    notify(favor, i){
        this.hr.post('favor/notify', { }, result => {
            this.busService.send(new DialogMessage(this, InfoDialogComponent, { title: '提示', content: '更新完成' }));
        });
    }
    clear(favor, i){
        this.hr.post('favor/clear', { }, result => {
            this.busService.send(new DialogMessage(this, InfoDialogComponent, { title: '提示', content: '清空完成' }));
        });
    }
}