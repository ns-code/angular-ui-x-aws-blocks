import { Routes } from '@angular/router';
import { Home } from './home/home';
import { Page1 } from './page1/page1';

export const routes: Routes = [
    { path: '', redirectTo: 'home', pathMatch: 'full'},
    { path: 'home', component: Home,
        children: [
            { path: 'page1', component: Page1 }
        ]
     },
];
