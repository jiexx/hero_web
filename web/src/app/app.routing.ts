import { NgModule } from '@angular/core';
import { CommonModule, } from '@angular/common';
import { BrowserModule  } from '@angular/platform-browser';
import { Routes, RouterModule } from '@angular/router';
import { BusService } from './common/dcl.bus.service';
import { ConfigService } from './common/net.config';
import { HttpRequest } from './common/net.request';
import { AuthGuard, User } from './common/auth.guard';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { JwtInterceptor } from './common/interceptor.jwt';
import { ErrorInterceptor } from './common/interceptor.error';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { ImageUrl } from './common/image.url';

const routes: Routes =[
  {
    path: '',
    redirectTo: 'tickets',
    pathMatch: 'full',
  }, {
    path: '',
    component: AdminLayoutComponent,
    children: [{
      path: '',
      loadChildren: './layouts/admin-layout/admin-layout.module#AdminLayoutModule'
    }]
  }
];

@NgModule({
  imports: [
    HttpClientModule,
    CommonModule,
    BrowserModule,
    RouterModule.forRoot(routes,{
       useHash: true
    })
  ],
  exports: [
  ],
  providers: [BusService,ConfigService,HttpRequest,AuthGuard,User,ImageUrl,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: JwtInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ErrorInterceptor,
      multi: true,
    }
  ],
})
export class AppRoutingModule { }
