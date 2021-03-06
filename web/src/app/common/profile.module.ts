import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Routes, RouterModule } from "@angular/router";
import { MatButtonModule } from "@angular/material/button";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";

import { ProfileComponent } from "./profile.component";
import { NetModule } from "./net.module";
import { ImageModule } from "./image.module";
import { DialogModule } from "./dialog.module";
import { ReactiveFormsModule } from "@angular/forms";

const routes: Routes = [
    {
        path: '',
        component: ProfileComponent
    }
];

@NgModule({
    imports: [
        CommonModule,
        NetModule,
        DialogModule,
        ReactiveFormsModule,
        RouterModule.forChild(routes),
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        ImageModule
    ],
    exports: [RouterModule, ProfileComponent],
    declarations: [
        ProfileComponent
    ]
})
export class ProfileModule { }