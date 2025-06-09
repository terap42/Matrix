import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TabsLayoutPage } from './tabs-layout.page';

const routes: Routes = [
  {
    path: '',
    component: TabsLayoutPage,
    children: [
      {
        path: 'home',
        loadChildren: () => import('../home/home.module').then(m => m.HomePageModule)
      },
      {
        path: 'profile',
        loadChildren: () => import('../profile/profile.module').then(m => m.ProfilePageModule)
      },
      {
        path: 'mission',
        loadChildren: () => import('../mission/mission.module').then(m => m.MissionPageModule)
      },
      {
        path: 'messagerie',
        loadChildren: () => import('../messagerie/messagerie.module').then(m => m.MessageriePageModule)
      },
      {
        path: 'messageriefrree',
        loadChildren: () => import('../messageriefrree/messageriefrree.module').then(m => m.MessageriefrreePageModule)
      },
      {
        path: 'missions',
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
export class TabsLayoutPageRoutingModule {}
