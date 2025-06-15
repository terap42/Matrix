import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FreelanceProfilePage } from './freelance-profile.page';

const routes: Routes = [
  {
    path: '',
    component: FreelanceProfilePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FreelanceProfilePageRoutingModule {}
