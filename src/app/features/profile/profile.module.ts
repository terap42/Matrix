import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ProfilePageRoutingModule } from './profile-routing.module';

import { ProfilePage } from './profile.page';
import { ButtonComponent } from "../../shared/components/button/button.component";
import { ButtonDemoComponent } from "../../shared/components/button-demo/button-demo.component";
import { IconButtonDemoComponent } from 'src/app/shared/components/icon-button-demo/icon-button-demo.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ProfilePageRoutingModule,
    ButtonComponent,
    ButtonDemoComponent,
    IconButtonDemoComponent
],
  declarations: [ProfilePage]
})
export class ProfilePageModule {}
