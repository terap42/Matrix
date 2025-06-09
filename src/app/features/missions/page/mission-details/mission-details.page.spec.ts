import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MissionDetailsPage } from './mission-details.page';

describe('MissionDetailsPage', () => {
  let component: MissionDetailsPage;
  let fixture: ComponentFixture<MissionDetailsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MissionDetailsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
