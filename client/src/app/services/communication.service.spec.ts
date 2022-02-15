import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Message } from '@app/classes/message';
import { Parameters } from '@app/classes/parameters';
import { Player, Room } from '@app/classes/room';
import { CommunicationService, IoWrapper } from '@app/services/communication.service';
import EventEmitter from 'events';
import { Letter } from './alphabet';
import { Board } from './game-context.service';

class SocketMock {
    readonly events: EventEmitter = new EventEmitter();
    readonly emitSpy: jasmine.Spy<any>;
    connected: boolean = true;

    emit(event: string, ...params: any[]) {}
    on(event: string, listener: (...params: any[]) => void) {
        this.events.on(event, listener);
    }
    once(event: string, listener: (...params: any[]) => void) {
        this.events.once(event, listener);
    }
    connect() {
        this.connected = true;
    }
    disconnect() {
        this.connected = false;
    }
    close() {}

    constructor() {
        this.emitSpy = spyOn<SocketMock, any>(this, 'emit');
    }
}

class IoWrapperMock {
    io(path: string, params?: { auth: any }): SocketMock {
        return new SocketMock();
    }
}

// export class CommunicationServiceMock {
//     readonly selectedRoom: BehaviorSubject<Room | undefined> = new Room()
// }

describe('CommunicationService', () => {
    const ID: string = 'BOB';

    let httpMock: HttpTestingController;
    let service: CommunicationService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [{ provide: Router, useValue: { navigate(){} } }, { provide: IoWrapper, useClass: IoWrapperMock }],
        });
        service = TestBed.inject(CommunicationService);
        httpMock = TestBed.inject(HttpTestingController);
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
        (service['mainSocket'] as unknown as SocketMock).events.emit('id', ID, 23);
        expect(service.getId().value).toBe(ID);
        expect(service['token']).toBe(23);
    });

    it('should handle broadcasting messages', () => {
        expect(service.rooms.value).toEqual([]);
        const rooms: Room[] = [{ id: 0, name: 'Game', parameters: new Parameters(), mainPlayer: { name: 'BOB', id: ID, connected: true }, otherPlayer: undefined, started: false }];
        (service['waitingRoomsSocket'] as unknown as SocketMock).events.emit('broadcast-rooms', rooms);
        expect(service.rooms.value).toEqual(rooms);
    });

    const createRoom = () => {
        (service['mainSocket'] as unknown as SocketMock).events.emit('id', ID, 23);
        (service['mainSocket'] as unknown as SocketMock).events.emit('join', 5);
        (service['roomSocket'] as unknown as SocketMock).events.emit('update-room', {
            id: 0,
            name: 'Room name',
            parameters: new Parameters(),
            mainPlayer: { name: 'Player 1', id: ID, connected: true },
            otherPlayer: undefined,
            started: false,
        });
    }

    const otherPlayer = () => {
        const newRoom = service.selectedRoom.value;
        if (newRoom) newRoom.mainPlayer.id = 'albatros';
        service.selectedRoom.next(newRoom);
    }

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
        (service['roomSocket'] as unknown as SocketMock).events.emit('join-game', 5);
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
        (service['mainSocket'] as unknown as SocketMock).events.emit('id', ID, 23);
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
        (service['roomSocket'] as unknown as SocketMock).events.emit('join-game', 9);
        service.confirmForfeit();
        expect((service['gameSocket'] as unknown as SocketMock).emitSpy).toHaveBeenCalledWith('confirm-forfeit');
        expect(service.getLoserId()).toBe(ID);
    });

    it('should join room', async () => {
        const promise = service.joinRoom('aldabob', 0);
        expect((service['mainSocket'] as unknown as SocketMock).emitSpy).toHaveBeenCalledWith('join-room', 0, 'aldabob');
        createRoom();
        setTimeout(() => otherPlayer(), 0);
        await promise;
    });

    it('should not join room 2 times', async () => {
        const promise = service.joinRoom('aldabob', 0);
        expect((service['mainSocket'] as unknown as SocketMock).emitSpy).toHaveBeenCalledWith('join-room', 0, 'aldabob');
        createRoom();
        setTimeout(() => otherPlayer(), 0);
        await promise;
        await expectAsync(service.joinRoom('aldabob', 0)).toBeRejected();
    });

    it('should not join room when there is an error', async () => {
        (service['mainSocket'] as unknown as SocketMock).events.emit('id', ID, 23);
        const promise = service.joinRoom('aldabob', 0);
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
        (service['mainSocket'] as unknown as SocketMock).events.emit('id', ID, 23);
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
        const spy = spyOn<any>(service, 'handleError');
        (service['mainSocket'] as unknown as SocketMock).events.emit('error', 'BIG BAD ERROR');
        expect(spy).toHaveBeenCalled();
    });

    const joinGame = () => {
        createRoom();
        (service['roomSocket'] as unknown as SocketMock).events.emit('join-game', 9);
    };

    it('should handle errors on room socket', async () => {
        joinGame();
        const spy = spyOn<any>(service, 'handleError').and.callThrough();
        (service['roomSocket'] as unknown as SocketMock).events.emit('error', 'BIG BAD ERROR');
        expect(spy).toHaveBeenCalled();
    });

    it('should forfeit', async () => {
        const spy = spyOn(service['gameContextService'], 'clearMessages');
        const spy2 = spyOn<any>(service, 'leaveGame');
        joinGame();
        (service['gameSocket'] as unknown as SocketMock).events.emit('forfeit', ID);
        expect(spy).toHaveBeenCalled();
        expect(spy2).toHaveBeenCalled();
    });

    it('should allow other player to forfeit', async () => {
        const spy = spyOn(service['gameContextService'], 'clearMessages');
        const spy2 = spyOn<any>(service, 'leaveGame');
        joinGame();
        (service['gameSocket'] as unknown as SocketMock).events.emit('forfeit', 'Dummy');
        expect(spy).toHaveBeenCalled();
        expect(spy2).toHaveBeenCalled();
    });

    it('should set turn', async () => {
        const spy = spyOn(service['gameContextService'], 'setMyTurn');
        joinGame();
        (service['gameSocket'] as unknown as SocketMock).events.emit('turn', ID);
        expect(spy).toHaveBeenCalledWith(true);
        (service['gameSocket'] as unknown as SocketMock).events.emit('turn', 'Dummy');
        expect(spy).toHaveBeenCalledWith(false);
    });

    it('should receive message', async () => {
        const spy = spyOn(service['gameContextService'], 'receiveMessages');
        joinGame();
        const message: Message = { emitter: ID, text: 'Random text' };
        (service['gameSocket'] as unknown as SocketMock).events.emit('message', message, 2);
        expect(spy).toHaveBeenCalledWith(message, 2, true);
        message.emitter = 'NotMe';
        (service['gameSocket'] as unknown as SocketMock).events.emit('message', message, 2);
        expect(spy).toHaveBeenCalledWith(message, 2, false);
    });

    it('should receive game errors', async () => {
        const spy = spyOn(service['gameContextService'], 'addMessage');
        joinGame();
        (service['gameSocket'] as unknown as SocketMock).events.emit('game-error', 'BOBO');
        expect(spy).toHaveBeenCalledWith('BOBO', true);
    });

    it('should receive valid commands', async () => {
        const spy = spyOn(service['gameContextService'], 'addMessage');
        joinGame();
        (service['gameSocket'] as unknown as SocketMock).events.emit('valid-command', 'BOBO');
        expect(spy).toHaveBeenCalledWith('BOBO', true);
    });

    it('should update reserve', async () => {
        const spy = spyOn(service['gameContextService'], 'updateReserveCount');
        joinGame();
        (service['gameSocket'] as unknown as SocketMock).events.emit('reserve', 9);
        expect(spy).toHaveBeenCalledWith(9);
    });

    it('should update racks', async () => {
        const spy = spyOn(service['gameContextService'], 'updateRack');
        joinGame();
        const letters: Letter[] = [{ id: 0, name: 'A', score: 1, quantity: 30 }];
        (service['gameSocket'] as unknown as SocketMock).events.emit('rack', letters, 9);
        expect(spy).toHaveBeenCalledWith(letters, 9);
    });

    it('should set players', async () => {
        const spy = spyOn(service['gameContextService'], 'setName');
        joinGame();
        const player1: Player = { name: 'BOB', id: ID, connected: true };
        const player2: Player = { name: 'Not BOB', id: 'Dummy', connected: true };
        (service['gameSocket'] as unknown as SocketMock).events.emit('players', [player1, player2]);
        expect(spy).toHaveBeenCalledWith(player1, true);
        expect(spy).toHaveBeenCalledWith(player2, false);
    });

    it('should set board', async () => {
        const spy = spyOn(service['gameContextService'], 'setBoard');
        joinGame();
        const board: Board = [[{ id: 0, name: 'A', score: 1, quantity: 3000 }]];
        (service['gameSocket'] as unknown as SocketMock).events.emit('board', board);
        expect(spy).toHaveBeenCalledWith(board);
    });

    it('should set score', async () => {
        const spy = spyOn(service['gameContextService'], 'setScore');
        joinGame();
        (service['gameSocket'] as unknown as SocketMock).events.emit('score', 9, ID);
        expect(spy).toHaveBeenCalledWith(9, true);
        (service['gameSocket'] as unknown as SocketMock).events.emit('score', 9, 'Dummy');
        expect(spy).toHaveBeenCalledWith(9, false);
    });

    it('should save id when unloading', () => {
        let closeHandler: EventListenerOrEventListenerObject = () => {};
        const spy = spyOn(window, 'addEventListener').and.callFake((event: string, handler: EventListenerOrEventListenerObject) => {
            closeHandler = handler;
        });
        (service['mainSocket'] as unknown as SocketMock).events.emit('id', ID, 23);
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
