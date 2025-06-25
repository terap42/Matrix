import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TabsLayoutPage } from './tabs-layout.page';
import { AuthGuard } from '../auth/guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    component: TabsLayoutPage,
    children: [
      {
        path: 'homes',
        loadChildren: () => import('../home/home.module').then(m => m.HomePageModule),
        canActivate: [AuthGuard]
      },
      {
        path: 'profile',
        loadChildren: () => import('../profile/profile.module').then(m => m.ProfilePageModule),
        canActivate: [AuthGuard]
      },
      {
        path: 'mission',
        loadChildren: () => import('../mission/mission.module').then(m => m.MissionPageModule),
        canActivate: [AuthGuard]
      },
      {
        path: 'messagerie',
        loadChildren: () => import('../messagerie/messagerie.module').then(m => m.MessageriePageModule),
        canActivate: [AuthGuard]
      },
      {
        path: 'messageriefrree',
        loadChildren: () => import('../messageriefrree/messageriefrree.module').then(m => m.MessageriefrreePageModule),
        canActivate: [AuthGuard]
      },
      
       {
    path: 'freelance-profile',
    loadChildren: () => import('../freelance-profile/freelance-profile.module').then( m => m.FreelanceProfilePageModule)
      },
      {
        path: 'missions',
        canActivate: [AuthGuard],
        children: [
          {
            path: '',
            loadChildren: () => import('../missions/missions.module').then(m => m.MissionsPageModule)
          },
          {
            path: 'mission-details/:id',
            loadChildren: () => import('../missions/page/mission-details/mission-details.module').then(m => m.MissionDetailsPageModule)
          }
        ]
      },
       {
    path: 'home',
    loadChildren: () => import('../content/content.module').then( m => m.ContentPageModule)
  },
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TabsLayoutPageRoutingModule { }