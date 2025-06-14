// src/app/Admin/pages/utilisateurs/utilisateurs.page.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, ToastController, LoadingController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../features/auth/services/auth.service';

import { 
  UsersManagementService, 
  User, 
  UserStats, 
  UserFilters 
} from './services/users-management.service';

@Component({
  selector: 'app-utilisateurs',
  templateUrl: './utilisateurs.page.html',
  styleUrls: ['./utilisateurs.page.scss'],
  standalone: false,
})
export class UtilisateursPage implements OnInit, OnDestroy {

  // Données
  users: User[] = [];
  filteredUsers: User[] = [];
  selectedUsers: string[] = [];
  isLoading = false;
  
  // Modals
  showFilters = false;
  showAddModal = false;
  showEditModal = false;
  showViewModal = false;
  selectedUser: User | null = null;
  newUser: Partial<User> = {};

  // Filtres
  filters = {
    search: '',
    type: '',
    statut: '',
    specialite: '',
    pays: '',
    dateInscription: '',
    signalements: false
  };

  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 0;
  totalItems = 0;

  // Stats
  stats: UserStats = {
    total: 0,
    freelances: 0,
    clients: 0,
    actifs: 0,
    inactifs: 0,
    suspendus: 0
  };

  // Options
  specialites = [
    'Développeur Web',
    'Designer UI/UX',
    'Graphiste',
    'Rédacteur',
    'Traducteur',
    'Marketing Digital',
    'Community Manager',
    'Vidéaste',
    'Photographe',
    'Consultant'
  ];

  private subscriptions: Subscription[] = [];
  private searchTimeout: any;

  constructor(
    private router: Router,
    private alertController: AlertController,
    private toastController: ToastController,
    private loadingController: LoadingController,
    private authService: AuthService,
    private usersService: UsersManagementService
  ) {
    console.log('🏗️ Composant UtilisateursPage initialisé');
  }

  ngOnInit() {
    console.log('🚀 === DÉMARRAGE DU COMPOSANT UTILISATEURS ===');
    
    // 🔧 CORRECTION PRINCIPALE : Debug authentification immédiat
    this.debugAuthentication();
    
    this.checkAuthAndInit();
  }

  ngOnDestroy() {
    console.log('🧹 Nettoyage des subscriptions');
    this.cleanup();
  }

  // 🆕 MÉTHODE DEBUG AUTHENTIFICATION DÉTAILLÉE (corrigée pour AuthService)
  debugAuthentication() {
    console.log('🔍 === DEBUG AUTHENTIFICATION DÉTAILLÉ ===');
    
    // Vérifier AuthService directement
    console.log('🔍 AuthService état:', {
      isLoggedIn: this.authService.isLoggedIn(),
      isAdmin: this.authService.isAdmin(),
      token: this.authService.getToken() ? 'PRÉSENT' : 'ABSENT',
      currentUser: this.authService.getCurrentUserValue()
    });
    
    if (this.authService.getToken()) {
      const token = this.authService.getToken()!;
      console.log('🎫 Token preview:', token.substring(0, 30) + '...');
    }
    
    // Vérifier localStorage (pour comparaison)
    console.log('🔍 LocalStorage (pour info):', {
      auth_token: localStorage.getItem('auth_token'),
      token: localStorage.getItem('token'),
      current_user: localStorage.getItem('current_user')
    });
    
    const currentUser = this.authService.getCurrentUserValue();
    if (currentUser) {
      console.log('🔍 Utilisateur connecté:', {
        id: currentUser.id,
        email: currentUser.email,
        user_type: currentUser.user_type,
        first_name: currentUser.first_name,
        last_name: currentUser.last_name
      });
    }
    
    console.log('=======================================');
  }

