import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { IonContent, IonButton, IonIcon } from "@ionic/angular/standalone";
import { CampaignData } from '../../model/finances.type';
import { ButtonComponent } from "../../../../shared/components/button/button.component";

@Component({
  selector: 'app-detail-fonds',
  templateUrl: './detail-fonds.component.html',
  styleUrls: ['./detail-fonds.component.scss'],
  imports: [IonIcon, IonContent, CommonModule, ButtonComponent],
})
export class DetailFondsComponent  implements OnInit {

  @Input() campaign!: CampaignData;
  @Input() balance: number = 0;
  
  activeTab: string = 'Résumé';
  isFavorite: boolean = false;
  tabs: string[] = ['Résumé', 'Détails', 'Comité'];

  constructor(private modalCtrl: ModalController) { }

  ngOnInit() {}

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  toggleFavorite() {
    this.isFavorite = !this.isFavorite;
  }

  contribute() {
    // Logique de contribution
    console.log('Contribute button clicked');
  }

  dismissModal() {
    this.modalCtrl.dismiss();
  }

}
