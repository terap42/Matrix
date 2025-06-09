import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-delete-mission-modal',
  templateUrl: './delete-mission-modal.component.html',
  styleUrls: ['./delete-mission-modal.component.scss'],
  standalone: false,
})
export class DeleteMissionModalComponent {
  @Input() mission: any;
  deleteReason: string = '';
  notifyUsers: boolean = true;

  constructor(private modalController: ModalController) {}

  close() {
    this.modalController.dismiss();
  }

  confirmDelete() {
    // Ici vous ajouterez la logique Firebase
    console.log('Suppression de la mission:', this.mission.id);
    console.log('Raison:', this.deleteReason);
    console.log('Notifier les utilisateurs:', this.notifyUsers);
    
    this.modalController.dismiss({
      deleted: true,
      mission: this.mission,
      reason: this.deleteReason,
      notify: this.notifyUsers
    });
  }
}