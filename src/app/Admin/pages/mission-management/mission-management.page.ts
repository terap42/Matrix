// src/app/admin/mission-management/mission-management.page.ts - Version finale corrigée

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
  
  // Données des missions - Initialisées pour éviter les warnings
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

  // MÉTHODE CORRIGÉE - Charger les missions depuis l'API
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
        next: (response: any) => {
          console.log('📦 Réponse complète reçue:', response);
          
          // VÉRIFICATION ET CORRECTION DE LA STRUCTURE
          if (!response) {
            console.error('❌ Réponse vide');
            this.missions = [];
            this.filteredMissions = [];
            this.totalItems = 0;
            this.totalPages = 0;
            return;
          }

          // Cas 1: La réponse est directement un tableau de missions
          if (Array.isArray(response)) {
            console.log('📋 Réponse = tableau direct');
            this.missions = response;
            this.filteredMissions = response;
            this.totalItems = response.length;
            this.totalPages = Math.ceil(response.length / this.itemsPerPage);
            this.currentPage = 1;
          }
          // Cas 2: La réponse a une structure avec missions
          else if (response.missions) {
            console.log('📋 Réponse = objet avec missions');
            this.missions = response.missions;
            this.filteredMissions = response.missions;
            this.totalItems = response.pagination?.totalItems || response.missions.length;
            this.totalPages = response.pagination?.totalPages || Math.ceil(this.totalItems / this.itemsPerPage);
            this.currentPage = response.pagination?.currentPage || 1;
          }
          // Cas 3: La réponse a une structure avec data
          else if (response.data) {
            console.log('📋 Réponse = objet avec data');
            this.missions = Array.isArray(response.data) ? response.data : response.data.missions || [];
            this.filteredMissions = this.missions;
            this.totalItems = response.data.total || response.data.pagination?.totalItems || this.missions.length;
            this.totalPages = response.data.pagination?.totalPages || Math.ceil(this.totalItems / this.itemsPerPage);
            this.currentPage = response.data.pagination?.currentPage || 1;
          }
          // Cas 4: Structure inconnue
          else {
            console.error('❌ Structure de réponse inconnue:', response);
            this.missions = [];
            this.filteredMissions = [];
            this.totalItems = 0;
            this.totalPages = 0;
          }
          
          console.log(`✅ ${this.missions.length} missions chargées, Total: ${this.totalItems}`);
        },
        error: (error) => {
          console.error('❌ Erreur chargement missions:', error);
          this.showErrorToast('Erreur lors du chargement des missions');
          
          // Réinitialiser en cas d'erreur
          this.missions = [];
          this.filteredMissions = [];
          this.totalItems = 0;
          this.totalPages = 0;
        }
      });
  }

  // MÉTHODE CORRIGÉE - Version Promise pour le chargement initial
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
          next: (response: any) => {
            console.log('📦 Promise - Réponse reçue:', response);
            
            if (!response) {
              this.missions = [];
              this.filteredMissions = [];
              this.totalItems = 0;
              this.totalPages = 0;
              resolve();
              return;
            }

            if (Array.isArray(response)) {
              this.missions = response;
              this.filteredMissions = response;
              this.totalItems = response.length;
              this.totalPages = Math.ceil(response.length / this.itemsPerPage);
              this.currentPage = 1;
            } else if (response.missions) {
              this.missions = response.missions;
              this.filteredMissions = response.missions;
              this.totalItems = response.pagination?.totalItems || response.missions.length;
              this.totalPages = response.pagination?.totalPages || Math.ceil(this.totalItems / this.itemsPerPage);
              this.currentPage = response.pagination?.currentPage || 1;
            } else if (response.data) {
              this.missions = Array.isArray(response.data) ? response.data : response.data.missions || [];
              this.filteredMissions = this.missions;
              this.totalItems = response.data.total || response.data.pagination?.totalItems || this.missions.length;
              this.totalPages = response.data.pagination?.totalPages || Math.ceil(this.totalItems / this.itemsPerPage);
              this.currentPage = response.data.pagination?.currentPage || 1;
            } else {
              this.missions = [];
              this.filteredMissions = [];
              this.totalItems = 0;
              this.totalPages = 0;
            }
            
            resolve();
          },
          error: (error) => {
            console.error('❌ Promise - Erreur chargement missions:', error);
            this.missions = [];
            this.filteredMissions = [];
            this.totalItems = 0;
            this.totalPages = 0;
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

  // MÉTHODE DE DEBUG CORRIGÉE - Tester directement le service
  debugMissionService() {
    console.log('🔍 Test direct du service...');
    
    this.missionService.getMissions({
      page: 1,
      limit: 10,
      sortBy: 'created_at',
      sortOrder: 'DESC'
    }).subscribe({
      next: (response) => {
        console.log('🔍 Debug - Type de response:', typeof response);
        console.log('🔍 Debug - Response est array:', Array.isArray(response));
        console.log('🔍 Debug - Response complète:', response);
        console.log('🔍 Debug - Clés de response:', response ? Object.keys(response) : 'undefined');
        
        if (response && typeof response === 'object' && !Array.isArray(response)) {
          // Correction du typage pour éviter l'erreur TS7053
          const responseObj = response as { [key: string]: any };
          Object.keys(responseObj).forEach(key => {
            console.log(`🔍 Debug - ${key}:`, responseObj[key]);
          });
        }
      },
      error: (error) => {
        console.error('🔍 Debug - Erreur:', error);
      }
    });
  }

  // Debug pour analyser le budget
  debugMissionBudget(mission: Mission) {
    console.log('🔍 === DEBUG MISSION BUDGET ===');
    console.log('🔍 Mission complète:', mission);
    console.log('🔍 Budget value:', mission.budget);
    console.log('🔍 Budget type:', typeof mission.budget);
    console.log('🔍 Budget JSON:', JSON.stringify(mission.budget));
    console.log('🔍 Currency:', mission.currency);
    console.log('🔍 Currency type:', typeof mission.currency);
    console.log('🔍 === FIN DEBUG ===');
  }

  // Méthode utilitaire pour formater le budget
  private formatBudget(budget: any, currency: string = 'EUR'): string {
    // Debug du budget
    console.log('💰 Formatage budget:', { budget, currency, type: typeof budget });
    
    // Si budget est null ou undefined
    if (budget === null || budget === undefined) {
      return 'Budget non défini';
    }
    
    // Si budget est déjà un nombre
    if (typeof budget === 'number') {
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: currency
      }).format(budget);
    }
    
    // Si budget est une string
    if (typeof budget === 'string') {
      const numBudget = parseFloat(budget);
      if (!isNaN(numBudget)) {
        return new Intl.NumberFormat('fr-FR', {
          style: 'currency',
          currency: currency
        }).format(numBudget);
      }
      return budget + ' ' + currency;
    }
    
    // Si budget est un objet
    if (typeof budget === 'object') {
      console.log('🔍 Budget est un objet:', budget);
      
      // Essayer différentes propriétés communes
      const possibleKeys = ['amount', 'value', 'budget', 'price', 'cost', 'sum', 'total'];
      
      for (const key of possibleKeys) {
        if (budget[key] !== undefined && budget[key] !== null) {
          const value = budget[key];
          if (typeof value === 'number') {
            return new Intl.NumberFormat('fr-FR', {
              style: 'currency',
              currency: currency
            }).format(value);
          }
          if (typeof value === 'string') {
            const numValue = parseFloat(value);
            if (!isNaN(numValue)) {
              return new Intl.NumberFormat('fr-FR', {
                style: 'currency',
                currency: currency
              }).format(numValue);
            }
          }
        }
      }
      
      // Si range de budget (min/max)
      if (budget.min !== undefined && budget.max !== undefined) {
        return `${budget.min} - ${budget.max} ${currency}`;
      }
      
      // Si on ne trouve rien, afficher l'objet stringifié pour debug
      return `Budget complexe: ${JSON.stringify(budget)}`;
    }
    
    // Fallback
    return 'Budget non défini';
  }

  // MÉTHODE DE TEST CORRIGÉE - Charger des missions de test avec types corrects
  loadTestMissions() {
    console.log('🧪 Chargement de missions de test...');
    
    const testMissions: Mission[] = [
      {
        id: 'test-1',
        title: 'Mission de test 1',
        description: 'Description de test pour la première mission',
        category: 'Développement Web',
        clientId: 'client-test-1',
        clientName: 'Client Test',
        clientEmail: 'client.test@example.com',
        budget: 1000,
        currency: 'EUR',
        status: 'open',
        priority: 'medium',
        applicationsCount: 5,
        skillsRequired: ['JavaScript', 'Angular', 'TypeScript'],
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        isReported: false,
        reportReason: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'test-2',
        title: 'Mission de test 2',
        description: 'Autre description de test pour la deuxième mission',
        category: 'Mobile Development',
        clientId: 'client-test-2',
        clientName: 'Autre Client',
        clientEmail: 'autre.client@example.com',
        budget: 2000,
        currency: 'EUR',
        status: 'in_progress',
        priority: 'high',
        applicationsCount: 8,
        skillsRequired: ['TypeScript', 'Ionic', 'Angular'],
        deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        isReported: true,
        reportReason: 'Contenu inapproprié',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'test-3',
        title: 'Mission de test 3',
        description: 'Troisième mission de test avec un budget plus élevé',
        category: 'Full Stack',
        clientId: 'client-test-3',
        clientName: 'Super Client',
        clientEmail: 'super.client@example.com',
        budget: 5000,
        currency: 'EUR',
        status: 'completed',
        priority: 'low',
        applicationsCount: 12,
        skillsRequired: ['React', 'Node.js', 'MongoDB', 'AWS'],
        deadline: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        isReported: false,
        reportReason: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    this.missions = testMissions;
    this.filteredMissions = testMissions;
    this.totalItems = testMissions.length;
    this.totalPages = 1;
    this.currentPage = 1;
    
    console.log('✅ Missions de test chargées');
    this.showSuccessToast('Missions de test chargées avec succès');
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

  // MÉTHODE CORRIGÉE - Voir les détails d'une mission avec formatage du budget
  // Version alternative avec affichage structuré et propre :

async viewMissionDetail(mission: Mission) {
  console.log('👁️ Affichage détails mission:', mission.id);
  
  try {
    // Formatage sécurisé du budget
    const budgetFormatted = this.formatBudget(mission.budget, mission.currency);
    
    // Préparation des données pour l'affichage
    const details = [
      { label: 'Description', value: mission.description || 'Aucune description' },
      { label: 'Client', value: mission.clientName || 'Non spécifié' },
      { label: 'Budget', value: budgetFormatted },
      { label: 'Statut', value: this.getStatusLabel(mission.status || 'unknown') },
      { label: 'Candidatures', value: (mission.applicationsCount || 0).toString() }
    ];
    
    // Ajouter les compétences si elles existent
    if (mission.skillsRequired && mission.skillsRequired.length > 0) {
      details.push({ 
        label: 'Compétences', 
        value: mission.skillsRequired.join(', ') 
      });
    } else {
      details.push({ 
        label: 'Compétences', 
        value: 'Aucune compétence spécifiée' 
      });
    }
    
    // Ajouter l'échéance si elle existe
    if (mission.deadline) {
      details.push({ 
        label: 'Échéance', 
        value: new Date(mission.deadline).toLocaleDateString('fr-FR') 
      });
    }
    
    // Ajouter le signalement si nécessaire
    if (mission.isReported) {
      details.push({ 
        label: '⚠️ Signalement', 
        value: mission.reportReason || 'Raison non spécifiée' 
      });
    }
    
    // Construire le message
    const messageText = details
      .map(detail => `${detail.label}: ${detail.value}`)
      .join('\n\n');
    
    const alert = await this.alertController.create({
      header: mission.title || 'Mission sans titre',
      message: messageText,
      buttons: [
        {
          text: 'Fermer',
          role: 'cancel'
        },
        {
          text: 'Voir plus de détails',
          handler: () => {
            this.openDetailModal(mission);
          }
        }
      ]
    });
    
    await alert.present();
  } catch (error) {
    console.error('❌ Erreur lors de l\'affichage des détails:', error);
    this.showErrorToast('Erreur lors de l\'affichage des détails de la mission');
  }

  }

  // NOUVELLE MÉTHODE - Ouvrir le modal détaillé
  async openDetailModal(mission: Mission) {
    console.log('🔍 Ouverture du modal détaillé pour la mission:', mission.id);
    
    try {
      // Import dynamique du composant modal
      const { MissionDetailModalComponent } = await import('./components/mission-detail-modal/mission-detail-modal.component');
      
      const modal = await this.modalController.create({
        component: MissionDetailModalComponent,
        componentProps: {
          mission: mission
        },
        cssClass: 'mission-detail-modal',
        showBackdrop: true,
        backdropDismiss: true
      });

      modal.onDidDismiss().then((result) => {
        if (result.data && result.data.action === 'updated') {
          console.log('✅ Mission mise à jour depuis le modal');
          this.loadMissions(); // Recharger la liste
          this.loadStats(); // Recharger les stats
        }
      });

      await modal.present();
    } catch (error) {
      console.error('❌ Erreur lors de l\'ouverture du modal:', error);
      this.showErrorToast('Erreur lors de l\'ouverture du modal de détails');
    }
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

  // Méthode de tracking pour optimiser le rendu
  trackMissionById(index: number, mission: Mission): string {
    return mission?.id || index.toString();
  }

  get endIndex(): number {
    return Math.min(this.currentPage * this.itemsPerPage, this.totalItems);
  }

  get startIndex(): number {
    return this.totalItems > 0 ? (this.currentPage - 1) * this.itemsPerPage + 1 : 0;
  }
  // Méthode pour formater le budget dans le template HTML
formatBudgetForDisplay(budget: any, currency: string = 'EUR'): string {
  return this.formatBudget(budget, currency);
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