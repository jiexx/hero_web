import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Routes, RouterModule } from "@angular/router";
import { MatButtonModule } from "@angular/material/button";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatSelectModule } from "@angular/material/select";
import { MatPaginatorModule } from "@angular/material/paginator";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { MatIconModule } from "@angular/material/icon";
import { MatListModule } from "@angular/material/list";
import { MatExpansionModule } from "@angular/material/expansion";


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