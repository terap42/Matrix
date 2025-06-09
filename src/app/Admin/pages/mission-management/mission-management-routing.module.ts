import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MissionManagementPage } from './mission-management.page';

const routes: Routes = [
  {
    path: '',
    component: MissionManagementPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MissionManagementPageRoutingModule {}
