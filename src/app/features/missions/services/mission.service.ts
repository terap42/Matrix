// services/mission.service.ts - VERSION CORRIGÉE FINALE
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';

export interface Mission {
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

export interface MissionDetail {
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

export interface CreateMissionRequest {
  title: string;
  description: string;
  category: string;
  budget: {
    min: number;
    max: number;
  };
  deadline: string;
  skills: string[];
  isUrgent: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class MissionService {
  private apiUrl = 'http://localhost:3000/api/missions';
  private missionsSubject = new BehaviorSubject<Mission[]>([]);
  public missions$ = this.missionsSubject.asObservable();

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken');
    console.log('🔑 Token récupéré:', token ? 'Présent' : 'Absent');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  // ✅ CORRIGÉ - Récupérer toutes les missions
  getMissions(): Observable<Mission[]> {
    console.log('📡 Récupération des missions...');
    
    return this.http.get<any>(this.apiUrl, { headers: this.getHeaders() })
      .pipe(
        map(response => {
          console.log('📡 Réponse brute du serveur:', response);
          
          // ✅ Adapter aux différents formats de réponse possible
          let missions: Mission[] = [];
          
          if (response.success && response.missions) {
            // Format: { success: true, missions: [...] }
            missions = response.missions;
          } else if (response.success && response.data && response.data.missions) {
            // Format: { success: true, data: { missions: [...] } }
            missions = response.data.missions;
          } else if (Array.isArray(response)) {
            // Format: [...] (tableau direct)
            missions = response;
          } else if (response.missions) {
            // Format: { missions: [...] }
            missions = response.missions;
          }
          
          console.log('✅ Missions formatées:', missions.length);
          this.missionsSubject.next(missions);
          return missions;
        }),
        catchError(this.handleError)
      );
  }

  // ✅ CORRIGÉ - Récupérer une mission par ID
  getMissionById(id: string): Observable<MissionDetail> {
    console.log('🔍 Récupération mission ID:', id);
    
    return this.http.get<any>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() })
      .pipe(
        map(response => {
          console.log('📋 Réponse détail mission:', response);
          
          if (response.success && response.data) {
            return response.data;
          } else if (response.data) {
            return response.data;
          }
          
          throw new Error('Mission non trouvée');
        }),
        catchError(this.handleError)
      );
  }

  // ✅ CORRIGÉ - Créer une nouvelle mission
  createMission(missionData: CreateMissionRequest): Observable<Mission> {
    console.log('📤 Création mission:', missionData);
    
    // Validation côté client
    const validationError = this.validateMissionData(missionData);
    if (validationError) {
      console.error('❌ Validation échoué:', validationError);
      return throwError(() => new Error(validationError));
    }

    return this.http.post<any>(this.apiUrl, missionData, { headers: this.getHeaders() })
      .pipe(
        map(response => {
          console.log('✅ Réponse création mission:', response);
          
          let mission: Mission;
          
          // ✅ Adapter aux différents formats de réponse
          if (response.success === true && response.mission) {
            // Format: { success: true, mission: {...} }
            mission = response.mission;
          } else if (response.success === true && response.data) {
            // Format: { success: true, data: {...} }
            mission = response.data;
          } else if (response.mission) {
            // Format: { mission: {...} }
            mission = response.mission;
          } else if (response.success === false) {
            // Cas d'erreur explicite
            throw new Error(response.message || 'Erreur lors de la création');
          } else {
            // Format inattendu
            console.warn('⚠️ Format de réponse inattendu:', response);
            throw new Error('Format de réponse du serveur inattendu');
          }
          
          console.log('✅ Mission créée avec succès:', mission.title);
          
          // Mettre à jour la liste locale des missions
          const currentMissions = this.missionsSubject.value;
          const updatedMissions = [mission, ...currentMissions];
          this.missionsSubject.next(updatedMissions);
          
          return mission;
        }),
        tap(mission => {
          console.log('🎉 Mission ajoutée à la liste locale:', mission.id);
        }),
        catchError((error) => {
          console.error('❌ Erreur création mission:', error);
          
          // ✅ CORRECTION SPÉCIALE : Détecter les faux positifs
          if (error.message && error.message.includes('Mission créée avec succès')) {
            console.log('🔧 Détection faux positif - récupération des missions');
            
            // Recharger les missions pour récupérer la nouvelle
            return this.getMissions().pipe(
              map(missions => {
                const latestMission = missions[0]; // La plus récente
                if (latestMission) {
                  console.log('✅ Mission récupérée après faux positif:', latestMission.title);
                  return latestMission;
                }
                throw new Error('Mission créée mais impossible de la récupérer');
              })
            );
          }
          
          return this.handleError(error);
        })
      );
  }

