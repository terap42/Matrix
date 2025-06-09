import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MessageriefrreePage } from './messageriefrree.page';

const routes: Routes = [
  {
    path: '',
    component: MessageriefrreePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MessageriefrreePageRoutingModule {}