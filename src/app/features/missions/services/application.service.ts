// src/app/features/missions/services/application.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

export interface Application {
  id: string;
  mission_id: string;
  proposal: string;
  proposed_budget?: number;
  proposed_deadline?: string;
  status: 'pending' | 'accepted' | 'rejected';
  applied_at: string;
  responded_at?: string;
  freelance?: {
    id: string;
    name: string;
    avatar: string;
    email: string;
    bio?: string;
    hourly_rate: number;
    experience_years: number;
    average_rating: number;
    completed_missions: number;
    response_time_hours?: number;
  };
  mission?: {
    title: string;
    description?: string;
    category: string;
    budget: { min: number; max: number };
    deadline: string;
    status: string;
    client: {
      name: string;
      avatar: string;
    };
  };
}

export interface CreateApplicationRequest {
  mission_id: string;
  proposal: string;
  proposed_budget?: number;
  proposed_deadline?: string;
  cover_letter?: string;
}

export interface ApplicationStats {
  total: number;
  pending: number;
  accepted: number;
  rejected: number;
  success_rate: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  applications?: T;
  stats?: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages?: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ApplicationService {
  private apiUrl = environment.apiUrl;
  
  // Sujets pour la gestion d'état réactive
  private applicationsSubject = new BehaviorSubject<Application[]>([]);
  public applications$ = this.applicationsSubject.asObservable();
  
  private statsSubject = new BehaviorSubject<ApplicationStats>({
    total: 0,
    pending: 0,
    accepted: 0,
    rejected: 0,
    success_rate: '0'
  });
  public stats$ = this.statsSubject.asObservable();

  constructor(private http: HttpClient) {}

  // ✅ Postuler à une mission
  applyToMission(applicationData: CreateApplicationRequest): Observable<ApiResponse<Application>> {
    console.log('📤 Envoi candidature:', applicationData);
    
    return this.http.post<ApiResponse<Application>>(
      `${this.apiUrl}/applications`, 
      applicationData
    ).pipe(
      tap(response => {
        if (response.success) {
          console.log('✅ Candidature envoyée avec succès');
          // Recharger les candidatures du freelance
          this.getMyApplications().subscribe();
        }
      }),
      catchError(error => {
        console.error('❌ Erreur candidature:', error);
        throw error;
      })
    );
  }

  // ✅ Récupérer les candidatures du freelance connecté
  getMyApplications(
    status: string = 'all', 
    page: number = 1, 
    limit: number = 10
  ): Observable<ApiResponse<Application[]>> {
    let params = new HttpParams()
      .set('status', status)
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<ApiResponse<Application[]>>(
      `${this.apiUrl}/applications`, 
      { params }
    ).pipe(
      tap(response => {
        if (response.success && response.applications) {
          this.applicationsSubject.next(response.applications);
          console.log(`✅ ${response.applications.length} candidatures récupérées`);
        }
      })
    );
  }

  // ✅ Récupérer les candidatures pour une mission (côté client)
  getMissionApplications(
    missionId: string,
    status: string = 'all',
    page: number = 1,
    limit: number = 10
  ): Observable<ApiResponse<Application[]>> {
    let params = new HttpParams()
      .set('mission_id', missionId)
      .set('status', status)
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<ApiResponse<Application[]>>(
      `${this.apiUrl}/applications`,
      { params }
    );
  }

  // ✅ Modifier le statut d'une candidature (accepter/rejeter)
  updateApplicationStatus(
    applicationId: string, 
    status: 'accepted' | 'rejected',
    responseMessage?: string
  ): Observable<ApiResponse<any>> {
    const body = {
      status,
      response_message: responseMessage
    };

    return this.http.patch<ApiResponse<any>>(
      `${this.apiUrl}/applications/${applicationId}/status`,
      body
    ).pipe(
      tap(response => {
        if (response.success) {
          console.log(`✅ Statut candidature mis à jour: ${status}`);
        }
      })
    );
  }

  // ✅ Supprimer/retirer une candidature
  deleteApplication(applicationId: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(
      `${this.apiUrl}/applications/${applicationId}`
    ).pipe(
      tap(response => {
        if (response.success) {
          console.log('✅ Candidature supprimée');
          // Recharger les candidatures
          this.getMyApplications().subscribe();
        }
      })
    );
  }

  // ✅ Récupérer les statistiques des candidatures
  getApplicationStats(): Observable<ApiResponse<ApplicationStats>> {
    return this.http.get<ApiResponse<ApplicationStats>>(
      `${this.apiUrl}/applications/stats`
    ).pipe(
      tap(response => {
        if (response.success && response.stats) {
          this.statsSubject.next(response.stats);
          console.log('✅ Stats candidatures récupérées');
        }
      })
    );
  }

  // ✅ ADMIN - Récupérer toutes les candidatures
  getAdminApplications(
    status: string = 'all',
    page: number = 1,
    limit: number = 20,
    search: string = '',
    dateFrom: string = '',
    dateTo: string = ''
  ): Observable<ApiResponse<Application[]>> {
    let params = new HttpParams()
      .set('status', status)
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (search) params = params.set('search', search);
    if (dateFrom) params = params.set('date_from', dateFrom);
    if (dateTo) params = params.set('date_to', dateTo);

    return this.http.get<ApiResponse<Application[]>>(
      `${this.apiUrl}/admin/applications`,
      { params }
    );
  }

  // ✅ Vérifier si l'utilisateur a déjà postulé à une mission
  hasAppliedToMission(missionId: string): Observable<boolean> {
    return new Observable(observer => {
      this.getMyApplications().subscribe({
        next: (response: any) => {
          if (response.success && response.applications) {
            const hasApplied = response.applications.some(
              (app: any) => app.mission_id === missionId
            );
            observer.next(hasApplied);
            observer.complete();
          } else {
            observer.next(false);
            observer.complete();
          }
        },
        error: () => {
          observer.next(false);
          observer.complete();
        }
      });
    });
  }

  // ✅ Obtenir le statut d'une candidature pour une mission
  getApplicationStatus(missionId: string): Observable<string | null> {
    return new Observable(observer => {
      this.getMyApplications().subscribe({
        next: (response: any) => {
          if (response.success && response.applications) {
            const application = response.applications.find(
              (app: any) => app.mission_id === missionId
            );
            observer.next(application ? application.status : null);
            observer.complete();
          } else {
            observer.next(null);
            observer.complete();
          }
        },
        error: () => {
          observer.next(null);
          observer.complete();
        }
      });
    });
  }

  // ✅ Méthodes utilitaires
  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'pending': 'En attente',
      'accepted': 'Acceptée',
      'rejected': 'Rejetée'
    };
    return labels[status] || status;
  }

  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'pending': 'text-yellow-600 bg-yellow-100',
      'accepted': 'text-green-600 bg-green-100',
      'rejected': 'text-red-600 bg-red-100'
    };
    return colors[status] || 'text-gray-600 bg-gray-100';
  }

  formatApplicationDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // ✅ Gestion des états locaux
  getCurrentApplications(): Application[] {
    return this.applicationsSubject.getValue();
  }

  getCurrentStats(): ApplicationStats {
    return this.statsSubject.getValue();
  }

  // ✅ Réinitialiser les données
  clearApplications(): void {
    this.applicationsSubject.next([]);
    this.statsSubject.next({
      total: 0,
      pending: 0,
      accepted: 0,
      rejected: 0,
      success_rate: '0'
    });
  }

  // ✅ Méthode pour rafraîchir toutes les données
  refreshData(): Observable<any> {
    // Charger les candidatures et les stats en parallèle
    return new Observable(observer => {
      Promise.all([
        this.getMyApplications().toPromise(),
        this.getApplicationStats().toPromise()
      ]).then(results => {
        console.log('✅ Données candidatures rafraîchies');
        observer.next(results);
        observer.complete();
      }).catch(error => {
        console.error('❌ Erreur rafraîchissement données:', error);
        observer.error(error);
      });
    });
  }
  // Ajoutez cette méthode temporaire dans votre application.service.ts pour debug

// ✅ Méthode de test à ajouter temporairement dans ApplicationService
testUrlConstruction(): void {
  console.log('🧪 === TEST CONSTRUCTION URL ===');
  console.log('Environment:', environment);
  console.log('API URL brute:', environment.apiUrl);
  console.log('API URL type:', typeof environment.apiUrl);
  
  const testUrl = `${environment.apiUrl}/applications`;
  console.log('URL construite:', testUrl);
  console.log('URL construite type:', typeof testUrl);
  
  // Test de construction manuelle
  const manualUrl = 'http://localhost:3000/api/applications';
  console.log('URL manuelle:', manualUrl);
  
  // Test avec this.apiUrl
  console.log('this.apiUrl:', this.apiUrl);
  console.log('URL service:', `${this.apiUrl}/applications`);
  
  // Test de requête GET simple pour vérifier la connectivité
  console.log('🧪 Test de connectivité...');
  
  this.http.get(`${environment.apiUrl}/health`).subscribe({
    next: (response) => {
      console.log('✅ API Health check réussi:', response);
    },
    error: (error) => {
      console.error('❌ API Health check échoué:', error);
      console.error('Status:', error.status);
      console.error('URL appelée:', error.url);
    }
  });
}
}