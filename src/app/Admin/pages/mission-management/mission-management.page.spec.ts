import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MissionManagementPage } from './mission-management.page';

describe('MissionManagementPage', () => {
  let component: MissionManagementPage;
  let fixture: ComponentFixture<MissionManagementPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MissionManagementPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
