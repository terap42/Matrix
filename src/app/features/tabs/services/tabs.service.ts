import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class TabsService {
  private activeTabSubject = new BehaviorSubject<string>('home');
  activeTab$ = this.activeTabSubject.asObservable();

  constructor(private router: Router) {}

  setActiveTab(tab: string) {
    this.activeTabSubject.next(tab);
    this.router.navigateByUrl(`/tabs/${tab}`);
  }

  getActiveTab() {
    return this.activeTabSubject.value;
  }

  setActiveTabWithoutNavigation(tab: string) {
    this.activeTabSubject.next(tab);
  }
}