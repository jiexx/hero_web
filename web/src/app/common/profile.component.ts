import { Component, OnInit} from "@angular/core";
import { HttpRequest } from "./net.request";
import { FormControl, Validators, FormGroup } from "@angular/forms";
import { BusService } from "./dcl.bus.service";
import { DialogMessage } from "./dcl.dialog.message";
import { InfoDialogComponent } from './dialog.info.component';
import { User } from "./net.user";

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
    <button mat-raised-button type="submit" color="warn" (click)="act()">{{!user.logined()? '注册': '保存'}}</button>
</form>
`
})

export class ProfileComponent implements OnInit {
    profile = this.user.profile;
    constructor(public hr: HttpRequest, public user: User, private busService: BusService) { 
    }
    autos: string[] = this.profile.cars ? this.profile.cars.split(',') : [];

    name = new FormControl(this.profile.name, [
        Validators.required,
        Validators.maxLength(8),
    ]);
    about = new FormControl(this.profile.about, [
        Validators.required,
        Validators.maxLength(128),
    ]);
    cars = new FormControl(this.autos, [
    ]);
    tel = new FormControl(this.profile.mobile);
    form: FormGroup = new FormGroup({
        tel: this.tel,
        name: this.name,
        about: this.about,
        cars: this.cars
    });

    ngOnInit() {

    }
    act() {
        if (!this.user.logined()) {
            this.user.register();
            return;
        }
        this.name.setValue(this.name.value);
        this.about.setValue(this.about.value);
        this.cars.setValue(this.autos);
        if (this.form.valid) {
            //console.log(this.form.value, this.autos)
            this.user.updateProfile(this.form.value, () => {
                this.busService.send(new DialogMessage(this, InfoDialogComponent, { title: '提示', content: '个人资料修改成功' }));
            });
        }
    }
}