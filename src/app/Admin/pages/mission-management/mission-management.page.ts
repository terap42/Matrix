// src/app/admin/mission-management/mission-management.page.ts - Version dynamique intégrée

import { Component, OnInit, OnDestroy } from '@angular/core';
import { ModalController, AlertController, ToastController, LoadingController } from '@ionic/angular';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { 
  MissionService, 
  Mission, 
  MissionFilters, 
  MissionListResponse,
  MissionStats 
} from './service/mission.service';

@Component({
  selector: 'app-mission-management',
  templateUrl: './mission-management.page.html',
  styleUrls: ['./mission-management.page.scss'],
  standalone: false,
})
export class MissionManagementPage implements OnInit, OnDestroy {
  
  // Données des missions
  missions: Mission[] = [];
  filteredMissions: Mission[] = [];
  stats: MissionStats | null = null;
  
  // État de chargement
  loading: boolean = false;
  initialLoading: boolean = true;
  
  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalItems: number = 0;
  totalPages: number = 0;
  
  // Filtres
  filters: MissionFilters = {
    page: 1,
    limit: 10,
    sortBy: 'created_at',
    sortOrder: 'DESC'
  };
  
  // Options pour les filtres
  categories: string[] = [];
  statusOptions = [
    { value: '', label: 'Tous les statuts' },
    { value: 'open', label: 'Ouvertes' },
    { value: 'in_progress', label: 'En cours' },
    { value: 'completed', label: 'Terminées' },
    { value: 'cancelled', label: 'Annulées' }
  ];
  
  private destroy$ = new Subject<void>();

  constructor(
    private modalController: ModalController,
    private alertController: AlertController,
    private toastController: ToastController,
    private loadingController: LoadingController,
    private missionService: MissionService
  ) {
    console.log('🚀 MissionManagementPage initialisé');
  }

  ngOnInit() {
    console.log('🔄 Initialisation de la page');
    this.initializePage();
  }

  ngOnDestroy() {
    console.log('🛑 Destruction de la page');
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Initialisation complète de la page
  private async initializePage() {
    try {
      // Test de connexion API
      this.missionService.checkConnection()
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            console.log('✅ API connectée, chargement des données');
            this.loadInitialData();
          },
          error: (error) => {
            console.error('❌ Connexion API échouée:', error);
            this.showErrorToast('Impossible de se connecter au serveur');
            this.initialLoading = false;
          }
        });

      // S'abonner aux mises à jour
      this.subscribeToUpdates();
      
