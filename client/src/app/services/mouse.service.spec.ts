/* eslint-disable prettier/prettier */
import { TestBed } from '@angular/core/testing';
import { Vec2 } from '@app/classes/vec2';
import { MouseButton } from '@app/components/play-area/play-area.component';
import { from } from 'rxjs';
import { GameContextService } from './game-context.service';
import { GridService } from './grid.service';
import { MouseService } from './mouse.service';

fdescribe('MouseDetect', () => {
    let service: MouseService;
    let mouseEvent: MouseEvent;
    let gameContextService: jasmine.SpyObj<GameContextService>;
    let gridService: jasmine.SpyObj<GridService>;

    beforeEach(() => {
        gameContextService = jasmine.createSpyObj('GameContextService', ['isMyTurn']);
        gameContextService.isMyTurn.and.callFake(() => from([true]));
        gridService = jasmine.createSpyObj('GridService', ['drawGrid']);
        TestBed.configureTestingModule({
            providers: [
                { provide: GameContextService, useValue: gameContextService },
                { provide: GridService, useValue: gridService },
            ],
        });
        service = TestBed.inject(MouseService);
        service.gridService.letterWritten = 0;
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

    it('mouseHitDetect should return on right click', async () => {
        mouseEvent = {
            offsetX: 20,
            offsetY: 20,
            button: MouseButton.Right,
        } as MouseEvent;
        service.mouseHitDetect(mouseEvent);
        expect(gridService.drawGrid).not.toHaveBeenCalled();
    });

    it('calculateX should return a number', async () => {
        mouseEvent = {
            offsetX: 20,
            offsetY: 20,
            button: MouseButton.Right,
        } as MouseEvent;
        const result = service.calculateX(mouseEvent.offsetX);
        expect(typeof result).toEqual(typeof 20);
    });

    it('calculateY should return a number', async () => {
        mouseEvent = {
            offsetX: 20,
            offsetY: 20,
            button: MouseButton.Right,
        } as MouseEvent;
        const result = service.calculateY(mouseEvent.offsetY);
        expect(typeof result).toEqual(typeof 20);
    });

    it('isInBound should return false if positionX is under 20', async () => {
        mouseEvent = {
            offsetX: Math.random() * 19,
            offsetY: 20,
            button: MouseButton.Right,
        } as MouseEvent;
        const result = service.isInBound(mouseEvent);
        expect(result).toEqual(false);
    });
});
