import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GestMissionsPage } from './gest-missions.page';

describe('GestMissionsPage', () => {
  let component: GestMissionsPage;
  let fixture: ComponentFixture<GestMissionsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(GestMissionsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
