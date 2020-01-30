import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Routes, RouterModule } from "@angular/router";
import { MatButtonModule } from "@angular/material/button";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatIconModule } from "@angular/material/icon";
import { MatExpansionModule } from "@angular/material/expansion";
import { MatListModule } from "@angular/material/list";
import { MatPaginatorModule } from "@angular/material/paginator";

import { NetModule } from "./net.module";
import { PostComponent } from "./posts.component";
import { FormsModule } from "@angular/forms";

const routes: Routes = [
    {
        path: '',
        component: PostComponent
    }
];

@NgModule({
    imports: [
        CommonModule,
        NetModule,
        FormsModule,
        RouterModule.forChild(routes),
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatIconModule,
        MatExpansionModule,
        MatListModule,
        MatPaginatorModule
    ],
    exports: [RouterModule, PostComponent],
    declarations: [
        PostComponent
    ]
})
export class PostsModule { }