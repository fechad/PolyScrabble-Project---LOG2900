import { TestBed } from '@angular/core/testing';
import { SkipTurnService } from './skip-turn.service';

describe('SkipTurnService', () => {
    let service: SkipTurnService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(SkipTurnService);
        service.isYourTurn = true;
    });
    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('skipTurn() should change the value of isYourTurn variable', () => {
        service.skipTurn();
        expect(service.isYourTurn).toBeFalse();
        service.skipTurn();
        expect(service.isYourTurn).toBeTrue();
    });
});
