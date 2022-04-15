import { TestBed } from '@angular/core/testing';
import { GameState } from '@app/classes/game';
import { Letter } from '@app/classes/letter';
import { State } from '@app/classes/room';
import { BehaviorSubject, of } from 'rxjs';
import { GameContextService, Tile } from './game-context.service';
import { GridService } from './grid.service';
import { MouseService } from './mouse.service';
import { PlaceLetterService } from './place-letter.service';

describe('PlaceLetterService', () => {
    let service: PlaceLetterService;
    let gameService: jasmine.SpyObj<GameContextService>;
    let gridService: jasmine.SpyObj<GridService>;
    let mouseService: jasmine.SpyObj<MouseService>;
    beforeEach(() => {
        gameService = jasmine.createSpyObj(
            'GameContextService',
            ['place', 'addMessage', 'tempUpdateRack', 'attemptTempRackUpdate', 'isMyTurn', 'addTempRack'],
            {
                state: new BehaviorSubject({
                    state: State.Started,
                    board: [
                        [null, { name: 'A', score: 1 }, null],
                        [null, null, null],
                        [null, null, null],
                    ] as Tile[][],
                } as unknown as GameState),
                rack: new BehaviorSubject([{ name: 'A', score: 1 }]),
            },
        );
        gameService.isMyTurn.and.callFake(() => of(true));
        gridService = jasmine.createSpyObj('GridService', ['drawGrid', 'tempUpdateBoard', 'drawArrow'], {
            rack: [{ name: 'A', score: 1 }] as Letter[],
            letterPosition: [[0, 0]] as number[][],
            firstLetter: [0, 0] as number[],
            letters: [] as Letter[],
            letterForServer: 'a',
        });
        mouseService = jasmine.createSpyObj('MouseService', ['MouseHitDetect'], { mousePosition: { x: 20, y: 510 }, isHorizontal: true });
    });

    beforeEach(async () => {
        TestBed.configureTestingModule({
            providers: [
                { provide: GameContextService, useValue: gameService },
                { provide: GridService, useValue: gridService },
                { provide: MouseService, useValue: mouseService },
            ],
        }).compileComponents();
        service = TestBed.inject(PlaceLetterService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('sendPlacedLetters should clear all the variable', () => {
        const clearSpy = spyOn(service, 'clear');
        service.sendPlacedLetters();
        expect(clearSpy).toHaveBeenCalled();
    });
});
