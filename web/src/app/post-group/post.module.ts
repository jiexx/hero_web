import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { PostsRoutingModule } from "./post-routing.module";
import { PostGroupComponent } from "./post-group.component";
import { MatFormFieldModule, MatIconModule, MatExpansionModule, MatCardModule, MatGridListModule, MatInputModule, MatButton, MatButtonModule } from "@angular/material";
import { PostsModule } from "app/common/posts.module";
import { FormsModule } from "@angular/forms";


@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        MatInputModule,
        PostsRoutingModule,
        MatFormFieldModule,
        MatCardModule,
        MatExpansionModule,
        MatIconModule,
        MatGridListModule,
        MatButtonModule,
        PostsModule
    ],
    declarations: [
        PostGroupComponent,
    ]
})
export class PostGroupModule { }