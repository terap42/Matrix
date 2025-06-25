import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

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

export interface CreatePostPayload {
  title?: string;
  content: string;
  type: 'text' | 'project' | 'achievement';
  isUrgent: boolean;
  files?: File[];
  // Données projet
  projectTitle?: string;
  projectDescription?: string;
  projectTechnologies?: string[];
  projectBudget?: string;
  projectDuration?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ContentService {
  private apiUrl = `${environment.apiUrl}/content`;
  private postsSubject = new BehaviorSubject<Post[]>([]);
  public posts$ = this.postsSubject.asObservable();

  constructor(private http: HttpClient) { }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  // Récupérer les posts
  getPosts(page: number = 1, limit: number = 10): Observable<{ success: boolean; posts: Post[] }> {
    const headers = this.getAuthHeaders();
    
    return this.http.get<any>(`${this.apiUrl}/posts`, {
      headers,
      params: { page: page.toString(), limit: limit.toString() }
    }).pipe(
      map(response => {
        if (response.success && response.posts) {
          // Convertir les dates
          const posts = response.posts.map((post: any) => ({
            ...post,
            createdAt: new Date(post.createdAt)
          }));
          return { success: true, posts };
        }
        return { success: false, posts: [] };
      }),
      catchError(error => {
        console.error('Erreur récupération posts:', error);
        return throwError(() => error);
      })
    );
  }

  // Créer un nouveau post avec fichiers
  createPost(postData: CreatePostPayload): Observable<{ success: boolean; post?: Post; message?: string }> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    });

    // Utiliser FormData pour supporter l'upload de fichiers
    const formData = new FormData();
    
    // Ajouter les données texte
    formData.append('content', postData.content);
    formData.append('type', postData.type);
    formData.append('isUrgent', postData.isUrgent.toString());
    
    if (postData.title) {
      formData.append('title', postData.title);
    }

    // Ajouter les données projet si c'est un projet
    if (postData.type === 'project') {
      if (postData.projectTitle) formData.append('projectTitle', postData.projectTitle);
      if (postData.projectDescription) formData.append('projectDescription', postData.projectDescription);
      if (postData.projectTechnologies) formData.append('projectTechnologies', JSON.stringify(postData.projectTechnologies));
      if (postData.projectBudget) formData.append('projectBudget', postData.projectBudget);
      if (postData.projectDuration) formData.append('projectDuration', postData.projectDuration);
    }

    // Ajouter les fichiers
    if (postData.files && postData.files.length > 0) {
      postData.files.forEach(file => {
        formData.append('files', file);
      });
    }

    return this.http.post<any>(`${this.apiUrl}/posts`, formData, { headers }).pipe(
      map(response => {
        if (response.success && response.post) {
          // Convertir la date
          const post = {
            ...response.post,
            createdAt: new Date(response.post.createdAt)
          };
          return { success: true, post, message: response.message };
        }
        return { success: false, message: response.message || 'Erreur lors de la création' };
      }),
      catchError(error => {
        console.error('Erreur création post:', error);
        return throwError(() => error);
      })
    );
  }

  // Liker/unliker un post
  toggleLike(postId: string): Observable<{ success: boolean; data?: { isLiked: boolean; likesCount: number } }> {
    const headers = this.getAuthHeaders();
    
    return this.http.post<any>(`${this.apiUrl}/posts/${postId}/like`, {}, { headers }).pipe(
      catchError(error => {
        console.error('Erreur toggle like:', error);
        return throwError(() => error);
      })
    );
  }

  // Ajouter un commentaire
  addComment(postId: string, comment: string): Observable<{ success: boolean; data?: { commentsCount: number } }> {
    const headers = this.getAuthHeaders();
    
    return this.http.post<any>(`${this.apiUrl}/posts/${postId}/comment`, { comment }, { headers }).pipe(
      catchError(error => {
        console.error('Erreur ajout commentaire:', error);
        return throwError(() => error);
      })
    );
  }

  // Partager un post
  sharePost(postId: string): Observable<{ success: boolean; data?: { sharesCount: number } }> {
    const headers = this.getAuthHeaders();
    
    return this.http.post<any>(`${this.apiUrl}/posts/${postId}/share`, {}, { headers }).pipe(
      catchError(error => {
        console.error('Erreur partage post:', error);
        return throwError(() => error);
      })
    );
  }

  // Récupérer le profil public d'un utilisateur
  getUserProfile(userId: string): Observable<{ success: boolean; profile?: any }> {
    const headers = this.getAuthHeaders();
    
    return this.http.get<any>(`${this.apiUrl}/users/${userId}/profile`, { headers }).pipe(
      catchError(error => {
        console.error('Erreur récupération profil:', error);
        return throwError(() => error);
      })
    );
  }

  // Mettre à jour la liste locale des posts
  updateLocalPosts(posts: Post[]): void {
    this.postsSubject.next(posts);
  }

  // Ajouter un post à la liste locale
  addPostToLocal(post: Post): void {
    const currentPosts = this.postsSubject.value;
    this.postsSubject.next([post, ...currentPosts]);
  }

  // Mettre à jour un post spécifique dans la liste locale
  updatePostInLocal(postId: string, updates: Partial<Post>): void {
    const currentPosts = this.postsSubject.value;
    const updatedPosts = currentPosts.map(post => 
      post.id === postId ? { ...post, ...updates } : post
    );
    this.postsSubject.next(updatedPosts);
  }

  // Supprimer un post de la liste locale
  removePostFromLocal(postId: string): void {
    const currentPosts = this.postsSubject.value;
    const filteredPosts = currentPosts.filter(post => post.id !== postId);
    this.postsSubject.next(filteredPosts);
  }

  // Réinitialiser les posts
  clearPosts(): void {
    this.postsSubject.next([]);
  }
}