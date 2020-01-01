import { NgModule } from "@angular/core";
import { LayoutComponent } from "./layout.component";
import { LayoutRoutingModule } from "./layout-routings.module";
import { CommonModule } from "@angular/common";
import { FooterComponent } from "./footer/footer.component";
import { NavbarComponent } from "./navbar/navbar.component";
import { SidebarComponent } from "./sidebar/sidebar.component";
import { FormsModule } from "@angular/forms";
import { NaviModule } from "app/common/navi.module";
import { MatIconModule, MatButtonModule } from "@angular/material";
import { AuthGuard } from "app/common/net.auth";
import { DialogModule } from "app/common/dialog.module";

@NgModule({
    imports: [
        FormsModule,
        CommonModule,
        LayoutRoutingModule,
        NaviModule,
        MatIconModule,
        MatButtonModule,
        DialogModule,
    ],
    declarations: [
        LayoutComponent,
        FooterComponent,
        NavbarComponent,
        SidebarComponent,
    ],
    providers:[
        AuthGuard,
    ],
    
})
export class LayoutModule { }