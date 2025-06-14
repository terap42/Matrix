import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { MissionService, MissionDetail } from '../../services/mission.service';

@Component({
  selector: 'app-mission-details',
  templateUrl: './mission-details.page.html',
  styleUrls: ['./mission-details.page.scss'],
  standalone: false,
})
export class MissionDetailsPage implements OnInit, OnDestroy {
  mission: MissionDetail | null = null;
  missionId: string = '';
  loading: boolean = true;
  error: string = '';
  showFullDescription: boolean = false;

  private subscriptions: Subscription = new Subscription();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private missionService: MissionService
  ) {}

  ngOnInit() {
    console.log('MissionDetailsPage loaded');
    this.route.params.subscribe(params => {
      this.missionId = params['id'];
      console.log('Mission ID:', this.missionId);
      this.loadMissionDetails();
    });
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  loadMissionDetails() {
    this.loading = true;
    this.error = '';

    console.log('🔍 Chargement mission ID:', this.missionId);

    this.subscriptions.add(
      this.missionService.getMissionById(this.missionId).subscribe({
        next: (mission) => {
          console.log('✅ Mission chargée:', mission);
          this.mission = mission;
          this.loading = false;
        },
        error: (error) => {
          console.error('❌ Erreur chargement mission:', error);
          this.error = 'Mission non trouvée ou erreur de chargement';
          this.loading = false;
          
          // Créer une mission de fallback si l'API échoue
          this.createFallbackMission();
        }
      })
    );
  }

  // Créer une mission de fallback en cas d'erreur
  createFallbackMission() {
    console.log('📋 Création mission fallback pour ID:', this.missionId);
    
    this.mission = {
      id: this.missionId,
      title: 'Mission en cours de chargement...',
      description: 'Cette mission est en cours de récupération depuis le serveur.',
      longDescription: 'Description détaillée en cours de chargement depuis l\'API. Cette mission a été récemment créée et ses détails complets sont en cours de synchronisation.\n\nVeuillez rafraîchir la page dans quelques instants pour voir toutes les informations, ou vérifiez que le serveur backend est démarré.',
      category: 'Développement',
      budget: { min: 500, max: 1000 },
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 jours
      client: {
        id: 'fallback-client',
        name: 'Client en cours de chargement',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
        rating: 4.5,
        completedProjects: 5,
        memberSince: new Date().toISOString().split('T')[0],
        verified: false
      },
      publishedAt: new Date().toISOString().split('T')[0],
      skills: ['Compétences en cours de chargement'],
      requirements: [
        'Exigences en cours de récupération depuis l\'API',
        'Veuillez contacter le client pour plus de détails',
        'Vérifiez que le serveur backend est démarré'
      ],
      deliverables: [
        'Livrables en cours de spécification',
        'Détails à confirmer avec le client',
        'Informations complètes disponibles via l\'API'
      ],
      applicationsCount: 0,
      status: 'open',
      isUrgent: false,
      attachments: []
    };
    
    this.loading = false;
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
    console.log('💾 Mission sauvegardée en favoris:', this.mission?.id);
    // TODO: Implémenter la logique de sauvegarde via API
    this.showSuccessMessage('Mission ajoutée aux favoris !');
  }

  reportMission() {
    console.log('🚨 Mission signalée:', this.mission?.id);
    // TODO: Implémenter la logique de signalement via API
    this.showSuccessMessage('Mission signalée !');
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
    const days = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, days); // Éviter les valeurs négatives
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
    console.log('📥 Téléchargement de:', attachment.name);
    // TODO: Implémenter le téléchargement réel via API
    window.open(attachment.url, '_blank');
  }

  toggleDescription() {
    this.showFullDescription = !this.showFullDescription;
  }

  shareMission() {
    if (navigator.share && this.mission) {
      navigator.share({
        title: this.mission.title,
        text: this.mission.description,
        url: window.location.href
      }).catch(err => {
        console.log('Erreur partage:', err);
        this.copyToClipboard();
      });
    } else {
      this.copyToClipboard();
    }
  }

  private copyToClipboard() {
    navigator.clipboard.writeText(window.location.href).then(() => {
      console.log('🔗 Lien copié dans le presse-papiers');
      this.showSuccessMessage('Lien copié dans le presse-papiers !');
    }).catch(err => {
      console.error('Erreur copie:', err);
    });
  }

  private showSuccessMessage(message: string) {
    // Simple alert pour l'instant - vous pouvez utiliser un toast service plus tard
    alert(message);
  }

  // Méthodes utilitaires pour le debug
  reloadMission() {
    this.loadMissionDetails();
  }

  getApiStatus(): string {
    return this.error ? 'Erreur API' : 'API OK';
  }
}