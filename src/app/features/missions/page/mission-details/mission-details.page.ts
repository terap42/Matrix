import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

interface MissionDetail {
  id: string;
  title: string;
  description: string;
  longDescription: string;
  category: string;
  budget: {
    min: number;
    max: number;
  };
  deadline: string;
  client: {
    id: string;
    name: string;
    avatar: string;
    rating: number;
    completedProjects: number;
    memberSince: string;
    verified: boolean;
  };
  publishedAt: string;
  skills: string[];
  requirements: string[];
  deliverables: string[];
  applicationsCount: number;
  status: 'open' | 'in_progress' | 'completed';
  isUrgent?: boolean;
  attachments?: {
    name: string;
    url: string;
    type: string;
  }[];
}

@Component({
  selector: 'app-mission-details',
  templateUrl: './mission-details.page.html',
  styleUrls: ['./mission-details.page.scss'],
  standalone: false,
})
export class MissionDetailsPage implements OnInit {
  mission: MissionDetail | null = null;
  missionId: string = '';
  loading: boolean = true;
  showFullDescription: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    console.log('MissionDetailsPage loaded');
    this.route.params.subscribe(params => {
      this.missionId = params['id'];
      console.log('Mission ID:', this.missionId);
      this.loadMissionDetails();
    });
  }

  loadMissionDetails() {
    this.loading = true;

    const missionsMock: MissionDetail[] = [
      {
        id: '1',
        title: 'Refonte Site Web WordPress',
        description: 'Recherche un développeur WordPress expérimenté pour refonte complète d\'un site e-commerce. Design moderne et responsive requis.',
        longDescription: 'Description longue...',
        category: 'development',
        budget: { min: 800, max: 1200 },
        deadline: '2024-07-15',
        client: {
          id: 'client1',
          name: 'TechCorp',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
          rating: 4.8,
          completedProjects: 23,
          memberSince: '2022-03-15',
          verified: true
        },
        publishedAt: '2024-06-05',
        skills: ['WordPress', 'PHP', 'JavaScript', 'CSS'],
        requirements: [],
        deliverables: [],
        applicationsCount: 12,
        status: 'open',
        isUrgent: false,
        attachments: []
      },
      {
        id: '2',
        title: 'Identité Visuelle Startup',
        description: 'Création de l\'identité visuelle complète pour une nouvelle startup. Logo, carte de visite, et charte graphique requis.',
        longDescription: 'Description longue...',
        category: 'design',
        budget: { min: 500, max: 800 },
        deadline: '2024-08-01',
        client: {
          id: 'client2',
          name: 'InnoTech',
          avatar: 'https://images.unsplash.com/photo-1507679790980-4b94378b2f4b?w=100&h=100&fit=crop&crop=face',
          rating: 4.5,
          completedProjects: 10,
          memberSince: '2023-01-10',
          verified: true
        },
        publishedAt: '2024-07-10',
        skills: ['Graphisme', 'Illustrator', 'Photoshop'],
        requirements: [],
        deliverables: [],
        applicationsCount: 8,
        status: 'completed',
        isUrgent: true,
        attachments: []
      },
      // Ajoute autant de missions que tu veux ici
    ];

    setTimeout(() => {
      this.mission = missionsMock.find(m => m.id === this.missionId) || null;
      this.loading = false;
    }, 500);
  }

  applyToMission() {
    if (this.mission) {
      this.router.navigate(['/apply-mission', this.mission.id]);
    }
  }

  contactClient() {
    if (this.mission) {
      this.router.navigate(['/chat', this.mission.client.id]);
    }
  }

  saveToFavorites() {
    // Logique pour sauvegarder en favoris
    console.log('Mission sauvegardée en favoris');
  }

  reportMission() {
    // Logique pour signaler la mission
    console.log('Mission signalée');
  }

  goBack() {
    this.router.navigate(['/tabs/missions']);
  }

  formatBudget(budget: { min: number; max: number }): string {
    return `€${budget.min} - €${budget.max}`;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      day: '2-digit', 
      month: 'long', 
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

  getDaysUntilDeadline(): number {
    if (!this.mission) return 0;
    const deadline = new Date(this.mission.deadline);
    const now = new Date();
    return Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  }

  getUrgencyClass(): string {
    const days = this.getDaysUntilDeadline();
    if (days <= 7) return 'urgent';
    if (days <= 30) return 'soon';
    return 'normal';
  }

  getFileIcon(fileType: string): string {
    const icons = {
      'pdf': '📄',
      'figma': '🎨',
      'doc': '📝',
      'xlsx': '📊',
      'zip': '📦'
    };
    return icons[fileType as keyof typeof icons] || '📎';
  }

  downloadAttachment(attachment: any) {
    // Logique pour télécharger le fichier
    window.open(attachment.url, '_blank');
  }

  toggleDescription() {
    this.showFullDescription = !this.showFullDescription;
  }

  shareMission() {
    if (navigator.share) {
      navigator.share({
        title: this.mission?.title,
        text: this.mission?.description,
        url: window.location.href
      });
    } else {
      // Fallback pour les navigateurs qui ne supportent pas l'API Web Share
      navigator.clipboard.writeText(window.location.href);
      // Afficher une notification
    }
  }
}