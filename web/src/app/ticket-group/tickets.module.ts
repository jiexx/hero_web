import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { TicketDepartComponent } from "./ticket-depart.component";
import { TicketsModule } from "app/common/tickets.module";
import { TicketsRoutingModule } from "./tickets-routing.module";
import { TicketArriveComponent } from "./ticket-arrive.component";
import { MatIconModule } from "@angular/material/icon";

@NgModule({
    imports: [
        CommonModule,
        TicketsRoutingModule,
        TicketsModule,
        MatIconModule
    ],
    declarations: [
        TicketDepartComponent,
        TicketArriveComponent
    ]
})
export class TicketsGroupModule { }