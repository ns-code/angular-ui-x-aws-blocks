import { Routes } from '@angular/router';
import { AwsLogin } from './auth/aws-login/aws-login';

export const routes: Routes = [
    { path: '', redirectTo: 'signIn', pathMatch: 'full'},
    { path: 'signIn', component: AwsLogin },
];
