import { TestBed } from '@angular/core/testing';
import { AvatarSelectionService } from './avatar-selection.service';

const MAX_ICONS = 3;

describe('AvatarSelectionService', () => {
    let service: AvatarSelectionService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(AvatarSelectionService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should change icon/index when chooseIcon is called when clicking on next', () => {
        service.idx = 0;
        service.chooseIcon(true);
        expect(service.idx).toBe(1);
    });

    it('should change icon/index when chooseIcon is called when clicking on previous', () => {
        service.idx = 0;
        service.chooseIcon(false);
        expect(service.idx).toBe(MAX_ICONS);
    });
});
