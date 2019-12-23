import { Component, OnInit, ViewChild, ViewContainerRef, Inject, Optional } from '@angular/core';
import { BusService } from 'app/common/dcl.bus.service';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material';
import { DialogMessage } from './dcl.dialog.message';
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { IDialogComponent } from './dialog.component';



@Component({
    template:
`<h6 mat-dialog-header>
        <mat-list>
            <mat-list-item>
                <img mat-list-icon style="width: 3.5rem;height: 3.5rem" [src]="msg.info.avatar">
                <p mat-line>{{msg.info.name}}</p>
                <p mat-line style="width:10rem;">
                    <small>{{msg.info.about}}</small>
                </p>
            </mat-list-item>
        </mat-list>
    </h6>
    <mat-dialog-content>
        <form  [formGroup]="form">
            <mat-form-field>
                <input matInput placeholder="标题"  [matAutocomplete]="auto" [formControl]="title.input">
                <mat-autocomplete #auto="matAutocomplete">
                    <mat-option *ngFor="let hint of title.hints" [value]="hint.content">
                        <mat-icon class="example-option-img" color="{{hint.color}}">{{hint.icon}}</mat-icon>
                        <span>{{hint.content}}</span>
                    </mat-option>
                </mat-autocomplete>
                <mat-error *ngIf="title.input.hasError('maxLength') && !title.input.hasError('required')">
                    <small>最长32位</small>
                </mat-error>
                <mat-error *ngIf="title.input.hasError('required')">
                    <strong>必填</strong>
                </mat-error>
                <mat-hint *ngIf="title.input.hasError('hint')">
                    <strong>{{title.input.getError('hint')}}</strong>
                </mat-hint>
            </mat-form-field>
            <mat-form-field>
                <textarea matInput placeholder="内容"  [formControl]="content"></textarea>
                <mat-error *ngIf="content.hasError('maxLength') && !content.hasError('required')">
                    <small>最长256位</small>
                </mat-error>
                <mat-error *ngIf="content.hasError('required')">
                    <strong>必填</strong>
                </mat-error>
                <mat-hint *ngIf="content.hasError('hint')">
                    <strong>{{content.getError('hint')}}</strong>
                </mat-hint>
            </mat-form-field>
        </form>
    </mat-dialog-content>
    <mat-dialog-actions align="center">
        <button mat-raised-button (click)="decline()">取消</button>
        <button mat-raised-button (click)="confirm()" [mat-dialog-close]="true" cdkFocusInitial>确定</button>
    </mat-dialog-actions>
`,
})
export class MsgDialogComponent extends IDialogComponent implements OnInit {
    title = {
        input: new FormControl('', [
            Validators.required,
            Validators.maxLength(32),
        ]),
        hints:[
            {icon:'sentiment_very_satisfied', color:'warn',content:'你好,预约接机有空吗?'},
            {icon:'sentiment_satisfied', color:'accent',content:'你好,预约送人有空吗?'},
        ]
    };
    content = new FormControl('', [
        Validators.required,
        Validators.maxLength(256),
    ]);
    form: FormGroup = new FormGroup({
        title: this.title.input,
        content: this.content
    });
    ngOnInit() {
    }
    confirm() {
        //console.log(this.form.value);
        super.confirm(this.form.value)
    }
    decline() {
        super.decline();
    }
}
