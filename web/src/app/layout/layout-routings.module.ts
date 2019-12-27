import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { AuthGuard } from 'app/common/net.auth';

const routes: Routes = [
    {
        path: 'tickets',
        loadChildren: () => import('../ticket-group/tickets.module').then(mod => mod.TicketsGroupModule),
    },
    {
        path: 'profile',
        loadChildren: () => import('../user-profile/profile.module').then(mod => mod.UserProfileModule),
        canActivate: [AuthGuard]
    },
    {
        path: 'post',
        loadChildren: () => import('../post-group/post.module').then(mod => mod.PostGroupModule),
    },
    {
        path: 'login',
        loadChildren: () => import('../common/login.module').then(mod => mod.LoginModule),
    },
    {
        path: 'message',
        loadChildren: () => import('../notifications/message-group.module').then(mod => mod.MessageGroupModule),
    },
    {
        path: 'favor',
        loadChildren: () => import('../notifications/favor-group.module').then(mod => mod.FavorsGroupModule),
    },
    {
        path: '',
        redirectTo: 'tickets',
        pathMatch: 'full'
    }
];

@NgModule({
    imports: [
        RouterModule.forChild(routes)
    ],
    exports: [RouterModule],
})
export class LayoutRoutingModule { }