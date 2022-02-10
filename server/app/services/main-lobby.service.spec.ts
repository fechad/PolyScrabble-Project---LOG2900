import { Parameters } from '@app/classes/parameters';
import { Room } from '@app/classes/room';
import { assert, expect } from 'chai';
import { EventEmitter } from 'events';
import * as sinon from 'sinon';
import { MainLobbyService } from './main-lobby.service';
import { RoomsService } from './rooms.service';

describe('MainLobby service tests', () => {
    let service: MainLobbyService;
    let rooms: RoomsService;
    let playersSocket: EventEmitter[];

    beforeEach(async () => {
        rooms = new RoomsService();
        service = new MainLobbyService(rooms);

        const player1 = new EventEmitter();
        service.connect(player1, 'DummyId');
        const player2 = new EventEmitter();
        service.connect(player2, 'NotDummyId');
        playersSocket = [player1, player2];
    });

    afterEach(() => {
        sinon.restore();
    });

    it('should create a room', (done) => {
        const parameters = new Parameters();
        playersSocket[0].emit('create-room', 'Dummy', parameters);
        const expectedRoom = new Room(0, 'DummyId', 'Dummy', parameters);
        expect(rooms.rooms).to.deep.equal([expectedRoom]);
        done();
    });

    it('should join a room', (done) => {
        const parameters = new Parameters();
        playersSocket[0].emit('create-room', 'Dummy', parameters);

        const expectedRoom = new Room(0, 'DummyId', 'Dummy', parameters);
        expect(rooms.rooms).to.deep.equal([expectedRoom]);

        const stub = sinon.stub();
        playersSocket[1].on('join', stub);
        playersSocket[1].emit('join-room', 0, 'NotDummy');

        expect(stub.callCount).to.equal(1);
        assert(stub.calledWith(0));

        const expectedRoom2 = new Room(0, 'DummyId', 'Dummy', parameters);
        expectedRoom2.addPlayer('NotDummyId', 'NotDummy');
        expect(rooms.rooms).to.deep.equal([expectedRoom2]);
        done();
    });

    it('should return an error if room does not exist', (done) => {
        const stub = sinon.stub();
        playersSocket[0].on('error', stub);
        playersSocket[0].emit('join-room', 0, 'NotDummy');
        assert(stub.calledWith('Room is no longer available'));
        done();
    });
});
