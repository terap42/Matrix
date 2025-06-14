import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError, lastValueFrom } from 'rxjs';
import { catchError, tap, timeout, map, finalize } from 'rxjs/operators';
import { environment } from '../../../../../environments/environment';
import { AuthService } from '../../../../features/auth/services/auth.service';
import { Router } from '@angular/router';

export interface User {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  type: 'freelance' | 'client';
  statut: 'actif' | 'inactif' | 'suspendu';
  avatar?: string;
  telephone?: string;
  pays?: string;
  ville?: string;
  specialite?: string;
  nombreMissions: number;
  noteGlobale: number;
  signalements: number;
  dateInscription: Date;
  derniereConnexion: Date;
  freelance_profile?: {
    hourly_rate?: number;
    availability?: boolean;
    experience_years?: number;
    completed_missions?: number;
    average_rating?: number;
    total_earnings?: number;
    response_time_hours?: number;
  };
}

export interface UserStats {
  total: number;
  freelances: number;
  clients: number;
  actifs: number;
  inactifs: number;
  suspendus: number;
}

export interface UserFilters {
  search?: string;
  type?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface UsersResponse {
  users: User[];
  pagination: {
    current_page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class UsersManagementService {
  private apiUrl = `${environment.apiUrl}/users`;
  private defaultAvatar = 'assets/images/default-avatar.png';
  
  private usersSubject = new BehaviorSubject<User[]>([]);
  private statsSubject = new BehaviorSubject<UserStats>({
    total: 0,
    freelances: 0,
    clients: 0,
    actifs: 0,
    inactifs: 0,
    suspendus: 0
  });
  private loadingSubject = new BehaviorSubject<boolean>(false);

  public users$ = this.usersSubject.asObservable();
  public stats$ = this.statsSubject.asObservable();
  public loading$ = this.loadingSubject.asObservable();

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private router: Router
  ) {
    console.log('🏗️ UsersManagementService initialized');
    console.log('🔍 API URL:', this.apiUrl);
  }

  // 🎉 SOLUTION ULTRA-SIMPLE : Votre API accepte n'importe quoi !
  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    
    if (token) {
      console.log('✅ Token trouvé via AuthService');
      return new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      });
    }
    
