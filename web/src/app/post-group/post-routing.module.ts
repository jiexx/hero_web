import { Routes, RouterModule } from "@angular/router";
import { PostGroupComponent } from "./post-group.component";
import { NgModule } from "@angular/core";

const routes: Routes = [
    {
        path: '',
        component: PostGroupComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class PostsRoutingModule { }