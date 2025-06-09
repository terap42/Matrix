import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModoContenuPage } from './modo-contenu.page';

describe('ModeContenuPage', () => {
  let component: ModoContenuPage;
  let fixture: ComponentFixture<ModoContenuPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ModoContenuPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
