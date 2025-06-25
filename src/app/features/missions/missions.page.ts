// src/app/features/missions/missions.page.ts - VERSION AVEC LOGIQUE COMPLÈTE
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { MissionService, Mission, CreateMissionRequest } from './services/mission.service';
import { ApplicationService } from './services/application.service';
import { AuthService, User } from '../auth/services/auth.service';

@Component({
  selector: 'app-missions',
  templateUrl: './missions.page.html',
  styleUrls: ['./missions.page.scss'],
  standalone: false,
})
export class MissionsPage implements OnInit, OnDestroy {
  missions: Mission[] = [];
  filteredMissions: Mission[] = [];
  selectedCategory: string = 'all';
  searchTerm: string = '';
  showFilters: boolean = false;
  selectedBudgetRange: string = 'all';
  selectedDeadline: string = 'all';
  loading: boolean = false;
  error: string = '';
  
  // Propriétés liées à l'authentification
  currentUser: User | null = null;
  isLoggedIn: boolean = false;
  
  // Modal d'ajout de mission
  showAddMissionModal: boolean = false;
  skillInput: string = '';
  submitting: boolean = false;
  newMission: CreateMissionRequest = {
    title: '',
    description: '',
    category: '',
    budget: { min: 0, max: 0 },
    deadline: '',
    skills: [],
    isUrgent: false
  };

  // Modal de candidature
  showApplicationModal: boolean = false;
  selectedMissionForApplication: Mission | null = null;
  userApplications: Map<string, string> = new Map();

  private subscriptions: Subscription = new Subscription();

  categories = [
    { value: 'all', label: 'Toutes', count: 0 },
    { value: 'design', label: 'Design', count: 0 },
    { value: 'development', label: 'Développement', count: 0 },
    { value: 'marketing', label: 'Marketing', count: 0 },
    { value: 'writing', label: 'Rédaction', count: 0 }
  ];

  budgetRanges = [
    { value: 'all', label: 'Tous budgets' },
    { value: '0-500', label: '0€ - 500€' },
    { value: '500-1000', label: '500€ - 1000€' },
    { value: '1000-2000', label: '1000€ - 2000€' },
    { value: '2000+', label: '2000€+' }
  ];

  deadlineOptions = [
    { value: 'all', label: 'Tous délais' },
    { value: 'urgent', label: 'Urgent (< 1 semaine)' },
    { value: 'short', label: 'Court terme (< 1 mois)' },
    { value: 'medium', label: 'Moyen terme (1-3 mois)' },
    { value: 'long', label: 'Long terme (3+ mois)' }
  ];

  constructor(
    private router: Router,
    private missionService: MissionService,
    private applicationService: ApplicationService,
    public authService: AuthService // ✅ Rendu public pour être accessible dans le template
  ) {}

