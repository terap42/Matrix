import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
import { TabsService } from '../tabs/services/tabs.service';
import { IconButtonComponent } from "../../shared/components/icon-button/icon-button.component";
import { ButtonComponent } from "../../shared/components/button/button.component";

@Component({
  selector: 'app-profil-modal',
  templateUrl: './profil-modal.component.html',
  styleUrls: ['./profil-modal.component.scss'],
  imports: [IonicModule, CommonModule, IconButtonComponent, ButtonComponent],
})
export class ProfilModalComponent  implements OnInit {
  
  constructor(private modalCtrl: ModalController, private navigationService: TabsService) {}

  ngOnInit(): void {
  }

  dismiss() {
    this.modalCtrl.dismiss();
    this.navigationService.setActiveTab("login");
  }
  
  // Méthodes pour rendre la modale interactive si nécessaire
  openPaymentMethods() {
    console.log('Ouverture des méthodes de paiement');
    // Implémentation pour ouvrir les méthodes de paiement
  }
  
  openActivities() {
    console.log('Ouverture des activités');
    // Implémentation pour ouvrir les activités
  }
  
  changePassword() {
    console.log('Changement de mot de passe');
    // Implémentation pour changer le mot de passe
  }
  
  logout() {
    console.log('Déconnexion');
    this.dismiss();
    // Implémentation pour la déconnexion
  }
}
