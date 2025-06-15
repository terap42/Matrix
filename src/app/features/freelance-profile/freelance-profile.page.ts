import { Component, OnInit } from '@angular/core';
import { ToastController, LoadingController, AlertController } from '@ionic/angular';
import { Router } from '@angular/router';

interface Skill {
  name: string;
  level: 'debutant' | 'intermediaire' | 'avance' | 'expert';
}

interface Project {
  title: string;
  description: string;
  imageUrl: string;
  projectUrl: string;
}

interface FreelanceProfile {
  id?: number;
  userId?: number;
  fullName: string;
  title: string;
  bio: string;
  hourlyRate: number;
  availability: boolean;
  experienceYears: number;
  completedMissions: number;
  averageRating: number;
  totalEarnings: number;
  responseTimeHours: number;
  skills: Skill[];
  portfolio: Project[];
  createdAt?: string;
  updatedAt?: string;
}

@Component({
  selector: 'app-freelance-profile',
  templateUrl: './freelance-profile.page.html',
  styleUrls: ['./freelance-profile.page.scss'],
  standalone: false,
})
export class FreelanceProfilePage implements OnInit {
  
  profile: FreelanceProfile = {
    fullName: '',
    title: '',
    bio: '',
    hourlyRate: 0,
    availability: true,
    experienceYears: 0,
    completedMissions: 0,
    averageRating: 0,
    totalEarnings: 0,
    responseTimeHours: 24,
    skills: [],
    portfolio: []
  };

  isSaving: boolean = false;

  constructor(
    private toastController: ToastController,
    private loadingController: LoadingController,
    private alertController: AlertController,
    private router: Router
  ) { }

  ngOnInit() {
    this.loadProfile();
  }

  /**
   * Charge le profil existant depuis l'API
   */
  async loadProfile() {
    const loading = await this.loadingController.create({
      message: 'Chargement du profil...',
      duration: 2000
    });
    
    await loading.present();

    try {
      // Simuler un appel API - remplacez par votre service réel
      // const response = await this.profileService.getProfile();
      
      // Données d'exemple pour la démonstration
      const mockProfile = {
        fullName: 'Alexandre Martin',
        title: 'Développeur Full-Stack & Designer UI/UX',
        bio: 'Développeur passionné avec 5 ans d\'expérience en React, Node.js et design UI/UX. Spécialisé dans la création d\'applications web modernes et intuitives.',
        hourlyRate: 350,
        availability: true,
        experienceYears: 5,
        completedMissions: 42,
        averageRating: 4.8,
        totalEarnings: 125000,
        responseTimeHours: 24,
        skills: [
          { name: 'React', level: 'expert' as const },
          { name: 'Node.js', level: 'avance' as const },
          { name: 'TypeScript', level: 'avance' as const },
          { name: 'UI/UX Design', level: 'intermediaire' as const }
        ],
        portfolio: [
          {
            title: 'Application E-commerce',
            description: 'Développement d\'une plateforme e-commerce complète avec React et Node.js',
            imageUrl: 'https://example.com/project1.jpg',
            projectUrl: 'https://example.com/project1'
          }
        ]
      };

      // Charger les données existantes ou utiliser les données par défaut
      this.profile = { ...this.profile, ...mockProfile };
      
      await loading.dismiss();
    } catch (error) {
      await loading.dismiss();
      this.showToast('Erreur lors du chargement du profil', 'danger');
      console.error('Erreur de chargement:', error);
    }
  }

  /**
   * Sauvegarde le profil
   */
  async saveProfile() {
    if (!this.validateProfile()) {
      return;
    }

    this.isSaving = true;

    try {
      // Simuler un appel API - remplacez par votre service réel
      // await this.profileService.updateProfile(this.profile);
      
      // Simulation d'un délai de sauvegarde
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      this.showToast('Profil sauvegardé avec succès !', 'success');
    } catch (error) {
      this.showToast('Erreur lors de la sauvegarde', 'danger');
      console.error('Erreur de sauvegarde:', error);
    } finally {
      this.isSaving = false;
    }
  }

  /**
   * Valide les données du profil
   */
  private validateProfile(): boolean {
    if (!this.profile.fullName.trim()) {
      this.showToast('Le nom complet est requis', 'warning');
      return false;
    }

    if (!this.profile.title.trim()) {
      this.showToast('Le titre professionnel est requis', 'warning');
      return false;
    }

    if (!this.profile.bio.trim()) {
      this.showToast('La bio est requise', 'warning');
      return false;
    }

    if (this.profile.hourlyRate <= 0) {
      this.showToast('Le tarif horaire doit être supérieur à 0', 'warning');
      return false;
    }

    if (this.profile.experienceYears < 0) {
      this.showToast('Les années d\'expérience ne peuvent pas être négatives', 'warning');
      return false;
    }

    return true;
  }

  /**
   * Ajoute une nouvelle compétence
   */
  addSkill() {
    this.profile.skills.push({
      name: '',
      level: 'debutant'
    });
  }

  /**
   * Supprime une compétence
   */
  async removeSkill(index: number) {
    const alert = await this.alertController.create({
      header: 'Confirmer la suppression',
      message: 'Êtes-vous sûr de vouloir supprimer cette compétence ?',
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel'
        },
        {
          text: 'Supprimer',
          role: 'destructive',
          handler: () => {
            this.profile.skills.splice(index, 1);
          }
        }
      ]
    });

    await alert.present();
  }

  /**
   * Ajoute un nouveau projet
   */
  addProject() {
    this.profile.portfolio.push({
      title: '',
      description: '',
      imageUrl: '',
      projectUrl: ''
    });
  }

  /**
   * Supprime un projet
   */
  async removeProject(index: number) {
    const alert = await this.alertController.create({
      header: 'Confirmer la suppression',
      message: 'Êtes-vous sûr de vouloir supprimer ce projet ?',
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel'
        },
        {
          text: 'Supprimer',
          role: 'destructive',
          handler: () => {
            this.profile.portfolio.splice(index, 1);
          }
        }
      ]
    });

    await alert.present();
  }

  /**
   * Formate les gains en euros
   */
  formatEarnings(amount: number): string {
    if (!amount || amount === 0) return '0 €';
    
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  /**
   * Affiche un toast
   */
  private async showToast(message: string, color: 'success' | 'warning' | 'danger' = 'success') {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      position: 'top',
      color,
      buttons: [
        {
          text: 'Fermer',
          role: 'cancel'
        }
      ]
    });

    await toast.present();
  }

  /**
   * Navigation vers les autres pages
   */
  navigateToTab(tab: string) {
    switch(tab) {
      case 'dashboard':
        this.router.navigate(['/tabs/dashboard']);
        break;
      case 'missions':
        this.router.navigate(['/tabs/missions']);
        break;
      case 'messages':
        this.router.navigate(['/tabs/messages']);
        break;
    }
  }
}