import { Component, OnInit } from '@angular/core';
import { TabsService } from '../services/tabs.service';
import { IonicModule, ModalController } from '@ionic/angular';
import { RouterModule, Router } from '@angular/router';
import { ProfilModalComponent } from '../../profil-modal/profil-modal.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.scss'],
  imports: [IonicModule, RouterModule, CommonModule]
})
export class TabsComponent implements OnInit {
  activeTab: string = 'home';
  
  constructor(
    private navigationService: TabsService, 
    private modalCtrl: ModalController,
    public router: Router
  ) {}

  ngOnInit() {
    this.navigationService.activeTab$.subscribe(tab => {
      this.activeTab = tab;
    });
  }

  navigate(tab: string) {
    this.navigationService.setActiveTab(tab);
  }

  isActive(tab: string): boolean {
    return this.activeTab === tab;
  }

  // Méthode pour déterminer si on affiche les tabs visiteur
  hideVisisteurTab(): boolean {
    // Ajoutez votre logique ici
    // Par exemple, vérifier si l'utilisateur est connecté
    // return this.authService.isLoggedIn();
    return true; 
  }

  async openUserProfileModal() {
    const modal = await this.modalCtrl.create({
      component: ProfilModalComponent,
      cssClass: 'profil-modal'
    });
    return await modal.present();
  }

  isOnDetailsPage(): boolean {
    return this.router.url.includes('/missions/mission-details');
  }
}
