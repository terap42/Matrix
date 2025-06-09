import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { ParametresPageRoutingModule } from './parametres-routing.module';
import { ParametresPage } from './parametres.page';

// Import des composants modaux
import { MissionDetailModalComponent } from './components/mission-detail-modal/mission-detail-modal.component';
import { DeleteMissionModalComponent } from './components/delete-mission-modal/delete-mission-modal.component';
import { EditMissionModalComponent } from './components/edit-mission-modal/edit-mission-modal.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ParametresPageRoutingModule
  ],
  declarations: [
    ParametresPage,
    MissionDetailModalComponent,
    DeleteMissionModalComponent,
    EditMissionModalComponent
  ]
})
export class ParametresPageModule {}

