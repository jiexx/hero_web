import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Routes, RouterModule } from "@angular/router";
import { FavorGroupComponent } from "./favor-group.component";
import { FavorsModule } from "app/common/favors.module";
import { MatIcon, MatIconModule } from "@angular/material";


const routes: Routes = [
    {
        path: '',
        component: FavorGroupComponent
    }
];

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        FavorsModule,
        MatIconModule
    ],
    exports: [RouterModule],
    declarations: [
        FavorGroupComponent,
    ]
})
export class FavorsGroupModule { }