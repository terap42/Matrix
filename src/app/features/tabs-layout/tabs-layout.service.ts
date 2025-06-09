import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TabsLayoutService {
  private activeHideTabs = new BehaviorSubject<boolean>(true);
  hideTabs$ = this.activeHideTabs.asObservable();
  
  constructor() { }

  toogleHideTabs() {
    this.activeHideTabs.next(!this.activeHideTabs.value);
  }

  get getHideTabs() {
    return this.activeHideTabs.value;
  }

  setHideTabs() {
    this.activeHideTabs.next(true);
  }

  setShowTabs() {
    this.activeHideTabs.next(false);
  }
}
