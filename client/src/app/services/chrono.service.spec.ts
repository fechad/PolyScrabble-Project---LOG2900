import { TestBed } from '@angular/core/testing';
import { ChronoService } from './chrono.service';

describe('ChronoService', () => {
    let service: ChronoService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ChronoService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
    /* TODO: à tester*/
});
