import { Component, OnInit } from '@angular/core';
import { ToastController, LoadingController, AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';

interface Skill {
  id?: number;
  name: string;
  level: 'debutant' | 'intermediaire' | 'avance' | 'expert';
}

interface Project {
  id?: string;
  title: string;
  description: string;
  imageUrl: string;
  projectUrl: string;
  technologies: string[];
  technologiesString?: string; // Helper pour l'input
  createdAt?: string;
  isNew?: boolean; // Pour identifier les nouveaux projets
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
  
  private apiUrl = 'http://localhost:3000/api';
  
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
  isLoading: boolean = false;

  constructor(
    private toastController: ToastController,
    private loadingController: LoadingController,
    private alertController: AlertController,
    private router: Router,
    private http: HttpClient
  ) { }

  ngOnInit() {
    this.loadProfile();
  }

  /**
   * Récupère les headers avec le token d'authentification
   */
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken');
    console.log('🔐 Token récupéré:', token ? 'Présent' : 'Absent');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  /**
   * Charge le profil existant depuis l'API
   */
  async loadProfile() {
    this.isLoading = true;
    const loading = await this.loadingController.create({
      message: 'Chargement du profil...',
      duration: 10000
    });
    
    await loading.present();

    try {
      const headers = this.getAuthHeaders();
      console.log('📡 Chargement profil...');
      
      const response: any = await this.http.get(
        `${this.apiUrl}/freelance-profile`,
        { headers }
      ).toPromise();

      console.log('📥 Réponse API profil:', response);

      if (response && response.success && response.profile) {
        this.profile = { ...this.profile, ...response.profile };
        
        // Convertir les technologies en string pour l'affichage
        if (this.profile.portfolio && Array.isArray(this.profile.portfolio)) {
          this.profile.portfolio.forEach(project => {
            if (project.technologies && Array.isArray(project.technologies)) {
              project.technologiesString = project.technologies.join(', ');
            }
          });
        }
        
        console.log('✅ Profil chargé:', this.profile);
        
        // Charger les stats également
        await this.loadStats();
      } else {
        this.showToast('Erreur lors du chargement du profil', 'warning');
      }
      
    } catch (error: any) {
      console.error('❌ Erreur chargement profil:', error);
      
      if (error.status === 401) {
        this.showToast('Session expirée, veuillez vous reconnecter', 'danger');
        this.router.navigate(['/login']);
      } else if (error.status === 403) {
        this.showToast('Accès réservé aux freelances', 'warning');
        this.router.navigate(['/tabs/dashboard']);
      } else {
        this.showToast('Erreur lors du chargement du profil', 'danger');
      }
    } finally {
      this.isLoading = false;
      await loading.dismiss();
    }
  }

  /**
   * Sauvegarde le profil - VERSION CORRIGÉE
   */
  async saveProfile() {
    if (!this.validateProfile()) {
      return;
    }

    this.isSaving = true;
    
    const loading = await this.loadingController.create({
      message: 'Sauvegarde en cours...',
      duration: 10000
    });
    
    await loading.present();

    try {
      console.log('💾 Début sauvegarde profil...');
      
      // 1. Sauvegarder d'abord le profil principal
      const headers = this.getAuthHeaders();
      
      const profileData = {
        fullName: this.profile.fullName,
        title: this.profile.title,
        bio: this.profile.bio,
        hourlyRate: this.profile.hourlyRate,
        availability: this.profile.availability,
        experienceYears: this.profile.experienceYears,
        responseTimeHours: this.profile.responseTimeHours,
        skills: this.profile.skills
      };
      
      console.log('📤 Données profil à sauvegarder:', profileData);
      
      const response: any = await this.http.put(
        `${this.apiUrl}/freelance-profile`,
        profileData,
        { headers }
      ).toPromise();

      console.log('📥 Réponse sauvegarde profil:', response);

      if (response && response.success) {
        console.log('✅ Profil principal sauvegardé');
        
        // 2. Sauvegarder les projets du portfolio séparément
        await this.savePortfolioProjects();
        
        this.showToast('Profil sauvegardé avec succès !', 'success');
        
        // 3. Recharger le profil pour avoir les données à jour
        await this.loadProfile();
      } else {
        throw new Error(response?.message || 'Erreur de sauvegarde');
      }
      
    } catch (error: any) {
      console.error('❌ Erreur sauvegarde:', error);
      
      if (error.status === 401) {
        this.showToast('Session expirée, veuillez vous reconnecter', 'danger');
        this.router.navigate(['/login']);
      } else if (error.status === 400) {
        this.showToast(error.error?.message || 'Données invalides', 'warning');
      } else {
        this.showToast('Erreur lors de la sauvegarde: ' + (error.error?.message || error.message), 'danger');
      }
    } finally {
      this.isSaving = false;
      await loading.dismiss();
    }
  }

  /**
   * Sauvegarde les projets du portfolio - VERSION CORRIGÉE
   */
  private async savePortfolioProjects() {
    console.log('📁 Début sauvegarde portfolio...');
    const headers = this.getAuthHeaders();
    
    if (!this.profile.portfolio || this.profile.portfolio.length === 0) {
      console.log('📋 Aucun projet à sauvegarder');
      return;
    }
    
    for (let i = 0; i < this.profile.portfolio.length; i++) {
      const project = this.profile.portfolio[i];
      
      // Convertir les technologies string en array si nécessaire
      if (project.technologiesString && typeof project.technologiesString === 'string') {
        project.technologies = project.technologiesString
          .split(',')
          .map(tech => tech.trim())
          .filter(tech => tech.length > 0);
      }
      
      const projectData = {
        title: project.title,
        description: project.description,
        imageUrl: project.imageUrl || '',
        projectUrl: project.projectUrl || '',
        technologies: project.technologies || []
      };
      
      try {
        console.log(`📤 Sauvegarde projet ${i + 1}:`, projectData);
        
        if (project.id && !project.isNew) {
          // Mettre à jour le projet existant
          console.log(`🔄 Mise à jour projet existant ${project.id}`);
          
          const response: any = await this.http.put(
            `${this.apiUrl}/freelance-profile/portfolio/${project.id}`,
            projectData,
            { headers }
          ).toPromise();
          
          console.log(`✅ Projet ${project.id} mis à jour:`, response);
          
        } else {
          // Créer un nouveau projet
          console.log('➕ Création nouveau projet');
          
          const response: any = await this.http.post(
            `${this.apiUrl}/freelance-profile/portfolio`,
            projectData,
            { headers }
          ).toPromise();
          
          console.log('✅ Nouveau projet créé:', response);
          
          if (response && response.success && response.project) {
            project.id = response.project.id;
            project.isNew = false; // Marquer comme non-nouveau
          }
        }
        
      } catch (error: any) {
        console.error(`❌ Erreur sauvegarde projet ${i + 1}:`, error);
        
        // Ne pas arrêter tout le processus pour un projet qui échoue
        if (error.status === 404) {
          console.log(`⚠️ Projet ${project.id} non trouvé, tentative de création...`);
          
          try {
            // Essayer de créer le projet si la mise à jour échoue
            const createResponse: any = await this.http.post(
              `${this.apiUrl}/freelance-profile/portfolio`,
              projectData,
              { headers }
            ).toPromise();
            
            if (createResponse && createResponse.success && createResponse.project) {
              project.id = createResponse.project.id;
              project.isNew = false;
              console.log('✅ Projet recréé avec succès');
            }
          } catch (createError) {
            console.error('❌ Échec création projet:', createError);
          }
        }
      }
    }
    
    console.log('✅ Sauvegarde portfolio terminée');
  }

  /**
   * Valide les données du profil
   */
  private validateProfile(): boolean {
    if (!this.profile.fullName || !this.profile.fullName.trim()) {
      this.showToast('Le nom complet est requis', 'warning');
      return false;
    }

    if (!this.profile.title || !this.profile.title.trim()) {
      this.showToast('Le titre professionnel est requis', 'warning');
      return false;
    }

    if (!this.profile.bio || !this.profile.bio.trim()) {
      this.showToast('La bio est requise', 'warning');
      return false;
    }

    if (this.profile.hourlyRate < 0) {
      this.showToast('Le tarif horaire ne peut pas être négatif', 'warning');
      return false;
    }

    if (this.profile.experienceYears < 0) {
      this.showToast('Les années d\'expérience ne peuvent pas être négatives', 'warning');
      return false;
    }

    // Validation des compétences
    for (const skill of this.profile.skills) {
      if (!skill.name || !skill.name.trim()) {
        this.showToast('Toutes les compétences doivent avoir un nom', 'warning');
        return false;
      }
    }

    // Validation des projets
    for (const project of this.profile.portfolio) {
      if (!project.title || !project.title.trim()) {
        this.showToast('Tous les projets doivent avoir un titre', 'warning');
        return false;
      }
      
      if (!project.description || !project.description.trim()) {
        this.showToast('Tous les projets doivent avoir une description', 'warning');
        return false;
      }
    }

    return true;
  }

  /**
   * Ajoute une nouvelle compétence
   */
  addSkill() {
    this.profile.skills.push({
      name: '',
      level: 'intermediaire'
    });
    console.log('➕ Nouvelle compétence ajoutée');
  }

  /**
   * Supprime une compétence
   */
  async removeSkill(index: number) {
    const skill = this.profile.skills[index];
    
    const alert = await this.alertController.create({
      header: 'Confirmer la suppression',
      message: `Êtes-vous sûr de vouloir supprimer la compétence "${skill.name || 'Sans nom'}" ?`,
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel'
        },
        {
          text: 'Supprimer',
          role: 'destructive',
          handler: async () => {
            try {
              // Si la compétence a un ID, la supprimer du serveur
              if (skill.id) {
                const headers = this.getAuthHeaders();
                await this.http.delete(
                  `${this.apiUrl}/freelance-profile/skills/${skill.id}`,
                  { headers }
                ).toPromise();
                console.log(`✅ Compétence ${skill.id} supprimée du serveur`);
              }
              
              // Supprimer de la liste locale
              this.profile.skills.splice(index, 1);
              this.showToast('Compétence supprimée', 'success');
            } catch (error) {
              console.error('❌ Erreur suppression compétence:', error);
              this.showToast('Erreur lors de la suppression', 'danger');
            }
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
      projectUrl: '',
      technologies: [],
      technologiesString: '',
      isNew: true // Marquer comme nouveau
    });
    console.log('➕ Nouveau projet ajouté');
  }

  /**
   * Supprime un projet
   */
  async removeProject(index: number) {
    const project = this.profile.portfolio[index];
    
    const alert = await this.alertController.create({
      header: 'Confirmer la suppression',
      message: `Êtes-vous sûr de vouloir supprimer le projet "${project.title || 'Sans titre'}" ?`,
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel'
        },
        {
          text: 'Supprimer',
          role: 'destructive',
          handler: async () => {
            try {
              // Si le projet a un ID, le supprimer du serveur
              if (project.id && !project.isNew) {
                const headers = this.getAuthHeaders();
                await this.http.delete(
                  `${this.apiUrl}/freelance-profile/portfolio/${project.id}`,
                  { headers }
                ).toPromise();
                console.log(`✅ Projet ${project.id} supprimé du serveur`);
              }
              
              // Supprimer de la liste locale
              this.profile.portfolio.splice(index, 1);
              this.showToast('Projet supprimé', 'success');
            } catch (error) {
              console.error('❌ Erreur suppression projet:', error);
              this.showToast('Erreur lors de la suppression', 'danger');
            }
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
      duration: 4000,
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

  /**
   * Récupère les statistiques du freelance
   */
  async loadStats() {
    try {
      console.log('📊 Chargement des statistiques...');
      const headers = this.getAuthHeaders();
      
      const response: any = await this.http.get(
        `${this.apiUrl}/freelance-profile/stats`,
        { headers }
      ).toPromise();

      console.log('📥 Réponse stats:', response);

      if (response && response.success && response.stats) {
        this.profile.completedMissions = response.stats.completed_missions;
        this.profile.averageRating = response.stats.average_rating;
        this.profile.totalEarnings = response.stats.total_earnings;
        this.profile.responseTimeHours = response.stats.response_time_hours;
        console.log('✅ Statistiques chargées');
      }
    } catch (error) {
      console.error('❌ Erreur chargement stats:', error);
    }
  }

  /**
   * Rafraîchit les données
   */
  async refreshData() {
    console.log('🔄 Rafraîchissement des données...');
    await this.loadProfile();
  }

  /**
   * Sauvegarde un projet individuel (pour les modifications en temps réel)
   */
  async saveProjectIndividually(project: Project, index: number) {
    if (!project.title || !project.description) {
      this.showToast('Titre et description requis', 'warning');
      return;
    }

    try {
      const headers = this.getAuthHeaders();
      
      // Convertir technologies si nécessaire
      if (project.technologiesString) {
        project.technologies = project.technologiesString
          .split(',')
          .map(tech => tech.trim())
          .filter(tech => tech.length > 0);
      }

      const projectData = {
        title: project.title,
        description: project.description,
        imageUrl: project.imageUrl || '',
        projectUrl: project.projectUrl || '',
        technologies: project.technologies || []
      };

      if (project.id && !project.isNew) {
        // Mettre à jour
        const response: any = await this.http.put(
          `${this.apiUrl}/freelance-profile/portfolio/${project.id}`,
          projectData,
          { headers }
        ).toPromise();
        
        if (response.success) {
          this.showToast('Projet mis à jour', 'success');
        }
      } else {
        // Créer
        const response: any = await this.http.post(
          `${this.apiUrl}/freelance-profile/portfolio`,
          projectData,
          { headers }
        ).toPromise();
        
        if (response.success && response.project) {
          project.id = response.project.id;
          project.isNew = false;
          this.showToast('Projet créé', 'success');
        }
      }
    } catch (error: any) {
      console.error('❌ Erreur sauvegarde projet:', error);
      this.showToast('Erreur lors de la sauvegarde du projet', 'danger');
    }
  }
}