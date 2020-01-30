import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { HttpRequest } from "./net.request";
import { HTTP_INTERCEPTORS } from "@angular/common/http";
import { ConfigService } from "./net.config";
import { ImageUrl } from "./net.image";
import { JwtInterceptor } from "./net.interceptor.jwt";
import { ErrorInterceptor } from "./net.interceptor.error";
import { User } from "./net.user";
import { MatPaginatorIntl } from "@angular/material/paginator";
import { ConfPaginator } from "./conf.paginator";


@NgModule({
    imports: [
        CommonModule,
    ],
    declarations: [
    ],
    exports: [
    ],
    providers: [
        HttpRequest,
        ConfigService,
        ImageUrl,
        User,
        {provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true},
        {provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true,},
        { provide: MatPaginatorIntl, useValue: ConfPaginator() }
    ]
})
export class NetModule { }