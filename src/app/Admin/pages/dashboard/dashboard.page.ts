// dashboard.page.ts
import { Component, OnInit } from '@angular/core';

interface StatCard {
  title: string;
  value: number;
  icon: string;
  trend: number;
  color: string;
}

interface RecentActivity {
  id: string;
  type: string;
  message: string;
  time: string;
  status: 'info' | 'warning' | 'success' | 'error';
}

interface TopFreelancer {
  id: string;
  name: string;
  avatar: string;
  specialty: string;
  rating: number;
  missions: number;
}

interface SystemStatus {
  service: string;
  status: 'operational' | 'degraded' | 'down';
  icon: string;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: false,
})
export class DashboardPage implements OnInit {

  // 📊 Statistiques principales avec icônes FontAwesome
  stats: StatCard[] = [
    {
      title: 'Utilisateurs Actifs',
      value: 12847,
      icon: 'users', // 👥 Icône utilisateurs
      trend: 12.5,
      color: 'blue'
    },
    {
      title: 'Missions en Cours',
      value: 342,
      icon: 'briefcase', // 💼 Icône missions/travail
      trend: 8.2,
      color: 'green'
    },
    {
      title: 'Signalements',
      value: 23,
      icon: 'flag', // 🚩 Icône signalement/rapport
      trend: -15.3,
      color: 'red'
    },
    {
      title: 'Revenus Mensuels',
      value: 85420,
      icon: 'dollar-sign', // 💰 Icône argent/revenus
      trend: 22.1,
      color: 'purple'
    }
  ];

  // 🔔 Activités récentes avec icônes d'état
  recentActivities: RecentActivity[] = [
    {
      id: '1',
      type: 'Nouvelle inscription',
      message: 'Marie Dubois a rejoint la plateforme comme Designer',
      time: 'Il y a 5 min',
      status: 'success'
    },
    {
      id: '2',
      type: 'Mission complétée',
      message: 'Développement site web - Client: TechCorp terminé',
      time: 'Il y a 12 min',
      status: 'success'
    },
    {
      id: '3',
      type: 'Signalement reçu',
      message: 'Contenu inapproprié signalé sur le profil #4521',
      time: 'Il y a 25 min',
      status: 'warning'
    },
    {
      id: '4',
      type: 'Paiement traité',
      message: 'Virement de 2,850€ effectué vers Jean Martin',
      time: 'Il y a 1h',
      status: 'info'
    },
    {
      id: '5',
      type: 'Erreur système',
      message: 'Échec d\'envoi de notifications push - Service dégradé',
      time: 'Il y a 2h',
      status: 'error'
    }
  ];

  // 🏆 Top freelancers
  topFreelancers: TopFreelancer[] = [
    {
      id: '1',
      name: 'Sarah Johnson',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      specialty: 'Développeuse Full-Stack',
      rating: 4.9,
      missions: 47
    },
    {
      id: '2',
      name: 'Ahmed Ben Ali',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      specialty: 'Designer UI/UX',
      rating: 4.8,
      missions: 35
    },
    {
      id: '3',
      name: 'Emma Rodriguez',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      specialty: 'Rédactrice Web',
      rating: 4.7,
      missions: 42
    },
    {
      id: '4',
      name: 'Thomas Mueller',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      specialty: 'Data Scientist',
      rating: 4.9,
      missions: 28
    }
  ];

  // 🖥️ États du système
  systemServices: SystemStatus[] = [
    {
      service: 'Serveurs API',
      status: 'operational',
      icon: 'server'
    },
    {
      service: 'Base de données',
      status: 'operational',
      icon: 'database'
    },
    {
      service: 'Notifications Push',
      status: 'degraded',
      icon: 'bell'
    },
    {
      service: 'Stockage Fichiers',
      status: 'operational',
      icon: 'cloud'
    }
  ];

  // Période sélectionnée pour les graphiques
  selectedPeriod: string = '7j';

  // Données pour le graphique (exemple)
  chartData = {
    labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
    datasets: [{
      label: 'Nouvelles inscriptions',
      data: [45, 67, 89, 123, 98, 156, 134],
      borderColor: '#3B82F6',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      tension: 0.4
    }]
  };

  constructor() { }

  ngOnInit() {
    // Initialisation des données
    this.loadDashboardData();
  }

  // 🔢 Fonction pour Math.abs (accessible dans le template)
  abs(value: number): number {
    return Math.abs(value);
  }

