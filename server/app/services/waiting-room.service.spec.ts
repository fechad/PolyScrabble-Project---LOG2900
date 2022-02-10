import { Parameters } from '@app/classes/parameters';
import { Room } from '@app/classes/room';
import { assert, expect } from 'chai';
import { EventEmitter } from 'events';
import * as sinon from 'sinon';
import { RoomsService } from './rooms.service';
import { ROOMS_LIST_UPDATE_TIMEOUT, WaitingRoomService } from './waiting-room.service';

const RESPONSE_DELAY = ROOMS_LIST_UPDATE_TIMEOUT + 100; // ms

describe('WaitingRoom service tests', () => {
    let service: WaitingRoomService;
    let rooms: RoomsService;

    beforeEach(async () => {
        rooms = new RoomsService();
        service = new WaitingRoomService(rooms);
    });

    afterEach(() => {
        sinon.restore();
    });

    it('should broadcast available rooms on connect', (done) => {
        const stub = sinon.stub();
        service.on('broadcast-rooms', stub);
        const localEvents = new EventEmitter();
        const eventStub = sinon.stub(localEvents, 'emit');
        service.connect(localEvents);
        expect(stub.callCount).to.equal(0);
        expect(eventStub.callCount).to.equal(1);
        assert(eventStub.alwaysCalledWith('broadcast-rooms', []));
        done();
    });

    it('should broadcast available rooms on connect even if there is already some rooms', (done) => {
        const stub = sinon.stub();
        service.on('broadcast-rooms', stub);

        const parameters = new Parameters();
        const room = new Room(0, 'DummyId', 'Dummy', parameters);
        rooms.rooms.push(room);
        expect(rooms.rooms.length).to.equal(1);

        const localEvents = new EventEmitter();
        const eventStub = sinon.stub(localEvents, 'emit');
        service.connect(localEvents);
        
        expect(stub.callCount).to.equal(0);
        expect(eventStub.callCount).to.equal(1);
        assert(eventStub.alwaysCalledWith('broadcast-rooms', [room]));
        done();
    });

    it('should broadcast available rooms on connect only to one client', (done) => {
        const stub = sinon.stub();
        service.on('broadcast-rooms', stub);
        const localEvents = new EventEmitter();
        const eventStub = sinon.stub(localEvents, 'emit');
        service.connect(localEvents);
        const localEvents2 = new EventEmitter();
        const eventStub2 = sinon.stub(localEvents2, 'emit');
        service.connect(localEvents2);
        
        expect(stub.callCount).to.equal(0);
        expect(eventStub.callCount).to.equal(1);
        assert(eventStub.alwaysCalledWith('broadcast-rooms', []));
        expect(eventStub2.callCount).to.equal(1);
        assert(eventStub2.alwaysCalledWith('broadcast-rooms', []));
        done();
    });

    it('should periodically broadcast rooms', (done) => {
        const stub = sinon.stub();
        service.on('broadcast-rooms', stub);
        const localEvents = new EventEmitter();
        const eventStub = sinon.stub(localEvents, 'emit');
        service.connect(localEvents);
        const localEvents2 = new EventEmitter();
        const eventStub2 = sinon.stub(localEvents2, 'emit');
        service.connect(localEvents2);

        const parameters = new Parameters();
        const room = new Room(0, 'DummyId', 'Dummy', parameters);
        rooms.rooms.push(room);
        expect(rooms.rooms.length).to.equal(1);

        setTimeout(() => {
            expect(stub.callCount).to.equal(1);
            assert(stub.alwaysCalledWith([room]))
            expect(eventStub.callCount).to.equal(1);
            assert(eventStub.alwaysCalledWith('broadcast-rooms', []));
            expect(eventStub2.callCount).to.equal(1);
            assert(eventStub2.alwaysCalledWith('broadcast-rooms', []));
            done();
        }, RESPONSE_DELAY * 3);
    });

    it('should not display full rooms', (done) => {
        const stub = sinon.stub();
        service.on('broadcast-rooms', stub);
        const localEvents = new EventEmitter();
        const eventStub = sinon.stub(localEvents, 'emit');
        service.connect(localEvents);
        const localEvents2 = new EventEmitter();
        const eventStub2 = sinon.stub(localEvents2, 'emit');
        service.connect(localEvents2);

        const parameters = new Parameters();
        const room = new Room(1, 'DummyId', 'Dummy', parameters);
        expect(room.addPlayer('NotDummyId', 'NotDummy')).to.be.undefined;
        expect(room.hasOtherPlayer()).to.equal(true);
        rooms.rooms.push(room);
        expect(rooms.rooms.length).to.equal(1);

        setTimeout(() => {
            expect(stub.callCount).to.equal(0);
            expect(eventStub.callCount).to.equal(1);
            assert(eventStub.alwaysCalledWith('broadcast-rooms', []));
            expect(eventStub2.callCount).to.equal(1);
            assert(eventStub2.alwaysCalledWith('broadcast-rooms', []));
            done();
        }, RESPONSE_DELAY);
    });
});