  // ✅ CORRIGÉ - Supprimer une mission
  deleteMission(id: string): Observable<any> {
    console.log('🗑️ Suppression mission:', id);
    
    return this.http.delete<any>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() })
      .pipe(
        map(response => {
          console.log('🗑️ Réponse suppression:', response);
          
          if (response.success) {
            // Retirer la mission de la liste locale
            const currentMissions = this.missionsSubject.value;
            const updatedMissions = currentMissions.filter(m => m.id !== id);
            this.missionsSubject.next(updatedMissions);
            
            console.log('✅ Mission supprimée de la liste locale');
            return response;
          }
          
          throw new Error(response.message || 'Erreur lors de la suppression');
        }),
        catchError(this.handleError)
      );
  }

  // ✅ CORRIGÉ - Changer le statut d'une mission
  updateMissionStatus(id: string, status: string): Observable<any> {
    console.log('🔄 Mise à jour statut mission:', id, '→', status);
    
    return this.http.patch<any>(`${this.apiUrl}/${id}/status`, { status }, { headers: this.getHeaders() })
      .pipe(
        map(response => {
          console.log('🔄 Réponse mise à jour statut:', response);
          
          if (response.success) {
            // Mettre à jour la mission dans la liste locale
            const currentMissions = this.missionsSubject.value;
            const updatedMissions = currentMissions.map(m => 
              m.id === id ? { ...m, status: status as any } : m
            );
            this.missionsSubject.next(updatedMissions);
            
            console.log('✅ Statut mis à jour dans la liste locale');
            return response;
          }
          
          throw new Error(response.message || 'Erreur lors de la mise à jour');
        }),
        catchError(this.handleError)
      );
  }

  // ✅ CORRIGÉ - Obtenir les statistiques
  getStats(): Observable<any> {
    console.log('📊 Récupération statistiques...');
    
    return this.http.get<any>(`${this.apiUrl}/stats/overview`, { headers: this.getHeaders() })
      .pipe(
        map(response => {
          console.log('📊 Réponse stats:', response);
          
          if (response.success && response.data) {
            return response.data;
          } else if (response.data) {
            return response.data;
          }
          
          return {};
        }),
        catchError(this.handleError)
      );
  }

  // ✅ NOUVEAU - Validation des données de mission
  private validateMissionData(data: CreateMissionRequest): string | null {
    if (!data.title?.trim()) return 'Le titre est requis';
    if (!data.description?.trim()) return 'La description est requise';
    if (!data.category?.trim()) return 'La catégorie est requise';
    if (!data.deadline) return 'La date limite est requise';
    
    if (!data.budget || data.budget.min <= 0 || data.budget.max <= 0) {
      return 'Le budget doit être supérieur à 0';
    }
    
    if (data.budget.min > data.budget.max) {
      return 'Le budget minimum ne peut pas être supérieur au maximum';
    }

    // Vérifier la date
    const deadline = new Date(data.deadline);
    const now = new Date();
    if (deadline <= now) {
      return 'La date limite doit être dans le futur';
    }

    return null;
  }

  // ✅ NOUVEAU - Gestion d'erreur centralisée
  private handleError(error: any): Observable<never> {
    let errorMessage = 'Une erreur inattendue s\'est produite';
    
    console.error('🚨 Erreur détaillée:', {
      error: error,
      status: error.status,
      statusText: error.statusText,
      url: error.url,
      message: error.message
    });

    if (error instanceof HttpErrorResponse) {
      switch (error.status) {
        case 0:
          errorMessage = 'Impossible de contacter le serveur. Vérifiez votre connexion.';
          break;
        case 401:
          errorMessage = 'Session expirée. Veuillez vous reconnecter.';
          // Optionnel: rediriger vers login
          break;
        case 403:
          errorMessage = 'Vous n\'avez pas les permissions nécessaires.';
          break;
        case 404:
          errorMessage = 'Ressource non trouvée.';
          break;
        case 422:
          errorMessage = error.error?.message || 'Données invalides.';
          break;
        case 500:
          errorMessage = 'Erreur serveur. Veuillez réessayer plus tard.';
          if (error.error?.message) {
            errorMessage += ` Détail: ${error.error.message}`;
          }
          break;
        default:
          if (error.error?.message) {
            errorMessage = error.error.message;
          }
      }
    } else if (error.message) {
      errorMessage = error.message;
    }

    return throwError(() => ({
      message: errorMessage,
      status: error.status || 0,
      originalError: error
    }));
  }

  // ✅ NOUVEAU - Test de connexion API
  testApiConnection(): Observable<any> {
    console.log('🔍 Test connexion API...');
    
    return this.http.get('http://localhost:3000/api/health', { headers: this.getHeaders() })
      .pipe(
        tap(response => console.log('✅ Test API réussi:', response)),
        catchError(error => {
          console.error('❌ Test API échoué:', error);
          return throwError(() => error);
        })
      );
  }

  // Méthodes utilitaires existantes
  refreshMissions(): void {
    console.log('🔄 Rafraîchissement des missions...');
    this.getMissions().subscribe({
      next: (missions) => console.log('✅ Missions rafraîchies:', missions.length),
      error: (error) => console.error('❌ Erreur rafraîchissement:', error)
    });
  }

  getCurrentMissions(): Mission[] {
    return this.missionsSubject.value;
  }

  // ✅ NOUVEAU - Méthodes de debug
  debugService(): void {
    console.log('🐛 Debug MissionService:', {
      missions: this.getCurrentMissions().length,
      token: localStorage.getItem('authToken') ? 'Présent' : 'Absent',
      apiUrl: this.apiUrl
    });
  }
}