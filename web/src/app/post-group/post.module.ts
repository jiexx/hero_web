import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { PostsRoutingModule } from "./post-routing.module";
import { PostGroupComponent } from "./post-group.component";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatExpansionModule } from "@angular/material/expansion";
import { MatCardModule } from "@angular/material/card";
import { MatInputModule } from "@angular/material/input";
import { MatButtonModule } from "@angular/material/button";

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
        MatButtonModule,
        PostsModule
    ],
    declarations: [
        PostGroupComponent,
    ]
})
export class PostGroupModule { }