import { Component, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { User } from 'app/common/auth.guard';
import { PostComponent } from 'app/common/posts.component';

@Component({
  selector: 'post-group',
  templateUrl: './post-group.component.html',
  styleUrls: ['./post-group.component.css']
})
export class PostGroupComponent {

  @ViewChild('postRef', { static:false }) postRef:PostComponent;

  article = {title: '', content: ''}
  constructor(private user: User) {
  }
  toggle(panel1){
    if(!this.user.logined()) {
      this.user.register();
      return;
    }
    panel1.toggle();
  }

  post(panel: any) {
      this.postRef.post(this.article.title, this.article.content, panel);
  }


}
