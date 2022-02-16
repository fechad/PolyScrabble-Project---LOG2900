import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Letter } from '@app/classes/letter';
import { Message } from '@app/classes/message';
import { Parameters } from '@app/classes/parameters';
import { Player, Room } from '@app/classes/room';
import { IoWrapper } from '@app/classes/socket-wrapper';
import { SocketMock } from '@app/classes/socket-wrapper.spec';
import { CommunicationService } from '@app/services/communication.service';
import { Board, GameContextService } from './game-context.service';

/* eslint-disable dot-notation, max-lines */

class IoWrapperMock {
    io(): SocketMock {
        return new SocketMock();
    }
}

describe('CommunicationService', () => {
    const ID = 'BOB';
    const TOKEN = 34;
    const GAME_NO = 9;

    let httpMock: HttpTestingController;
    let service: CommunicationService;
    let gameContext: GameContextService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                {
                    provide: Router,
                    useValue: {
                        navigate: () => {
                            /* ignore */
                        },
                    },
                },
                { provide: IoWrapper, useClass: IoWrapperMock },
            ],
        });
        service = TestBed.inject(CommunicationService);
        httpMock = TestBed.inject(HttpTestingController);
        gameContext = TestBed.inject(GameContextService);
        const dictionnaries = httpMock.expectOne('http://localhost:3000/api/dictionnaries');
        dictionnaries.flush([]);
        sessionStorage.clear();
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should handle id message', () => {
        (service['mainSocket'] as unknown as SocketMock).events.emit('id', ID, TOKEN);
        expect(service.getId().value).toBe(ID);
        expect(service['token']).toBe(TOKEN);
    });

    it('should handle broadcasting messages', () => {
        expect(service.rooms.value).toEqual([]);
        const rooms: Room[] = [
            {
                id: 0,
                name: 'Game',
                parameters: new Parameters(),
                mainPlayer: { name: 'BOB', id: ID, connected: true },
                otherPlayer: undefined,
                started: false,
            },
        ];
        (service['waitingRoomsSocket'] as unknown as SocketMock).events.emit('broadcast-rooms', rooms);
        expect(service.rooms.value).toEqual(rooms);
    });

    const createRoom = () => {
        (service['mainSocket'] as unknown as SocketMock).events.emit('id', ID, TOKEN);
        (service['mainSocket'] as unknown as SocketMock).events.emit('join', GAME_NO);
        (service['roomSocket'] as unknown as SocketMock).events.emit('update-room', {
            id: GAME_NO,
            name: 'Room name',
            parameters: new Parameters(),
            mainPlayer: { name: 'Player 1', id: ID, connected: true },
            otherPlayer: undefined,
            started: false,
        });
    };

    const otherPlayer = () => {
        const newRoom = service.selectedRoom.value;
        if (newRoom) newRoom.mainPlayer.id = 'albatros';
        service.selectedRoom.next(newRoom);
    };

    it('should allow to know if ID is mainPlayer', () => {
        expect(service.isMainPlayer()).toBe(false);
        createRoom();
        expect(service.isMainPlayer()).toBe(true);
        otherPlayer();
        expect(service.isMainPlayer()).toBe(false);
    });

    it('should kick', () => {
        expect(() => service.kick()).toThrow();
        createRoom();
        service.kick();
        expect((service['roomSocket'] as unknown as SocketMock).emitSpy).toHaveBeenCalledWith('kick');
        otherPlayer();
        expect(() => service.kick()).toThrow();
    });

    it('should be kicked', () => {
        createRoom();
        (service['roomSocket'] as unknown as SocketMock).events.emit('kick');
        expect(service['roomSocket']).toBeUndefined();
        expect(service.selectedRoom.value).toBeUndefined();
    });

    it('should not error on kick & leave when not in game', () => {
        createRoom();
        expect(() => service.kickLeave()).not.toThrow();
        expect(service['roomSocket']).toBeUndefined();
        expect(service.selectedRoom.value).toBeUndefined();
    });

    it('should kick & leave when main player', () => {
        createRoom();
        (service['roomSocket'] as unknown as SocketMock).events.emit('join-game', GAME_NO);
        const spy = (service['gameSocket'] as unknown as SocketMock).emitSpy;
        service.kickLeave();
        expect(spy).toHaveBeenCalledWith('kick');
        expect(service['roomSocket']).toBeUndefined();
        expect(service.selectedRoom.value).toBeUndefined();
    });

    it('should not kick & leave when other player', () => {
        createRoom();
        otherPlayer();
        expect(() => service.kickLeave()).toThrow();
    });

    it('should leave when in room', () => {
        createRoom();
        service.leave();
        expect(service['roomSocket']).toBeUndefined();
        expect(service.selectedRoom.value).toBeUndefined();
    });

    it('should not leave when not in room', () => {
        (service['mainSocket'] as unknown as SocketMock).events.emit('id', ID, TOKEN);
        expect(() => service.leave()).toThrow();
    });

    it('should start', () => {
        createRoom();
        service.start();
        expect((service['roomSocket'] as unknown as SocketMock).emitSpy).toHaveBeenCalledWith('start');
        otherPlayer();
        expect(() => service.start()).toThrow();
    });

    it('should forfeit', () => {
        createRoom();
        (service['roomSocket'] as unknown as SocketMock).events.emit('join-game', GAME_NO);
        service.confirmForfeit();
        expect((service['gameSocket'] as unknown as SocketMock).emitSpy).toHaveBeenCalledWith('confirm-forfeit');
        expect(service.getLoserId()).toBe(ID);
    });

    it('should join room', async () => {
        const promise = service.joinRoom('aldabob', GAME_NO);
        expect((service['mainSocket'] as unknown as SocketMock).emitSpy).toHaveBeenCalledWith('join-room', GAME_NO, 'aldabob');
        createRoom();
        setTimeout(() => otherPlayer(), 0);
        await promise;
    });

    it('should not join room 2 times', async () => {
        const promise = service.joinRoom('aldabob', GAME_NO);
        expect((service['mainSocket'] as unknown as SocketMock).emitSpy).toHaveBeenCalledWith('join-room', GAME_NO, 'aldabob');
        createRoom();
        setTimeout(() => otherPlayer(), 0);
        await promise;
        await expectAsync(service.joinRoom('aldabob', 0)).toBeRejected();
    });

    it('should not join room when there is an error', async () => {
        (service['mainSocket'] as unknown as SocketMock).events.emit('id', ID, TOKEN);
        const promise = service.joinRoom('aldabob', GAME_NO);
        (service['mainSocket'] as unknown as SocketMock).events.emit('error', new Error('big bad error'));
        await expectAsync(promise).toBeRejected();
    });

    it('should create room', async () => {
        const promise = service.createRoom('aldabob', new Parameters());
        expect((service['mainSocket'] as unknown as SocketMock).emitSpy).toHaveBeenCalledWith('create-room', 'aldabob', new Parameters());
        createRoom();
        setTimeout(() => createRoom(), 0);
        await promise;
    });

    it('should not create room when already in one', async () => {
        const promise = service.createRoom('aldabob', new Parameters());
        expect((service['mainSocket'] as unknown as SocketMock).emitSpy).toHaveBeenCalledWith('create-room', 'aldabob', new Parameters());
        createRoom();
        setTimeout(() => createRoom(), 0);
        await promise;

        await expectAsync(service.createRoom('aldabob', new Parameters())).toBeRejected();
    });

    it('should not create room when there is an error', async () => {
        const promise = service.createRoom('aldabob', new Parameters());
        (service['mainSocket'] as unknown as SocketMock).events.emit('error', new Error('big bad error'));
        await expectAsync(promise).toBeRejected();
    });

    it('should start/stop listening to broadcasts', async () => {
        (service['mainSocket'] as unknown as SocketMock).events.emit('id', ID, TOKEN);
        const spy = spyOn(service['waitingRoomsSocket'], 'disconnect').and.callThrough();
        expect(service['waitingRoomsSocket'].connected).toBe(true);
        service.unlistenRooms();
        expect(spy).toHaveBeenCalled();
        expect(service['waitingRoomsSocket'].connected).toBe(false);
        spy.calls.reset();
        service.unlistenRooms();
        expect(spy).not.toHaveBeenCalled();
        expect(service['waitingRoomsSocket'].connected).toBe(false);
        const promise = service.listenRooms();
        (service['waitingRoomsSocket'] as unknown as SocketMock).events.emit('connect');
        await promise;
        await service.listenRooms();
    });

    it('should handle errors on main socket', async () => {
        const spy = spyOn(service, 'handleError' as never);
        (service['mainSocket'] as unknown as SocketMock).events.emit('error', 'BIG BAD ERROR');
        expect(spy).toHaveBeenCalled();
    });

    const joinGame = () => {
        createRoom();
        (service['roomSocket'] as unknown as SocketMock).events.emit('join-game', GAME_NO);
    };

    it('should handle errors on room socket', async () => {
        joinGame();
        const spy = spyOn(service, 'handleError' as never).and.callThrough();
        (service['roomSocket'] as unknown as SocketMock).events.emit('error', 'BIG BAD ERROR');
        expect(spy).toHaveBeenCalled();
    });

    it('should forfeit', async () => {
        const spy = spyOn(gameContext, 'clearMessages');
        const spy2 = spyOn(service, 'leaveGame' as never);
        joinGame();
        (service['gameSocket'] as unknown as SocketMock).events.emit('forfeit', ID);
        expect(spy).toHaveBeenCalled();
        expect(spy2).toHaveBeenCalled();
    });

    it('should allow other player to forfeit', async () => {
        const spy = spyOn(gameContext, 'clearMessages');
        const spy2 = spyOn(service, 'leaveGame' as never);
        joinGame();
        (service['gameSocket'] as unknown as SocketMock).events.emit('forfeit', 'Dummy');
        expect(spy).toHaveBeenCalled();
        expect(spy2).toHaveBeenCalled();
    });

    it('should set turn', async () => {
        joinGame();
        (service['gameSocket'] as unknown as SocketMock).events.emit('turn', ID);
        expect(gameContext.isMyTurn.value).toBe(true);
        (service['gameSocket'] as unknown as SocketMock).events.emit('turn', 'Dummy');
        expect(gameContext.isMyTurn.value).toBe(false);
    });

    it('should receive message', async () => {
        const spy = spyOn(gameContext, 'receiveMessages');
        joinGame();
        const message: Message = { emitter: ID, text: 'Random text' };
        (service['gameSocket'] as unknown as SocketMock).events.emit('message', message, 2);
        expect(spy).toHaveBeenCalledWith(message, 2, true);
        message.emitter = 'NotMe';
        (service['gameSocket'] as unknown as SocketMock).events.emit('message', message, 2);
        expect(spy).toHaveBeenCalledWith(message, 2, false);
    });

    it('should receive game errors', async () => {
        const spy = spyOn(gameContext, 'addMessage');
        joinGame();
        (service['gameSocket'] as unknown as SocketMock).events.emit('game-error', 'BOBO');
        expect(spy).toHaveBeenCalledWith('BOBO', true);
    });

    it('should receive valid commands', async () => {
        const spy = spyOn(gameContext, 'addMessage');
        joinGame();
        (service['gameSocket'] as unknown as SocketMock).events.emit('valid-command', 'BOBO');
        expect(spy).toHaveBeenCalledWith('BOBO', true);
    });

    it('should receive valid exchanges', async () => {
        const spy = spyOn(gameContext, 'addMessage');
        joinGame();
        (service['gameSocket'] as unknown as SocketMock).events.emit('valid-exchange', 'BOBO');
        expect(spy).toHaveBeenCalledWith('BOBO', true);
    });

    it('should accept wins', async () => {
        joinGame();
        (service['gameSocket'] as unknown as SocketMock).events.emit('congratulations', { name: 'BOB', id: ID, connected: true });
        expect(service.congratulations).toBe('Félicitations BOB, vous avez gagné la partie !!');
    });

    it('should accept losts', async () => {
        joinGame();
        (service['gameSocket'] as unknown as SocketMock).events.emit('congratulations', { name: 'BOB', id: 'Dummy', connected: true });
        expect(service.getLoserId()).toBe(ID);
    });

    it('should receive game summary', async () => {
        const spy = spyOn(gameContext, 'addMessage');
        joinGame();
        (service['gameSocket'] as unknown as SocketMock).events.emit('game-summary', 'BOBO');
        expect(spy).toHaveBeenCalledWith('BOBO', true);
    });

    it('should accept ties', async () => {
        joinGame();
        (service['gameSocket'] as unknown as SocketMock).events.emit('its-a-tie', { name: 'BOB', id: ID, connected: true }, 'BOBBY');
        expect(service.congratulations).toBe('Félicitations, BOB et BOBBY, vous avez gagné la partie !!');
    });

    it('should update reserve', async () => {
        const NUM_LETTERS = 1000;
        joinGame();
        (service['gameSocket'] as unknown as SocketMock).events.emit('reserve', NUM_LETTERS);
        expect(gameContext.reserveCount.value).toBe(NUM_LETTERS);
    });

    it('should update racks', async () => {
        const NUM_LETTERS = 9;
        const spy = spyOn(gameContext, 'updateRack');
        joinGame();
        const letters: Letter[] = [{ name: 'A', score: 1 }];
        (service['gameSocket'] as unknown as SocketMock).events.emit('rack', letters, NUM_LETTERS);
        expect(spy).toHaveBeenCalledWith(letters, NUM_LETTERS);
    });

    it('should set players', async () => {
        const spy = spyOn(gameContext, 'setName');
        joinGame();
        const player1: Player = { name: 'BOB', id: ID, connected: true };
        const player2: Player = { name: 'Not BOB', id: 'Dummy', connected: true };
        (service['gameSocket'] as unknown as SocketMock).events.emit('players', [player1, player2]);
        expect(spy).toHaveBeenCalledWith(player1.name, true);
        expect(spy).toHaveBeenCalledWith(player2.name, false);
    });

    it('should set board', async () => {
        joinGame();
        const board: Board = [[{ name: 'A', score: 1 }]];
        (service['gameSocket'] as unknown as SocketMock).events.emit('board', board);
        expect(gameContext.board.value).toBe(board);
    });

    it('should set score', async () => {
        const SCORE = 9;
        const spy = spyOn(gameContext, 'setScore');
        joinGame();
        (service['gameSocket'] as unknown as SocketMock).events.emit('score', SCORE, ID);
        expect(spy).toHaveBeenCalledWith(SCORE, true);
        (service['gameSocket'] as unknown as SocketMock).events.emit('score', SCORE, 'Dummy');
        expect(spy).toHaveBeenCalledWith(SCORE, false);
    });

    it('should save id when unloading', () => {
        let closeHandler: EventListenerOrEventListenerObject = () => {
            expect(true).toBe(false); // should not be called
        };
        const spy = spyOn(window, 'addEventListener').and.callFake((event: string, handler: EventListenerOrEventListenerObject) => {
            closeHandler = handler;
        });
        (service['mainSocket'] as unknown as SocketMock).events.emit('id', ID, TOKEN);
        expect(spy).toHaveBeenCalled();
        expect(closeHandler).not.toBe(undefined);
        closeHandler(new Event('beforeunload'));
        expect(sessionStorage.getItem('ids')).toBe(ID);
    });

    it('retrieve codes', async () => {
        sessionStorage.clear();
        expect(service['getAuth']()).toEqual({});

        sessionStorage.setItem('ids', '');
        expect(service['getAuth']()).toEqual({});

        sessionStorage.setItem('ids', 'alibaba');
        expect(service['getAuth']()).toEqual({ id: 'alibaba' });
        expect(sessionStorage.getItem('ids')).toEqual('');

        sessionStorage.setItem('ids', 'a;b;c;d;d;e');
        expect(service['getAuth']()).toEqual({ id: 'e' });
        expect(sessionStorage.getItem('ids')).toEqual('a;b;c;d;d');
    });

    it('save codes', async () => {
        sessionStorage.clear();
        service['saveAuth']('ab');
        expect(sessionStorage.getItem('ids')).toEqual('ab');

        sessionStorage.setItem('ids', '');
        service['saveAuth']('ab');
        expect(sessionStorage.getItem('ids')).toEqual('ab');

        sessionStorage.setItem('ids', 'alibaba');
        service['saveAuth']('ab');
        expect(sessionStorage.getItem('ids')).toEqual('alibaba;ab');

        sessionStorage.setItem('ids', 'a;b;c;d;d;e');
        service['saveAuth']('ab');
        expect(sessionStorage.getItem('ids')).toEqual('a;b;c;d;d;e;ab');
    });
});
