import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit {

  // Données du tableau de bord
  dashboardStats = {
    activeMissions: 12,
    monthlyRevenue: 2850,
    successRate: 94,
    averageRating: 4.8,
    completedProjects: 47
  };

  // Missions récentes
  recentMissions = [
    {
      id: 1,
      title: 'Logo Design E-commerce',
      category: 'Design',
      client: 'TechStart',
      amount: 450,
      status: 'EN COURS',
      statusColor: 'bg-blue-100 text-blue-700',
      deadline: '2025-06-10'
    },
    {
      id: 2,
      title: 'App Mobile React Native',
      category: 'Développement',
      client: 'InnovateCorp',
      amount: 1200,
      status: 'EN ATTENTE',
      statusColor: 'bg-yellow-100 text-yellow-700',
      deadline: '2025-06-15'
    },
    {
      id: 3,
      title: 'Site Web Vitrine',
      category: 'Développement',
      client: 'StartupXYZ',
      amount: 800,
      status: 'TERMINÉ',
      statusColor: 'bg-green-100 text-green-700',
      deadline: '2025-05-30'
    },
    {
      id: 4,
      title: 'Stratégie SEO',
      category: 'Marketing',
      client: 'DigitalPro',
      amount: 650,
      status: 'EN COURS',
      statusColor: 'bg-blue-100 text-blue-700',
      deadline: '2025-06-20'
    }
  ];

  // Messages récents
  recentMessages = [
    {
      id: 1,
      client: 'TechStart',
      message: 'Pouvez-vous me montrer les premières ébauches du logo ?',
      time: '14:30',
      unread: true
    },
    {
      id: 2,
      client: 'InnovateCorp',
      message: 'Parfait ! Le projet est validé, nous pouvons commencer.',
      time: '12:45',
      unread: false
    },
    {
      id: 3,
      client: 'StartupXYZ',
      message: 'Merci pour l\'excellent travail sur le site !',
      time: '10:20',
      unread: false
    }
  ];

  // Nouvelles offres recommandées
  recommendedOffers = [
    {
      id: 1,
      title: 'Refonte UX/UI Application Mobile',
      budget: '1,500€ - 2,000€',
      skills: ['UI/UX', 'Figma', 'Prototypage'],
      client: 'MobileTech',
      postedTime: '2h',
      matchScore: 95
    },
    {
      id: 2,
      title: 'Développement API REST',
      budget: '800€ - 1,200€',
      skills: ['Node.js', 'MongoDB', 'API'],
      client: 'DataCorp',
      postedTime: '5h',
      matchScore: 88
    },
    {
      id: 3,
      title: 'Identité Visuelle Startup',
      budget: '600€ - 900€',
      skills: ['Branding', 'Logo', 'Charte graphique'],
      client: 'FreshStart',
      postedTime: '8h',
      matchScore: 92
    }
  ];

  constructor() { }

  ngOnInit() {
    // Initialisation des données
    this.loadDashboardData();
  }

  loadDashboardData() {
    // Simulation du chargement des données depuis Firebase
    // En production, vous récupéreriez les données depuis Firestore
  }

  onMissionClick(mission: any) {
    // Navigation vers le détail de la mission
    console.log('Mission clicked:', mission);
  }

  onMessageClick(message: any) {
    // Navigation vers la messagerie
    console.log('Message clicked:', message);
  }

  onOfferClick(offer: any) {
    // Navigation vers le détail de l'offre
    console.log('Offer clicked:', offer);
  }

  onViewAllMissions() {
    // Navigation vers la page des missions
    console.log('View all missions');
  }

  onViewAllMessages() {
    // Navigation vers la messagerie
    console.log('View all messages');
  }

  onViewAllOffers() {
    // Navigation vers les offres
    console.log('View all offers');
  }
}