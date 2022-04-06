import { TestBed } from '@angular/core/testing';

import { PlaceLetterService } from './place-letter.service';

describe('PlaceLetterService', () => {
  let service: PlaceLetterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PlaceLetterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