  private async checkAuthAndInit() {
    console.log('🔍 === VÉRIFICATION AUTHENTIFICATION ===');
    
    // 🔧 CORRECTION : Utiliser AuthService directement
    if (!this.authService.isLoggedIn()) {
      console.error('❌ Utilisateur non connecté selon AuthService');
      await this.showToast('Veuillez vous connecter', 'warning');
      this.router.navigate(['/login']);
      return;
    }
    
    console.log('✅ Utilisateur connecté selon AuthService');
    
    // Vérifier si l'utilisateur est admin
    if (!this.authService.isAdmin()) {
      console.error('❌ Utilisateur non administrateur');
      await this.showToast('Accès refusé - Droits administrateur requis', 'danger');
      this.router.navigate(['/login']);
      return;
    }

    console.log('✅ Permissions admin validées');
    
    const currentUser = this.authService.getCurrentUserValue();
    if (currentUser) {
      console.log('👤 Admin connecté:', {
        email: currentUser.email,
        name: `${currentUser.first_name} ${currentUser.last_name}`,
        type: currentUser.user_type
      });
      await this.showToast(`Bienvenue ${currentUser.first_name}`, 'success');
    }

    this.setupSubscriptions();
    await this.initializeData();
  }

  // 🆕 MÉTHODES AUXILIAIRES POUR L'AUTHENTIFICATION
  private checkAdminFromStorage(): boolean {
    try {
      const currentUser = localStorage.getItem('current_user');
      if (currentUser) {
        const user = JSON.parse(currentUser);
        return user.user_type === 'admin';
      }
    } catch (e) {
      console.error('Erreur parsing user pour vérification admin:', e);
    }
    return false;
  }

  private getCurrentUserFromStorage(): any {
    try {
      const currentUser = localStorage.getItem('current_user');
      if (currentUser) {
        return JSON.parse(currentUser);
      }
    } catch (e) {
      console.error('Erreur parsing user storage:', e);
    }
    return null;
  }

  // ✅ CORRECTION PRINCIPALE: Subscriptions réactives
  private setupSubscriptions() {
    console.log('🔗 Configuration des subscriptions réactives');
    
    // Écouter les changements des statistiques
    const statsSubscription = this.usersService.stats$.subscribe({
      next: (stats) => {
        console.log('📊 Stats mises à jour automatiquement:', stats);
        this.stats = stats;
      },
      error: (error) => {
        console.error('❌ Erreur dans stats subscription:', error);
      }
    });
    this.subscriptions.push(statsSubscription);

    // Écouter les changements des utilisateurs
    const usersSubscription = this.usersService.users$.subscribe({
      next: (users) => {
        console.log('👥 Utilisateurs mis à jour automatiquement:', users.length);
        this.users = users;
        this.filteredUsers = [...users];
        this.applyCurrentFilters();
        
        // Mettre à jour la pagination locale
        this.updateLocalPagination();
        
        console.log('✅ État local synchronisé:', {
          users: this.users.length,
          filteredUsers: this.filteredUsers.length,
          totalItems: this.totalItems
        });
      },
      error: (error) => {
        console.error('❌ Erreur dans users subscription:', error);
      }
    });
    this.subscriptions.push(usersSubscription);

    // Écouter l'état de chargement
    const loadingSubscription = this.usersService.loading$.subscribe({
      next: (isLoading) => {
        console.log('⏳ État de chargement synchronisé:', isLoading);
        this.isLoading = isLoading;
      }
    });
    this.subscriptions.push(loadingSubscription);
  }

  private async initializeData() {
    console.log('📋 Initialisation des données');
    
    try {
      // 🔧 CORRECTION : Vérifier AuthService directement
      if (!this.authService.isLoggedIn()) {
        console.error('❌ AuthService indique utilisateur non connecté');
        await this.showToast('Session expirée', 'danger');
        this.router.navigate(['/login']);
        return;
      }
      
      console.log('🎫 AuthService confirme utilisateur connecté');

      // Charger les données initiales
      await this.loadUsers();
      await this.loadStats();
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation:', error);
      await this.showToast('Erreur lors de l\'initialisation', 'danger');
    }
  }

