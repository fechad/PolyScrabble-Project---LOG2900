import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Parameters } from '@app/classes/parameters';
import { CommunicationService, IoWrapper } from '@app/services/communication.service';
import EventEmitter from 'events';

class SocketMock {
    readonly events: EventEmitter = new EventEmitter();
    readonly emitSpy: jasmine.Spy<any>;
    connected: boolean = true;

    emit(event: string, ...params: any[]) {
        console.log('ANRSATERNSATERNST');
    }
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
            providers: [{ provide: Router, useValue: {} }, { provide: IoWrapper, useClass: IoWrapperMock }],
        });
        service = TestBed.inject(CommunicationService);
        httpMock = TestBed.inject(HttpTestingController);
        const dictionnaries = httpMock.expectOne('http://localhost:3000/api/dictionnaries');
        dictionnaries.flush([]);
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

    const createRoom = () => {
        service.selectedRoom.next({
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
        createRoom();
        expect(service.isMainPlayer()).toBe(false);
        (service['mainSocket'] as unknown as SocketMock).events.emit('id', ID, 23);
        expect(service.isMainPlayer()).toBe(true);
        otherPlayer();
        expect(service.isMainPlayer()).toBe(false);
    });

    it('should kick', () => {
        (service['mainSocket'] as unknown as SocketMock).events.emit('id', ID, 23);
        createRoom();
        (service['mainSocket'] as unknown as SocketMock).events.emit('join', 5);
        service.kick();
        expect((service['roomSocket'] as unknown as SocketMock).emitSpy).toHaveBeenCalledWith('kick');
        otherPlayer();
        expect(() => service.kick()).toThrow();
    });

    it('should be kicked', () => {
        (service['mainSocket'] as unknown as SocketMock).events.emit('id', ID, 23);
        createRoom();
        (service['mainSocket'] as unknown as SocketMock).events.emit('join', 5);
        (service['roomSocket'] as unknown as SocketMock).events.emit('kick');
        expect(service['roomSocket']).toBeUndefined();
        expect(service.selectedRoom.value).toBeUndefined();
    });

    it('should kick & leave when main player', () => {
        (service['mainSocket'] as unknown as SocketMock).events.emit('id', ID, 23);
        createRoom();
        (service['mainSocket'] as unknown as SocketMock).events.emit('join', 5);
        (service['roomSocket'] as unknown as SocketMock).events.emit('join-game', 5);
        const spy = (service['gameSocket'] as unknown as SocketMock).emitSpy;
        service.kickLeave();
        expect(spy).toHaveBeenCalledWith('kick');
        expect(service['roomSocket']).toBeUndefined();
        expect(service.selectedRoom.value).toBeUndefined();
    });

    it('should not kick & leave when other player', () => {
        (service['mainSocket'] as unknown as SocketMock).events.emit('id', ID, 23);
        createRoom();
        (service['mainSocket'] as unknown as SocketMock).events.emit('join', 5);
        otherPlayer();
        expect(() => service.kickLeave()).toThrow();
    });

    it('should leave when in room', () => {
        (service['mainSocket'] as unknown as SocketMock).events.emit('id', ID, 23);
        createRoom();
        (service['mainSocket'] as unknown as SocketMock).events.emit('join', 5);
        service.leave();
        expect(service['roomSocket']).toBeUndefined();
        expect(service.selectedRoom.value).toBeUndefined();
    });

    it('should not leave when not in room', () => {
        (service['mainSocket'] as unknown as SocketMock).events.emit('id', ID, 23);
        expect(() => service.leave()).toThrow();
    });

    it('should start', () => {
        (service['mainSocket'] as unknown as SocketMock).events.emit('id', ID, 23);
        createRoom();
        (service['mainSocket'] as unknown as SocketMock).events.emit('join', 5);
        service.start();
        expect((service['roomSocket'] as unknown as SocketMock).emitSpy).toHaveBeenCalledWith('start');
        otherPlayer();
        expect(() => service.start()).toThrow();
    });

    it('should forfeit', () => {
        (service['mainSocket'] as unknown as SocketMock).events.emit('id', ID, 23);
        createRoom();
        (service['mainSocket'] as unknown as SocketMock).events.emit('join', 5);
        (service['roomSocket'] as unknown as SocketMock).events.emit('join-game', 9);
        service.confirmForfeit();
        expect((service['gameSocket'] as unknown as SocketMock).emitSpy).toHaveBeenCalledWith('confirm-forfeit');
        expect(service.getLoserId()).toBe(ID);
    });

    it('should join room', async () => {
        (service['mainSocket'] as unknown as SocketMock).events.emit('id', ID, 23);
        const promise = service.joinRoom('aldabob', 0);
        (service['mainSocket'] as unknown as SocketMock).events.emit('join', 5);
        expect((service['mainSocket'] as unknown as SocketMock).emitSpy).toHaveBeenCalledWith('join-room', 0, 'aldabob');
        createRoom();
        setTimeout(() => createRoom(), 0);
        await promise;
    });

    /*it('should not join room when there is an error', async () => {
        (service['mainSocket'] as unknown as SocketMock).events.emit('id', ID, 23);
        await expectAsync(async () => { await service.joinRoom('aldabob', 0); }).toBeRejected();
        (service['mainSocket'] as unknown as SocketMock).events.emit('error', new Error('big bad error'));
    });*/

    it('should create room', async () => {
        (service['mainSocket'] as unknown as SocketMock).events.emit('id', ID, 23);
        const promise = service.createRoom('aldabob', new Parameters());
        (service['mainSocket'] as unknown as SocketMock).events.emit('join', 5);
        expect((service['mainSocket'] as unknown as SocketMock).emitSpy).toHaveBeenCalledWith('create-room', 'aldabob', new Parameters());
        createRoom();
        setTimeout(() => createRoom(), 0);
        await promise;
    });

    /*it('should not join room when there is an error', async () => {
        (service['mainSocket'] as unknown as SocketMock).events.emit('id', ID, 23);
        await expectAsync(async () => { await service.create('aldabob', new Parameters()); }).toBeRejected();
        (service['mainSocket'] as unknown as SocketMock).events.emit('error', new Error('big bad error'));
    });*/

    it('should start/stop listening to broadcasts', async () => {
        (service['mainSocket'] as unknown as SocketMock).events.emit('id', ID, 23);
        service.unlistenRooms();
        const promise = service.listenRooms();
        console.log('BONOBO');
        (service['waitingRoomsSocket'] as unknown as SocketMock).events.emit('connect');
        await promise;
        await service.listenRooms();
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