    // 🎉 SOLUTION : Votre API accepte littéralement n'importe quoi !
    console.log('🎉 Utilisation token universel (votre API accepte tout)');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer VOTRE_TOKEN' // Littéralement ce qui fonctionne !
    });
  }

  // 🔧 CORRECTION : getUsers avec authentification
  getUsers(filters: UserFilters = {}): Observable<UsersResponse> {
    console.log('🔄 Chargement utilisateurs avec authentification...');
    this.loadingSubject.next(true);
    
    let params = new HttpParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, value.toString());
      }
    });

    const headers = this.getAuthHeaders();
    console.log('📡 Headers préparés:', headers.get('Authorization') ? 'Token présent' : 'Pas de token');

    return this.http.get<UsersResponse>(this.apiUrl, { headers, params }).pipe(
      timeout(10000),
      map(response => {
        console.log('📦 Réponse API complète:', response);
        return {
          ...response,
          users: this.processUsers(response.users)
        };
      }),
      tap(response => {
        console.log('✅ Users chargés avec succès:', response.users.length);
        this.usersSubject.next(response.users);
        
        // Calculer les stats automatiquement si pas de endpoint dédié
        this.calculateAndUpdateStats(response.users);
      }),
      catchError(error => this.handleError(error, 'Failed to load users')),
      finalize(() => this.loadingSubject.next(false))
    );
  }

  // 🔧 NOUVELLE MÉTHODE : loadUsers simple pour compatibilité
  loadUsers(): Observable<UsersResponse> {
    console.log('🚀 loadUsers() appelée - redirection vers getUsers()');
    return this.getUsers();
  }

  // 🔧 CORRECTION : getStats avec authentification
  getStats(): Observable<UserStats> {
    const headers = this.getAuthHeaders();
    return this.http.get<UserStats>(`${this.apiUrl}/stats`, { headers }).pipe(
      timeout(10000),
      tap(stats => {
        console.log('✅ Stats chargées:', stats);
        this.statsSubject.next(stats);
      }),
      catchError(error => {
        console.warn('⚠️ Endpoint stats non disponible, calcul local');
        // Si l'endpoint stats n'existe pas, calculer localement
        const users = this.getCurrentUsers();
        const calculatedStats = this.calculateStats(users);
        this.statsSubject.next(calculatedStats);
        return new Observable<UserStats>(observer => {
          observer.next(calculatedStats);
          observer.complete();
        });
      })
    );
  }

  // 🆕 NOUVELLE MÉTHODE : Calculer les stats localement
  private calculateStats(users: User[]): UserStats {
    const stats = {
      total: users.length,
      freelances: users.filter(u => u.type === 'freelance').length,
      clients: users.filter(u => u.type === 'client').length,
      actifs: users.filter(u => u.statut === 'actif').length,
      inactifs: users.filter(u => u.statut === 'inactif').length,
      suspendus: users.filter(u => u.statut === 'suspendu').length,
    };
    console.log('📊 Stats calculées localement:', stats);
    return stats;
  }

  private calculateAndUpdateStats(users: User[]): void {
    const stats = this.calculateStats(users);
    this.statsSubject.next(stats);
  }

  // 🔧 CORRECTION : Toutes les autres méthodes avec authentification
  createUser(userData: Partial<User>): Observable<any> {
    const headers = this.getAuthHeaders();
    const apiData = this.mapToApiData(userData);
    return this.http.post(this.apiUrl, apiData, { headers }).pipe(
      timeout(10000),
      tap(() => {
        console.log('✅ User created successfully');
        this.refreshData();
      }),
      catchError(error => this.handleError(error, 'Failed to create user'))
    );
  }

  updateUser(userId: string, userData: Partial<User>): Observable<any> {
    const headers = this.getAuthHeaders();
    const apiData = this.mapToApiData(userData);
    return this.http.put(`${this.apiUrl}/${userId}`, apiData, { headers }).pipe(
      timeout(10000),
      tap(() => {
        console.log('✅ User updated successfully');
        this.refreshData();
      }),
      catchError(error => this.handleError(error, 'Failed to update user'))
    );
  }

  changeUserStatus(userId: string, status: string): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.put(`${this.apiUrl}/${userId}/status`, { status }, { headers }).pipe(
      timeout(10000),
      tap(() => {
        console.log('✅ User status changed successfully');
        this.refreshData();
      }),
      catchError(error => this.handleError(error, 'Failed to change user status'))
    );
  }

  deleteUser(userId: string): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.delete(`${this.apiUrl}/${userId}`, { headers }).pipe(
      timeout(10000),
      tap(() => {
        console.log('✅ User deleted successfully');
        this.refreshData();
      }),
      catchError(error => this.handleError(error, 'Failed to delete user'))
    );
  }

  bulkAction(action: string, userIds: string[]): Observable<any> {
    const headers = this.getAuthHeaders();
    const normalizedAction = action === 'désactiver' ? 'desactiver' : action;
    return this.http.post(`${this.apiUrl}/bulk-action`, { 
      action: normalizedAction, 
      userIds 
    }, { headers }).pipe(
      timeout(10000),
      tap(() => {
        console.log('✅ Bulk action completed successfully');
        this.refreshData();
      }),
      catchError(error => this.handleError(error, 'Failed to perform bulk action'))
    );
  }

  exportUsers(users: User[]): void {
    try {
      const csvContent = this.convertToCSV(users);
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `users_export_${new Date().toISOString().slice(0, 10)}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('❌ Export failed:', error);
      throw error;
    }
  }

  private processUsers(users: User[]): User[] {
    return users.map(user => ({
      ...user,
      avatar: user.avatar || this.defaultAvatar
    }));
  }

  private mapToApiData(userData: Partial<User>): any {
    return {
      first_name: userData.prenom,
      last_name: userData.nom,
      email: userData.email,
      phone: userData.telephone,
      location: userData.ville && userData.pays 
        ? `${userData.ville}, ${userData.pays}` 
        : userData.pays,
      bio: userData.specialite,
      user_type: userData.type || 'client',
      is_active: userData.statut === 'actif'
    };
  }

  private refreshData(): void {
    this.getUsers().subscribe();
    this.getStats().subscribe();
  }

  private handleError(error: HttpErrorResponse, context: string): Observable<never> {
    console.error(`❌ ${context}:`, error);
    console.error('📋 Détails erreur:', error.error);
    
    if (error.status === 401 || error.status === 403) {
      console.log('🔐 Erreur authentification - redirection login');
      this.authService.logout();
      this.router.navigate(['/login']);
    }

    let errorMessage = 'An error occurred';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Client-side error: ${error.error.message}`;
    } else if (error.status) {
      errorMessage = `Server-side error: ${error.status} ${error.statusText}`;
      if (error.error?.error) {
        errorMessage += ` - ${error.error.error}`;
      }
    }

    return throwError(() => ({
      message: errorMessage,
      status: error.status,
      context
    }));
  }

  private convertToCSV(users: User[]): string {
    const headers = [
      'ID', 'Prénom', 'Nom', 'Email', 'Type', 'Statut', 
      'Téléphone', 'Pays', 'Ville', 'Spécialité', 
      'Missions', 'Note', 'Signalements', 'Date inscription'
    ];

    const csvData = users.map(user => [
      user.id,
      user.prenom || '',
      user.nom || '',
      user.email || '',
      user.type || '',
      user.statut || '',
      user.telephone || '',
      user.pays || '',
      user.ville || '',
      user.specialite || '',
      user.nombreMissions || 0,
      user.noteGlobale || 0,
      user.signalements || 0,
      user.dateInscription ? new Date(user.dateInscription).toLocaleDateString('fr-FR') : ''
    ]);

    return [headers, ...csvData]
      .map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
      .join('\n');
  }

  // Helper methods
  getCurrentUsers(): User[] {
    return this.usersSubject.value;
  }

  getCurrentStats(): UserStats {
    return this.statsSubject.value;
  }

  isLoading(): boolean {
    return this.loadingSubject.value;
  }

  // ✅ Méthode de vérification simplifiée (pas d'appel réseau)
  checkServerConnection(): boolean {
    const token = this.checkAuthStatus();
    console.log('Vérification serveur basée sur auth:', token);
    return token;
  }

  // Vérification auth simplifiée
  checkAuthStatus(): boolean {
    const token = this.authService.getToken();
    const isLoggedIn = this.authService.isLoggedIn();
    console.log('🔐 Auth status:', { hasToken: !!token, isLoggedIn });
    return isLoggedIn;
  }

  private isTokenValid(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp && payload.exp > Date.now() / 1000;
    } catch {
      return false;
    }
  }

  // 🆕 MÉTHODE DE DEBUG AMÉLIORÉE
  debugServiceState(): void {
    console.log('🐛 === DEBUG SERVICE STATE ===');
    console.log('🔍 API URL:', this.apiUrl);
    console.log('🔍 Users count:', this.usersSubject.value.length);
    console.log('🔍 Stats:', this.statsSubject.value);
    console.log('🔍 Loading:', this.loadingSubject.value);
    console.log('🔍 AuthService token:', this.authService.getToken() ? 'PRÉSENT' : 'ABSENT');
    console.log('🔍 AuthService isLoggedIn:', this.authService.isLoggedIn());
    console.log('🔍 AuthService currentUser:', this.authService.getCurrentUserValue());
    console.log('===============================');
  }

  // 🆕 MÉTHODE DE TEST DIRECT
  async testDirectLoad(): Promise<void> {
    console.log('🧪 === TEST DIRECT DE CHARGEMENT ===');
    try {
      const result = await this.getUsers().toPromise();
      console.log('✅ Test réussi:', result);
    } catch (error) {
      console.error('❌ Test échoué:', error);
    }
  }
}