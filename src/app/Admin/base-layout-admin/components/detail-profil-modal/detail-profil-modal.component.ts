import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { AnimationController, IonicModule, ModalController } from '@ionic/angular';
import { IonContent, IonHeader } from "@ionic/angular/standalone";

@Component({
  selector: 'app-detail-profil-modal',
  templateUrl: './detail-profil-modal.component.html',
  styleUrls: ['./detail-profil-modal.component.scss'],
  imports: [IonicModule, CommonModule]
})
export class DetailProfilModalComponent  implements OnInit {

  @Input() profile: any;
  
  showPopup = false;
  showActions = false;
  isAdmin = true; // Selon votre logique d'application
  editMode = false;

  sections = [
    { icon: 'email', title: 'Email', value: 'dumont@entreprise.fr' },
    { icon: 'phone', title: 'Téléphone', value: '+33 6 12 34 56 78' },
    { icon: 'location', title: 'Localisation', value: 'Paris, France' },
    { icon: 'role', title: 'Rôle', value: 'Administrateur système' }
  ];

  constructor(private animationCtrl: AnimationController) {}

  ngOnInit() {
    // Si vous avez besoin de charger des données supplémentaires
  }

  togglePopup() {
    this.showPopup = !this.showPopup;
    
    if (this.showPopup) {
      // Réinitialiser le state du popup
      this.showActions = false;
    }
  }

  toggleActions() {
    this.showActions = !this.showActions;
  }

  toggleEditMode() {
    this.editMode = !this.editMode;
  }

  // Pour empêcher la fermeture lorsqu'on clique à l'intérieur du popup
  stopPropagation(event: Event) {
    event.stopPropagation();
  }
}
