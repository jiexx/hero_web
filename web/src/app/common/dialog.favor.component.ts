import { Component, OnInit, Pipe, Sanitizer } from '@angular/core';
import { IDialogComponent } from './dialog.interface';
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { HttpRequest } from './net.request';
import { DomSanitizer } from '@angular/platform-browser';
import { ImageUrl } from './net.image';
import { MsgDialogComponent } from './dialog.msg.component';

@Pipe({name: 'safe'})
export class SafeHtml {
  constructor(private sanitizer:DomSanitizer){}

  transform(html) {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }
}

@Component({
    template:

`<h5 mat-dialog-header>
        选择通知方式
    </h5>
    <mat-dialog-content align="center" >
        <form  [formGroup]="form">
            <mat-form-field>
                <input matInput placeholder="通知价格低于"  [matAutocomplete]="auto" [formControl]="price.input">
                <mat-autocomplete #auto="matAutocomplete">
                    <mat-option *ngFor="let hint of price.hints" [value]="hint">
                        <span>{{hint}}</span>
                    </mat-option>
                </mat-autocomplete>
                <mat-error *ngIf="price.input.hasError('maxLength') && !price.input.hasError('required')">
                    <small>最长32位</small>
                </mat-error>
                <mat-error *ngIf="price.input.hasError('required')">
                    <strong>必填</strong>
                </mat-error>
                <mat-hint *ngIf="price.input.hasError('hint')">
                    <strong>{{price.input.getError('hint')}}</strong>
                </mat-hint>
            </mat-form-field>
        </form>
        <div  style="display: inline-block;position: relative;width:100%" cdkFocusInitial>
            <div style="padding-bottom:100%"></div>
            <img *ngIf="msg.info.qrcode" style="position:absolute;top:0;bottom:0;left:0;right:0;" [src]="sanitizer.bypassSecurityTrustResourceUrl(msg.info.qrcode)">
            <img style="position:absolute;left:0;right:0;top:0;bottom:0;margin:auto;width:32px;" src="{{imgUrl.assets.imgLink('assets/img/alipay64x64.png', 'assets/img/default.png')}}">
            <div *ngIf="!msg.info.qrcode" style="position:absolute;left:0;right:0;top:0;bottom:0;margin:auto;width:5rem;height:5rem">
                <svg viewBox="0 0 46 46" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <linearGradient x1="8.042%" y1="0%" x2="65.682%" y2="23.865%" id="a">
                            <stop stop-color="tomato" stop-opacity="0" offset="0%"/>
                            <stop stop-color="tomato" stop-opacity=".631" offset="63.146%"/>
                            <stop stop-color="tomato" offset="100%"/>
                        </linearGradient>
                    </defs>
                    <g fill="none" fill-rule="evenodd">
                        <g transform="translate(1 1)">
                            <path d="M36 18c0-9.94-8.06-18-18-18" id="Oval-2" stroke="url(#a)" stroke-width="4">
                                <animateTransform
                                    attributeName="transform"
                                    type="rotate"
                                    from="0 18 18"
                                    to="360 18 18"
                                    dur="0.9s"
                                    repeatCount="indefinite" />
                            </path>
                        </g>
                    </g>
                </svg>
            </div>
        </div>
        <h6>扫码获取即时短信通知</h6>    
    </mat-dialog-content>
    <mat-dialog-actions align="center">
        <button *ngIf="msg.pass" mat-raised-button (click)="decline()">邮件</button>
        <button *ngIf="msg.fail" mat-raised-button (click)="confirm()" [mat-dialog-close]="true" cdkFocusInitial color="warn">短信</button>
    </mat-dialog-actions>
`,
})
export class FavorDialogComponent extends IDialogComponent implements OnInit {
    constructor(public imgUrl: ImageUrl, public sanitizer:DomSanitizer){ 
        super()
        
    }
    ngOnInit(): void{
        // if(!this.msg.info.qrcode){
        //     this.msg.info.qrcode = `data:image/svg+xml;charset=utf-8,<svg class="circular" viewBox="25 25 50 50"><circle class="path" cx="50" cy="50" r="20" fill="none" stroke-width="2" stroke-miterlimit="10"/></svg>`;
        // }
        this.msg.info['_result'] = this.form.value;
    }
    price = {
        input: new FormControl('', [
            Validators.required,
            Validators.maxLength(7),
        ]),
        hints:['1000', '2000', '3000', '5000']
    };
    form: FormGroup = new FormGroup({
        price: this.price.input,
    });
    confirm() {
        super.confirm(this.form.value)
    }
    decline() {
        super.decline(this.form.value);
    }
}
