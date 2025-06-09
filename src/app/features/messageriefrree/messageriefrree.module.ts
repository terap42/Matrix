import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { MessageriefrreePageRoutingModule } from './messageriefrree-routing.module';
import { MessageriefrreePage } from './messageriefrree.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MessageriefrreePageRoutingModule
  ],
  declarations: [MessageriefrreePage]
})
export class MessageriefrreePageModule {}