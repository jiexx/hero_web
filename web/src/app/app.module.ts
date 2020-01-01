import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routings.module';
import { AppComponent } from './app.component';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { LayoutModule } from './layout/layout.module';
import { BusService } from './common/dcl.bus.service';

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
