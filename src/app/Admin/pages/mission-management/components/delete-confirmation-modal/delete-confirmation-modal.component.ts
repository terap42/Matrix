// src/app/admin/mission-management/components/delete-confirmation-modal/delete-confirmation-modal.component.ts

import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Mission } from '../../models/mission.interface';

@Component({
  selector: 'app-delete-confirmation-modal',
  templateUrl: './delete-confirmation-modal.component.html',
  styleUrls: ['./delete-confirmation-modal.component.scss'],
  standalone: false,
})
export class DeleteConfirmationModalComponent implements OnInit {

  @Input() mission!: Mission;
  
  confirmationChecked: boolean = false;

  constructor(
    private modalController: ModalController
  ) {}

  ngOnInit() {
    // Vérifications d'initialisation si nécessaire
  }

  dismiss() {
    this.modalController.dismiss({
      confirmed: false
    });
  }

  confirmDelete() {
    if (this.confirmationChecked) {
      this.modalController.dismiss({
        confirmed: true,
        mission: this.mission
      });
    }
  }
}