  ngOnInit() {
    console.log('🚀 Initialisation de MissionsPage');
    this.initializeAuth();
    this.loadMissions();
    this.loadUserApplications();
    
    this.subscriptions.add(
      this.missionService.missions$.subscribe(missions => {
        this.missions = missions;
        this.updateCategoryCounts();
        this.applyFilters();
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  // ==================== GESTION DE L'AUTHENTIFICATION ====================

  private initializeAuth() {
    this.subscriptions.add(
      this.authService.currentUser$.subscribe(user => {
        this.currentUser = user;
        this.isLoggedIn = !!user;
        console.log('👤 Utilisateur connecté:', user?.user_type);
        
        // Charger les candidatures seulement pour les freelances
        if (user && this.authService.isFreelance()) {
          this.loadUserApplications();
        } else {
          this.userApplications.clear(); // Nettoyer si pas freelance
        }
      })
    );

    this.isLoggedIn = this.authService.isLoggedIn();
    this.currentUser = this.authService.getCurrentUserValue();
  }

  private loadUserApplications() {
    if (!this.isLoggedIn || !this.authService.isFreelance()) {
      console.log('⏭️ Pas de chargement de candidatures (pas freelance)');
      return;
    }

    this.subscriptions.add(
      this.applicationService.getMyApplications().subscribe({
        next: (response: any) => {
          if (response.success && response.applications) {
            this.userApplications.clear();
            response.applications.forEach((app: any) => {
              this.userApplications.set(app.mission_id, app.status);
            });
            console.log('✅ Candidatures chargées:', this.userApplications.size);
          }
        },
        error: (error: any) => {
          console.error('❌ Erreur chargement candidatures:', error);
        }
      })
    );
  }

  // ==================== CONTRÔLES D'AUTORISATION ====================

  /**
   * ✅ Vérifie si l'utilisateur peut créer des missions (clients uniquement)
   */
  canCreateMission(): boolean {
    const canCreate = this.isLoggedIn && this.authService.isClient();
    console.log('🔍 Peut créer mission:', canCreate, 'Type:', this.currentUser?.user_type);
    return canCreate;
  }

  /**
   * ✅ Vérifie si l'utilisateur peut postuler à des missions (freelances uniquement)
   */
  canApplyToMission(): boolean {
    const canApply = this.isLoggedIn && this.authService.isFreelance();
    console.log('🔍 Peut postuler:', canApply, 'Type:', this.currentUser?.user_type);
    return canApply;
  }

  /**
   * ✅ Vérifie si l'utilisateur a déjà postulé à une mission
   */
  hasUserApplied(missionId: string): boolean {
    const hasApplied = this.userApplications.has(missionId);
    console.log(`🔍 Déjà postulé à ${missionId}:`, hasApplied);
    return hasApplied;
  }

  /**
   * ✅ Récupère le statut de candidature de l'utilisateur pour une mission
   */
  getUserApplicationStatus(missionId: string): string | undefined {
    return this.userApplications.get(missionId);
  }

  // ==================== GESTION DES CANDIDATURES ====================

  /**
   * ✅ Ouvre le modal de candidature avec toutes les vérifications
   */
  openApplicationModal(mission: Mission) {
    console.log('🔍 Tentative de candidature à la mission:', mission.id);

    // Vérification 1: Utilisateur connecté
    if (!this.isLoggedIn) {
      this.error = 'Vous devez être connecté pour postuler à une mission';
      this.router.navigate(['/auth/login']);
      return;
    }

    // Vérification 2: Utilisateur est freelance
    if (!this.authService.isFreelance()) {
      this.error = 'Seuls les freelances peuvent postuler à des missions';
      console.log('❌ Tentative de candidature par un non-freelance');
      return;
    }

    // Vérification 3: Pas déjà postulé
    if (this.hasUserApplied(mission.id)) {
      const status = this.getUserApplicationStatus(mission.id);
      const statusLabel = this.getApplicationStatusLabel(status || '');
      this.error = `Vous avez déjà postulé à cette mission (${statusLabel})`;
      console.log('❌ Candidature déjà envoyée:', status);
      return;
    }

    // Tout est OK, ouvrir le modal
    this.selectedMissionForApplication = mission;
    this.showApplicationModal = true;
    this.error = ''; // Nettoyer les erreurs précédentes
    console.log('✅ Modal de candidature ouvert');
  }

  closeApplicationModal() {
    this.showApplicationModal = false;
    this.selectedMissionForApplication = null;
  }

  onApplicationSent() {
    console.log('✅ Candidature envoyée avec succès !');
    this.loadUserApplications(); // Recharger les candidatures
    this.closeApplicationModal();
    
    // Message de succès optionnel
    this.error = ''; // Nettoyer les erreurs
  }

  applyToMission(mission: Mission) {
    this.openApplicationModal(mission);
  }

  // ==================== GESTION DU MODAL D'AJOUT DE MISSION ====================

  /**
   * ✅ Ouvre le modal d'ajout avec toutes les vérifications
   */
  openAddMissionModal() {
    console.log('🔍 Tentative d\'ouverture du modal d\'ajout...');
    
    // Vérification 1: Utilisateur connecté
    if (!this.isLoggedIn) {
      this.error = 'Vous devez être connecté pour publier une mission';
      this.router.navigate(['/auth/login']);
      return;
    }

    // Vérification 2: Utilisateur est client
    if (!this.authService.isClient()) {
      this.error = 'Seuls les clients peuvent publier des missions';
      console.log('❌ Tentative de création par un non-client');
      return;
    }

    // Tout est OK, ouvrir le modal
    this.showAddMissionModal = true;
    this.resetForm();
    this.error = ''; // Nettoyer les erreurs précédentes
    console.log('✅ Modal d\'ajout ouvert');
  }

  closeAddMissionModal() {
    console.log('🔍 Fermeture du modal d\'ajout...');
    this.showAddMissionModal = false;
    this.resetForm();
  }

  resetForm() {
    this.newMission = {
      title: '',
      description: '',
      category: '',
      budget: { min: 0, max: 0 },
      deadline: '',
      skills: [],
      isUrgent: false
    };
    this.skillInput = '';
    this.error = '';
  }

  onSubmitMission() {
    console.log('🔍 Tentative de soumission de mission...');

    // Double vérification de sécurité
    if (!this.isLoggedIn) {
      this.error = 'Vous devez être connecté pour publier une mission';
      return;
    }

    if (!this.authService.isClient()) {
      this.error = 'Seuls les clients peuvent publier des missions';
      return;
    }

    if (!this.isFormValid()) {
      this.error = 'Veuillez remplir tous les champs obligatoires correctement';
      return;
    }

    if (this.newMission.budget.min > this.newMission.budget.max) {
      this.error = 'Le budget minimum ne peut pas être supérieur au budget maximum';
      return;
    }

    this.submitting = true;
    this.error = '';

    this.subscriptions.add(
      this.missionService.createMission(this.newMission).subscribe({
        next: (newMission: any) => {
          console.log('✅ Mission créée avec succès:', newMission);
          this.submitting = false;
          this.closeAddMissionModal();
          // Optionnel: message de succès
        },
        error: (error: any) => {
          console.error('❌ Erreur création mission:', error);
          this.submitting = false;
          this.error = error.message || 'Erreur lors de la création de la mission';
        }
      })
    );
  }

  // ==================== GESTION DES COMPÉTENCES ====================

  addSkill() {
    if (this.skillInput.trim() && !this.newMission.skills.includes(this.skillInput.trim())) {
      this.newMission.skills.push(this.skillInput.trim());
      this.skillInput = '';
    }
  }

  removeSkill(index: number) {
    this.newMission.skills.splice(index, 1);
  }

  // ==================== UTILITAIRES DE CANDIDATURE ====================

  getApplicationStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'pending': 'En attente',
      'accepted': 'Acceptée',
      'rejected': 'Rejetée'
    };
    return labels[status] || status;
  }

  getApplicationStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'pending': 'text-yellow-600 bg-yellow-100',
      'accepted': 'text-green-600 bg-green-100',
      'rejected': 'text-red-600 bg-red-100'
    };
    return colors[status] || 'text-gray-600 bg-gray-100';
  }

