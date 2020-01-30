import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Routes, RouterModule } from "@angular/router";
import { MatPaginatorModule } from "@angular/material/paginator";
import { MatListModule } from "@angular/material/list";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
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
        //RouterModule.forChild(routes),
        MatPaginatorModule,
        MatListModule,
        MatIconModule,
        MatButtonModule,
        DialogModule,
    ],
    exports: [/* RouterModule ,*/ FavorsComponent],
    declarations: [
        FavorsComponent
    ]
})
export class FavorsModule { }