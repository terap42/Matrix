import { Component, OnInit } from '@angular/core';
import { CampaignData } from './model/finances.type';
import { DetailFondsService } from './services/detail-fonds.service';
import { ModalController } from '@ionic/angular';
import { ContributionStoryComponent } from './components/contribution-story/contribution-story.component';

@Component({
  selector: 'app-finances',
  templateUrl: './finances.page.html',
  styleUrls: ['./finances.page.scss'],
  standalone: false,
})
export class FinancesPage implements OnInit {

  showContributionAmount = false;
  showBalanceAmount = false;
  zakatProgress = 75; // Pourcentage pour le cercle de progression

  constructor(private detailFondsService: DetailFondsService, private modalController: ModalController) { }

  toggleContributionVisibility() {
    this.showContributionAmount = !this.showContributionAmount;
  }

  toggleBalanceVisibility() {
    this.showBalanceAmount = !this.showBalanceAmount;
  }

  contributionAmount: number = 234000;
  contributionPercentage: number = 75;

  // Données pour le solde
  balance: number = 75000;

  // Données pour le Zakat Tracker
  zakatAmount: number = 180000;
  zakatTarget: number = 350000;
  zakatPercentage: number = Math.round((this.zakatAmount / this.zakatTarget) * 100);

  // Données pour les levées de fonds
  fundraisings = [
    {
      title: 'Mosquée Medina Baye',
      amount: 123000000,
      target: 300000000,
      contributions: 1240,
      percentage: 35
    },
    {
      title: 'Musée Cheikh Al Islami',
      amount: 45000000,
      target: 70000000,
      contributions: 340,
      percentage: 65
    },
    {
      title: 'Daara Serigne Touba',
      amount: 45000000,
      target: 65000000,
      contributions: 340,
      percentage: 70
    }
  ];

  // Données pour l'historique des contributions
  contributionHistory = [
    {
      amount: 50000,
      description: 'Rénovation Mosquée Medina Baye',
      method: 'Orange Money',
      date: '20 Octobre 2024 à 20:31',
      type: 'outgoing'
    }
    // Vous pouvez ajouter d'autres entrées historiques ici
  ];


  ngOnInit() {
    // Initialisation ou récupération des données depuis un service
    this.openContributionStory();
  }

  // Méthode pour formater les nombres avec espacement des milliers
  formatNumber(num: number): string {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  }

  // Autres méthodes pour votre application
  addFunds() {
    console.log('Ajouter des fonds');
    // Logique pour ajouter des fonds
  }

  refreshBalance() {
    console.log('Rafraîchir le solde');
    // Logique pour rafraîchir le solde
  }

  refreshContributions() {
    console.log('Rafraîchir les contributions');
    // Logique pour rafraîchir les contributions
  }

  openCampaignModal() {
    const campaignData: CampaignData = {
      id: '1',
      title: 'Rénovation Mosquée Medina Baye',
      organization: 'Association des Talibé Baye du Sénégal',
      description: `Le chef religieux, Cissé Niang, soulignant la dimension internationale 
            du Gamou de Medina Baye, a affirmé que l'esplanade de la grande 
            mosquée, nouvellement construite, va donner une image plus 
            reluisante à cette cité religieuse fondée par Cheikh Al Islam El Hadji 
            Ibrahima Niass dit Baye`,
      currentAmount: 180000,
      targetAmount: 350000,
      percentageCollected: 48,
      contributors: 245,
      daysRemaining: 250,
      imageUrl: 'assets/images/1.png'
    };

    this.detailFondsService.openCampaignModal(campaignData);
  }

  async openContributionStory() {
      const modal = await this.modalController.create({
        component: ContributionStoryComponent,
        initialBreakpoint: 0.2,
        breakpoints: [0, 0.4, 0.6, 0.9],
        cssClass: 'comment-modal'
      });
  
      return await modal.present();
    }
}