  // ==================== CHARGEMENT DES MISSIONS ====================

  loadMissions() {
    this.loading = true;
    this.error = '';
    
    this.subscriptions.add(
      this.missionService.getMissions().subscribe({
        next: (missions) => {
          console.log('✅ Missions chargées:', missions.length);
          this.loading = false;
        },
        error: (error) => {
          console.error('❌ Erreur chargement missions:', error);
          this.error = 'Erreur lors du chargement des missions';
          this.loading = false;
          this.loadFallbackMissions();
        }
      })
    );
  }

  loadFallbackMissions() {
    this.missions = [
      {
        id: 'fallback-1',
        title: 'Mission de test (mode hors ligne)',
        description: 'Cette mission s\'affiche car le serveur n\'est pas accessible.',
        category: 'development',
        budget: { min: 500, max: 1000 },
        deadline: '2024-07-15',
        clientName: 'Client Test',
        clientAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
        publishedAt: new Date().toISOString(),
        skills: ['Test'],
        applicationsCount: 0,
        status: 'open',
        isUrgent: false
      }
    ];
    this.updateCategoryCounts();
    this.applyFilters();
  }

  // ==================== FILTRAGE ET RECHERCHE ====================

  updateCategoryCounts() {
    this.categories.forEach(cat => {
      if (cat.value === 'all') {
        cat.count = this.missions.length;
      } else {
        const matchingMissions = this.missions.filter(m => m.category === cat.value);
        cat.count = matchingMissions.length;
      }
    });
  }

