import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Routes, RouterModule } from "@angular/router";
import { ImageComponent } from "./image.component";
import { NetModule } from "./net.module";
import { MatIconModule } from "@angular/material/icon";

const routes: Routes = [
    {
        path: '',
        component: ImageComponent
    }
];

@NgModule({
    imports: [
        CommonModule,
        NetModule,
        RouterModule.forChild(routes),
        MatIconModule
    ],
    exports: [RouterModule, ImageComponent],
    declarations: [
        ImageComponent
    ],
})
export class ImageModule { }