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

    it('should place letters', () => {
        const updateRack = spyOn(service.rack, 'tempUpdate');
        const allowSwitch = spyOn(service, 'allowSwitch');
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        service.place('allo', 7, 7, true);
        expect(updateRack).toHaveBeenCalled();
        expect(allowSwitch).toHaveBeenCalledWith(false);
    });
});
