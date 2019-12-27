import { Component, OnInit, Input} from "@angular/core";
import { HttpRequest } from "./net.request";
import { ImageUrl } from "./net.image";
import { User } from "./net.user";

@Component({
    selector: 'navi',
    template:
`<mat-toolbar style="background-color:transparent">
    <mat-toolbar-row>
        <h3>{{title}}</h3>
        <div style="flex: 1 1 auto;"></div>
        <button mat-icon-button [matMenuTriggerFor]="menu">
            <mat-icon matBadge="{{favorited+unread}}" *ngIf="favorited+unread > 0" matBadgeColor="warn" class="text-muted">notifications</mat-icon>
            <mat-icon *ngIf="favorited+unread == 0" matBadgeColor="warn" class="text-muted">notifications</mat-icon>
        </button>
        <mat-menu #menu="matMenu">
            <button mat-menu-item [routerLink]="['/favor']">
                <span  matBadge="{{favorited}}" matBadgeColor="warn" *ngIf="favorited>0">关注的机票</span>
                <span  *ngIf="favorited==0">关注的机票</span>
            </button>
            <button mat-menu-item [routerLink]="['/message']">
                <span  matBadge="{{unread}}" matBadgeColor="warn" *ngIf="unread>0">朋友的消息</span>
                <span  *ngIf="unread==0">朋友的消息</span>
            </button>
        </mat-menu>
        <button mat-icon-button [routerLink]="['/profile']"  ><img style="width: 1.5rem; height: 1.5rem; border-radius: 50%" src="{{avatar}}"></button>
    </mat-toolbar-row>
</mat-toolbar>
`
})

export class NaviComponent implements OnInit {
    @Input() title: string;
    avatar: any;

    unread: number = 0;
    favorited: number = 0;
    constructor(public hr: HttpRequest, public user: User, public imgUrl: ImageUrl) { 
        this.avatar = imgUrl.media.imgLink(user.profile.avatar, 'marc.jpg');
    }

    ngOnInit() {
        this.hr.post('message/count',{unread: '1'}, result => {
            this.unread = parseInt(result.data);
        });
        this.hr.post('favor/count',{unread: 1}, result => {
            this.favorited = parseInt(result.data);
        });
    }

}