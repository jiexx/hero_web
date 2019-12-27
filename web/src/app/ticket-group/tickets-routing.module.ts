import { Routes, RouterModule } from "@angular/router";
import { TicketGroupComponent } from "./ticket-group.component";
import { NgModule } from "@angular/core";

const routes: Routes = [
    {
        path: '',
        component: TicketGroupComponent
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class TicketsRoutingModule { }