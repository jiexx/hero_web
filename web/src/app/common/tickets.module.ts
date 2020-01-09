import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Routes, RouterModule } from "@angular/router";
import { MatButtonModule, MatFormFieldModule, MatSelectModule, MatPaginatorModule, MatAutocompleteModule, MatIconModule, MatList, MatListModule, MatExpansionModule } from "@angular/material";
import { NetModule } from "./net.module";
import { TicketComponent } from "./tickets.component";
import { DialogModule } from "./dialog.module";
import { FormsModule } from "@angular/forms";
import { FlexLayoutModule } from "@angular/flex-layout";

const routes: Routes = [
    {
        path: '',
        component: TicketComponent
    }
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        NetModule,
        RouterModule.forChild(routes),
        DialogModule,
        MatButtonModule,
        MatFormFieldModule,
        MatSelectModule,
        MatPaginatorModule,
        MatAutocompleteModule,
        MatIconModule,
        MatSelectModule,
        MatListModule,
        MatExpansionModule,
        FlexLayoutModule
    ],
    exports: [RouterModule, TicketComponent],
    declarations: [
        TicketComponent
    ]
})
export class TicketsModule { }