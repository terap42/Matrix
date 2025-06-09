import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { MissionFilters, MissionStatus } from '../../models/mission.interface';

@Component({
  selector: 'app-mission-filters',
  templateUrl: './mission-filters.component.html',
  styleUrls: ['./mission-filters.component.scss'],
  standalone:false,
})
export class MissionFiltersComponent implements OnInit {
  @Output() filtersChange = new EventEmitter<MissionFilters>();

  filters: MissionFilters = {};

  statusOptions = [
    { value: '', label: 'Tous les statuts' },
    { value: MissionStatus.DRAFT, label: 'Brouillon' },
    { value: MissionStatus.PUBLISHED, label: 'Publiée' },
    { value: MissionStatus.IN_PROGRESS, label: 'En cours' },
    { value: MissionStatus.COMPLETED, label: 'Terminée' },
    { value: MissionStatus.CANCELLED, label: 'Annulée' },
    { value: MissionStatus.REPORTED, label: 'Signalée' }
  ];

  categoryOptions = [
    { value: '', label: 'Toutes les catégories' },
    { value: 'Développement', label: 'Développement' },
    { value: 'Design', label: 'Design' },
    { value: 'Rédaction', label: 'Rédaction' },
    { value: 'Marketing', label: 'Marketing' },
    { value: 'Audiovisuel', label: 'Audiovisuel' },
    { value: 'Conseil', label: 'Conseil' }
  ];

  reportedOptions = [
    { value: '', label: 'Toutes les missions' },
    { value: true, label: 'Missions signalées' },
    { value: false, label: 'Missions non signalées' }
  ];

  showAdvancedFilters = false;

  constructor() {}

  ngOnInit() {}

  onFilterChange() {
    const cleanFilters: MissionFilters = {};

    if (this.filters.status) cleanFilters.status = this.filters.status;
    if (this.filters.category) cleanFilters.category = this.filters.category;
    if (typeof this.filters.isReported === 'boolean') {
      cleanFilters.isReported = this.filters.isReported;
    }
    if (this.filters.searchTerm && this.filters.searchTerm.trim()) {
      cleanFilters.searchTerm = this.filters.searchTerm.trim();
    }
    if (this.filters.budgetMin && this.filters.budgetMin > 0) {
      cleanFilters.budgetMin = this.filters.budgetMin;
    }
    if (this.filters.budgetMax && this.filters.budgetMax > 0) {
      cleanFilters.budgetMax = this.filters.budgetMax;
    }
    if (this.filters.dateFrom) cleanFilters.dateFrom = this.filters.dateFrom;
    if (this.filters.dateTo) cleanFilters.dateTo = this.filters.dateTo;

    this.filtersChange.emit(cleanFilters);
  }

  resetFilters() {
    this.filters = {};
    this.showAdvancedFilters = false;
    this.filtersChange.emit({});
  }

  toggleAdvancedFilters() {
    this.showAdvancedFilters = !this.showAdvancedFilters;
  }
}