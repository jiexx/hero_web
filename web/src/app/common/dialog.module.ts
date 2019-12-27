import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Routes, RouterModule } from "@angular/router";
import { MatListModule, MatDialog, MatFormFieldModule, MatInput, MatAutocompleteModule, MatDialogModule, MatInputModule, MatIcon, MatIconModule, MatButtonModule } from "@angular/material";
import { DialogComponent } from "./dialog.component";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { BusService } from "./dcl.bus.service";
import { InfoDialogComponent } from "./dialog.info.component";
import { MsgDialogComponent } from "./dialog.msg.component";
import { FavorDialogComponent } from "./dialog.favor.component";

const routes: Routes = [
    {
        path: '',
        component: DialogComponent
    }
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        //RouterModule.forChild(routes),
        MatDialogModule,
        MatListModule,
        FormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatAutocompleteModule,
        MatIconModule,
        MatButtonModule
    ],
    exports: [
        //RouterModule, 
        DialogComponent,
        InfoDialogComponent,
        MsgDialogComponent,
        FavorDialogComponent
    ],
    declarations: [
        DialogComponent,
        InfoDialogComponent,
        MsgDialogComponent,
        FavorDialogComponent
    ],
    entryComponents: [
        DialogComponent,
        InfoDialogComponent,
        MsgDialogComponent,
        FavorDialogComponent
    ],
})
export class DialogModule { }