import {COMMA, ENTER} from '@angular/cdk/keycodes';
import { Component, OnInit} from "@angular/core";
import { HttpRequest } from "./net.request";
import { FormControl, Validators, FormGroup } from "@angular/forms";
import { AuthGuard } from "./auth.guard";
import { BusService } from "./dcl.bus.service";
import { DialogMessage } from "./dcl.dialog.message";
import { DialogComponent } from "./dialog.component";
import { MatChipInputEvent } from '@angular/material';
import { InfoDialogComponent } from './dialog.info.component';

@Component({
    selector: 'profile',
    template:
`<form [formGroup]="form"> 
    <mat-form-field>
        <input matInput placeholder="手机号" type="tel" [formControl]="tel" readonly>
    </mat-form-field>
    <mat-form-field>
        <input matInput placeholder="昵称" type="text" [formControl]="name">
        <mat-error *ngIf="name.hasError('maxLength') && !name.hasError('required')">
            <small>最长8位</small>
        </mat-error>
        <mat-error *ngIf="name.hasError('required')">
            <small>必填</small>
        </mat-error>
    </mat-form-field>
    <mat-form-field>
        <input matInput placeholder="地址" type="text">
    </mat-form-field>
    <mat-form-field>
        <mat-label>自我介绍</mat-label>
        <textarea matInput [formControl]="about" placeholder=""></textarea>
        <mat-error *ngIf="about.hasError('maxLength') && !about.hasError('required')">
            <small>最长128位</small>
        </mat-error>
        <mat-error *ngIf="about.hasError('required')">
            <small>必填</small>
        </mat-error>
    </mat-form-field>
    <mat-label>车牌(最多3个)</mat-label>
    
    <div style="padding:1rem">
        <div style="float: left">
            <images #image [size]={w:100,h:100} [imageClass]="'img-thumbnail'" [max]=3 [(images)]="autos"></images>
        </div>
        <div style="clear: both;"></div>
    </div>
    <button mat-raised-button type="submit" color="warn" (click)="act()">{{auth.state == '_TEMP'? '注册': '保存'}}</button>
</form>
`
})

export class ProfileComponent implements OnInit {
    constructor(public hr: HttpRequest, public auth: AuthGuard, private busService: BusService) { 
        //console.log(JSON.stringify(this.auth.state)); 
    }
    autos: string[] = this.auth.profile.cars ? this.auth.profile.cars.split(',') : [];

    name = new FormControl(this.auth.profile.name, [
        Validators.required,
        Validators.maxLength(8),
    ]);
    about = new FormControl(this.auth.profile.about, [
        Validators.required,
        Validators.maxLength(128),
    ]);
    cars = new FormControl(this.autos, [
    ]);
    tel = new FormControl(this.auth.profile.mobile);
    form: FormGroup = new FormGroup({
        tel: this.tel,
        name: this.name,
        about: this.about,
        cars: this.cars
    });

    ngOnInit() {

    }
    act() {
        if (!this.auth.logined()) {
            this.auth.register();
            return;
        }
        this.name.setValue(this.name.value.trim());
        this.about.setValue(this.about.value.trim());
        this.cars.setValue(this.autos);
        if (this.form.valid) {
            //console.log(this.form.value, this.autos)
            this.auth.updateProfile(this.form.value, () => {
                this.busService.send(new DialogMessage(this, InfoDialogComponent, { title: '提示', content: '个人资料修改成功' }));
            });
        }
    }
}