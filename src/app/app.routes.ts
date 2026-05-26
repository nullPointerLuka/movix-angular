import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import {Details} from './pages/details/details';
export const routes: Routes = [
     {
    path: '',
    component: Home
  },
    {
    path: 'details',
    component: Details
  }
];
