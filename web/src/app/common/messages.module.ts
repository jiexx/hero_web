import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Routes, RouterModule } from "@angular/router";
import { MatPaginatorModule } from "@angular/material/paginator";
import { MatListModule } from "@angular/material/list";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";

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
        //RouterModule.forChild(routes),
        MatPaginatorModule,
        MatListModule,
        MatIconModule,
        MatButtonModule
    ],
    exports: [MessagesComponent],
    declarations: [
        MessagesComponent
    ],
})
export class MessagesModule { }