import { TestBed } from '@angular/core/testing';

import { GameContextService } from './game-context.service';

describe('GameContextService', () => {
  let service: GameContextService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GameContextService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
