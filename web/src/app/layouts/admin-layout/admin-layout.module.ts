import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AdminLayoutRoutes } from './admin-layout.routing';
import { UserProfileComponent } from '../../user-profile/user-profile.component';

import {
  MatButtonModule,
  MatInputModule,
  MatRippleModule,
  MatFormFieldModule,
  MatTooltipModule,
  MatSelectModule,
  MatPaginatorModule,
  MatDialogModule,
  MatDialogRef,
  MatCardModule,
  MatDividerModule,
  MatExpansionModule,
  MatIconModule,
  MatListModule,
  MatGridListModule,
  MatBadgeModule,
  MatMenuModule,
  MatToolbarModule,
} from '@angular/material';
import { LoginComponent } from 'app/common/login.component';
import { TicketGroupComponent } from 'app/ticket-group/ticket-group.component';
import { PostGroupComponent } from 'app/post-group/post-group.component';
import { PostComponent } from 'app/common/posts.component';
import { ImageComponent } from 'app/common/image.component';
import { TicketComponent } from 'app/common/tikets.component';
import { ProfileComponent } from 'app/common/profile.component';
import { MessagesComponent } from 'app/common/messages.component';
import { MessageGroupComponent } from 'app/notifications/message-group.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(AdminLayoutRoutes),
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatRippleModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTooltipModule,
    MatPaginatorModule,
    MatDialogModule,
    MatCardModule,
    MatDividerModule,
    MatExpansionModule,
    MatIconModule,
    MatListModule,
    MatGridListModule,
  ],
  declarations: [
    UserProfileComponent,
    TicketGroupComponent,
    PostGroupComponent,
    MessageGroupComponent,
    LoginComponent,
    ProfileComponent,
    ImageComponent,
    TicketComponent,
    PostComponent,
    MessagesComponent

  ],
  exports:[
  ],
  providers: [
    {provide: MatDialogRef, useValue: {}},
  ],
})

export class AdminLayoutModule {}
