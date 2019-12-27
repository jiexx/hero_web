import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Routes, RouterModule } from "@angular/router";
import { MatButtonModule, MatFormFieldModule, MatInputModule } from "@angular/material";
import { NetModule } from "./net.module";
import { LoginComponent } from "./login.component";
import { ReactiveFormsModule } from "@angular/forms";

const routes: Routes = [
    {
        path: '',
        component: LoginComponent
    }
];

@NgModule({
    imports: [
        CommonModule,
        NetModule,
        ReactiveFormsModule,
        RouterModule.forChild(routes),
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule
    ],
    exports: [RouterModule, LoginComponent],
    declarations: [
        LoginComponent
    ]
})
export class LoginModule { }