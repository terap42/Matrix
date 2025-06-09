import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FinancesPage } from './finances.page';

const routes: Routes = [
  {
    path: '',
    component: FinancesPage
  },
  // {
  //   path: 'detail-fonds',
  //   loadChildren: () => import('./components/detail-fonds/detail-fonds.module').then( m => m.DetailFondsPageModule)
  // }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FinancesPageRoutingModule {}
