import { Component, OnInit, ViewChild, ViewContainerRef, Inject, Optional } from '@angular/core';
import { IDialogComponent } from './dialog.component';




@Component({
    styles: [`
    .mat-dialog-container {
        background-color: transparent
    }
  `],
    template:
    `<h6 mat-dialog-header *ngIf="msg && msg.info"><b>{{msg.info.title}}</b></h6>
    <mat-dialog-content>
        <img [src]="msg.info.img" *ngIf="msg && msg.info && msg.info. img">
        <p style="width:10rem" *ngIf="msg && msg.info">
            <small>{{msg.info.content}}</small>
        </p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
        <button mat-raised-button (click)="decline()" *ngIf="msg && msg.fail">取消</button>
        <button mat-raised-button (click)="confirm()" [mat-dialog-close]="true" cdkFocusInitial>确定</button>
    </mat-dialog-actions>
    `,
})
export class InfoDialogComponent extends IDialogComponent {
    constructor(){
        super();
        
        // if(this.msg && this.msg.info && this.msg.info.content){
        //     this.lines = this.msg.info.content.match(/.{1,5}/g);
        // }
    }
    confirm() {
        super.confirm()
    }
    decline() {
        super.decline();
    }
}

