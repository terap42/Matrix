import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { FinancesPageRoutingModule } from './finances-routing.module';

import { FinancesPage } from './finances.page';
import { BaseLayoutComponent } from "../../shared/components/base-layout/base-layout.component";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FinancesPageRoutingModule,
    BaseLayoutComponent
],
  declarations: [FinancesPage]
})
export class FinancesPageModule {}
