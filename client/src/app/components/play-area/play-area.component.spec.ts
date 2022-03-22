import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { GameState } from '@app/classes/game';
import { Letter } from '@app/classes/letter';
import { State } from '@app/classes/room';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { CommunicationService } from '@app/services/communication.service';
import { GameContextService, Tile } from '@app/services/game-context.service';
import { GridService } from '@app/services/grid.service';
import { MouseService } from '@app/services/mouse.service';
import { BehaviorSubject, of, Subject } from 'rxjs';

describe('PlayAreaComponent', () => {
    let component: PlayAreaComponent;
    let fixture: ComponentFixture<PlayAreaComponent>;
    let commService: jasmine.SpyObj<CommunicationService>;
    let gameService: jasmine.SpyObj<GameContextService>;
    let gridService: jasmine.SpyObj<GridService>;
    let mouseService: jasmine.SpyObj<MouseService>;
    beforeEach(() => {
        commService = jasmine.createSpyObj('CommunicationService', ['place', 'sendLocalMessage']);
        gameService = jasmine.createSpyObj('GameContextService', ['tempUpdateRack', 'attemptTempRackUpdate', 'isMyTurn', 'addTempRack'], {
            state: new BehaviorSubject({
                state: State.Started,
                board: [
                    [null, { name: 'A', score: 1 }, null],
                    [null, null, null],
                    [null, null, null],
                ] as Tile[][],
            } as unknown as GameState),
            rack: new BehaviorSubject([{ name: 'A', score: 1 }]),
        });
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
            declarations: [PlayAreaComponent],
            imports: [RouterTestingModule, HttpClientTestingModule],
            providers: [
                { provide: CommunicationService, useValue: commService },
                { provide: GameContextService, useValue: gameService },
                { provide: GridService, useValue: gridService },
                { provide: MouseService, useValue: mouseService },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(PlayAreaComponent);
        component = fixture.componentInstance;
        component.sent = new Subject<void>();
        component.sent.subscribe();
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
        const keyDetectSpy = spyOn(component, 'sendPlacedLetters');
        const expectedKey = 'Enter';
        const buttonEvent = {
            key: expectedKey,
        } as KeyboardEvent;
        component.buttonDetect(buttonEvent);
        expect(keyDetectSpy).toHaveBeenCalled();
    });

    it('press enter should try to place letter in the board server side', () => {
        const expectedKey = 'Enter';
        const buttonEvent = {
            key: expectedKey,
        } as KeyboardEvent;
        component.buttonDetect(buttonEvent);
        expect(commService.place).toHaveBeenCalled();
    });

    it('removing a letter should draw a new arrow', () => {
        gridService.letters.push({ name: 'a', score: 1 });
        const keyDetectSpy = spyOn(component, 'drawShiftedArrow');
        const expectedKey = 'Backspace';
        const buttonEvent = {
            key: expectedKey,
        } as KeyboardEvent;
        component.buttonDetect(buttonEvent);
        expect(keyDetectSpy).toHaveBeenCalled();
    });

    it('pressing escape should remove all the letters', () => {
        gridService.letters.push({ name: 'a', score: 1 });
        gridService.letters.push({ name: 'a', score: 1 });
        const expectedKey = 'Escape';
        const buttonEvent = {
            key: expectedKey,
        } as KeyboardEvent;
        component.buttonDetect(buttonEvent);
        expect(gridService.drawGrid).toHaveBeenCalled();
    });

    it('typing an allowed letter should place the letter', () => {
        const keyDetectSpy = spyOn(component, 'placeWordOnCanvas');
        const expectedKey = 'a';
        const buttonEvent = {
            key: expectedKey,
        } as KeyboardEvent;
        spyOn(component, 'isInBound').and.callFake(() => {
            return true;
        });
        component.buttonDetect(buttonEvent);
        expect(keyDetectSpy).toHaveBeenCalled();
    });

    it('typing an allowed letter should remove it from the rack', () => {
        component.placeWordOnCanvas();
        expect(gameService.tempUpdateRack).toHaveBeenCalled();
    });
    it('isInbound should return true if the letter fit inside the board', () => {
        gridService.letters.push({ name: 'a', score: 1 });
        const result = component.isInBound();
        expect(result).toEqual(true);
    });
});
