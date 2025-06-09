// src/app/admin/mission-management/mission-management.page.ts

import { Component, OnInit } from '@angular/core';
import { ModalController, AlertController, ToastController } from '@ionic/angular';
import { Mission, MissionStatus, MissionFilters } from './models/mission.interface';
import { MissionDetailModalComponent } from './components/mission-detail-modal/mission-detail-modal.component';
import { DeleteConfirmationModalComponent } from './components/delete-confirmation-modal/delete-confirmation-modal.component';

@Component({
  selector: 'app-mission-management',
  templateUrl: './mission-management.page.html',
  styleUrls: ['./mission-management.page.scss'],
  standalone: false,
})
export class MissionManagementPage implements OnInit {
  
  missions: Mission[] = [];
  filteredMissions: Mission[] = [];
  filters: MissionFilters = {};
  loading: boolean = false;
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalItems: number = 0;

  // Données statiques pour la démo
  mockMissions: Mission[] = [
    {
      id: '1',
      title: 'Développement d\'une application e-commerce',
      description: 'Création d\'une application mobile pour la vente en ligne avec paiement intégré',
      budget: 5000,
      currency: 'EUR',
      status: MissionStatus.PUBLISHED,
      category: 'Développement',
      clientId: 'client1',
      clientName: 'Jean Dupont',
      clientEmail: 'jean.dupont@email.com',
      skillsRequired: ['React Native', 'Node.js', 'MongoDB'],
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15'),
      deadline: new Date('2024-03-15'),
      applicationsCount: 12,
      isReported: false,
      priority: 'medium' as any
    },
    {
      id: '2',
      title: 'Design UI/UX pour site web',
      description: 'Refonte complète de l\'interface utilisateur d\'un site vitrine',
      budget: 2500,
      currency: 'EUR',
      status: MissionStatus.IN_PROGRESS,
      category: 'Design',
      clientId: 'client2',
      clientName: 'Marie Martin',
      clientEmail: 'marie.martin@email.com',
      freelancerId: 'freelancer1',
      freelancerName: 'Paul Designer',
      skillsRequired: ['Figma', 'Photoshop', 'HTML/CSS'],
      createdAt: new Date('2024-01-20'),
      updatedAt: new Date('2024-02-01'),
      deadline: new Date('2024-02-28'),
      applicationsCount: 8,
      isReported: true,
      reportReason: 'Contenu inapproprié',
      priority: 'high' as any
    },
    {
      id: '3',
      title: 'Rédaction d\'articles de blog',
      description: 'Rédaction de 10 articles de blog sur le thème du marketing digital',
      budget: 800,
      currency: 'EUR',
      status: MissionStatus.COMPLETED,
      category: 'Rédaction',
      clientId: 'client3',
      clientName: 'Pierre Commercant',
      clientEmail: 'pierre.commercant@email.com',
      freelancerId: 'freelancer2',
      freelancerName: 'Sophie Rédactrice',
      skillsRequired: ['SEO', 'Marketing', 'Rédaction web'],
      createdAt: new Date('2024-01-10'),
      updatedAt: new Date('2024-01-25'),
      deadline: new Date('2024-02-10'),
      applicationsCount: 15,
      isReported: false,
      priority: 'low' as any
    }
  ];

  constructor(
    private modalController: ModalController,
    private alertController: AlertController,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.loadMissions();
  }

  loadMissions() {
    this.loading = true;
    // Simulation d'un appel API
    setTimeout(() => {
      this.missions = [...this.mockMissions];
      this.applyFilters();
      this.loading = false;
    }, 1000);
  }