  // 🎨 Fonction pour obtenir la couleur de fond des statistiques
  getStatColor(color: string): string {
    const colors: { [key: string]: string } = {
      blue: 'bg-blue-500',
      green: 'bg-green-500',
      red: 'bg-red-500',
      purple: 'bg-purple-500',
      yellow: 'bg-yellow-500',
      indigo: 'bg-indigo-500'
    };
    return colors[color] || 'bg-gray-500';
  }

  // 🔍 Fonction pour obtenir l'icône selon le statut d'activité
  getActivityIcon(status: string): string {
    const icons: { [key: string]: string } = {
      info: 'info-circle',       // ℹ️ Information
      warning: 'exclamation-triangle', // ⚠️ Attention
      success: 'check-circle',   // ✅ Succès
      error: 'times-circle'      // ❌ Erreur
    };
    return icons[status] || 'info-circle';
  }

  // 🎨 Fonction pour obtenir la couleur selon le statut d'activité
  getActivityColor(status: string): string {
    const colors: { [key: string]: string } = {
      info: 'text-blue-600',
      warning: 'text-yellow-600',
      success: 'text-green-600',
      error: 'text-red-600'
    };
    return colors[status] || 'text-gray-600';
  }

  // 🖥️ Fonction pour obtenir la couleur du statut système
  getSystemStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      operational: 'bg-green-500',
      degraded: 'bg-yellow-500',
      down: 'bg-red-500'
    };
    return colors[status] || 'bg-gray-500';
  }

  // 🖥️ Fonction pour obtenir le texte du statut système
  getSystemStatusText(status: string): string {
    const texts: { [key: string]: string } = {
      operational: 'Opérationnel',
      degraded: 'Dégradé',
      down: 'Hors service'
    };
    return texts[status] || 'Inconnu';
  }

  // 🖥️ Fonction pour obtenir la couleur du texte du statut système
  getSystemStatusTextColor(status: string): string {
    const colors: { [key: string]: string } = {
      operational: 'text-green-600',
      degraded: 'text-yellow-600',
      down: 'text-red-600'
    };
    return colors[status] || 'text-gray-600';
  }

  // 💰 Fonction pour formater les devises
  formatCurrency(value: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(value);
  }

  // 🔢 Fonction pour formater les nombres
  formatNumber(value: number): string {
    return value.toLocaleString('fr-FR');
  }

  // 🎯 Gestion des actions rapides
  handleQuickAction(action: string): void {
    console.log('Action rapide:', action);
    
    switch(action) {
      case 'moderation':
        this.navigateToModeration();
        break;
      case 'users':
        this.navigateToUsers();
        break;
      case 'missions':
        this.navigateToMissions();
        break;
      case 'settings':
        this.navigateToSettings();
        break;
      default:
        console.warn('Action non reconnue:', action);
    }
  }

  // 📊 Sélection de période pour les graphiques  
  selectPeriod(period: string): void {
    this.selectedPeriod = period;
    this.loadChartData(period);
  }

  // 🔄 Chargement des données du tableau de bord
  private loadDashboardData(): void {
    // Ici vous pouvez charger les données depuis votre API
    console.log('Chargement des données du tableau de bord...');
  }

  // 📈 Chargement des données du graphique selon la période
  private loadChartData(period: string): void {
    // Ici vous pouvez charger les données du graphique selon la période
    console.log('Chargement des données graphique pour:', period);
  }

  // 🧭 Méthodes de navigation
  private navigateToModeration(): void {
    console.log('Navigation vers modération');
    // Implémentez votre logique de navigation
  }

  private navigateToUsers(): void {
    console.log('Navigation vers gestion utilisateurs');
    // Implémentez votre logique de navigation
  }

  private navigateToMissions(): void {
    console.log('Navigation vers gestion missions');
    // Implémentez votre logique de navigation
  }

  private navigateToSettings(): void {
    console.log('Navigation vers paramètres');
    // Implémentez votre logique de navigation
  }

  // 👀 Voir toutes les activités
  viewAllActivities(): void {
    console.log('Affichage de toutes les activités');
    // Implémentez votre logique de navigation
  }

  // 🏆 Voir tous les freelancers
  viewAllFreelancers(): void {
    console.log('Affichage de tous les freelancers');
    // Implémentez votre logique de navigation
  }

  // 🔄 Rafraîchir les données
  refreshData(): void {
    console.log('Rafraîchissement des données...');
    this.loadDashboardData();
  }
}