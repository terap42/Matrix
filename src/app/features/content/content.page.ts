import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController, ToastController, AlertController } from '@ionic/angular';
import { AuthService, User } from '../auth/services/auth.service';
import { ContentService, CreatePostPayload } from './services/content.service';
import { Subscription } from 'rxjs';
import { CreatePostData } from './components/create-post-modal/create-post-modal.component';
import { HttpErrorResponse } from '@angular/common/http';

export interface Post {
  id: string;
  user: {
    id: string;
    name: string;
    avatar: string;
    type: 'freelance' | 'client';
    speciality?: string;
  };
  content: {
    text?: string;
    images?: string[];
    videos?: string[];
    documents?: string[];
    project?: {
      title: string;
      description: string;
      technologies: string[];
      budget?: string;
      duration?: string;
    };
  };
  interactions: {
    likes: number;
    comments: number;
    shares: number;
    isLiked: boolean;
  };
  createdAt: Date;
  type: 'text' | 'project' | 'bio_update' | 'achievement';
  isUrgent?: boolean;
}

@Component({
  selector: 'app-content',
  templateUrl: './content.page.html',
  styleUrls: ['./content.page.scss'],
  standalone: false,
})
export class ContentPage implements OnInit, OnDestroy {
  showProfileModal = false;
  showCreatePostModal = false;
  currentUser: User | null = null;
  posts: Post[] = [];
  isLoading = false;
  isLoadingMore = false;
  page = 1;
  limit = 10;
  hasMoreData = true;
  private subscriptions: Subscription[] = [];

  constructor(
    private router: Router,
    private authService: AuthService,
    private contentService: ContentService,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private alertController: AlertController
  ) { }

  async ngOnInit() {
    console.log('🚀 Initialisation ContentPage');
    await this.loadCurrentUser();
    await this.loadPosts();
    this.subscribeToUserChanges();
  }

