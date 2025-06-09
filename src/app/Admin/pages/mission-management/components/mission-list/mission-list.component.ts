// src/app/admin/mission-management/components/mission-list/mission-list.component.ts

import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Mission, MissionStatus } from '../../models/mission.interface';

@Component({
  selector: 'app-mission-list',
  templateUrl: './mission-list.component.html',
  styleUrls: ['./mission-list.component.scss']
})
export class MissionListComponent {

  @Input() paginatedMissions: Mission[] = [];
  @Input() currentPage: number = 1;
  @Input() totalPages: number = 1;
  @Input() totalItems: number = 0;
  @Input() itemsPerPage: number = 10;
  @Input() filteredMissions: Mission[] = [];

  @Output() viewDetailEvent = new EventEmitter<Mission>();
  @Output() deleteMissionEvent = new EventEmitter<Mission>();
  @Output() changeStatusEvent = new EventEmitter<{mission: Mission, status: MissionStatus}>();
  @Output() resolveReportEvent = new EventEmitter<Mission>();
  @Output() nextPageEvent = new EventEmitter<void>();
  @Output() previousPageEvent = new EventEmitter<void>();

  activeStatusMenu: string | null = null;
  Math = Math;

  availableStatuses = [
    { value: MissionStatus.DRAFT, label: 'Brouillon' },
    { value: MissionStatus.PUBLISHED, label: 'Publiée' },
    { value: MissionStatus.IN_PROGRESS, label: 'En cours' },
    { value: MissionStatus.COMPLETED, label: 'Terminée' },
    { value: MissionStatus.CANCELLED, label: 'Annulée' },
    { value: MissionStatus.REPORTED, label: 'Signalée' }
  ];

  trackByMissionId(index: number, mission: Mission): string {
    return mission.id;
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  getStatusColor(status: MissionStatus): string {
    const colors = {
      [MissionStatus.DRAFT]: 'bg-gray-100 text-gray-800',
      [MissionStatus.PUBLISHED]: 'bg-blue-100 text-blue-800',
      [MissionStatus.IN_PROGRESS]: 'bg-yellow-100 text-yellow-800',
      [MissionStatus.COMPLETED]: 'bg-green-100 text-green-800',
      [MissionStatus.CANCELLED]: 'bg-red-100 text-red-800',
      [MissionStatus.REPORTED]: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  }

  getStatusDotColor(status: MissionStatus): string {
    const colors = {
      [MissionStatus.DRAFT]: 'bg-gray-400',
      [MissionStatus.PUBLISHED]: 'bg-blue-400',
      [MissionStatus.IN_PROGRESS]: 'bg-yellow-400',
      [MissionStatus.COMPLETED]: 'bg-green-400',
      [MissionStatus.CANCELLED]: 'bg-red-400',
      [MissionStatus.REPORTED]: 'bg-red-400'
    };
    return colors[status] || 'bg-gray-400';
  }

  getStatusLabel(status: MissionStatus): string {
    const labels = {
      [MissionStatus.DRAFT]: 'Brouillon',
      [MissionStatus.PUBLISHED]: 'Publiée',
      [MissionStatus.IN_PROGRESS]: 'En cours',
      [MissionStatus.COMPLETED]: 'Terminée',
      [MissionStatus.CANCELLED]: 'Annulée',
      [MissionStatus.REPORTED]: 'Signalée'
    };
    return labels[status] || status;
  }

  viewDetail(mission: Mission) {
    this.viewDetailEvent.emit(mission);
  }

  deleteMission(mission: Mission) {
    this.deleteMissionEvent.emit(mission);
  }

  toggleStatusMenu(missionId: string) {
    this.activeStatusMenu = this.activeStatusMenu === missionId ? null : missionId;
  }

  changeStatus(mission: Mission, newStatus: MissionStatus) {
    this.activeStatusMenu = null;
    this.changeStatusEvent.emit({ mission, status: newStatus });
  }

  resolveReport(mission: Mission) {
    this.resolveReportEvent.emit(mission);
  }

  nextPage() {
    this.nextPageEvent.emit();
  }

  previousPage() {
    this.previousPageEvent.emit();
  }

  exportMissions() {
    // Logique d'export à implémenter
    console.log('Export des missions...');
  }
}