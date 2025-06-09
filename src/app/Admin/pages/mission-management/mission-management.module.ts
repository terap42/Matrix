import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { MissionManagementPageRoutingModule } from './mission-management-routing.module';
import { MissionManagementPage } from './mission-management.page';
import { MissionFiltersComponent } from '../mission-management/components/mission-filters/mission-filters.component';
import {MissionDetailModalComponent} from '../mission-management/components/mission-detail-modal/mission-detail-modal.component';
import {DeleteConfirmationModalComponent} from '../mission-management/components/delete-confirmation-modal/delete-confirmation-modal.component'


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MissionManagementPageRoutingModule
  ],
  declarations: [
    MissionManagementPage,
    MissionFiltersComponent,
    MissionDetailModalComponent,
     DeleteConfirmationModalComponent,
  ]
})
export class MissionManagementPageModule {}