import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { MissionService, Mission, CreateMissionRequest } from './services/mission.service';
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

  private subscriptions: Subscription = new Subscription();

  // ✅ CORRECTION : Harmoniser les valeurs avec le formulaire HTML
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
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.initializeAuth();
    this.loadMissions();
    
    // S'abonner aux changements des missions
    this.subscriptions.add(
      this.missionService.missions$.subscribe(missions => {
        this.missions = missions;
        this.updateCategoryCounts();
        this.applyFilters();
        
        // ✅ Debug temporaire
        setTimeout(() => this.debugCategories(), 500);
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  // Initialiser les données d'authentification
  private initializeAuth() {
    this.subscriptions.add(
      this.authService.currentUser$.subscribe(user => {
        this.currentUser = user;
        this.isLoggedIn = !!user;
        console.log('👤 Utilisateur actuel:', user);
      })
    );

    this.isLoggedIn = this.authService.isLoggedIn();
    this.currentUser = this.authService.getCurrentUserValue();
  }

  loadMissions() {
    this.loading = true;
    this.error = '';
    
    this.subscriptions.add(
      this.missionService.getMissions().subscribe({
        next: (missions) => {
          console.log('✅ Missions chargées:', missions.length);
          console.log('📊 Catégories trouvées:', missions.map(m => ({ title: m.title, category: m.category })));
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

  // Données de fallback en cas d'erreur réseau
  loadFallbackMissions() {
    this.missions = [
      {
        id: 'fallback-1',
        title: 'Mission de test (mode hors ligne)',
        description: 'Cette mission s\'affiche car le serveur n\'est pas accessible.',
        category: 'development', // ✅ Correction : utiliser la valeur en minuscules
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

  // ✅ CORRECTION : Améliorer updateCategoryCounts avec logs
  updateCategoryCounts() {
    console.log('🔄 Mise à jour des comptes de catégories...');
    
    this.categories.forEach(cat => {
      if (cat.value === 'all') {
        cat.count = this.missions.length;
      } else {
        const matchingMissions = this.missions.filter(m => m.category === cat.value);
        cat.count = matchingMissions.length;
        
        console.log(`📊 Catégorie "${cat.value}": ${cat.count} missions`, 
          matchingMissions.map(m => m.title));
      }
    });
    
    console.log('✅ Comptes mis à jour:', this.categories.map(c => ({ label: c.label, count: c.count })));
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
    
    console.log('🔍 Filtrage:', {
      selectedCategory: this.selectedCategory,
      totalMissions: this.missions.length,
      filteredMissions: this.filteredMissions.length
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

  onCategoryChange(category: string) {
    console.log('🏷️ Changement catégorie:', category);
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

  // ✅ NOUVEAU : Méthode de debug pour catégories
  debugCategories() {
    console.log('🐛 DEBUG CATÉGORIES:');
    console.log('📊 Missions totales:', this.missions.length);
    console.log('📊 Missions filtrées:', this.filteredMissions.length);
    console.log('🏷️ Catégorie sélectionnée:', this.selectedCategory);
    
    const categoryBreakdown = this.missions.reduce((acc, mission) => {
      const cat = mission.category || 'undefined';
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {} as any);
    
    console.log('📈 Répartition réelle des catégories:', categoryBreakdown);
    
    this.categories.forEach(cat => {
      const realCount = this.missions.filter(m => 
        cat.value === 'all' ? true : m.category === cat.value
      ).length;
      console.log(`🏷️ ${cat.label}: affiché=${cat.count}, réel=${realCount}`);
    });
  }

  // Méthodes pour le modal d'ajout de mission
  openAddMissionModal() {
    if (!this.isLoggedIn) {
      this.error = 'Vous devez être connecté pour publier une mission';
      this.router.navigate(['/auth/login']);
      return;
    }

    if (!this.authService.isClient()) {
      this.error = 'Seuls les clients peuvent publier des missions';
      return;
    }

    this.showAddMissionModal = true;
    this.resetForm();
  }

  closeAddMissionModal() {
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

  addSkill() {
    if (this.skillInput.trim() && !this.newMission.skills.includes(this.skillInput.trim())) {
      this.newMission.skills.push(this.skillInput.trim());
      this.skillInput = '';
    }
  }

  removeSkill(index: number) {
    this.newMission.skills.splice(index, 1);
  }

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

  onSubmitMission() {
    if (!this.isLoggedIn) {
      this.error = 'Vous devez être connecté pour publier une mission';
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

    console.log('📤 Envoi nouvelle mission:', this.newMission);

    this.subscriptions.add(
      this.missionService.createMission(this.newMission).subscribe({
        next: (newMission) => {
          console.log('✅ Mission créée avec succès:', newMission);
          this.submitting = false;
          this.closeAddMissionModal();
          this.showSuccessMessage('Mission publiée avec succès !');
        },
        error: (error) => {
          console.error('❌ Erreur création mission:', error);
          this.submitting = false;
          this.error = error.message || 'Erreur lors de la création de la mission';
        }
      })
    );
  }

  showSuccessMessage(message: string) {
    alert(message);
  }

  viewMissionDetails(missionId: string) {
    this.router.navigate(['/tabs/missions/mission-details', missionId]);
  }

  applyToMission(mission: Mission) {
    if (!this.isLoggedIn) {
      this.error = 'Vous devez être connecté pour postuler à une mission';
      this.router.navigate(['/auth/login']);
      return;
    }

    if (!this.authService.isFreelance()) {
      this.error = 'Seuls les freelances peuvent postuler à des missions';
      return;
    }

    this.router.navigate(['/apply-mission', mission.id]);
  }

  // Méthodes utilitaires liées à l'authentification
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

  canCreateMission(): boolean {
    return this.isLoggedIn && this.authService.isClient();
  }

  canApplyToMission(): boolean {
    return this.isLoggedIn && this.authService.isFreelance();
  }

  canViewMissionDetails(): boolean {
    return this.isLoggedIn;
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

  // ✅ CORRECTION : Adapter aux nouvelles valeurs de catégories
  getCategoryIcon(category: string): string {
    const icons: { [key: string]: string } = {
      'design': '🎨',
      'development': '💻',
      'marketing': '📈',
      'writing': '✍️',
      // Rétrocompatibilité avec les anciennes valeurs
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
  }

  getConnectionStatus(): string {
    return navigator.onLine ? 'En ligne' : 'Hors ligne';
  }
}