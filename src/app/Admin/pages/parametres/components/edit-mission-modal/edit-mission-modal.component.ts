import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-edit-mission-modal',
  templateUrl: './edit-mission-modal.component.html',
  styleUrls: ['./edit-mission-modal.component.scss'],
  standalone: false,
})
export class EditMissionModalComponent implements OnInit {
  @Input() mission: any;
  
  editedMission: any = {};
  
  statusOptions = [
    { value: 'en_attente', label: 'En attente' },
    { value: 'en_cours', label: 'En cours' },
    { value: 'terminee', label: 'Terminée' },
    { value: 'annulee', label: 'Annulée' }
  ];

  constructor(private modalController: ModalController) {}

  ngOnInit() {
    this.editedMission = { ...this.mission };
  }

  close() {
    this.modalController.dismiss();
  }

  saveChanges() {
    // Ici vous ajouterez la logique Firebase
    console.log('Modification de la mission:', this.editedMission);
    
    this.modalController.dismiss({
      updated: true,
      mission: this.editedMission
    });
  }

  // Méthode pour formater la date pour l'input date
  getFormattedDate(date: any): string {
    if (!date) return '';
    
    const d = date instanceof Date ? date : new Date(date);
    
    if (isNaN(d.getTime())) return '';
    
    return d.toISOString().split('T')[0];
  }

  // Méthode pour mettre à jour la date deadline
  updateDeadline(dateString: string) {
    if (dateString) {
      this.editedMission.deadline = new Date(dateString);
    } else {
      this.editedMission.deadline = null;
    }
  }
}