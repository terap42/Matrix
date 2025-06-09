import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SettingsPageRoutingModule } from './settings-routing.module';

import { SettingsPage } from './settings.page';
import { BaseLayoutComponent } from "../../shared/components/base-layout/base-layout.component";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SettingsPageRoutingModule,
    BaseLayoutComponent
],
  declarations: [SettingsPage]
})
export class SettingsPageModule {}
