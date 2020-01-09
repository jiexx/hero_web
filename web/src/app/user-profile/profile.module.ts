import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { UserProfileRoutingModule } from "./profile-routing.module";
import { UserProfileComponent } from "./user-profile.component";
import { ProfileModule } from "app/common/profile.module";
import { ImageModule } from "app/common/image.module";
import { FlexLayoutModule } from "@angular/flex-layout";

@NgModule({
    imports: [
        CommonModule,
        UserProfileRoutingModule,
        ProfileModule,
        ImageModule,
        FlexLayoutModule
    ],
    declarations: [
        UserProfileComponent
    ]
})
export class UserProfileModule { }