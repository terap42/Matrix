import { Component, HostListener, Input, OnInit } from '@angular/core';
import { BaseLayoutAdminService } from './base-layout-admin.service';

@Component({
  selector: 'app-base-layout-admin',
  templateUrl: './base-layout-admin.page.html',
  styleUrls: ['./base-layout-admin.page.scss'],
  standalone: false
})
export class BaseLayoutAdminPage implements OnInit {
  @Input() title: string = 'Dashboard';
  @Input() subtitle: string = 'Tableau de bord';
  showTooltip = false;

  activeTab: string = 'dashboard';
  isSidebarOpen = true;

  toggleTooltip() {
    this.showTooltip = !this.showTooltip;
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.tooltip-container') && this.showTooltip) {
      this.showTooltip = false;
    }
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;    
  }

  constructor(private navigationService: BaseLayoutAdminService) {}

  ngOnInit() {
    this.navigationService.activeTab$.subscribe(tab => {
      this.activeTab = tab;
    });
    console.log('tabs', this.activeTab);
    
  }

  navigate(tab: string) {
    this.navigationService.setActiveNav(tab);
  }

  isActive(tab: string): boolean {
    return this.activeTab === tab;
  }
}
