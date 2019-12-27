import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MessageGroupComponent } from "./message-group.component";
import { Routes, RouterModule } from "@angular/router";
import { MessagesModule } from "app/common/messages.module";


const routes: Routes = [
    {
        path: '',
        component: MessageGroupComponent
    }
];

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        MessagesModule
    ],
    exports: [RouterModule],
    declarations: [
        MessageGroupComponent,
    ]
})
export class MessageGroupModule { }