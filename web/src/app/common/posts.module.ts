import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Routes, RouterModule } from "@angular/router";
import { MatButtonModule, MatFormFieldModule, MatInputModule, MatIcon, MatIconModule, MatExpansionModule, MatListModule, MatPaginatorModule } from "@angular/material";
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