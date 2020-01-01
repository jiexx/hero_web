import { Routes, RouterModule } from "@angular/router";
import { TicketDepartComponent } from "./ticket-depart.component";
import { NgModule } from "@angular/core";
import { TicketArriveComponent } from "./ticket-arrive.component";

const routes: Routes = [
    {
        path: '',
        component: TicketDepartComponent
    },
    {
        path: 'arrive',
        component: TicketArriveComponent
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class TicketsRoutingModule { }