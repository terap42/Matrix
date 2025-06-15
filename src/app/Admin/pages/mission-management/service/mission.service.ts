// src/app/services/mission.service.ts - Service corrigé sans erreurs de syntaxe

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { environment } from '../../../../../environments/environment';

// Interfaces pour les missions
export interface Mission {
  id: string;
  title: string;
  description: string;
  category: string;
  budget: number;
  budgetMin?: number;
  budgetMax?: number;
  budgetType?: string;
  currency: string;
  status: string;
  deadline?: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  freelancerId?: string;
  freelancerName?: string;
  skillsRequired: string[];
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  estimatedDuration?: string;
  applicationsCount: number;
  isReported: boolean;
  reportReason?: string;
  priority: string;
  isRemote?: boolean;
  location?: string;
  experienceLevel?: string;
}

export interface MissionFilters {
  page?: number;
  limit?: number;
  status?: string;
  category?: string;
  search?: string;
  isReported?: boolean;
  sortBy?: string;
  sortOrder?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface MissionListResponse {
  missions: Mission[];
  pagination: {
    currentPage: number;
    totalItems: number;
    totalPages: number;
    itemsPerPage: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface MissionStats {
  total_missions: number;
  open_missions: number;
  in_progress_missions: number;
  completed_missions: number;
  reported_missions: number;
  average_budget: number;
}

@Injectable({
  providedIn: 'root'
})
export class MissionService {
  private readonly apiUrl = environment.apiUrl || 'http://localhost:3000/api';
  
  // Subject pour les mises à jour en temps réel
  private missionsUpdatedSubject = new BehaviorSubject<boolean>(false);
  public missionsUpdated$ = this.missionsUpdatedSubject.asObservable();

  constructor(private http: HttpClient) {
    console.log('🔧 MissionService initialisé avec API URL:', this.apiUrl);
  }

  // Méthode pour récupérer les headers avec token
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    
    return headers;
  }

  // MÉTHODE CORRIGÉE - Récupérer toutes les missions avec filtres et pagination
  getMissions(filters?: MissionFilters): Observable<MissionListResponse> {
    console.log('📋 Récupération des missions avec filtres:', filters);
    
    let params = new HttpParams();

    if (filters) {
      if (filters.page) {
        params = params.set('page', filters.page.toString());
      }
      if (filters.limit) {
        params = params.set('limit', filters.limit.toString());
      }
      if (filters.status) {
        params = params.set('status', filters.status);
      }
      if (filters.category) {
        params = params.set('category', filters.category);
      }
      if (filters.search) {
        params = params.set('search', filters.search);
      }
      if (filters.isReported !== undefined) {
        params = params.set('isReported', filters.isReported.toString());
      }
      if (filters.sortBy) {
        params = params.set('sortBy', filters.sortBy);
      }
      if (filters.sortOrder) {
        params = params.set('sortOrder', filters.sortOrder);
      }
      if (filters.dateFrom) {
        params = params.set('dateFrom', filters.dateFrom);
      }
      if (filters.dateTo) {
        params = params.set('dateTo', filters.dateTo);
      }
    }

    return this.http.get<any>(`${this.apiUrl}/missions`, { 
      params, 
      headers: this.getHeaders() 
    }).pipe(
      tap(response => {
        console.log('🔍 Réponse brute complète:', response);
        console.log('🔍 Type de réponse:', typeof response);
        console.log('🔍 Est un array:', Array.isArray(response));
        if (response && typeof response === 'object') {
          console.log('🔍 Clés de la réponse:', Object.keys(response));
        }
      }),
      map(response => {
        console.log('🗂️ Transformation de la réponse...');
        
        // Cas 1: Réponse vide ou null
        if (!response) {
          console.log('❌ Réponse vide');
          return {
            missions: [],
            pagination: {
              currentPage: 1,
              totalItems: 0,
              totalPages: 0,
              itemsPerPage: filters?.limit || 10
            }
          };
        }

        // Cas 2: La réponse est directement un tableau de missions
        if (Array.isArray(response)) {
          console.log('✅ Réponse est un tableau direct de', response.length, 'missions');
          return {
            missions: response,
            pagination: {
              currentPage: filters?.page || 1,
              totalItems: response.length,
              totalPages: Math.ceil(response.length / (filters?.limit || 10)),
              itemsPerPage: filters?.limit || 10
            }
          };
        }

        // Cas 3: Réponse avec structure { data: { missions: [...], pagination: {...} } }
        if (response.data && response.data.missions) {
          console.log('✅ Réponse avec data.missions de', response.data.missions.length, 'missions');
          return {
            missions: response.data.missions,
            pagination: response.data.pagination || {
              currentPage: filters?.page || 1,
              totalItems: response.data.missions.length,
              totalPages: Math.ceil(response.data.missions.length / (filters?.limit || 10)),
              itemsPerPage: filters?.limit || 10
            }
          };
        }

        // Cas 4: Réponse avec structure { missions: [...], pagination: {...} }
        if (response.missions) {
          console.log('✅ Réponse avec missions de', response.missions.length, 'missions');
          return {
            missions: response.missions,
            pagination: response.pagination || {
              currentPage: filters?.page || 1,
              totalItems: response.missions.length,
              totalPages: Math.ceil(response.missions.length / (filters?.limit || 10)),
              itemsPerPage: filters?.limit || 10
            }
          };
        }

        // Cas 5: Réponse avec structure { data: [...] } (array dans data)
        if (response.data && Array.isArray(response.data)) {
          console.log('✅ Réponse avec data array de', response.data.length, 'missions');
          return {
            missions: response.data,
            pagination: {
              currentPage: filters?.page || 1,
              totalItems: response.data.length,
              totalPages: Math.ceil(response.data.length / (filters?.limit || 10)),
              itemsPerPage: filters?.limit || 10
            }
          };
        }

        // Cas 6: Structure inconnue - on essaie de deviner
        console.log('❓ Structure de réponse inconnue, tentative d\'adaptation...');
        console.log('🔍 Clés disponibles:', Object.keys(response));
        
        // Chercher une propriété qui pourrait contenir les missions
        const possibleKeys = ['missions', 'data', 'items', 'results'];
        for (const key of possibleKeys) {
          if (response[key] && Array.isArray(response[key])) {
            console.log(`✅ Trouvé missions dans la propriété "${key}"`);
            return {
              missions: response[key],
              pagination: response.pagination || {
                currentPage: filters?.page || 1,
                totalItems: response[key].length,
                totalPages: Math.ceil(response[key].length / (filters?.limit || 10)),
                itemsPerPage: filters?.limit || 10
              }
            };
          }
        }

        // Dernier recours - retourner une structure vide
        console.log('❌ Impossible de trouver les missions, retour structure vide');
        return {
          missions: [],
          pagination: {
            currentPage: 1,
            totalItems: 0,
            totalPages: 0,
            itemsPerPage: filters?.limit || 10
          }
        };
      }),
      tap(finalResponse => {
        console.log('✅ Missions récupérées (final):', finalResponse.missions.length, 'missions');
        console.log('📊 Pagination:', finalResponse.pagination);
      }),
      catchError(this.handleError.bind(this))
    );
  }

  // MÉTHODE DE DEBUG - Pour identifier la structure exacte
  debugGetMissions(): Observable<any> {
    console.log('🔍 DEBUG - Test direct de l\'API sans transformation');
    
    return this.http.get<any>(`${this.apiUrl}/missions`, {
      headers: this.getHeaders()
    }).pipe(
      tap(response => {
        console.log('🔍 DEBUG - Réponse brute complète:', response);
        console.log('🔍 DEBUG - Type:', typeof response);
        console.log('🔍 DEBUG - Est array:', Array.isArray(response));
        console.log('🔍 DEBUG - JSON stringify:', JSON.stringify(response, null, 2));
        
        if (response && typeof response === 'object') {
          console.log('🔍 DEBUG - Clés:', Object.keys(response));
          
          // Tester chaque propriété
          Object.keys(response).forEach(key => {
            console.log(`🔍 DEBUG - ${key}:`, response[key]);
            console.log(`🔍 DEBUG - ${key} type:`, typeof response[key]);
            if (Array.isArray(response[key])) {
              console.log(`🔍 DEBUG - ${key} length:`, response[key].length);
            }
          });
        }
      }),
      catchError(error => {
        console.error('🔍 DEBUG - Erreur:', error);
        return throwError(() => error);
      })
    );
  }

  // Récupérer une mission par ID
  getMissionById(id: string): Observable<Mission> {
    console.log('🔍 Récupération mission ID:', id);
    
    return this.http.get<any>(`${this.apiUrl}/missions/${id}`, {
      headers: this.getHeaders()
    }).pipe(
      map(response => {
        // Adaptation selon la structure de réponse
        if (response.data) {
          console.log('✅ Mission récupérée:', response.data);
          return response.data;
        } else {
          console.log('✅ Mission récupérée:', response);
          return response;
        }
      }),
      catchError(this.handleError.bind(this))
    );
  }

  // Supprimer une mission
  deleteMission(id: string): Observable<void> {
    console.log('🗑️ Suppression mission ID:', id);
    
    return this.http.delete<any>(`${this.apiUrl}/missions/${id}`, {
      headers: this.getHeaders()
    }).pipe(
      map(response => {
        console.log('✅ Mission supprimée');
        this.notifyMissionsUpdated();
        return response.data || response;
      }),
      catchError(this.handleError.bind(this))
    );
  }

  // Changer le statut d'une mission
  updateMissionStatus(id: string, status: string): Observable<void> {
    console.log('🔄 Changement statut mission ID:', id, 'vers', status);
    
    return this.http.patch<any>(`${this.apiUrl}/missions/${id}/status`, 
      { status }, 
      { headers: this.getHeaders() }
    ).pipe(
      map(response => {
        console.log('✅ Statut mission mis à jour');
        this.notifyMissionsUpdated();
        return response.data || response;
      }),
      catchError(this.handleError.bind(this))
    );
  }

  // Récupérer les statistiques des missions
  getMissionStats(): Observable<MissionStats> {
    console.log('📊 Récupération statistiques missions');
    
    return this.http.get<any>(`${this.apiUrl}/missions/stats/overview`, {
      headers: this.getHeaders()
    }).pipe(
      map(response => {
        const stats = response.data || response;
        console.log('✅ Statistiques récupérées:', stats);
        return stats;
      }),
      catchError(this.handleError.bind(this))
    );
  }

  // Récupérer les compétences
  getSkills(): Observable<any[]> {
    console.log('🛠️ Récupération compétences');
    
    return this.http.get<any>(`${this.apiUrl}/skills`, {
      headers: this.getHeaders()
    }).pipe(
      map(response => {
        const skills = response.data || response;
        console.log('✅ Compétences récupérées:', Array.isArray(skills) ? skills.length : 'Structure inconnue');
        return Array.isArray(skills) ? skills : [];
      }),
      catchError(this.handleError.bind(this))
    );
  }

  // Récupérer les catégories de compétences
  getSkillCategories(): Observable<string[]> {
    console.log('📂 Récupération catégories');
    
    return this.http.get<any>(`${this.apiUrl}/skills/categories`, {
      headers: this.getHeaders()
    }).pipe(
      map(response => {
        const categories = response.data || response;
        console.log('✅ Catégories récupérées:', categories);
        return Array.isArray(categories) ? categories : [];
      }),
      catchError(this.handleError.bind(this))
    );
  }

  // Récupérer les catégories de missions (données statiques pour les filtres)
  getMissionCategories(): Observable<string[]> {
    return new Observable(observer => {
      const categories = [
        'Développement',
        'Design',
        'Rédaction',
        'Marketing',
        'Traduction',
        'Consultation',
        'Support technique',
        'Formation'
      ];
      observer.next(categories);
      observer.complete();
    });
  }

  // Notifier les mises à jour
  private notifyMissionsUpdated(): void {
    console.log('🔄 Notification mise à jour missions');
    this.missionsUpdatedSubject.next(true);
  }

  // Gestion des erreurs
  private handleError(error: any): Observable<never> {
    console.error('❌ Erreur MissionService:', error);
    
    let errorMessage = 'Une erreur est survenue';
    
    if (error.error && error.error.message) {
      errorMessage = error.error.message;
    } else if (error.message) {
      errorMessage = error.message;
    } else if (error.status) {
      switch (error.status) {
        case 401:
          errorMessage = 'Session expirée, veuillez vous reconnecter';
          break;
        case 403:
          errorMessage = 'Accès refusé';
          break;
        case 404:
          errorMessage = 'Ressource non trouvée';
          break;
        case 500:
          errorMessage = 'Erreur serveur interne';
          break;
        default:
          errorMessage = `Erreur ${error.status}: ${error.statusText}`;
      }
    }
    
    return throwError(() => new Error(errorMessage));
  }

  // Méthodes utilitaires pour les statuts
  getStatusLabel(status: string): string {
    const statusLabels: { [key: string]: string } = {
      'open': 'Ouverte',
      'assigned': 'Assignée', 
      'in_progress': 'En cours',
      'completed': 'Terminée',
      'cancelled': 'Annulée',
      'draft': 'Brouillon',
      'reported': 'Signalée'
    };
    return statusLabels[status] || status;
  }

  getStatusColor(status: string): string {
    const statusColors: { [key: string]: string } = {
      'open': 'bg-blue-100 text-blue-800',
      'assigned': 'bg-yellow-100 text-yellow-800',
      'in_progress': 'bg-yellow-100 text-yellow-800', 
      'completed': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800',
      'draft': 'bg-gray-100 text-gray-800',
      'reported': 'bg-red-100 text-red-800'
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800';
  }

  // Méthode pour vérifier si le service est connecté
  checkConnection(): Observable<boolean> {
    return this.http.get<any>(`${this.apiUrl}/test`).pipe(
      map(() => {
        console.log('✅ Connexion API OK');
        return true;
      }),
      catchError(() => {
        console.error('❌ Connexion API échouée');
        return throwError(() => new Error('Impossible de se connecter à l\'API'));
      })
    );
  }

  // Méthode pour rafraîchir les données
  refreshData(): void {
    console.log('🔄 Rafraîchissement des données');
    this.notifyMissionsUpdated();
  }
}