import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'homes',
    loadChildren: () => import('./homes/home.module').then( m => m.HomePageModule)
  },
  {
    path: '',
    redirectTo: 'homes',
    pathMatch: 'full'
  },
  

  {
    path: 'tabs',
    loadChildren: () => import('./features/tabs-layout/tabs-layout.module').then(m => m.TabsLayoutPageModule)
  }
   ,
  
  {
    path: 'admin',
    loadChildren: () => import('./Admin/base-layout-admin/base-layout-admin.module').then( m => m.BaseLayoutAdminPageModule)
  },
  {
    path: 'login',
    loadChildren: () => import('./features/auth/login/login.module').then( m => m.LoginPageModule)
  },
 
   {
    path: 'register',
    loadChildren: () => import('./features/auth/register/register.module').then( m => m.RegisterPageModule)
  },
 
  
 
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
