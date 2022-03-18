// eslint-disable-next-line max-classes-per-file
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GameState } from '@app/classes/game';
import { Letter } from '@app/classes/letter';
import { Parameters } from '@app/classes/parameters';
import { Room, State } from '@app/classes/room';
import { CommunicationService } from '@app/services/communication.service';
import { GameContextService } from '@app/services/game-context.service';
import { CountdownComponent, CountdownTimer } from 'ngx-countdown';
import { BehaviorSubject, from } from 'rxjs';
import { InfosBoxComponent } from './infos-box.component';

class GameContextServiceMock {
    state: BehaviorSubject<GameState> = new BehaviorSubject({
        /* Dummy state */
        players: [
            { id: '0', name: 'P1', connected: true, virtual: false },
            { id: '1', name: 'P2', connected: true, virtual: false },
        ].map((info) => ({ info, score: 0, rackCount: 7 })),
        reserveCount: 88,
        board: [],
        turn: undefined,
        state: State.Started,
    } as GameState);

    rack: BehaviorSubject<Letter[]> = new BehaviorSubject([{ name: 'A', score: 1 }]);

    isMyTurn() {
        return from([true]);
    }

    getOther() {
        return;
    }

    isEnded() {
        return from([false]);
    }

    getMe() {
        return;
    }
}

class CommunicationServiceMock {
    selectedRoom: BehaviorSubject<Room> = new BehaviorSubject({
        id: 0,
        name: 'Room',
        parameters: new Parameters(),
        mainPlayer: { name: 'Player 1', id: '0', connected: true },
        otherPlayer: undefined,
        state: State.Setup,
    } as Room);
    dictionnaries = Promise.resolve([{ id: 0, name: 'francais' }]);

    getId() {
        return 0;
    }
}

describe('InfosBoxComponent', () => {
    let component: InfosBoxComponent;
    let fixture: ComponentFixture<InfosBoxComponent>;
    let gameContextService: GameContextServiceMock;
    let communicationService: CommunicationServiceMock;

    beforeEach(() => {
        gameContextService = new GameContextServiceMock();
        communicationService = new CommunicationServiceMock();
        TestBed.configureTestingModule({
            declarations: [InfosBoxComponent, CountdownComponent],
            imports: [],
            providers: [
                CountdownTimer,
                { provide: GameContextService, useValue: gameContextService },
                { provide: CommunicationService, useValue: communicationService },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(InfosBoxComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should send winning summary if state of game is aborted', () => {
        gameContextService.state.next({ ...gameContextService.state.value, state: State.Aborted });
        expect(component.summary).toEqual('👑 Votre adversaire a abandonné, vous avez gagné! 👑');
    });

    it('should have undefined summary if state of game is not ended or aborted', () => {
        gameContextService.state.next({ ...gameContextService.state.value, state: State.Started });
        expect(component.summary).toBeUndefined();
    });

    it('should congratulate both players if game ended and winner is undefined', () => {
        gameContextService.state.next({ ...gameContextService.state.value, state: State.Ended });
        gameContextService.state.value.winner = undefined;
        expect(component.summary).toBeDefined();
    });

    it('should congratulate the winner if game ended and winner is defined', () => {
        gameContextService.state.next({ ...gameContextService.state.value, state: State.Ended });
        gameContextService.state.next({ ...gameContextService.state.value, winner: '1' });
        expect(component.summary).toBeDefined();
    });
});