  // ✅ CORRECTION: Version simplifiée de loadUsers avec gestion d'erreur token
  async loadUsers() {
    console.log('📊 === CHARGEMENT DES UTILISATEURS ===');
    
    if (this.isLoading) {
      console.log('⏳ Chargement déjà en cours, ignorer');
      return;
    }

    try {
      // 🔧 VÉRIFICATION AUTHSERVICE AVANT APPEL API
      if (!this.authService.isLoggedIn()) {
        console.error('❌ AuthService indique utilisateur non connecté');
        await this.showToast('Session expirée, reconnexion nécessaire', 'warning');
        this.router.navigate(['/login']);
        return;
      }

      const filters: UserFilters = {
        search: this.filters.search,
        type: this.filters.type,
        status: this.filters.statut,
        page: this.currentPage,
        limit: this.itemsPerPage
      };

      console.log('📊 Filtres appliqués:', filters);
      console.log('🎫 AuthService confirme utilisateur connecté');

      // ✅ CHANGEMENT PRINCIPAL: Utilisation simple du service
      this.usersService.getUsers(filters).subscribe({
        next: (response) => {
          console.log('✅ === DONNÉES REÇUES ===');
          console.log('📊 Réponse:', response);
          
          // Mise à jour de la pagination depuis l'API
          this.totalItems = response.pagination?.total || 0;
          this.totalPages = response.pagination?.total_pages || 0;
          this.currentPage = response.pagination?.current_page || 1;
          
          console.log('✅ Pagination mise à jour:', {
            totalItems: this.totalItems,
            totalPages: this.totalPages,
            currentPage: this.currentPage
          });

          if (response.users.length === 0) {
            console.warn('⚠️ Aucun utilisateur retourné par l\'API');
          } else {
            console.log('🎉 Utilisateurs chargés avec succès:', response.users.length);
          }
        },
        error: async (error) => {
          console.error('❌ === ERREUR LORS DU CHARGEMENT ===');
          console.error('❌ Erreur:', error);
          
          if (error.message && error.message.includes('Token')) {
            console.error('🚫 Problème de token détecté');
            await this.showToast('Session expirée, veuillez vous reconnecter', 'warning');
            this.router.navigate(['/login']);
          } else {
            await this.showToast('Erreur lors du chargement des utilisateurs', 'danger');
          }
        }
      });
      
    } catch (error) {
      console.error('❌ === ERREUR CRITIQUE ===');
      console.error('❌ Erreur dans loadUsers:', error);
      await this.showToast('Erreur lors du chargement des utilisateurs', 'danger');
    }
  }

  async loadStats() {
    try {
      console.log('📈 Chargement des statistiques');
      
      this.usersService.getStats().subscribe({
        next: (stats) => {
          console.log('📈 Statistiques chargées:', stats);
          // Les stats sont déjà mises à jour via la subscription
        },
        error: (error) => {
          console.error('❌ Erreur lors du chargement des statistiques:', error);
          // Les stats ne sont pas critiques, utiliser des valeurs par défaut
          this.stats = {
            total: 0,
            freelances: 0,
            clients: 0,
            actifs: 0,
            inactifs: 0,
            suspendus: 0
          };
        }
      });
      
    } catch (error) {
      console.error('❌ Erreur lors du chargement des statistiques:', error);
    }
  }

  // ✅ NOUVELLE MÉTHODE: Appliquer les filtres locaux actuels
  private applyCurrentFilters() {
    console.log('🔽 Application des filtres locaux actuels');
    let filtered = [...this.users];

    // Filtres locaux (non gérés par l'API)
    if (this.filters.specialite) {
      filtered = filtered.filter(user => user.specialite === this.filters.specialite);
    }

    if (this.filters.pays) {
      filtered = filtered.filter(user => 
        user.pays?.toLowerCase().includes(this.filters.pays.toLowerCase())
      );
    }

    if (this.filters.signalements) {
      filtered = filtered.filter(user => user.signalements > 0);
    }

    this.filteredUsers = filtered;
    console.log('🔽 Filtres locaux appliqués:', {
      original: this.users.length,
      filtered: this.filteredUsers.length
    });
  }

  // ✅ NOUVELLE MÉTHODE: Mettre à jour la pagination locale
  private updateLocalPagination() {
    if (this.filteredUsers.length > 0 && this.totalItems === 0) {
      // Si on utilise le filtrage local, calculer la pagination localement
      this.totalItems = this.filteredUsers.length;
      this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
    }
  }

