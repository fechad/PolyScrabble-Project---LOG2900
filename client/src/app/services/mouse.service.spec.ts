/* eslint-disable prettier/prettier */
import { TestBed } from '@angular/core/testing';
import { Vec2 } from '@app/classes/vec2';
import { MouseService } from './mouse.service';

describe('MouseDetect', () => {
    let service: MouseService;
    let mouseEvent: MouseEvent;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(MouseService);
    });

    /* eslint-disable @typescript-eslint/no-magic-numbers -- Add reason */
    it('mouseHitDetect should not change the mouse position if it is not a left click', () => {
        const expectedPosition: Vec2 = { x: 0, y: 0 };
        mouseEvent = {
            offsetX: expectedPosition.x + 10,
            offsetY: expectedPosition.y + 10,
            button: 1,
        } as MouseEvent;
        service.mouseHitDetect(mouseEvent);
        expect(service.mousePosition).not.toEqual({ x: mouseEvent.offsetX, y: mouseEvent.offsetY });
        expect(service.mousePosition).toEqual(expectedPosition);
    });
});
