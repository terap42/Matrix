import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BaseLayoutAdminService {

  private activeTabSubject = new BehaviorSubject<string>('dashboard');
  activeTab$ = this.activeTabSubject.asObservable();

  constructor(private router: Router) {}

  setActiveNav(tab: string) {
    this.activeTabSubject.next(tab);
    this.router.navigateByUrl(`/admin/${tab}`);
  }

  getActiveNav() {
    return this.activeTabSubject.value;
  }

  setActiveNavWithoutNavigation(tab: string) {
    this.activeTabSubject.next(tab);
  }
}