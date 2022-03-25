import { HttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { GameState } from '@app/classes/game';
import { Letter } from '@app/classes/letter';
import { Parameters } from '@app/classes/parameters';
import { Room, State } from '@app/classes/room';
import { CommunicationService } from '@app/services/communication.service';
import { GameContextService } from '@app/services/game-context.service';
import { CountdownComponent, CountdownTimer } from 'ngx-countdown';
import { BehaviorSubject, from } from 'rxjs';
import { ChronoContainerComponent } from './chrono-container.component';

class GameContextServiceMock {
    state: BehaviorSubject<GameState> = new BehaviorSubject({
        players: [
            { id: '0', avatar: 'a', name: 'P1', connected: true, virtual: false },
            { id: '1', avatar: 'a', name: 'P2', connected: true, virtual: false },
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

describe('ChronoContainerComponent', () => {
    let component: ChronoContainerComponent;
    let fixture: ComponentFixture<ChronoContainerComponent>;
    let httpClient: HttpClient;
    let router: jasmine.SpyObj<Router>;
    let gameContextService: GameContextServiceMock;
    let communicationService: CommunicationServiceMock;

    beforeEach(async () => {
        gameContextService = new GameContextServiceMock();
        communicationService = new CommunicationServiceMock();
        await TestBed.configureTestingModule({
            declarations: [ChronoContainerComponent, CountdownComponent],
            providers: [
                CountdownTimer,
                { provide: HttpClient, useValue: httpClient },
                { provide: Router, useValue: router },
                { provide: GameContextService, useValue: gameContextService },
                { provide: CommunicationService, useValue: communicationService },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ChronoContainerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
