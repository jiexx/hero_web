import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routings.module';
import { AppComponent } from './app.component';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { LayoutModule } from './layout/layout.module';
import { BusService } from './common/dcl.bus.service';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';

@NgModule({
    imports:[
        BrowserModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        HttpClientModule,
        LayoutModule,
        ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),
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
