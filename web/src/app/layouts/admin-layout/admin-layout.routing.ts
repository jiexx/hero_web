import { Routes } from '@angular/router';

import { UserProfileComponent } from '../../user-profile/user-profile.component';
import { MessageGroupComponent } from '../../notifications/message-group.component';
import { AuthGuard } from 'app/common/auth.guard';
import { LoginComponent } from 'app/common/login.component';
import { TicketGroupComponent } from 'app/ticket-group/ticket-group.component';
import { PostGroupComponent } from 'app/post-group/post-group.component';
import { FavorGroupComponent } from 'app/notifications/favor-group.component';

export const AdminLayoutRoutes: Routes = [
    // {
    //   path: '',
    //   children: [ {
    //     path: 'dashboard',
    //     component: DashboardComponent
    // }]}, {
    // path: '',
    // children: [ {
    //   path: 'userprofile',
    //   component: UserProfileComponent
    // }]
    // }, {
    //   path: '',
    //   children: [ {
    //     path: 'icons',
    //     component: IconsComponent
    //     }]
    // }, {
    //     path: '',
    //     children: [ {
    //         path: 'notifications',
    //         component: NotificationsComponent
    //     }]
    // }, {
    //     path: '',
    //     children: [ {
    //         path: 'maps',
    //         component: MapsComponent
    //     }]
    // }, {
    //     path: '',
    //     children: [ {
    //         path: 'post',
    //         component: TypographyComponent
    //     }]
    // }, {
    //     path: '',
    //     children: [ {
    //         path: 'upgrade',
    //         component: UpgradeComponent
    //     }]
    // }
    { path: 'tickets',     component: TicketGroupComponent, canActivate: [AuthGuard] },
    { path: 'user-profile',   component: UserProfileComponent, canActivate: [AuthGuard] },
    { path: 'post',     component: PostGroupComponent, canActivate: [AuthGuard] },
    //{ path: 'notifications',  component: NotificationsComponent, canActivate: [AuthGuard] },
    { path: 'login',   component: LoginComponent, canActivate: [AuthGuard] },
    { path: 'message',   component: MessageGroupComponent, canActivate: [AuthGuard] },
    { path: 'favor',   component: FavorGroupComponent, canActivate: [AuthGuard] },
];
