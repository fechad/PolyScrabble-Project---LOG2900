import { TestBed } from '@angular/core/testing';
import { GameState } from '@app/classes/game';
import { Parameters } from '@app/classes/parameters';
import { Room, State } from '@app/classes/room';
import { BehaviorSubject } from 'rxjs';
import { CommunicationService } from './communication.service';
import { GameContextService } from './game-context.service';
import { ONE_SECOND, TimerService } from './timer.service';

const TIMER_DELAY = 100;

describe('Timer service', () => {
    let service: TimerService;
    let room: BehaviorSubject<Room | undefined>;
    let gameState: BehaviorSubject<GameState>;

    beforeEach(() => {
        room = new BehaviorSubject(undefined as Room | undefined);
        const state: GameState = {
            players: [
                {
                    info: { id: 'P1', name: 'Player 1', connected: true, virtual: false },
                    score: 0,
                    rackCount: 7,
                },
                {
                    info: { id: 'P2', name: 'Player 2', connected: true, virtual: false },
                    score: 0,
                    rackCount: 7,
                },
            ],
            reserveCount: 88,
            board: [],
            turn: 'P1',
            ended: false,
        };
        gameState = new BehaviorSubject(state);
        TestBed.configureTestingModule({
            providers: [
                { provide: CommunicationService, useValue: { selectedRoom: room } },
                { provide: GameContextService, useValue: { state: gameState } },
            ],
        });
        service = TestBed.inject(TimerService);
    });

    it('should have ?:?? by default', () => {
        expect(service.timer.value).toBe('?:??');
    });

    it('should not start when room is not defined', () => {
        room.next(undefined);
        expect(service.timer.value).toBe('?:??');
    });

    it('should not start when room is not started', () => {
        room.next({
            parameters: new Parameters(),
            name: '',
            id: 0,
            mainPlayer: gameState.value.players[0].info,
            otherPlayer: gameState.value.players[1].info,
            state: State.Setup,
        });
        expect(service.timer.value).toBe('?:??');
    });

    it('should start when room is started', () => {
        room.next({
            parameters: new Parameters(),
            name: '',
            id: 0,
            mainPlayer: gameState.value.players[0].info,
            otherPlayer: gameState.value.players[1].info,
            state: State.Started,
        });
        expect(service.timer.value).toBe('1:00');
    });

    it('should restart when new turn is started', (done) => {
        room.next({
            parameters: new Parameters(),
            name: '',
            id: 0,
            mainPlayer: gameState.value.players[0].info,
            otherPlayer: gameState.value.players[1].info,
            state: State.Started,
        });
        expect(service.timer.value).toBe('1:00');
        setTimeout(() => {
            expect(service.timer.value).toBe('0:59');
            gameState.next({ ...gameState.value, turn: 'P2' });
            expect(service.timer.value).toBe('1:00');
            done();
        }, ONE_SECOND + TIMER_DELAY);
    });

    it('should not restart when the same turn is continued', (done) => {
        room.next({
            parameters: new Parameters(),
            name: '',
            id: 0,
            mainPlayer: gameState.value.players[0].info,
            otherPlayer: gameState.value.players[1].info,
            state: State.Started,
        });
        expect(service.timer.value).toBe('1:00');
        setTimeout(() => {
            expect(service.timer.value).toBe('0:59');
            gameState.next({ ...gameState.value, turn: 'P1' });
            expect(service.timer.value).toBe('0:59');
            done();
        }, ONE_SECOND + TIMER_DELAY);
    });

    it('should stop at 0', (done) => {
        const params = new Parameters();
        params.timer = 1;
        room.next({
            parameters: params,
            name: '',
            id: 0,
            mainPlayer: gameState.value.players[0].info,
            otherPlayer: gameState.value.players[1].info,
            state: State.Started,
        });
        expect(service.timer.value).toBe('0:01');
        setTimeout(() => {
            expect(service.timer.value).toBe('0:00');
            done();
        }, 2 * ONE_SECOND + TIMER_DELAY);
    });
});
