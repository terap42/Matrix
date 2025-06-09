import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

interface Mission {
  id: string;
  title: string;
  description: string;
  category: string;
  budget: {
    min: number;
    max: number;
  };
  deadline: string;
  clientName: string;
  clientAvatar: string;
  publishedAt: string;
  skills: string[];
  applicationsCount: number;
  status: 'open' | 'in_progress' | 'completed';
  isUrgent?: boolean;
}

@Component({
  selector: 'app-missions',
  templateUrl: './missions.page.html',
  styleUrls: ['./missions.page.scss'],
  standalone: false,
})
export class MissionsPage implements OnInit {
  missions: Mission[] = [];
  filteredMissions: Mission[] = [];
  selectedCategory: string = 'all';
  searchTerm: string = '';
  showFilters: boolean = false;
  selectedBudgetRange: string = 'all';
  selectedDeadline: string = 'all';

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

  constructor(private router: Router) {}

  ngOnInit() {
    this.loadMissions();
  }

  loadMissions() {
    // Simulation de données - À remplacer par un service Firebase
    this.missions = [
      {
        id: '1',
        title: 'Refonte Site Web WordPress',
        description: 'Recherche un développeur WordPress expérimenté pour refonte complète d\'un site e-commerce. Design moderne et responsive requis.',
        category: 'development',
        budget: { min: 800, max: 1200 },
        deadline: '2024-07-15',
        clientName: 'TechCorp',
        clientAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
        publishedAt: '2024-06-05',
        skills: ['WordPress', 'PHP', 'JavaScript', 'CSS'],
        applicationsCount: 12,
        status: 'open',
        isUrgent: false
      },
      {
        id: '2',
        title: 'Identité Visuelle Startup',
        description: 'Création complète d\'identité visuelle pour une startup tech : logo, charte graphique, cartes de visite.',
        category: 'design',
        budget: { min: 600, max: 900 },
        deadline: '2024-06-20',
        clientName: 'InnovateLab',
        clientAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
        publishedAt: '2024-06-06',
        skills: ['Illustrator', 'Photoshop', 'Branding', 'Design'],
        applicationsCount: 8,
        status: 'open',
        isUrgent: true
      },
      {
        id: '3',
        title: 'Application Mobile E-learning',
        description: 'Développement d\'une application mobile de formation en ligne avec système de quiz et suivi de progression.',
        category: 'development',
        budget: { min: 2000, max: 3500 },
        deadline: '2024-09-01',
        clientName: 'EduTech Solutions',
        clientAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
        publishedAt: '2024-06-04',
        skills: ['React Native', 'Node.js', 'MongoDB', 'Firebase'],
        applicationsCount: 15,
        status: 'open',
        isUrgent: false
      },
      {
        id: '4',
        title: 'Stratégie Social Media',
        description: 'Recherche expert en marketing digital pour développer une stratégie complète sur les réseaux sociaux.',
        category: 'marketing',
        budget: { min: 400, max: 700 },
        deadline: '2024-06-25',
        clientName: 'Fashion Brand',
        clientAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b789?w=100&h=100&fit=crop&crop=face',
        publishedAt: '2024-06-07',
        skills: ['Instagram', 'Facebook', 'TikTok', 'Content Strategy'],
        applicationsCount: 6,
        status: 'open',
        isUrgent: true
      }
    ];

    this.updateCategoryCounts();
    this.applyFilters();
  }

  updateCategoryCounts() {
    this.categories.forEach(cat => {
      if (cat.value === 'all') {
        cat.count = this.missions.length;
      } else {
        cat.count = this.missions.filter(m => m.category === cat.value).length;
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

  viewMissionDetails(missionId: string) {
    this.router.navigate(['/tabs/missions/mission-details', missionId]);
  }

  applyToMission(mission: Mission) {
    // Redirection vers la page de candidature
    this.router.navigate(['/apply-mission', mission.id]);
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
      design: '🎨',
      development: '💻',
      marketing: '📈',
      writing: '✍️'
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
}