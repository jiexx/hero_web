import { Component } from '@angular/core';
import { IDialogComponent } from './dialog.component';
import { FormControl, Validators, FormGroup } from '@angular/forms';



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
        <img width="80rem" src="data:image/png;base64,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">
        <h6>扫码获取即时短信通知</h6>    
    </mat-dialog-content>
    <mat-dialog-actions align="center">
        <button mat-raised-button (click)="decline()">邮件</button>
        <button mat-raised-button (click)="confirm()" [mat-dialog-close]="true" cdkFocusInitial color="warn">短信</button>
    </mat-dialog-actions>
`,
})
export class FavorDialogComponent extends IDialogComponent {
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
