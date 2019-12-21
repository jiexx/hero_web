import { Component, Input, OnInit } from "@angular/core";
import { AuthGuard } from "./auth.guard";
import { HttpRequest } from "./net.request";
import { kMaxLength } from "buffer";
import { PageEvent } from "@angular/material";
import { BusService } from "./dcl.bus.service";
import { DialogMessage } from "./dcl.dialog.message";
import { DialogComponent } from "./dialog.component";
import { MsgDialogComponent } from "./dialog.msg.component";
import { InfoDialogComponent } from "./dialog.info.component";

@Component({
    selector: 'messages',
    template:
`<mat-list>
    <mat-list-item *ngFor="let message of messages.list; let i = index" [ngClass]="(message.messages_0.readed==1)?'readed':'unread'" >
        <img mat-list-icon  src="{{ message && message.users_1 && message.users_1.avatar ? hr.assetsPath(message.users_1.avatar) : hr.assetsPath('media/img/marc.jpg')}}" (click)="sendMessage(message.users_1, panel)">
        <h5 mat-line><button mat-icon-button color="warn" (click)="selected(message.messages_0)" ><mat-icon [style.color]="message.messages_0.readed==0? 'tomato' : 'lightgray'">{{message.messages_0.readed==0? 'where_to_vote' : 'location_on'}}</mat-icon></button>{{message.messages_0.title}}</h5>
        <h6 mat-line>{{message.messages_0.content}}</h6>
        <h6 mat-line>{{message.users_1.name}}发送于:{{message.messages_0.createtime.replace(' ','日')}}</h6>
    </mat-list-item>
    <mat-paginator  [length]="messages.pgNumber" [pageSize]="10" (page)="page($event, messages)"> </mat-paginator>
</mat-list>
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
}`
    ]
})
export class MessagesComponent implements OnInit {
    @Input() messages: any;
    expanded;
    profile;

    constructor(public hr: HttpRequest, private auth: AuthGuard, private busService: BusService) {

    }
    ngOnInit() {
        this.expanded = true;
        this.profile = this.auth.profile;
        if(!this.messages){
            this.messages = {list:[], pgNumber:0};
        }

        this.hr.post('message/list', { page: 0 }, result => {
            this.messages['list'] = result.data;
        });
        
        this.hr.post('message/count',{}, result => {
            this.messages = Object.assign(this.messages, {});
            this.messages['pgNumber'] = parseInt(result.data);
        });
    }
    page($event, messages) {
        this.hr.post('message/list', { page: $event ? $event.pageIndex : 0 }, result => {
            messages['list'] = result.data;
        });
    }
    sendMessage(user, panel){
        user.avatar = user.avatar ? user.avatar : 'media/img/marc.jpg';
        this.busService.send(new DialogMessage(this, MsgDialogComponent, { avatar: this.hr.assetsPath(user.avatar), name: user.name, about: user.about},
            (form)=>{
                form['to'] = user.id;
                this.hr.post('message/post', form, result => {
                    console.log('message success')
                });
            },
        ));
    }
    selected(messages){
        this.hr.post('message/readed', { msgid: messages.id }, result => {
            messages.readed = result.data;
        });
    }
}