  applyFilters() {
    this.filteredMissions = this.missions.filter(mission => {
      const matchesCategory = this.selectedCategory === 'all' || mission.category === this.selectedCategory;
      const matchesSearch = !this.searchTerm || 
        mission.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        mission.description.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        mission.skills.some(skill => skill.toLowerCase().includes(this.searchTerm.toLowerCase()));
      
      const matchesBudget = this.matchesBudgetRange(mission);
      const matchesDeadline = this.matchesDeadlineFilter(mission);

      return matchesCategory && matchesSearch && matchesBudget && matchesDeadline;
    });
  }

  matchesBudgetRange(mission: Mission): boolean {
    if (this.selectedBudgetRange === 'all') return true;
    
    const [min, max] = this.selectedBudgetRange.split('-').map(v => v.replace('+', ''));
    const minBudget = parseInt(min);
    const maxBudget = max ? parseInt(max) : Infinity;
    
    return mission.budget.max >= minBudget && mission.budget.min <= maxBudget;
  }

  matchesDeadlineFilter(mission: Mission): boolean {
    if (this.selectedDeadline === 'all') return true;
    
    const deadline = new Date(mission.deadline);
    const now = new Date();
    const diffTime = deadline.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    switch (this.selectedDeadline) {
      case 'urgent': return diffDays <= 7;
      case 'short': return diffDays <= 30;
      case 'medium': return diffDays <= 90;
      case 'long': return diffDays > 90;
      default: return true;
    }
  }

  // ==================== GESTIONNAIRES D'ÉVÉNEMENTS ====================

  onCategoryChange(category: string) {
    this.selectedCategory = category;
    this.applyFilters();
  }

  onSearchChange() {
    this.applyFilters();
  }

  onBudgetRangeChange() {
    this.applyFilters();
  }

  onDeadlineChange() {
    this.applyFilters();
  }

  toggleFilters() {
    this.showFilters = !this.showFilters;
  }

  clearFilters() {
    this.selectedCategory = 'all';
    this.searchTerm = '';
    this.selectedBudgetRange = 'all';
    this.selectedDeadline = 'all';
    this.applyFilters();
  }

  // ==================== NAVIGATION ====================

  viewMissionDetails(missionId: string) {
    this.router.navigate(['/tabs/missions/mission-details', missionId]);
  }

  login() {
    this.router.navigate(['/auth/login']);
  }

  register() {
    this.router.navigate(['/auth/register']);
  }

  async logout() {
    try {
      await this.authService.logout();
      this.router.navigate(['/auth/login']);
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  }

  // ==================== UTILITAIRES ====================

  getCurrentDate(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  isFormValid(): boolean {
    return !!(
      this.newMission.title.trim() &&
      this.newMission.description.trim() &&
      this.newMission.category &&
      this.newMission.budget.min > 0 &&
      this.newMission.budget.max > 0 &&
      this.newMission.deadline &&
      this.newMission.budget.min <= this.newMission.budget.max
    );
  }

  formatBudget(budget: { min: number; max: number }): string {
    return `€${budget.min}-${budget.max}`;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  }

  getTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    
    if (diffDays > 0) {
      return `il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
    } else if (diffHours > 0) {
      return `il y a ${diffHours}h`;
    } else {
      return 'il y a quelques minutes';
    }
  }

  getCategoryIcon(category: string): string {
    const icons: { [key: string]: string } = {
      'design': '🎨',
      'development': '💻',
      'marketing': '📈',
      'writing': '✍️',
      'Design': '🎨',
      'Développement': '💻',
      'Marketing': '📈',
      'Rédaction': '✍️'
    };
    return icons[category] || '📋';
  }

  getUrgencyClass(mission: Mission): string {
    const deadline = new Date(mission.deadline);
    const now = new Date();
    const diffDays = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 7) return 'urgent';
    if (diffDays <= 30) return 'soon';
    return 'normal';
  }

  refreshMissions() {
    this.loadMissions();
    this.loadUserApplications();
  }

  getUserDisplayName(): string {
    if (!this.currentUser) return '';
    return `${this.currentUser.first_name} ${this.currentUser.last_name}`;
  }

  getUserTypeLabel(): string {
    if (!this.currentUser) return '';
    
    switch(this.currentUser.user_type) {
      case 'freelance': return 'Freelance';
      case 'client': return 'Client';
      case 'admin': return 'Administrateur';
      default: return '';
    }
  }
}