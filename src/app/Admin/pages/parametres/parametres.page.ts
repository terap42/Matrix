import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { MissionDetailModalComponent } from './components/mission-detail-modal/mission-detail-modal.component';
import { DeleteMissionModalComponent } from './components/delete-mission-modal/delete-mission-modal.component';
import { EditMissionModalComponent } from './components/edit-mission-modal/edit-mission-modal.component';

interface Mission {
  id: string;
  title: string;
  client: string;
  freelancer?: string;
  budget: number;
  status: 'en_attente' | 'en_cours' | 'terminee' | 'annulee';
  category: string;
  createdAt: Date;
  deadline: Date;
  description: string;
  skills: string[];
  signaled: boolean;
}

@Component({
  selector: 'app-parametres',
  templateUrl: './parametres.page.html',
  styleUrls: ['./parametres.page.scss'],
  standalone: false,
})
export class ParametresPage implements OnInit {

  // Propriété Math pour l'utiliser dans le template
  Math = Math;

  missions: Mission[] = [];
  filteredMissions: Mission[] = [];
  searchTerm: string = '';
  selectedStatus: string = 'all';
  selectedCategory: string = 'all';
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 1;

  statusOptions = [
    { value: 'all', label: 'Tous les statuts' },
    { value: 'en_attente', label: 'En attente' },
    { value: 'en_cours', label: 'En cours' },
    { value: 'terminee', label: 'Terminée' },
    { value: 'annulee', label: 'Annulée' }
  ];

  categoryOptions = [
    { value: 'all', label: 'Toutes les catégories' },
    { value: 'design', label: 'Design & Créatif' },
    { value: 'development', label: 'Développement' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'redaction', label: 'Rédaction' },
    { value: 'audiovisuel', label: 'Audiovisuel' },
    { value: 'consulting', label: 'Consulting' }
  ];

  constructor(private modalController: ModalController) { }

  ngOnInit() {
    this.loadMissions();
  }

  loadMissions() {
    // Données statiques pour le moment
    this.missions = [
      {
        id: '1',
        title: 'Création d\'une application mobile',
        client: 'TechCorp',
        freelancer: 'John Doe',
        budget: 5000,
        status: 'en_cours',
        category: 'development',
        createdAt: new Date('2024-01-15'),
        deadline: new Date('2024-03-15'),
        description: 'Développement d\'une application mobile cross-platform...',
        skills: ['React Native', 'Firebase', 'UI/UX'],
        signaled: false
      },
      {
        id: '2',
        title: 'Refonte graphique site web',
        client: 'StartupXYZ',
        budget: 2500,
        status: 'en_attente',
        category: 'design',
        createdAt: new Date('2024-02-01'),
        deadline: new Date('2024-02-28'),
        description: 'Refonte complète de l\'identité visuelle...',
        skills: ['Photoshop', 'Figma', 'HTML/CSS'],
        signaled: true
      },
      {
        id: '3',
        title: 'Stratégie SEO e-commerce',
        client: 'ShopOnline',
        freelancer: 'Marie Martin',
        budget: 1800,
        status: 'terminee',
        category: 'marketing',
        createdAt: new Date('2024-01-10'),
        deadline: new Date('2024-02-10'),
        description: 'Optimisation SEO pour boutique en ligne...',
        skills: ['SEO', 'Analytics', 'Content Marketing'],
        signaled: false
      }
    ];
    this.applyFilters();
  }

  applyFilters() {
    this.filteredMissions = this.missions.filter(mission => {
      const matchesSearch = mission.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                           mission.client.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesStatus = this.selectedStatus === 'all' || mission.status === this.selectedStatus;
      const matchesCategory = this.selectedCategory === 'all' || mission.category === this.selectedCategory;
      
      return matchesSearch && matchesStatus && matchesCategory;
    });
    
    this.totalPages = Math.ceil(this.filteredMissions.length / this.itemsPerPage);
    this.currentPage = 1;
  }

  getPaginatedMissions() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredMissions.slice(startIndex, endIndex);
  }

  getStatusLabel(status: string): string {
    const statusMap: { [key: string]: string } = {
      'en_attente': 'En attente',
      'en_cours': 'En cours',
      'terminee': 'Terminée',
      'annulee': 'Annulée'
    };
    return statusMap[status] || status;
  }

  getStatusColor(status: string): string {
    const colorMap: { [key: string]: string } = {
      'en_attente': 'bg-yellow-100 text-yellow-800',
      'en_cours': 'bg-blue-100 text-blue-800',
      'terminee': 'bg-green-100 text-green-800',
      'annulee': 'bg-red-100 text-red-800'
    };
    return colorMap[status] || 'bg-gray-100 text-gray-800';
  }

  async viewMission(mission: Mission) {
    const modal = await this.modalController.create({
      component: MissionDetailModalComponent,
      componentProps: {
        mission: mission
      }
    });
    return await modal.present();
  }

  async editMission(mission: Mission) {
    const modal = await this.modalController.create({
      component: EditMissionModalComponent,
      componentProps: {
        mission: mission
      }
    });
    
    modal.onDidDismiss().then((result) => {
      if (result.data && result.data.updated) {
        this.loadMissions(); // Recharger les données
      }
    });
    
    return await modal.present();
  }

  async deleteMission(mission: Mission) {
    const modal = await this.modalController.create({
      component: DeleteMissionModalComponent,
      componentProps: {
        mission: mission
      }
    });
    
    modal.onDidDismiss().then((result) => {
      if (result.data && result.data.deleted) {
        this.loadMissions(); // Recharger les données
      }
    });
    
    return await modal.present();
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  goToPage(page: number) {
    this.currentPage = page;
  }

  getPaginationPages(): number[] {
    const pages: number[] = [];
    const start = Math.max(1, this.currentPage - 2);
    const end = Math.min(this.totalPages, this.currentPage + 2);
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }
}