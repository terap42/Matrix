import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BaseLayoutAdminPage } from './base-layout-admin.page';

describe('BaseLayoutAdminPage', () => {
  let component: BaseLayoutAdminPage;
  let fixture: ComponentFixture<BaseLayoutAdminPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(BaseLayoutAdminPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
