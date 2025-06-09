import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TabsLayoutPage } from './tabs-layout.page';

describe('TabsLayoutPage', () => {
  let component: TabsLayoutPage;
  let fixture: ComponentFixture<TabsLayoutPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(TabsLayoutPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
