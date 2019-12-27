import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Routes, RouterModule } from "@angular/router";
import { MatPaginatorModule, MatListModule, MatIconModule } from "@angular/material";
import { NetModule } from "./net.module";
import { FavorsComponent } from "./favors.component";
import { DialogModule } from "./dialog.module";

const routes: Routes = [
    {
        path: '',
        component: FavorsComponent
    }
];

@NgModule({
    imports: [
        CommonModule,
        NetModule,
        DialogModule,
        RouterModule.forChild(routes),
        MatPaginatorModule,
        MatListModule,
        MatIconModule
    ],
    exports: [RouterModule, FavorsComponent],
    declarations: [
        FavorsComponent
    ]
})
export class FavorsModule { }