      // Charger les catégories
      this.loadCategories();
      
    } catch (error) {
      console.error('❌ Erreur initialisation:', error);
      this.initialLoading = false;
    }
  }

  // Charger les données initiales
  private loadInitialData() {
    Promise.all([
      this.loadMissionsPromise(),
      this.loadStatsPromise()
    ]).then(() => {
      this.initialLoading = false;
      console.log('✅ Données initiales chargées');
    }).catch(() => {
      this.initialLoading = false;
    });
  }

  // S'abonner aux mises à jour en temps réel
  private subscribeToUpdates() {
    this.missionService.missionsUpdated$
      .pipe(takeUntil(this.destroy$))
      .subscribe(updated => {
        if (updated) {
          console.log('🔄 Mise à jour détectée, rechargement...');
          this.loadMissions();
          this.loadStats();
        }
      });
  }

  // Charger les catégories
  private loadCategories() {
    this.missionService.getMissionCategories()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (categories) => {
          this.categories = categories;
          console.log('✅ Catégories chargées:', categories.length);
        },
        error: (error) => {
          console.error('❌ Erreur chargement catégories:', error);
        }
      });
  }

  // Charger les missions depuis l'API
  loadMissions() {
    if (this.loading) return;
    
    this.loading = true;
    console.log('📋 Chargement missions avec filtres:', this.filters);
    
    const requestFilters: MissionFilters = {
      ...this.filters,
      page: this.currentPage,
      limit: this.itemsPerPage
    };

    this.missionService.getMissions(requestFilters)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.loading = false)
      )
      .subscribe({
        next: (response: MissionListResponse) => {
          this.missions = response.missions;
          this.filteredMissions = response.missions;
          this.totalItems = response.pagination.totalItems;
          this.totalPages = response.pagination.totalPages;
          this.currentPage = response.pagination.currentPage;
          
          console.log(`✅ ${response.missions.length} missions chargées`);
        },
        error: (error) => {
          console.error('❌ Erreur chargement missions:', error);
          this.showErrorToast('Erreur lors du chargement des missions');
        }
      });
  }

  // Version Promise pour le chargement initial
  private loadMissionsPromise(): Promise<void> {
    return new Promise((resolve, reject) => {
      const requestFilters: MissionFilters = {
        ...this.filters,
        page: this.currentPage,
        limit: this.itemsPerPage
      };

      this.missionService.getMissions(requestFilters)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            this.missions = response.missions;
            this.filteredMissions = response.missions;
            this.totalItems = response.pagination.totalItems;
            this.totalPages = response.pagination.totalPages;
            this.currentPage = response.pagination.currentPage;
            resolve();
          },
          error: (error) => {
            console.error('❌ Erreur chargement missions:', error);
            reject(error);
          }
        });
    });
  }

  // Charger les statistiques
  loadStats() {
    this.missionService.getMissionStats()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (stats) => {
          this.stats = stats;
          console.log('✅ Statistiques chargées:', stats);
        },
        error: (error) => {
          console.error('❌ Erreur chargement stats:', error);
        }
      });
  }

  // Version Promise pour le chargement initial
  private loadStatsPromise(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.missionService.getMissionStats()
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (stats) => {
            this.stats = stats;
            resolve();
          },
          error: reject
        });
    });
  }

  // Appliquer les filtres
  onFiltersChange(newFilters: any) {
    console.log('🔍 Nouveaux filtres appliqués:', newFilters);
    this.filters = { ...this.filters, ...newFilters };
    this.currentPage = 1; // Reset à la première page
    this.loadMissions();
  }

  // Recherche textuelle
  onSearchChange(searchTerm: string) {
    console.log('🔍 Recherche:', searchTerm);
    this.filters.search = searchTerm || undefined;
    this.currentPage = 1;
    this.loadMissions();
  }

  // Voir les détails d'une mission
  async viewMissionDetail(mission: Mission) {
    console.log('👁️ Affichage détails mission:', mission.id);
    
    const alert = await this.alertController.create({
      header: mission.title,
      message: `
        <div class="mission-detail">
          <p><strong>Description:</strong><br>${mission.description}</p>
          <p><strong>Client:</strong> ${mission.clientName}</p>
          <p><strong>Budget:</strong> ${mission.budget} ${mission.currency}</p>
          <p><strong>Statut:</strong> ${this.missionService.getStatusLabel(mission.status)}</p>
          <p><strong>Candidatures:</strong> ${mission.applicationsCount}</p>
          <p><strong>Compétences:</strong> ${mission.skillsRequired.join(', ')}</p>
          ${mission.deadline ? `<p><strong>Échéance:</strong> ${new Date(mission.deadline).toLocaleDateString()}</p>` : ''}
          ${mission.isReported ? `<p><strong>⚠️ Signalée:</strong> ${mission.reportReason}</p>` : ''}
        </div>
      `,
      buttons: ['Fermer'],
      cssClass: 'mission-detail-alert'
    });
    
    await alert.present();
  }

  // Supprimer une mission
  async deleteMission(mission: Mission) {
    console.log('🗑️ Demande suppression mission:', mission.id);
    
    const alert = await this.alertController.create({
      header: 'Confirmer la suppression',
      message: `Êtes-vous sûr de vouloir supprimer la mission "${mission.title}" ?`,
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel'
        },
        {
          text: 'Supprimer',
          handler: () => {
            this.confirmDelete(mission);
          }
        }
      ]
    });

    await alert.present();
  }

  // Confirmer la suppression
  private async confirmDelete(mission: Mission) {
    const loading = await this.loadingController.create({
      message: 'Suppression en cours...'
    });
    await loading.present();

    this.missionService.deleteMission(mission.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          loading.dismiss();
          this.showSuccessToast(`Mission "${mission.title}" supprimée avec succès`);
          this.loadMissions();
          this.loadStats();
        },
        error: (error) => {
          loading.dismiss();
          console.error('❌ Erreur suppression:', error);
          this.showErrorToast('Erreur lors de la suppression');
        }
      });
  }

  // Changer le statut d'une mission
  async toggleMissionStatus(mission: Mission) {
    console.log('🔄 Changement statut mission:', mission.id);
    
    const alert = await this.alertController.create({
      header: 'Changer le statut',
      message: `Choisissez le nouveau statut pour "${mission.title}"`,
      inputs: [
        {
          name: 'status',
          type: 'radio',
          label: 'Ouverte',
          value: 'open',
          checked: mission.status === 'open'
        },
        {
          name: 'status',
          type: 'radio',
          label: 'En cours',
          value: 'in_progress',
          checked: mission.status === 'in_progress'
        },
        {
          name: 'status',
          type: 'radio',
          label: 'Terminée',
          value: 'completed',
          checked: mission.status === 'completed'
        },
        {
          name: 'status',
          type: 'radio',
          label: 'Annulée',
          value: 'cancelled',
          checked: mission.status === 'cancelled'
        }
      ],
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel'
        },
        {
          text: 'Confirmer',
          handler: (data) => {
            if (data && data !== mission.status) {
              this.updateMissionStatus(mission.id, data);
            }
          }
        }
      ]
    });

    await alert.present();
  }

  // Mettre à jour le statut
  private updateMissionStatus(missionId: string, status: string) {
    this.missionService.updateMissionStatus(missionId, status)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.showSuccessToast('Statut mis à jour avec succès');
          this.loadMissions();
          this.loadStats();
        },
        error: (error) => {
          console.error('❌ Erreur changement statut:', error);
          this.showErrorToast('Erreur lors du changement de statut');
        }
      });
  }

  // Navigation pagination
  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadMissions();
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadMissions();
    }
  }

  // Actualiser les données
  async refreshData() {
    console.log('🔄 Actualisation des données');
    this.missionService.refreshData();
  }

  // Méthodes utilitaires pour l'affichage
  getStatusColor(status: string): string {
    return this.missionService.getStatusColor(status);
  }

  getStatusLabel(status: string): string {
    return this.missionService.getStatusLabel(status);
  }

  getPaginatedMissions(): Mission[] {
    return this.filteredMissions;
  }

  get endIndex(): number {
    return Math.min(this.currentPage * this.itemsPerPage, this.totalItems);
  }

  get startIndex(): number {
    return this.totalItems > 0 ? (this.currentPage - 1) * this.itemsPerPage + 1 : 0;
  }

  // Méthodes pour les toasts
  private async showSuccessToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      color: 'success',
      position: 'top',
      buttons: [
        {
          text: 'Fermer',
          role: 'cancel'
        }
      ]
    });
    await toast.present();
  }

  private async showErrorToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 5000,
      color: 'danger',
      position: 'top',
      buttons: [
        {
          text: 'Fermer',
          role: 'cancel'
        }
      ]
    });
    await toast.present();
  }
}