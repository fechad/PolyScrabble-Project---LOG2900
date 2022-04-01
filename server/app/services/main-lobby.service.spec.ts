import { Difficulty, GameType, Parameters } from '@app/classes/parameters';
import { Room } from '@app/classes/room';
import { assert, expect } from 'chai';
import { EventEmitter } from 'events';
import * as sinon from 'sinon';
import { Container } from 'typedi';
import { DictionnaryService } from './dictionnary.service';
import { MainLobbyService } from './main-lobby.service';
import { RoomsService } from './rooms.service';

describe('MainLobby service tests', () => {
    let service: MainLobbyService;
    let rooms: RoomsService;
    let playersSocket: EventEmitter[];
    let dictionnaryService: DictionnaryService;

    before(async () => {
        dictionnaryService = Container.get(DictionnaryService);
        await dictionnaryService.init();
    });

    beforeEach(() => {
        rooms = new RoomsService();
        service = new MainLobbyService(rooms, dictionnaryService);

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

    it('should create a room with virtual player', (done) => {
        const parameters = new Parameters();
        parameters.dictionnary = 0;
        parameters.difficulty = Difficulty.Beginner;
        parameters.gameType = GameType.Solo;
        const mathRandom = Math.random;
        Math.random = () => 0;
        playersSocket[0].emit('create-room', 'Dummy', parameters, 'Anna');
        const expectedRoom = new Room(0, 'DummyId', 'Dummy', parameters);
        expectedRoom.addPlayer('VP', 'Anna', true, 'assets/icon-images/1.png');
        Math.random = mathRandom;
        expectedRoom.start();
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
        playersSocket[1].emit('join-room', 0, 'NotDummy', 'a');

        expect(stub.callCount).to.equal(1);
        assert(stub.calledWith(0));

        const expectedRoom2 = new Room(0, 'DummyId', 'Dummy', parameters);
        expectedRoom2.addPlayer('NotDummyId', 'NotDummy', false, 'a');
        expect(rooms.rooms).to.deep.equal([expectedRoom2]);
        done();
    });

    it('should emit join if already joined room', (done) => {
        const room = new Room(0, 'DummyId', 'Dummy', new Parameters());
        room.addPlayer('NotDummyId', 'NotDummy', false, 'a');
        room.start();
        rooms.rooms.push(room);

        const stub = sinon.stub();
        playersSocket[0].on('join', stub);

        service.connect(playersSocket[0], 'DummyId');

        assert(stub.called);
        done();
    });

    it('should return an error if room does not exist', (done) => {
        const stub = sinon.stub();
        playersSocket[0].on('error', stub);
        playersSocket[0].emit('join-room', 0, 'NotDummy');
        assert(stub.calledWith('Room is no longer available'));
        done();
    });

    it('should return an error if player cannot join', (done) => {
        const stub = sinon.stub();
        const player3 = new EventEmitter();
        service.connect(player3, 'ReallyNotDummyId');
        player3.on('error', stub);

        const parameters = new Parameters();
        playersSocket[0].emit('create-room', 'Dummy', parameters);

        playersSocket[1].emit('join-room', 0, 'NotDummy');

        player3.emit('join-room', 0, 'ReallyNotDummy');
        assert(stub.called);
        done();
    });
});
