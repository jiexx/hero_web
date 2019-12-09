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
    selector: 'posts',
    template:
`<mat-list *ngIf="!!articles">
    <mat-accordion>
        <mat-expansion-panel *ngFor="let article of articles.list" (opened)="open(article)"  [ngClass]="{'mat-elevation-z0': level>0}" #panel>
            <mat-expansion-panel-header [collapsedHeight]="'auto'" [expandedHeight]="'auto'">
                <mat-list-item>
                    <img mat-list-icon  src="{{ article && article.users_1 && article.users_1.avatar ? hr.assetsPath(article.users_1.avatar) : hr.assetsPath('media/img/marc.jpg')}}" (click)="sendMessage(article.users_1, panel)">
                    <h4 mat-line *ngIf="level==0"><mat-icon color="warn">bookmark_border</mat-icon>{{article.articles_0.title}}</h4>
                    <p mat-line *ngIf="level!=0">{{article.articles_0.content}}</p>
                    <p mat-line><small>{{article && article.users_1 && article.users_1.name ? article.users_1.name : ''}}发表于{{article.articles_0.createtime}}</small></p>
                </mat-list-item>
            </mat-expansion-panel-header>
            <p *ngIf="level==0">{{article.articles_0.content}}</p>
            <mat-form-field>
                <textarea matInput placeholder="回复内容" [(ngModel)]="content"></textarea>
                <button mat-mini-fab matSuffix color="warn" (click)="comment(article)"><mat-icon>done</mat-icon></button>
            </mat-form-field>
            <posts [articles]="article.articles" [level]="level+1"  ></posts>
        </mat-expansion-panel>
        <mat-expansion-panel [disabled]=true [ngClass]="{'mat-elevation-z0':level!=0}">
            <mat-expansion-panel-header>
                <mat-panel-title></mat-panel-title>
                <div fxFlex></div>
                <mat-paginator  [length]="articles.pgNumber" [pageSize]="level == 1 ? 5: 10" (page)="level == 0 ? page($event, articles): subPage($event, articles); "> </mat-paginator>
            </mat-expansion-panel-header>
        </mat-expansion-panel>
    </mat-accordion>
</mat-list>
`
})
export class PostComponent implements OnInit {
    @Input() articles = {};
    @Input() level;
    content: '';
    profile;

    constructor(public hr: HttpRequest, private auth: AuthGuard, private busService: BusService) {

    }
    ngOnInit() {
        this.profile = this.auth.profile;
        if(this.level == 0) {
            if(!this.articles){
                this.articles = {list:[], pgNumber:0};
            }

            this.hr.post('article/list', { page: 0 }, result => {
                this.articles['list'] = result.data;
            });
            
            this.hr.post('article/count',{}, result => {
                this.articles = Object.assign(this.articles, {});
                this.articles['pgNumber'] = parseInt(result.data);
            });
        }
    }
    comment(article) {
        if (!this.auth.logined()) {
            this.auth.register();
            return;
        }
        this.hr.post('article/comment', { articleid: article.articles_0.id, content: this.content }, result => {
            if (!article['articles']) {
                article['articles'] = {list:[], pgNumber:0};
            }
            console.log(article)
            this.busService.send(new DialogMessage(this, InfoDialogComponent, {title:'提示', content:`回复${article.users_1.name ? article.users_1.name: ''}成功`}));
            article['articles']['list'].unshift({ articles_0: { title: '', content: this.content, createtime: new Date().toLocaleString() }, users_1: { avatar: this.profile.avatar, name: this.profile.name } });
            article['articles']['pgNumber'] = article['articles']['pgNumber'] + 1;
        });
    }
    post(title: string, content: string, panel) {
        //this.article['']
        if(!this.auth.logined()) {
            this.auth.register();
            return;
        }
        this.hr.post('article/post', {title:title, content: content}, result => {
            if (!this.articles) {
                this.articles = {list:[], pgNumber:0};
            }
            this.busService.send(new DialogMessage(this, InfoDialogComponent, {title:'提示', content:`发布成功`},
                ()=>{
                    panel.close();
                }, 
                null, 
                ()=>{}
            ));
            this.articles['list'].unshift({ articles_0:{title: title, content: content, createtime: new Date().toLocaleString() }, users_1:{avatar: this.profile.avatar, name: this.profile.name} });
            this.articles['pgNumber'] = this.articles['pgNumber'] + 1;
        });
    }
    open(article) {
        if(!article['articles']){
            article['articles'] = {};
            this.hr.post('article/sublist', { page: 0, articleid: article.articles_0.id }, result => {
                article['articles']['list'] = result.data;
            });
        }
        this.hr.post('article/subcount',{ articleid: article.articles_0.id }, result => {
            article['articles'] = Object.assign(article['articles'], {});
            article['articles']['pgNumber'] = parseInt(result.data); 
            article['articles']['articleid'] = parseInt(article.articles_0.id)
        });
    }
    page($event, articles) {
        this.hr.post('article/list', { page: $event ? $event.pageIndex : 0 }, result => {
            articles['list'] = result.data;
        });
    }
    subPage($event, articles) {
        this.hr.post('article/sublist', { page: $event ? $event.pageIndex : 0, articleid: articles.articleid}, result => {
            articles['list'] = result.data;
        });
    }


    sendMessage(user, panel){
        panel.disabled = true;
        user.avatar = user.avatar ? user.avatar : 'media/img/marc.jpg';
        this.busService.send(new DialogMessage(this, MsgDialogComponent, { avatar: this.hr.assetsPath(user.avatar), name: user.name, about: user.about},
            (form)=>{
                form['to'] = user.id;
                this.hr.post('message/post', form, result => {
                    console.log('message success')
                });
            }, 
            null, 
            ()=>{panel.disabled = false;panel.hideToggle = false}
        ));
    }
}