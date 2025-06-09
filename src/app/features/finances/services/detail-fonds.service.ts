import { Injectable } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { CampaignData } from '../model/finances.type';
import { DetailFondsComponent } from '../components/detail-fonds/detail-fonds.component';

@Injectable({
  providedIn: 'root'
})
export class DetailFondsService {

  constructor(private modalCtrl: ModalController) { }

  async openCampaignModal(campaignData: CampaignData) {
    const modal = await this.modalCtrl.create({
      component: DetailFondsComponent,
      componentProps: {
        campaign: campaignData,
        balance: 75000 // Normalement ceci serait récupéré depuis un service d'utilisateur
      },
      // breakpoints: [0, 0.4, 0.6, 0.9],
      initialBreakpoint: 0.9,
      backdropDismiss: true,
      showBackdrop: true,
      cssClass: 'campaign-modal'
    });

    return await modal.present();
  }
}
