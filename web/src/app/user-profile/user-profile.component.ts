import { Component, OnInit } from '@angular/core';
import { HttpRequest } from 'app/common/net.request';
import { AuthGuard, User } from 'app/common/auth.guard';
import { FormControl, Validators, FormGroupDirective, NgForm, FormGroup } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material';
import { ImageUrl } from 'app/common/image.url';
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
  constructor(public imgUrl: ImageUrl, public user: User) {
    
  }

  ngOnInit() {
    this.avatar = [this.user.profile.avatar];
  }

  onUploaded(data){

    if(!this.user.logined()) {
        this.user.register();
        return;
    }
    //console.log(this.hr.uploadPath(data))
    this.user.updateProfile({avatar:data});
  }

}
