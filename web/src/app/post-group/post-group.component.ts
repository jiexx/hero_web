import { Component, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { HttpRequest } from 'app/common/net.request';
import { AuthGuard } from 'app/common/auth.guard';
import { PageEvent } from '@angular/material';
import { Router } from '@angular/router';
import { PostComponent } from 'app/common/posts.component';

@Component({
  selector: 'post-group',
  templateUrl: './post-group.component.html',
  styleUrls: ['./post-group.component.css']
})
export class PostGroupComponent implements OnInit {

  @ViewChild('postRef', { static:false }) postRef:PostComponent;

  article = {title: '', content: ''}
  constructor(private auth: AuthGuard) {
  }

  ngOnInit() {
  
  }
  toggle(panel1){
    if(!this.auth.logined()) {
      this.auth.register();
      return;
    }
    panel1.toggle();
  }

  post(panel: any) {
      this.postRef.post(this.article.title, this.article.content, panel);
  }


}
