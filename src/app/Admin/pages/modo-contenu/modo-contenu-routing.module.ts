import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ModoContenuPage } from './modo-contenu.page';

const routes: Routes = [
  {
    path: '',
    component: ModoContenuPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ModoContenuPageRoutingModule {}
