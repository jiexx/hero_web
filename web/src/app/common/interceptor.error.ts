import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor,HttpClient} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthGuard } from './auth.guard';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
    constructor(private auth: AuthGuard, protected http: HttpClient) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(request).pipe(catchError(err => {
            if (err.status === 401) {
                // auto logout if 401 response returned from api
                this.auth.for401();
            }
            const error = err.error.message || err.statusText;
            return throwError(error);
        }))
    }
}