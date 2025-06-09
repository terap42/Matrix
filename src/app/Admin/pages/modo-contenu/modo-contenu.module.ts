import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ModoContenuPageRoutingModule } from './modo-contenu-routing.module';

import { ModoContenuPage } from './modo-contenu.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ModoContenuPageRoutingModule
  ],
  declarations: [ModoContenuPage]
})
export class ModoContenuPageModule {}
