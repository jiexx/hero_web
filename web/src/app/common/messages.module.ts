import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Routes, RouterModule } from "@angular/router";
import { MatPaginatorModule, MatListModule, MatIconModule } from "@angular/material";
import { NetModule } from "./net.module";
import { MessagesComponent } from "./messages.component";
import { BusService } from "./dcl.bus.service";
import { DialogModule } from "./dialog.module";

const routes: Routes = [
    {
        path: '',
        component: MessagesComponent
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
    exports: [RouterModule, MessagesComponent],
    declarations: [
        MessagesComponent
    ],
})
export class MessagesModule { }