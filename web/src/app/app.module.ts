import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routings.module';
import { AppComponent } from './app.component';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { LayoutModule } from './layout/layout.module';
import { BusService } from './common/dcl.bus.service';
import { DialogComponent } from './common/dialog.component';
import { InfoDialogComponent } from './common/dialog.info.component';
import { MsgDialogComponent } from './common/dialog.msg.component';
import { FavorDialogComponent } from './common/dialog.favor.component';
import { DialogModule } from './common/dialog.module';

@NgModule({
    imports:[
        BrowserModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        HttpClientModule,
        LayoutModule,
    ],
    declarations: [
        AppComponent,
    ],
    bootstrap: [AppComponent],
    providers:[
        BusService
    ],
})
export class AppModule { }