  applyFilters() {
    this.filteredMissions = this.missions.filter(mission => {
      let matches = true;

      if (this.filters.status && mission.status !== this.filters.status) {
        matches = false;
      }

      if (this.filters.category && mission.category !== this.filters.category) {
        matches = false;
      }

      if (this.filters.isReported !== undefined && mission.isReported !== this.filters.isReported) {
        matches = false;
      }

      if (this.filters.searchTerm) {
        const searchLower = this.filters.searchTerm.toLowerCase();
        matches = matches && (
          mission.title.toLowerCase().includes(searchLower) ||
          mission.clientName.toLowerCase().includes(searchLower) ||
          mission.description.toLowerCase().includes(searchLower)
        );
      }

      return matches;
    });

    this.totalItems = this.filteredMissions.length;
  }

  onFiltersChange(filters: MissionFilters) {
    this.filters = { ...filters };
    this.applyFilters();
    this.currentPage = 1;
  }

  async viewMissionDetail(mission: Mission) {
    const modal = await this.modalController.create({
      component: MissionDetailModalComponent,
      componentProps: {
        mission: mission
      },
      cssClass: 'mission-detail-modal'
    });

    modal.onDidDismiss().then((result) => {
      if (result.data?.action === 'updated') {
        this.loadMissions();
      }
    });

    return await modal.present();
  }

  async deleteMission(mission: Mission) {
    const modal = await this.modalController.create({
      component: DeleteConfirmationModalComponent,
      componentProps: {
        mission: mission
      },
      cssClass: 'delete-confirmation-modal'
    });

    modal.onDidDismiss().then(async (result) => {
      if (result.data?.confirmed) {
        await this.confirmDelete(mission);
      }
    });

    return await modal.present();
  }

  private async confirmDelete(mission: Mission) {
    // Simulation de suppression
    this.missions = this.missions.filter(m => m.id !== mission.id);
    this.applyFilters();

    const toast = await this.toastController.create({
      message: `Mission "${mission.title}" supprimée avec succès`,
      duration: 3000,
      color: 'success',
      position: 'top'
    });
    toast.present();
  }

  async toggleMissionStatus(mission: Mission) {
    const alert = await this.alertController.create({
      header: 'Changer le statut',
      message: `Voulez-vous changer le statut de "${mission.title}" ?`,
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel'
        },
        {
          text: 'Confirmer',
          handler: () => {
            // Logique de changement de statut
            const toast = this.toastController.create({
              message: 'Statut mis à jour',
              duration: 2000,
              color: 'success'
            });
            toast.then(t => t.present());
          }
        }
      ]
    });

    await alert.present();
  }

  getStatusColor(status: MissionStatus): string {
    const colors = {
      [MissionStatus.DRAFT]: 'bg-gray-100 text-gray-800',
      [MissionStatus.PUBLISHED]: 'bg-blue-100 text-blue-800',
      [MissionStatus.IN_PROGRESS]: 'bg-yellow-100 text-yellow-800',
      [MissionStatus.COMPLETED]: 'bg-green-100 text-green-800',
      [MissionStatus.CANCELLED]: 'bg-red-100 text-red-800',
      [MissionStatus.REPORTED]: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  }

  getStatusLabel(status: MissionStatus): string {
    const labels = {
      [MissionStatus.DRAFT]: 'Brouillon',
      [MissionStatus.PUBLISHED]: 'Publiée',
      [MissionStatus.IN_PROGRESS]: 'En cours',
      [MissionStatus.COMPLETED]: 'Terminée',
      [MissionStatus.CANCELLED]: 'Annulée',
      [MissionStatus.REPORTED]: 'Signalée'
    };
    return labels[status] || status;
  }

  getPaginatedMissions(): Mission[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredMissions.slice(start, end);
  }

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }

  // Méthode pour calculer le minimum (accessible depuis le template)
  getMinValue(a: number, b: number): number {
    return Math.min(a, b);
  }

  // Getter pour l'index de fin de pagination
  get endIndex(): number {
    return Math.min(this.currentPage * this.itemsPerPage, this.totalItems);
  }

  // Getter pour l'index de début de pagination
  get startIndex(): number {
    return (this.currentPage - 1) * this.itemsPerPage + 1;
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }
}