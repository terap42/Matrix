import { TestBed } from '@angular/core/testing';

import { DetailFondsService } from './detail-fonds.service';

describe('DetailFondsService', () => {
  let service: DetailFondsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DetailFondsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
