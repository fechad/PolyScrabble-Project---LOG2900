import { TestBed } from '@angular/core/testing';

import { MenusStatesService } from './menus-states.service';

describe('MenusStatesService', () => {
  let service: MenusStatesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MenusStatesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
