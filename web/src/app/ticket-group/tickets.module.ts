import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { TicketGroupComponent } from "./ticket-group.component";
import { TicketsModule } from "app/common/tickets.module";
import { TicketsRoutingModule } from "./tickets-routing.module";

@NgModule({
    imports: [
        CommonModule,
        TicketsRoutingModule,
        TicketsModule
    ],
    declarations: [
        TicketGroupComponent,
    ]
})
export class TicketsGroupModule { }