import { Component, Input, OnInit } from "@angular/core";
import { AuthGuard } from "./auth.guard";
import { HttpRequest } from "./net.request";
import { kMaxLength } from "buffer";
import { PageEvent } from "@angular/material";
import { FormControl, Validators, FormGroup } from "@angular/forms";

function hint(control: FormControl):{[key:string]: string}{
    if(!!control.value){
        return null;
    }
}

@Component({
    selector: 'login',
    template:
        `
<div class="main-content">
    <div class="container-fluid">
        <div class="card">
            <div class="card-header card-header-danger">
                <h4 class="card-title">{{user.action}}</h4>
                <p class="card-category">{{user.hint}}</p>
            </div>
            <div class="card-body">
                <form  [formGroup]="from">
                    <mat-form-field>
                        <mat-label>手机号</mat-label>
                        <input matInput placeholder="能收短信的11位手机号" type="tel" [formControl]="tel">
                        <button mat-raised-button matSuffix color="warn" (click)="sms()" [disabled]="tel.hasError('pattern') || tel.hasError('required')">发送验证码</button>
                        <mat-error *ngIf="tel.hasError('pattern') && !tel.hasError('required')">
                            手机号不正确
                        </mat-error>
                        <mat-error *ngIf="tel.hasError('required')">
                            <strong>必填</strong>
                        </mat-error>
                        <mat-hint *ngIf="tel.hasError('hint')">
                            <strong>{{tel.getError('hint')}}</strong>
                        </mat-hint>
                    </mat-form-field>
                    <mat-form-field>
                        <mat-label>验证码</mat-label>
                        <input matInput placeholder="手机收到的4位验证码" type="text" [formControl]="code">
                        <mat-error *ngIf="code.hasError('required')">
                            <strong>必填</strong>
                        </mat-error>
                        <mat-hint *ngIf="code.hasError('hint')">
                            <strong>{{code.getError('hint')}}</strong>
                        </mat-hint>
                    </mat-form-field>
                    <div fxFlex></div>
                    <button mat-raised-button type="submit" color="warn" (click)="act()">提交</button>
                </form>
            </div>
        </div>
    </div>
</div>
`
})
export class LoginComponent implements OnInit {
    avatar: string[] = [];
    user = { action: '注册', hint: '登陆' };

    constructor(public hr: HttpRequest, private auth: AuthGuard) { 
        //console.log(JSON.stringify(this.auth.state)); 
    }
    tel = new FormControl('', [
        hint,
        Validators.required,
        Validators.pattern(/^((13[0-9])|(15[^4])|(18[0-9])|(17[0-1|3|5-8])|(14[5|7|9]))\d{8}$/g),
    ]);
    code = new FormControl('', [
        hint,
        Validators.required,
    ]);
    from: FormGroup = new FormGroup({
        tel: this.tel,
        code: this.code
    });
    ngOnInit() {
        this.avatar = [this.auth.user.profile.avatar];
        if (this.auth.user.state == '_TEMP') {
            this.user.action = '注册';
            this.user.hint = '新用户';
        } else {
            this.user.action = '登录';
            this.user.hint = '重置密码';
        }
    }
    sms() {
        if (this.from.controls.tel.valid) {
            this.hr.post('auth/sms', { tel: this.from.controls.tel.value }, result => {
                this.from.controls.code.setErrors({ hint: '请输入验证码' });
            }, error => {
                this.from.controls.tel.setErrors({ hint: error.msg });
            });
        }

    }
    act() {
        if (this.from.valid) {
            
            this.auth.user.checkin(this.from.controls.tel.value, this.from.controls.code.value);
        }
    }
}