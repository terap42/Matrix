import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';


import { TabsLayoutPageRoutingModule } from './tabs-layout-routing.module';

import { TabsLayoutPage } from './tabs-layout.page';
import { TabsComponent } from '../tabs/components/tabs.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TabsLayoutPageRoutingModule,
    TabsComponent,
    
  ],
  declarations: [TabsLayoutPage]
})
export class TabsLayoutPageModule {}