  // Filtres et recherche
  onSearchChange(event: any) {
    const searchValue = event?.target?.value || '';
    this.filters.search = searchValue.trim();
    console.log('🔍 Recherche:', this.filters.search);
    
    // Débounce la recherche
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.currentPage = 1;
      this.loadUsers();
    }, 500);
  }

  async filterByType(type: string) {
    this.filters.type = type;
    this.currentPage = 1;
    console.log('🔽 Filtre par type:', type);
    await this.loadUsers();
  }

  async filterByStatus(status: string) {
    this.filters.statut = status;
    this.currentPage = 1;
    console.log('🔽 Filtre par statut:', status);
    await this.loadUsers();
  }

  applyFilters() {
    console.log('🔽 Application des filtres locaux');
    this.applyCurrentFilters();
    this.currentPage = 1;
    this.updateLocalPagination();
  }

  clearFilters() {
    console.log('🧹 Nettoyage des filtres');
    this.filters = {
      search: '',
      type: '',
      statut: '',
      specialite: '',
      pays: '',
      dateInscription: '',
      signalements: false
    };
    this.currentPage = 1;
    this.loadUsers();
  }

  toggleFilters() {
    this.showFilters = !this.showFilters;
    console.log('🔽 Toggle filtres:', this.showFilters);
  }

  // Pagination
  getPaginatedUsers() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredUsers.slice(start, end);
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages && !this.isLoading) {
      console.log('📄 Changement de page:', page);
      this.currentPage = page;
      this.loadUsers();
    }
  }

  getPaginationArray(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;
    const start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
    const end = Math.min(this.totalPages, start + maxVisible - 1);
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  // Gestion des modals
  openAddModal() {
    console.log('➕ Ouverture modal d\'ajout');
    this.newUser = {
      nom: '',
      prenom: '',
      email: '',
      type: 'freelance',
      statut: 'actif',
      telephone: '',
      pays: 'Sénégal',
      ville: '',
      specialite: '',
      nombreMissions: 0,
      noteGlobale: 0,
      signalements: 0,
      dateInscription: new Date(),
      derniereConnexion: new Date()
    };
    this.showAddModal = true;
  }

  openEditModal(user: User) {
    console.log('✏️ Ouverture modal d\'édition pour:', user.email);
    this.selectedUser = { ...user };
    this.showEditModal = true;
  }

  openViewModal(user: User) {
    console.log('👁️ Ouverture modal de détail pour:', user.email);
    this.selectedUser = user;
    this.showViewModal = true;
  }

  closeModal(modalType: string) {
    console.log('❌ Fermeture modal:', modalType);
    switch(modalType) {
      case 'add':
        this.showAddModal = false;
        this.newUser = {};
        break;
      case 'edit':
        this.showEditModal = false;
        break;
      case 'view':
        this.showViewModal = false;
        break;
    }
    this.selectedUser = null;
  }

  // Actions sur les utilisateurs
  async confirmAction(action: string, user: User) {
    const alert = await this.alertController.create({
      header: 'Confirmation',
      message: `Êtes-vous sûr de vouloir ${action} cet utilisateur ?`,
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel'
        },
        {
          text: 'Confirmer',
          handler: () => {
            this.executeAction(action, user);
          }
        }
      ]
    });

    await alert.present();
  }

  // ✅ CORRECTION: Actions sans rechargement manuel
  async executeAction(action: string, user: User) {
    let loading: HTMLIonLoadingElement | null = null;
    
    try {
      loading = await this.loadingController.create({
        message: 'Action en cours...',
        spinner: 'circular'
      });
      await loading.present();

      switch(action) {
        case 'activer':
        case 'désactiver':
        case 'suspendre':
          const status = action === 'activer' ? 'actif' : 
                        action === 'désactiver' ? 'inactif' : 'suspendu';
          
          // ✅ Le service va automatiquement recharger les données
          await this.usersService.changeUserStatus(user.id, status).toPromise();
          await this.showToast(`Utilisateur ${action} avec succès`);
          break;

        case 'supprimer':
          // ✅ Le service va automatiquement recharger les données
          await this.usersService.deleteUser(user.id).toPromise();
          await this.showToast('Utilisateur supprimé avec succès');
          break;
      }

      // ✅ PLUS BESOIN de recharger manuellement

    } catch (error: any) {
      console.error(`❌ Erreur lors de l'action ${action}:`, error);
      
      let errorMessage = `Erreur lors de l'action ${action}`;
      if (error?.status === 403) {
        errorMessage = 'Permissions insuffisantes';
      } else if (error?.status === 404) {
        errorMessage = 'Utilisateur non trouvé';
      }
      
      await this.showToast(errorMessage, 'danger');
    } finally {
      if (loading) {
        await loading.dismiss();
      }
    }
  }

  // ✅ CORRECTION: Sauvegarde sans rechargement manuel
  async saveUser() {
    if (!this.selectedUser) {
      await this.showToast('Aucun utilisateur sélectionné', 'warning');
      return;
    }

    const validation = this.validateUserData(this.selectedUser);
    if (!validation.isValid) {
      await this.showToast(validation.message, 'warning');
      return;
    }

    let loading: HTMLIonLoadingElement | null = null;
    
    try {
      loading = await this.loadingController.create({
        message: 'Sauvegarde en cours...',
        spinner: 'circular'
      });
      await loading.present();

      // ✅ Le service va automatiquement recharger les données
      await this.usersService.updateUser(this.selectedUser.id, this.selectedUser).toPromise();
      await this.showToast('Utilisateur modifié avec succès');
      this.closeModal('edit');
      
    } catch (error: any) {
      console.error('❌ Erreur lors de la sauvegarde:', error);
      
      let errorMessage = 'Erreur lors de la sauvegarde';
      if (error?.error?.error) {
        errorMessage = error.error.error;
      } else if (error?.status === 409) {
        errorMessage = 'Cet email est déjà utilisé';
      }
      
      await this.showToast(errorMessage, 'danger');
    } finally {
      if (loading) {
        await loading.dismiss();
      }
    }
  }

  // ✅ CORRECTION: Ajout sans rechargement manuel
  async addUser() {
    const validation = this.validateUserData(this.newUser);
    if (!validation.isValid) {
      await this.showToast(validation.message, 'warning');
      return;
    }

    let loading: HTMLIonLoadingElement | null = null;
    
    try {
      loading = await this.loadingController.create({
        message: 'Création en cours...',
        spinner: 'circular'
      });
      await loading.present();

      // ✅ Le service va automatiquement recharger les données
      await this.usersService.createUser(this.newUser).toPromise();
      await this.showToast('Utilisateur créé avec succès');
      this.closeModal('add');
      
    } catch (error: any) {
      console.error('❌ Erreur lors de la création:', error);
      
      let errorMessage = 'Erreur lors de la création';
      if (error?.error?.error) {
        errorMessage = error.error.error;
      } else if (error?.status === 409) {
        errorMessage = 'Cet email est déjà utilisé';
      } else if (error?.status === 422) {
        errorMessage = 'Données invalides';
      }
      
      await this.showToast(errorMessage, 'danger');
    } finally {
      if (loading) {
        await loading.dismiss();
      }
    }
  }

  private validateUserData(userData: Partial<User>): { isValid: boolean; message: string } {
    if (!userData.nom?.trim()) {
      return { isValid: false, message: 'Le nom est obligatoire' };
    }
    
    if (!userData.prenom?.trim()) {
      return { isValid: false, message: 'Le prénom est obligatoire' };
    }
    
    if (!userData.email?.trim()) {
      return { isValid: false, message: 'L\'email est obligatoire' };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userData.email)) {
      return { isValid: false, message: 'Veuillez saisir un email valide' };
    }

    return { isValid: true, message: '' };
  }

  async deleteUser(user: User) {
    const alert = await this.alertController.create({
      header: 'Confirmation de suppression',
      message: `Êtes-vous sûr de vouloir supprimer définitivement l'utilisateur ${user.prenom} ${user.nom} ?`,
      subHeader: 'Cette action est irréversible',
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel'
        },
        {
          text: 'Supprimer',
          role: 'destructive',
          handler: () => {
            this.executeAction('supprimer', user);
          }
        }
      ]
    });

    await alert.present();
  }

  // Sélections multiples
  selectUser(userId: string) {
    const index = this.selectedUsers.indexOf(userId);
    if (index > -1) {
      this.selectedUsers.splice(index, 1);
    } else {
      this.selectedUsers.push(userId);
    }
    console.log('✅ Utilisateurs sélectionnés:', this.selectedUsers.length);
  }

  selectAllUsers() {
    const currentPageUsers = this.getPaginatedUsers();
    if (this.selectedUsers.length === currentPageUsers.length) {
      this.selectedUsers = [];
    } else {
      this.selectedUsers = currentPageUsers.map(u => u.id);
    }
    console.log('✅ Sélection globale:', this.selectedUsers.length);
  }

  isUserSelected(userId: string): boolean {
    return this.selectedUsers.includes(userId);
  }

  areAllUsersSelected(): boolean {
    const currentPageUsers = this.getPaginatedUsers();
    return currentPageUsers.length > 0 && 
           currentPageUsers.every(user => this.selectedUsers.includes(user.id));
  }

  async bulkAction(action: string) {
    if (this.selectedUsers.length === 0) {
      await this.showToast('Aucun utilisateur sélectionné', 'warning');
      return;
    }

    const alert = await this.alertController.create({
      header: 'Confirmation',
      message: `Êtes-vous sûr de vouloir ${action} ${this.selectedUsers.length} utilisateur(s) ?`,
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel'
        },
        {
          text: 'Confirmer',
          handler: () => {
            this.executeBulkAction(action);
          }
        }
      ]
    });

    await alert.present();
  }

  async executeBulkAction(action: string) {
    let loading: HTMLIonLoadingElement | null = null;
    
    try {
      loading = await this.loadingController.create({
        message: 'Action en cours...',
        spinner: 'circular'
      });
      await loading.present();

      // ✅ Le service va automatiquement recharger les données
      await this.usersService.bulkAction(action, this.selectedUsers).toPromise();
      this.selectedUsers = [];
      await this.showToast(`Action ${action} appliquée avec succès`);
      
    } catch (error: any) {
      console.error('❌ Erreur lors de l\'action en lot:', error);
      
      let errorMessage = 'Erreur lors de l\'action en lot';
      if (error?.error?.message) {
        errorMessage = error.error.message;
      }
      
      await this.showToast(errorMessage, 'danger');
    } finally {
      if (loading) {
        await loading.dismiss();
      }
    }
  }

  // Export
  async exportUsers() {
    try {
      const loading = await this.loadingController.create({
        message: 'Préparation de l\'export...',
        spinner: 'circular'
      });
      await loading.present();

      const usersToExport = this.filteredUsers.length > 0 ? this.filteredUsers : this.users;
      
      if (usersToExport.length === 0) {
        await this.showToast('Aucun utilisateur à exporter', 'warning');
        await loading.dismiss();
        return;
      }
      
      this.usersService.exportUsers(usersToExport);
      await this.showToast(`Export de ${usersToExport.length} utilisateurs réalisé avec succès`);
      
      await loading.dismiss();
    } catch (error) {
      console.error('❌ Erreur lors de l\'export:', error);
      await this.showToast('Erreur lors de l\'export', 'danger');
    }
  }

  // Utilitaires
  getStatusColor(statut: string): string {
    switch(statut?.toLowerCase()) {
      case 'actif': return 'text-green-600';
      case 'inactif': return 'text-yellow-600';
      case 'suspendu': return 'text-red-600';
      default: return 'text-gray-600';
    }
  }

  getStatusBadgeColor(statut: string): string {
    switch(statut?.toLowerCase()) {
      case 'actif': return 'success';
      case 'inactif': return 'warning';
      case 'suspendu': return 'danger';
      default: return 'medium';
    }
  }

  getTypeIcon(type: string): string {
    return type === 'freelance' ? '👨‍💻' : '🏢';
  }

  getTypeLabel(type: string): string {
    return type === 'freelance' ? 'Freelance' : 'Client';
  }

  formatDate(date: Date | string): string {
    if (!date) return '-';
    try {
      const d = new Date(date);
      return d.toLocaleDateString('fr-FR');
    } catch {
      return '-';
    }
  }

  formatDateTime(date: Date | string): string {
    if (!date) return '-';
    try {
      const d = new Date(date);
      return d.toLocaleString('fr-FR');
    } catch {
      return '-';
    }
  }

  trackByUserId(index: number, user: User): string {
    return user?.id || index.toString();
  }

  private async showToast(message: string, color: 'success' | 'warning' | 'danger' = 'success') {
    try {
      const toast = await this.toastController.create({
        message: message,
        duration: 3000,
        position: 'top',
        color: color,
        buttons: [
          {
            text: '✕',
            role: 'cancel'
          }
        ]
      });
      await toast.present();
    } catch (error) {
      console.error('❌ Erreur lors de l\'affichage du toast:', error);
    }
  }

  // ✅ CORRECTION: Rafraîchissement simplifié
  async doRefresh(event: any) {
    try {
      console.log('🔄 Rafraîchissement des données');
      
      // Simplement recharger les données, les subscriptions feront le reste
      await this.loadUsers();
      await this.loadStats();
      
      await this.showToast('Données actualisées');
    } catch (error) {
      console.error('❌ Erreur lors du rafraîchissement:', error);
      await this.showToast('Erreur lors de l\'actualisation', 'danger');
    } finally {
      if (event?.target) {
        event.target.complete();
      }
    }
  }

  // Helper pour Math dans le template
  get Math() {
    return Math;
  }

  // Méthodes utiles pour le template
  hasUsers(): boolean {
    return this.users.length > 0;
  }

  hasFilteredUsers(): boolean {
    return this.filteredUsers.length > 0;
  }

  getDisplayedUsersCount(): number {
    return this.getPaginatedUsers().length;
  }

  // Debug complet
  debugAll() {
    console.log('🐛 === DEBUG COMPLET ===');
    console.log('🔍 État du composant:', {
      isLoading: this.isLoading,
      usersCount: this.users.length,
      filteredUsersCount: this.filteredUsers.length,
      selectedUsersCount: this.selectedUsers.length,
      currentPage: this.currentPage,
      totalPages: this.totalPages,
      totalItems: this.totalItems,
      filters: this.filters
    });
    
    const currentUser = this.authService.getCurrentUserValue();
    console.log('🔍 État d\'authentification:', {
      isLoggedIn: this.authService.isLoggedIn(),
      isAdmin: this.authService.isAdmin(),
      isFreelance: this.authService.isFreelance(),
      isClient: this.authService.isClient(),
      currentUser: currentUser,
      token: this.authService.getToken() ? 'Présent' : 'Absent'
    });
    
    // Debug du service de gestion des utilisateurs
    this.usersService.debugServiceState();
    
    console.log('=======================================');
  }

  // 🆕 MÉTHODE DE TEST API DIRECTE
  async testApiDirectly() {
    console.log('🧪 === TEST API DIRECT ===');
    
    // Récupérer le token de toutes les sources possibles
    const token = this.authService.getToken() || 
                  localStorage.getItem('auth_token') || 
                  localStorage.getItem('token') ||
                  localStorage.getItem('authToken');
    
    console.log('🎫 Token à utiliser:', token ? token.substring(0, 30) + '...' : 'AUCUN');
    
    if (!token) {
      console.error('❌ Aucun token disponible pour le test');
      await this.showToast('Aucun token d\'authentification trouvé', 'danger');
      return;
    }
    
    try {
      console.log('📡 Test direct avec fetch...');
      
      const response = await fetch('http://localhost:3000/api/users', {
        method: 'GET',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('📊 Statut réponse:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Test API réussi:', data);
        console.log('👥 Nombre d\'utilisateurs:', data.users?.length || 0);
        await this.showToast('Test API réussi !', 'success');
      } else {
        const errorText = await response.text();
        console.error('❌ Test API échoué:', response.status, errorText);
        await this.showToast(`Test API échoué: ${response.status}`, 'danger');
      }
      
    } catch (error) {
      console.error('❌ Erreur lors du test API:', error);
      await this.showToast('Erreur lors du test API', 'danger');
    }
  }

  // 🆕 MÉTHODES DE DEBUG AVANCÉES POUR RÉSOUDRE LE PROBLÈME

  async checkIonicStorage() {
    console.log('📦 === VÉRIFICATION IONIC STORAGE ===');
    
    try {
      // Accéder directement au storage de AuthService
      const storage = (this.authService as any).storage;
      
      if (!storage) {
        console.error('❌ Storage non initialisé dans AuthService');
        await this.showToast('Storage non initialisé', 'danger');
        return;
      }
      
      // Vérifier les données stockées
      const authToken = await storage.get('auth_token');
      const currentUser = await storage.get('current_user');
      
      console.log('📦 Données dans Ionic Storage:', {
        auth_token: authToken ? 'PRÉSENT' : 'ABSENT',
        current_user: currentUser ? 'PRÉSENT' : 'ABSENT'
      });
      
      if (authToken) {
        console.log('🎫 Token trouvé:', authToken.substring(0, 30) + '...');
        await this.showToast('Token trouvé dans storage !', 'success');
      } else {
        console.error('❌ Aucun token dans Ionic Storage');
        await this.showToast('Aucun token dans storage - Connexion requise', 'warning');
      }
      
      if (currentUser) {
        console.log('👤 Utilisateur trouvé:', currentUser);
      }
      
    } catch (error) {
      console.error('❌ Erreur vérification storage:', error);
      await this.showToast('Erreur vérification storage', 'danger');
    }
  }

  async manualLogin() {
    console.log('🔐 === LOGIN MANUEL POUR TEST ===');
    
    try {
      // Données de test (remplacez par vos vraies données admin)
      const loginData = {
        email: 'admin@matrix.com', // Ou votre email admin
        password: 'password123' // Ou votre mot de passe admin
      };
      
      console.log('🔄 Tentative de connexion avec:', loginData.email);
      
      const response = await this.authService.login(loginData.email, loginData.password);
      
      console.log('✅ Connexion réussie:', response);
      await this.showToast(`Connecté en tant que ${response.user.first_name}`, 'success');
      
      // Attendre un peu puis recharger les utilisateurs
      setTimeout(() => {
        this.loadUsers();
      }, 1000);
      
    } catch (error: any) {
      console.error('❌ Erreur connexion:', error);
      
      let errorMsg = 'Erreur de connexion';
      if (error.error?.message) {
        errorMsg = error.error.message;
      } else if (error.message) {
        errorMsg = error.message;
      }
      
      await this.showToast(errorMsg, 'danger');
    }
  }

  async forceTokenFromCurl() {
    console.log('🔧 === INJECTION TOKEN DEPUIS CURL ===');
    
    // Le token qui fonctionne avec curl (celui que vous avez testé)
    const workingToken = prompt('Collez le token qui fonctionne avec curl :');
    
    if (!workingToken) {
      await this.showToast('Aucun token fourni', 'warning');
      return;
    }
    
    try {
      // Forcer le token dans AuthService
      const storage = (this.authService as any).storage;
      
      if (storage) {
        await storage.set('auth_token', workingToken);
        console.log('✅ Token forcé dans storage');
        
        // Forcer aussi les BehaviorSubjects
        (this.authService as any).tokenSubject.next(workingToken);
        
        // Créer un utilisateur fictif admin
        const fakeAdmin = {
          id: 1,
          email: 'admin@test.com',
          user_type: 'admin',
          first_name: 'Admin',
          last_name: 'Test'
        };
        
        await storage.set('current_user', fakeAdmin);
        (this.authService as any).currentUserSubject.next(fakeAdmin);
        
        await this.showToast('Token forcé avec succès !', 'success');
        
        // Tenter de charger les utilisateurs
        setTimeout(() => {
          this.loadUsers();
        }, 1000);
        
      } else {
        await this.showToast('Storage non disponible', 'danger');
      }
      
    } catch (error) {
      console.error('❌ Erreur injection token:', error);
      await this.showToast('Erreur injection token', 'danger');
    }
  }

  // Gestion des erreurs globales
  private handleError(error: any, context: string): void {
    console.error(`❌ Erreur dans ${context}:`, error);
    
    if (error?.status === 401) {
      this.showToast('Session expirée, veuillez vous reconnecter', 'warning');
      this.router.navigate(['/login']);
    } else if (error?.status === 403) {
      this.showToast('Permissions insuffisantes', 'danger');
    } else if (error?.status === 0) {
      this.showToast('Impossible de contacter le serveur', 'danger');
    } else {
      this.showToast(`Erreur: ${error?.message || 'Erreur inconnue'}`, 'danger');
    }
  }

  // Méthodes pour la gestion des permissions
  canEditUser(): boolean {
    return this.authService.isAdmin();
  }

  canDeleteUser(): boolean {
    return this.authService.isAdmin();
  }

  canCreateUser(): boolean {
    return this.authService.isAdmin();
  }

  // Méthodes pour les statistiques
  getStatsPercentage(value: number): number {
    if (this.stats.total === 0) return 0;
    return Math.round((value / this.stats.total) * 100);
  }

  // ✅ CORRECTION: Nettoyage des ressources
  private cleanup(): void {
    // Nettoyer le timeout de recherche
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    
    // Désabonner toutes les subscriptions
    this.subscriptions.forEach(sub => {
      if (sub && !sub.closed) {
        sub.unsubscribe();
      }
    });
    this.subscriptions = [];
    
    // Réinitialiser les données
    this.selectedUsers = [];
    this.filteredUsers = [];
    this.users = [];
  }
}