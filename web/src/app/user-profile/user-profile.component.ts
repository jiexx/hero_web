import { Component, OnInit } from '@angular/core';
import { HttpRequest } from 'app/common/net.request';
import { AuthGuard } from 'app/common/auth.guard';
import { FormControl, Validators, FormGroupDirective, NgForm, FormGroup } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material';
export class Matcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}
@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {

  avatar: string[] = [];
  constructor(public hr: HttpRequest, public auth: AuthGuard) {
    
  }

  ngOnInit() {
    this.avatar = [this.auth.profile.avatar];
  }

  onUploaded(data){

    if(!this.auth.logined()) {
        this.auth.register();
        return;
    }
    console.log(this.hr.uploadPath(data))
    this.auth.updateProfile({avatar:this.hr.uploadPath(data)});
  }

}
