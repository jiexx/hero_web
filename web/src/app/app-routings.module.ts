import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';

const routes: Routes = [
    {
        path: '',
        component: LayoutComponent,
        loadChildren: () => import('./layout/layout.module').then(mod => mod.LayoutModule)
    },
    {
        path: '',
        redirectTo: '',
        pathMatch: 'full',
    }
];

@NgModule({
    imports: [
        RouterModule.forRoot(routes, {useHash: true})
    ],
    exports: [RouterModule],
})
export class AppRoutingModule { }
