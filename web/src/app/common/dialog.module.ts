import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Routes, RouterModule } from "@angular/router";
import { MatListModule } from "@angular/material/list";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { MatDialogModule } from "@angular/material/dialog";
import { MatInputModule } from "@angular/material/input";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { DialogComponent } from "./dialog.component";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { BusService } from "./dcl.bus.service";
import { InfoDialogComponent } from "./dialog.info.component";
import { MsgDialogComponent } from "./dialog.msg.component";
import { FavorDialogComponent, SafeHtml } from "./dialog.favor.component";
import { QRCodeModule } from 'angular2-qrcode';


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
        MatButtonModule,
        QRCodeModule
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
        FavorDialogComponent,
        SafeHtml
    ],
    entryComponents: [
        DialogComponent,
        InfoDialogComponent,
        MsgDialogComponent,
        FavorDialogComponent
    ],
})
export class DialogModule { }