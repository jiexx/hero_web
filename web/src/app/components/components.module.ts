import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { FooterComponent } from './footer/footer.component';
import { NavbarComponent } from './navbar/navbar.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { MatDialog, MatDialogRef, MatDialogModule, MatButtonModule, MatRippleModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatTooltipModule, MatPaginatorModule, MatCardModule, MatDividerModule, MatExpansionModule, MatIconModule, MatListModule, MatGridListModule, MAT_DIALOG_DATA, MatAutocompleteModule, MatMenuModule, MatBadgeModule, MatToolbarModule } from '@angular/material';
import { HttpRequest } from 'app/common/net.request';
import { DialogComponent } from 'app/common/dialog.component';
import { PostComponent } from 'app/common/posts.component';
import { ImageComponent } from 'app/common/image.component';
import { TicketComponent } from 'app/common/tikets.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MsgDialogComponent } from 'app/common/dialog.msg.component';
import { InfoDialogComponent } from 'app/common/dialog.info.component';
import { NaviComponent } from 'app/common/navi.component';
import { FavorDialogComponent } from 'app/common/dialog.favor.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    // MatRippleModule,
    MatFormFieldModule,
    MatInputModule,
    // MatSelectModule,
    // MatTooltipModule,
    // MatPaginatorModule,
    MatDialogModule,
    // MatCardModule,
    // MatDividerModule,
    // MatExpansionModule,
    MatIconModule,
    MatListModule,
    // MatGridListModule,
    MatAutocompleteModule,
    MatMenuModule,
    MatBadgeModule,
    MatToolbarModule
  ],
  declarations: [
    FooterComponent,
    NavbarComponent,
    SidebarComponent,
    DialogComponent,
    InfoDialogComponent,
    MsgDialogComponent,
    NaviComponent,
    FavorDialogComponent,
  ],
  exports: [
    FooterComponent,
    NavbarComponent,
    SidebarComponent,
    DialogComponent,
    InfoDialogComponent,
    MsgDialogComponent,
    NaviComponent,
    FavorDialogComponent
  ],
  entryComponents: [
    DialogComponent,
    InfoDialogComponent,
    MsgDialogComponent,
    FavorDialogComponent
  ],
  providers: [HttpRequest]
})
export class ComponentsModule { }
