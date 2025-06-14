// src/app/admin/mission-management/models/mission.interface.ts - VERSION CORRIGÉE

export enum MissionStatus {
  DRAFT = 'draft',
  PUBLISHED = 'open',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  REPORTED = 'reported'
}

export enum BudgetType {
  FIXED = 'fixed',
  HOURLY = 'hourly'
}

export enum ExperienceLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  EXPERT = 'expert'
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  category: string;
  budget: number;
  budgetMin?: number;
  budgetMax?: number;
  budgetType?: BudgetType;
  currency: string;
  status: MissionStatus;
  deadline?: Date;
  
  // Informations client
  clientId: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  
  // Informations freelancer
  freelancerId?: string;
  freelancerName?: string;
  freelancerEmail?: string;
  
  // Compétences et détails
  skillsRequired: string[];
  estimatedDuration?: string; // ✅ AJOUTÉE - Durée estimée
  
  // Dates
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date; // ✅ AJOUTÉE - Date de publication
  
  // Candidatures et signalements
  applicationsCount: number;
  isReported: boolean;
  reportReason?: string;
  reportedAt?: Date;
  reporterId?: string;
  
  // Autres propriétés
  priority: 'low' | 'medium' | 'high';
  isRemote: boolean;
  location?: string;
  experienceLevel: ExperienceLevel;
}

export interface MissionFilters {
  // Pagination
  page?: number;
  limit?: number;
  
  // Filtres de base
  status?: MissionStatus;
  category?: string;
  searchTerm?: string;
  isReported?: boolean;
  
  // Tri
  sortBy?: 'created_at' | 'updated_at' | 'deadline' | 'budget_max' | 'title';
  sortOrder?: 'ASC' | 'DESC';
  
  // Filtres avancés
  budgetMin?: number;
  budgetMax?: number;
  experienceLevel?: ExperienceLevel;
  isRemote?: boolean;
  clientId?: string;
  freelancerId?: string;
  
  // Filtres de dates ✅ AJOUTÉS
  dateFrom?: string;
  dateTo?: string;
}

export interface MissionReport {
  id: string;
  missionId: string;
  reporterId: string;
  reporterName: string;
  reason: string;
  status: 'pending' | 'reviewed' | 'resolved';
  adminNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MissionApplication {
  id: string;
  missionId: string;
  freelanceId: string;
  freelanceName: string;
  freelanceEmail: string;
  proposal: string;
  proposedBudget: number;
  proposedDeadline: Date;
  status: 'pending' | 'accepted' | 'rejected';
  appliedAt: Date;
  respondedAt?: Date;
}

export interface CreateMissionRequest {
  title: string;
  description: string;
  category: string;
  budgetMin?: number;
  budgetMax?: number;
  budgetType: BudgetType;
  currency: string;
  deadline?: string;
  isRemote: boolean;
  location?: string;
  experienceLevel: ExperienceLevel;
  skillsRequired: string[];
  estimatedDuration?: string; // ✅ AJOUTÉE
}

export interface UpdateMissionRequest {
  title?: string;
  description?: string;
  category?: string;
  budgetMin?: number;
  budgetMax?: number;
  budgetType?: BudgetType;
  currency?: string;
  deadline?: string;
  status?: MissionStatus;
  isRemote?: boolean;
  location?: string;
  experienceLevel?: ExperienceLevel;
  skillsRequired?: string[];
  estimatedDuration?: string; // ✅ AJOUTÉE
}