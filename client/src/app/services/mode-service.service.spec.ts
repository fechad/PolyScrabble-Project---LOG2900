import { TestBed } from '@angular/core/testing';
import { ModeServiceService } from './mode-service.service';

describe('ModeServiceService', () => {
    let service: ModeServiceService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ModeServiceService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('mode should be input string of appendMode', () => {
        service.mode = 'start';
        service.appendMode('classique');
        expect(service.mode).toBe('classique');
    });
});
