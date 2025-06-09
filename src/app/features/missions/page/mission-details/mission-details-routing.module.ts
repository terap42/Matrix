import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MissionDetailsPage } from './mission-details.page';

const routes: Routes = [
  {
    path: '',
    component: MissionDetailsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MissionDetailsPageRoutingModule {}
