import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FreelanceProfilePage } from './freelance-profile.page';

describe('FreelanceProfilePage', () => {
  let component: FreelanceProfilePage;
  let fixture: ComponentFixture<FreelanceProfilePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(FreelanceProfilePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
