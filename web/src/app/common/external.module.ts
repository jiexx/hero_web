import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Routes, RouterModule } from "@angular/router";
import { ExternalComponent } from "./external.component";
import { HttpClientModule } from "@angular/common/http";

const routes: Routes = [
    {
        path: '',
        component: ExternalComponent
    }
];

@NgModule({
    imports: [
        CommonModule,
        HttpClientModule,
        RouterModule.forChild(routes),
    ],
    exports: [
        ExternalComponent
    ],
    declarations: [
        ExternalComponent
    ],
    //providers: [{ provide: Window, useValue: window }],
})
export class ExternalModule { }