  ngOnDestroy() {
    // Nettoyer les subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private subscribeToUserChanges() {
    const userSub = this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      console.log('👤 Utilisateur mis à jour:', user?.first_name);
    });
    this.subscriptions.push(userSub);

    const postsSub = this.contentService.posts$.subscribe(posts => {
      this.posts = posts;
      console.log('📋 Posts mis à jour:', posts.length);
    });
    this.subscriptions.push(postsSub);
  }

  private async loadCurrentUser() {
    try {
      this.currentUser = await this.authService.getCurrentUser();
      if (!this.currentUser) {
        console.log('❌ Utilisateur non connecté, redirection...');
        this.router.navigate(['/login']);
      }
    } catch (error) {
      console.error('❌ Erreur chargement utilisateur:', error);
      await this.showToast('Erreur de connexion', 'danger');
      this.router.navigate(['/login']);
    }
  }

  async loadPosts(refresh = false) {
    if (this.isLoading || (!this.hasMoreData && !refresh)) return;

    try {
      if (refresh) {
        this.page = 1;
        this.hasMoreData = true;
        this.isLoading = true;
      } else {
        this.isLoadingMore = true;
      }

      console.log(`📋 Chargement posts page ${this.page}...`);
      
      // Appel API réel
      const response = await this.contentService.getPosts(this.page, this.limit).toPromise();
      
      if (response?.success && response.posts) {
        const newPosts = response.posts;
        
        if (refresh) {
          this.posts = newPosts;
          this.contentService.updateLocalPosts(newPosts);
        } else {
          this.posts = [...this.posts, ...newPosts];
          this.contentService.updateLocalPosts(this.posts);
        }
        
        this.hasMoreData = newPosts.length === this.limit;
        this.page++;
        
        console.log(`✅ ${newPosts.length} posts chargés`);
      } else {
        throw new Error('Réponse API invalide');
      }
    } catch (error) {
      console.error('❌ Erreur chargement posts:', error);
      
      // Charger des données de démonstration en cas d'erreur API
      if (this.posts.length === 0) {
        this.loadDemoData();
      }
      
      await this.showToast('Erreur de chargement des contenus', 'warning');
    } finally {
      this.isLoading = false;
      this.isLoadingMore = false;
    }
  }

  private loadDemoData() {
    console.log('📋 Chargement données de démonstration...');
    
    // Données de démonstration si l'API n'est pas disponible
    this.posts = [
      {
        id: '1',
        user: {
          id: '2',
          name: 'Marie Dubois',
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=100&h=100&fit=crop&crop=face',
          type: 'freelance',
          speciality: 'UI/UX Designer'
        },
        content: {
          text: 'Voici mon dernier projet de redesign d\'application mobile pour une startup fintech. Qu\'en pensez-vous ?',
          images: [
            'https://images.unsplash.com/photo-1512486130939-2c4f79935e4f?w=500&h=300&fit=crop',
            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=300&fit=crop'
          ],
          videos: [],
          documents: [],
          project: {
            title: 'Redesign App Fintech',
            description: 'Interface moderne et intuitive pour application de gestion financière',
            technologies: ['Figma', 'Adobe XD', 'Prototyping'],
            duration: '3 semaines'
          }
        },
        interactions: {
          likes: 24,
          comments: 8,
          shares: 3,
          isLiked: false
        },
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        type: 'project',
        isUrgent: false
      },
      {
        id: '2',
        user: {
          id: '3',
          name: 'Ahmed El Hassan',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
          type: 'client'
        },
        content: {
          text: 'Je recherche un développeur React Native pour une application de livraison. Budget : 5000-8000€. Qui est intéressé ?',
          images: [],
          videos: [],
          documents: []
        },
        interactions: {
          likes: 12,
          comments: 15,
          shares: 2,
          isLiked: true
        },
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
        type: 'text',
        isUrgent: true
      }
    ];
    
    this.contentService.updateLocalPosts(this.posts);
    console.log('✅ Données de démonstration chargées');
  }

  async onCreatePost() {
    console.log('➕ Ouvrir modal de création de post');
    this.showCreatePostModal = true;
  }

  onCloseCreatePostModal() {
    this.showCreatePostModal = false;
  }

  async onSubmitPost(postData: CreatePostData) {
    const loading = await this.loadingController.create({
      message: 'Publication en cours...',
      spinner: 'circular'
    });

    try {
      await loading.present();
      console.log('📤 Création nouveau post:', {
        type: postData.type,
        contentLength: postData.content.length,
        filesCount: postData.files.length,
        hasProject: !!postData.project
      });

      // Convertir les données du modal vers le format du service
      const servicePayload: CreatePostPayload = {
        title: postData.title,
        content: postData.content,
        type: postData.type,
        isUrgent: postData.isUrgent,
        files: postData.files
      };

      // Ajouter les données projet si applicable
      if (postData.type === 'project' && postData.project) {
        servicePayload.projectTitle = postData.project.title;
        servicePayload.projectDescription = postData.project.description;
        servicePayload.projectTechnologies = postData.project.technologies;
        servicePayload.projectBudget = postData.project.budget;
        servicePayload.projectDuration = postData.project.duration;
      }

      // Appel API réel
      const response = await this.contentService.createPost(servicePayload).toPromise();

      if (response?.success && response.post) {
        await this.showToast('Publication créée avec succès !', 'success');
        this.showCreatePostModal = false;
        
        // Ajouter le nouveau post en haut de la liste
        this.contentService.addPostToLocal(response.post);
        
        // Optionnel: recharger pour sync avec le serveur
        // await this.loadPosts(true);
      } else {
        throw new Error(response?.message || 'Erreur lors de la création');
      }
      
    } catch (error: unknown) {
      console.error('❌ Erreur création post:', error);
      
      // Gestion d'erreur améliorée avec vérification de type
      let errorMessage = 'Erreur lors de la création de la publication';
      
      if (error instanceof HttpErrorResponse) {
        if (error.status === 413) {
          errorMessage = 'Fichier trop volumineux (max 50MB)';
        } else if (error.status === 400) {
          errorMessage = error.error?.message || 'Données invalides';
        } else if (error.status === 401) {
          errorMessage = 'Session expirée, veuillez vous reconnecter';
          this.router.navigate(['/login']);
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      await this.showToast(errorMessage, 'danger');
    } finally {
      await loading.dismiss();
    }
  }

  async onLike(post: Post) {
    try {
      console.log(`❤️ Toggle like pour post ${post.id}`);
      
      // Optimistic update
      const wasLiked = post.interactions.isLiked;
      post.interactions.isLiked = !wasLiked;
      post.interactions.likes += wasLiked ? -1 : 1;

      // Appel API
      const response = await this.contentService.toggleLike(post.id).toPromise();
      
      if (response?.success && response.data) {
        // Mettre à jour avec les vraies données du serveur
        post.interactions.likes = response.data.likesCount;
        post.interactions.isLiked = response.data.isLiked;
        
        // Mettre à jour dans le store local
        this.contentService.updatePostInLocal(post.id, {
          interactions: post.interactions
        });
      } else {
        // Revenir à l'état précédent en cas d'erreur
        post.interactions.isLiked = wasLiked;
        post.interactions.likes += wasLiked ? 1 : -1;
        throw new Error('Erreur lors du like');
      }
    } catch (error) {
      console.error('❌ Erreur like:', error);
      await this.showToast('Erreur lors du like', 'danger');
    }
  }

  async onComment(post: Post) {
    console.log(`💬 Commenter le post: ${post.id}`);
    
    const alert = await this.alertController.create({
      header: 'Ajouter un commentaire',
      inputs: [
        {
          name: 'comment',
          type: 'textarea',
          placeholder: 'Votre commentaire...',
          attributes: {
            maxlength: 500
          }
        }
      ],
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel'
        },
        {
          text: 'Publier',
          handler: async (data) => {
            if (data.comment && data.comment.trim()) {
              try {
                const response = await this.contentService.addComment(post.id, data.comment.trim()).toPromise();
                
                if (response?.success && response.data) {
                  post.interactions.comments = response.data.commentsCount;
                  
                  // Mettre à jour dans le store local
                  this.contentService.updatePostInLocal(post.id, {
                    interactions: post.interactions
                  });
                  
                  await this.showToast('Commentaire ajouté !', 'success');
                } else {
                  throw new Error('Erreur lors de l\'ajout du commentaire');
                }
              } catch (error) {
                console.error('❌ Erreur commentaire:', error);
                await this.showToast('Erreur lors de l\'ajout du commentaire', 'danger');
              }
            }
          }
        }
      ]
    });
    
    await alert.present();
  }

  async onShare(post: Post) {
    try {
      console.log(`🔄 Partager le post: ${post.id}`);
      
      const response = await this.contentService.sharePost(post.id).toPromise();
      
      if (response?.success && response.data) {
        post.interactions.shares = response.data.sharesCount;
        
        // Mettre à jour dans le store local
        this.contentService.updatePostInLocal(post.id, {
          interactions: post.interactions
        });
        
        await this.showToast('Post partagé !', 'success');
      } else {
        throw new Error('Erreur lors du partage');
      }
    } catch (error) {
      console.error('❌ Erreur partage:', error);
      await this.showToast('Erreur lors du partage', 'danger');
    }
  }

  async onUserProfile(userId: string) {
    console.log('👤 Voir profil utilisateur:', userId);
    
    try {
      // Appel API pour récupérer le profil
      const response = await this.contentService.getUserProfile(userId).toPromise();
      
      if (response?.success && response.profile) {
        // Naviguer vers la page de profil avec les données
        this.router.navigate(['/profile', userId], {
          state: { profile: response.profile }
        });
      } else {
        // Navigation simple si pas de données détaillées
        this.router.navigate(['/profile', userId]);
      }
    } catch (error) {
      console.error('❌ Erreur récupération profil:', error);
      // Navigation simple en cas d'erreur
      this.router.navigate(['/profile', userId]);
    }
  }

  toggleProfileModal() {
    this.showProfileModal = !this.showProfileModal;
  }

  async onLogout() {
    const alert = await this.alertController.create({
      header: 'Déconnexion',
      message: 'Êtes-vous sûr de vouloir vous déconnecter ?',
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel'
        },
        {
          text: 'Se déconnecter',
          handler: async () => {
            await this.performLogout();
          }
        }
      ]
    });
    await alert.present();
  }

  private async performLogout() {
    const loading = await this.loadingController.create({
      message: 'Déconnexion...',
      spinner: 'circular'
    });

    try {
      await loading.present();
      
      // Nettoyer les données locales
      this.contentService.clearPosts();
      
      // Déconnexion
      await this.authService.logout();
      await loading.dismiss();
      await this.showToast('Vous êtes déconnecté', 'success');
      
      // Redirection vers la page de connexion
      this.router.navigate(['/login'], { replaceUrl: true });
    } catch (error) {
      await loading.dismiss();
      console.error('❌ Erreur déconnexion:', error);
      await this.showToast('Erreur lors de la déconnexion', 'danger');
    }
  }

  async doRefresh(event: any) {
    console.log('🔄 Refresh des posts...');
    try {
      await this.loadPosts(true);
      await this.showToast('Contenus actualisés', 'success');
    } catch (error) {
      console.error('❌ Erreur refresh:', error);
    } finally {
      event.target.complete();
    }
  }

  async loadMore(event: any) {
    console.log('📋 Chargement posts supplémentaires...');
    try {
      await this.loadPosts(false);
    } catch (error) {
      console.error('❌ Erreur load more:', error);
    } finally {
      event.target.complete();
    }
  }

  // Fonction de tracking pour ngFor (améliore les performances)
  trackByPostId(index: number, post: Post): string {
    return post.id;
  }

  getTimeAgo(date: Date): string {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'À l\'instant';
    } else if (diffInHours < 24) {
      return `Il y a ${diffInHours}h`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `Il y a ${diffInDays}j`;
    }
  }

  formatNumber(num: number): string {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  }

  getUserDisplayName(): string {
    if (!this.currentUser) return 'Utilisateur';
    return `${this.currentUser.first_name} ${this.currentUser.last_name}`;
  }

  getUserSpeciality(): string {
    if (!this.currentUser) return '';
    
    if (this.currentUser.user_type === 'freelance') {
      // Pour les freelances, on cherche la spécialité dans la bio ou un champ dédié
      return this.currentUser.bio?.split('.')[0] || 'Freelance';
    } else if (this.currentUser.user_type === 'client') {
      return 'Client';
    } else if (this.currentUser.user_type === 'admin') {
      return 'Administrateur';
    }
    return this.currentUser.user_type;
  }

  getUserAvatar(): string {
    return this.currentUser?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face';
  }

  private async showToast(message: string, color: 'success' | 'warning' | 'danger' = 'success') {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      position: 'top',
      color,
      buttons: [
        {
          text: '✕',
          role: 'cancel'
        }
      ]
    });
    await toast.present();
  }
}