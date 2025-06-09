import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MissionPage } from './mission.page';

describe('MissionPage', () => {
  let component: MissionPage;
  let fixture: ComponentFixture<MissionPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MissionPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
