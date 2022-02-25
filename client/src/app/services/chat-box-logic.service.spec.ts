import { TestBed } from '@angular/core/testing';

import { ChatBoxLogicService } from './chat-box-logic.service';

describe('ChatBoxLogicService', () => {
  let service: ChatBoxLogicService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChatBoxLogicService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
