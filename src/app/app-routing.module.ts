// src/app/app-routing.module.ts
import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard, AdminGuard, NoAuthGuard } from './features/auth/guards/auth.guard';

const routes: Routes = [
  {
    path: 'homes',
    loadChildren: () => import('./features/auth/homes/home.module').then( m => m.HomePageModule),
    canActivate: [AuthGuard]
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'tabs',
    loadChildren: () => import('./features/tabs-layout/tabs-layout.module').then(m => m.TabsLayoutPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'admin',
    loadChildren: () => import('./Admin/base-layout-admin/base-layout-admin.module').then( m => m.BaseLayoutAdminPageModule),
    canActivate: [AdminGuard]
  },
  {
    path: 'login',
    loadChildren: () => import('./features/auth/login/login.module').then( m => m.LoginPageModule),
    canActivate: [NoAuthGuard]
  },
  {
    path: 'register',
    loadChildren: () => import('./features/auth/register/register.module').then( m => m.RegisterPageModule),
    canActivate: [NoAuthGuard]
  },
  
  {
    path: '**',
    redirectTo: 'login'
  },
 
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }