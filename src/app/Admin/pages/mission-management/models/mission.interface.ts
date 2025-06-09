// src/app/admin/mission-management/models/mission.interface.ts

export interface Mission {
  id: string;
  title: string;
  description: string;
  budget: number;
  currency: string;
  status: MissionStatus;
  category: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  freelancerId?: string;
  freelancerName?: string;
  skillsRequired: string[];
  createdAt: Date;
  updatedAt: Date;
  deadline: Date;
  applicationsCount: number;
  isReported: boolean;
  reportReason?: string;
  priority: MissionPriority;
    publishedAt?: string | Date;
  estimatedDuration?: string;
  
}

export enum MissionStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  REPORTED = 'reported'
}

export enum MissionPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

export interface MissionFilters {
  status?: MissionStatus;
  category?: string;
  isReported?: boolean;
  dateFrom?: Date;
  dateTo?: Date;
  budgetMin?: number;
  budgetMax?: number;
  searchTerm?: string;
}
export interface Mission {
  // autres propriétés

 
}
