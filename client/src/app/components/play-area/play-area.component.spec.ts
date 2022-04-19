import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { GameState } from '@app/classes/game';
import { Letter } from '@app/classes/letter';
import { State } from '@app/classes/room';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { GameContextService, Tile } from '@app/services/game-context.service';
import { GridService } from '@app/services/grid.service';
import { MouseService } from '@app/services/mouse.service';
import { PlaceLetterService } from '@app/services/place-letter.service';
import { BehaviorSubject, of, Subject } from 'rxjs';

describe('PlayAreaComponent', () => {
    let component: PlayAreaComponent;
    let fixture: ComponentFixture<PlayAreaComponent>;
    let gameService: jasmine.SpyObj<GameContextService>;
    let mouseService: jasmine.SpyObj<MouseService>;
    let placeService: jasmine.SpyObj<PlaceLetterService>;
    let gridService: jasmine.SpyObj<GridService>;

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
        mouseService = jasmine.createSpyObj('MouseService', ['MouseHitDetect'], { mousePosition: { x: 20, y: 510 }, isHorizontal: true });
        placeService = jasmine.createSpyObj('PlaceLetterService', [
            'sendPlacedLetters',
            'removeWord',
            'removeLetterOnCanvas',
            'placeWordOnCanvas',
            'clear',
        ]);

        gridService = jasmine.createSpyObj('GridService', ['drawGrid', 'tempUpdateBoard', 'drawArrow'], {
            rack: [{ name: 'A', score: 1 }] as Letter[],
            letterPosition: [[0, 0]] as number[][],
            firstLetter: [0, 0] as number[],
            letters: [] as Letter[],
            letterForServer: 'a',
        });
    });

    beforeEach(async () => {
        TestBed.configureTestingModule({
            declarations: [PlayAreaComponent],
            imports: [RouterTestingModule, HttpClientTestingModule],
            providers: [
                { provide: GameContextService, useValue: gameService },
                { provide: GridService, useValue: gridService },
                { provide: MouseService, useValue: mouseService },
                { provide: PlaceLetterService, useValue: placeService },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(PlayAreaComponent);
        component = fixture.componentInstance;
        component.sent = new Subject<void>();
        component.sent.subscribe();
        component.gridService = gridService;

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
    it('buttonDetect should modify the buttonPressed variable', () => {
        const keyDetectSpy = spyOn(component, 'buttonDetect');
        const expectedKey = 'Enter';
        const buttonEvent = {
            key: expectedKey,
        } as KeyboardEvent;
        component.buttonDetect(buttonEvent);
        expect(keyDetectSpy).toHaveBeenCalled();
    });
    it('press enter should send letter to server', () => {
        const expectedKey = 'Enter';
        const buttonEvent = {
            key: expectedKey,
        } as KeyboardEvent;
        component.buttonDetect(buttonEvent);
        expect(placeService.sendPlacedLetters).toHaveBeenCalled();
    });

    it('press enter should try to place letter in the board server side', () => {
        const expectedKey = 'Enter';
        const buttonEvent = {
            key: expectedKey,
        } as KeyboardEvent;
        component.buttonDetect(buttonEvent);
        expect(placeService.sendPlacedLetters).toHaveBeenCalled();
    });

    it('pressing escape should remove all the letters', () => {
        component.gridService.letters.push({ name: 'a', score: 1 });
        component.gridService.letters.push({ name: 'a', score: 1 });
        const expectedKey = 'Escape';
        const buttonEvent = {
            key: expectedKey,
        } as KeyboardEvent;
        component.buttonDetect(buttonEvent);
        expect(component.gridService.drawGrid).toHaveBeenCalled();
    });

    it('typing an allowed letter should place the letter', () => {
        const expectedKey = 'a';
        const buttonEvent = {
            key: expectedKey,
        } as KeyboardEvent;
        spyOn(component, 'isInBound').and.callFake(() => {
            return true;
        });
        component.buttonDetect(buttonEvent);
        expect(placeService.placeWordOnCanvas).toHaveBeenCalled();
    });

    it('isInbound should return true if the letter fit inside the board', () => {
        component.gridService.letters.push({ name: 'a', score: 1 });
        const result = component.isInBound();
        expect(result).toEqual(true);
    });

    it('should sendPlacedLetters if length is not 0', () => {
        gridService = jasmine.createSpyObj('GridService', ['drawGrid', 'tempUpdateBoard', 'drawArrow'], {
            rack: [{ name: 'A', score: 1 }] as Letter[],
            letterPosition: [[0, 0]] as number[][],
            firstLetter: [0, 0] as number[],
            letters: [] as Letter[],
            letterForServer: '',
        });
        component.gridService = gridService;
        fixture.detectChanges();

        const expectedKey = 'Enter';
        const buttonEvent = {
            key: expectedKey,
        } as KeyboardEvent;
        component.buttonDetect(buttonEvent);
        expect(gameService.addMessage).toHaveBeenCalled();
    });
});
