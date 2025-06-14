// src/app/features/auth/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, BehaviorSubject, lastValueFrom } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Storage } from '@ionic/storage-angular';

export interface User {
  id: number;
  email: string;
  user_type: 'freelance' | 'client' | 'admin';
  first_name: string;
  last_name: string;
  avatar?: string;
  bio?: string;
  location?: string;
  phone?: string;
  website?: string;
  freelance_profile?: {
    hourly_rate: number;
    availability: boolean;
    experience_years: number;
    completed_missions: number;
    average_rating: number;
    total_earnings: number;
    response_time_hours: number;
  };
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface RegisterData {
  email: string;
  password: string;
  user_type: 'freelance' | 'client';
  first_name: string;
  last_name: string;
  phone?: string;
  location?: string;
  bio?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api'; // Changez selon votre configuration
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private tokenSubject = new BehaviorSubject<string | null>(null);

  public currentUser$ = this.currentUserSubject.asObservable();
  public token$ = this.tokenSubject.asObservable();

  constructor(
    private http: HttpClient,
    private storage: Storage
  ) {
    this.initStorage();
  }

  private async initStorage() {
    await this.storage.create();
    await this.loadStoredAuth();
  }

  private async loadStoredAuth() {
    try {
      const token = await this.storage.get('auth_token');
      const user = await this.storage.get('current_user');
      
      if (token && user) {
        this.tokenSubject.next(token);
        this.currentUserSubject.next(user);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données d\'auth:', error);
    }
  }

  private getAuthHeaders(): HttpHeaders {
    const token = this.tokenSubject.value;
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await lastValueFrom(
        this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, {
          email,
          password
        }).pipe(
          tap(async (response) => {
            // Stocker le token et l'utilisateur
            await this.storage.set('auth_token', response.token);
            await this.storage.set('current_user', response.user);
            
            this.tokenSubject.next(response.token);
            this.currentUserSubject.next(response.user);
          })
        )
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  async register(userData: RegisterData): Promise<AuthResponse> {
    try {
      const response = await lastValueFrom(
        this.http.post<AuthResponse>(`${this.apiUrl}/auth/register`, userData)
          .pipe(
            tap(async (response) => {
              // Stocker le token et l'utilisateur après inscription
              await this.storage.set('auth_token', response.token);
              await this.storage.set('current_user', response.user);
              
              this.tokenSubject.next(response.token);
              this.currentUserSubject.next(response.user);
            })
          )
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      // Appeler l'API de déconnexion si connecté
      if (this.tokenSubject.value) {
        await lastValueFrom(
          this.http.post(`${this.apiUrl}/auth/logout`, {}, {
            headers: this.getAuthHeaders()
          })
        );
      }
    } catch (error) {
      console.error('Erreur lors de la déconnexion API:', error);
    } finally {
      // Nettoyer le stockage local
      await this.storage.remove('auth_token');
      await this.storage.remove('current_user');
      
      this.tokenSubject.next(null);
      this.currentUserSubject.next(null);
    }
  }

  async getCurrentUser(): Promise<User | null> {
    if (!this.tokenSubject.value) {
      return null;
    }

    try {
      const response = await lastValueFrom(
        this.http.get<{ user: User }>(`${this.apiUrl}/auth/me`, {
          headers: this.getAuthHeaders()
        })
      );

      if (response && response.user) {
        this.currentUserSubject.next(response.user);
        await this.storage.set('current_user', response.user);
        return response.user;
      }
    } catch (error) {
      console.error('Erreur lors de la récupération du profil:', error);
      // Si le token est invalide, déconnecter l'utilisateur
      if (this.isHttpErrorResponse(error) && (error.status === 401 || error.status === 403)) {
        await this.logout();
      }
    }

    return null;
  }

  private isHttpErrorResponse(error: any): error is HttpErrorResponse {
    return error instanceof HttpErrorResponse;
  }

  isLoggedIn(): boolean {
    return !!this.tokenSubject.value && !!this.currentUserSubject.value;
  }

  getToken(): string | null {
    return this.tokenSubject.value;
  }

  getCurrentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  isAdmin(): boolean {
    const user = this.currentUserSubject.value;
    return user?.user_type === 'admin';
  }

  isFreelance(): boolean {
    const user = this.currentUserSubject.value;
    return user?.user_type === 'freelance';
  }

  isClient(): boolean {
    const user = this.currentUserSubject.value;
    return user?.user_type === 'client';
  }
}