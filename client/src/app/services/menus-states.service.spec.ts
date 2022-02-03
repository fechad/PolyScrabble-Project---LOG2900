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

    it('assignMode should assign the input string as the mode if it is not empty', () => {
        service.mode = '';
        const mode = 'classique';
        service.assignMode(mode);
        expect(service.mode).toBe('classique');
    });

    it('assignMode should not assign the input string as the mode if it is empty', () => {
        service.mode = '2990';
        const mode = '';
        service.assignMode(mode);
        expect(service.mode).toBe('2990');
    });
});
