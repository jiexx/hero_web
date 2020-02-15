import { Component, OnInit, Input} from "@angular/core";
import { HttpRequest } from "./net.request";
import { ImageUrl } from "./net.image";
import { User } from "./net.user";
import { Location } from "@angular/common";

@Component({
    selector: 'navi',
    template:
`<mat-toolbar  layout="row" >
    <mat-toolbar-row>
        <!--h3>{{title}}</h3-->
        <button mat-icon-button [routerLink]="['/tickets']">
            <mat-icon  color="warn" >person_pin_circle</mat-icon>
        </button>
        <div style="flex: 1 1 auto;"></div>
        <button mat-icon-button [routerLink]="['/post']">
            <mat-icon  color="warn" >not_listed_location</mat-icon>
        </button>
        <button mat-icon-button [matMenuTriggerFor]="menu">
            <mat-icon matBadge="{{favorited+unread}}" matBadgeColor="warn" *ngIf="favorited+unread > 0" style="color:gray">notifications</mat-icon>
            <mat-icon *ngIf="favorited+unread == 0" style="color:gray" >notifications</mat-icon>
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
    <mat-toolbar-row style="background-color: pink" *ngIf=" showLogin() ">
        <span style="margin:auto"><button  mat-icon-button [routerLink]="['/login']"  >登录</button></span>
    </mat-toolbar-row>
</mat-toolbar>
`,
    styles:[
`.mat-toolbar-row{
    height: 40px;
}`
    ]
})

export class NaviComponent implements OnInit {
    @Input() title: string;
    avatar: any;

    unread: number = 0;
    favorited: number = 0;
    constructor(public hr: HttpRequest, public user: User, public imgUrl: ImageUrl, public location: Location) { 
        this.avatar = imgUrl.media.imgLink(user.profile.avatar, 'media/img/marc.jpg');
    }

    ngOnInit() {
        this.hr.post('message/count',{unread: '1'}, result => {
            this.unread = parseInt(result.data);
        });
        this.hr.post('favor/count',{state: 'received'}, result => {
            this.favorited = parseInt(result.data);
        });
    }
    showLogin(){
        var titlee = this.location.prepareExternalUrl(this.location.path());
        if(titlee.charAt(0) === '#'){
            titlee = titlee.slice( 1 );
        }
        return titlee != '/login' && !this.user.logined();
    }
}