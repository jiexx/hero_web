import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Routes, RouterModule } from "@angular/router";
import { MatButtonModule, MatMenuModule, MatBadgeModule, MatIconModule, MatToolbarModule } from "@angular/material";
import { NetModule } from "./net.module";
import { NaviComponent } from "./navi.component";

const routes: Routes = [
    {
        path: '',
        component: NaviComponent
    }
];

@NgModule({
    imports: [
        CommonModule,
        NetModule,
        RouterModule,
        //RouterModule.forChild(routes),
        MatButtonModule,
        MatMenuModule,
        MatBadgeModule,
        MatIconModule,
        MatToolbarModule
    ],
    exports: [/* RouterModule,  */NaviComponent],
    declarations: [
        NaviComponent
    ]
})
export class NaviModule { }