import { Parameters } from '@app/classes/parameters';
import { Room } from '@app/classes/room';
import { assert } from 'chai';
import * as sinon from 'sinon';
import { DELETION_DELAY, RoomsService } from './rooms.service';

/* eslint-disable @typescript-eslint/no-magic-numbers */

describe('Rooms service', () => {
    let roomsService: RoomsService;

    beforeEach(() => {
        roomsService = new RoomsService();
        roomsService.rooms.push(
            new Room(0, 'DummyId', 'Dummy', new Parameters()),
            new Room(2, 'DummyId2', 'Dummy2', new Parameters()),
            new Room(5, 'DummyId3', 'Dummy3', new Parameters()),
            new Room(6, 'DummyId4', 'Dummy4', new Parameters()),
            new Room(9, 'DummyId5', 'Dummy5', new Parameters()),
        );
        roomsService.rooms.forEach((room, i) => {
            room.addPlayer(`NotDummyId${i}`, 'NotDummy');
        });
    });
    it('should be created', () => {
        assert(roomsService !== undefined);
    });
    it('should delete after 5s', (done) => {
        const stub = sinon.stub();
        roomsService.pendDeletion(5, stub);
        assert(roomsService.rooms.some((room) => room.id === 5));
        setTimeout(() => {
            assert(!roomsService.rooms.some((room) => room.id === 5), 'remove');
            assert(stub.called, 'Called deletion callback');
            done();
        }, DELETION_DELAY + 100);
    });
    it('should cancel deletion before 5s', (done) => {
        const stub = sinon.stub();
        roomsService.pendDeletion(5, stub);
        assert(roomsService.rooms.some((room) => room.id === 5));
        roomsService.unpendDeletion(5);
        setTimeout(() => {
            assert(roomsService.rooms.some((room) => room.id === 5));
            assert(stub.notCalled);
            done();
        }, DELETION_DELAY + 100);
    });
    it('should not cancel deletion after 5s', (done) => {
        const stub = sinon.stub();
        roomsService.pendDeletion(5, stub);
        assert(roomsService.rooms.some((room) => room.id === 5));
        setTimeout(() => {
            roomsService.unpendDeletion(5);
            assert(!roomsService.rooms.some((room) => room.id === 5));
            assert(stub.called);
            done();
        }, DELETION_DELAY + 100);
    });
    it('should not cancel deletion when a player is not connected', (done) => {
        const stub = sinon.stub();
        roomsService.rooms.filter((room) => room.id === 5).map((room) => (room.mainPlayer.connected = false));
        roomsService.rooms
            .filter((room) => room.id === 6)
            .forEach((room) => {
                const otherPlayer = room.getOtherPlayer();
                if (otherPlayer !== undefined) otherPlayer.connected = false;
            });
        roomsService.pendDeletion(5, stub);
        roomsService.pendDeletion(6, stub);
        assert(roomsService.rooms.some((room) => room.id === 5));
        assert(roomsService.rooms.some((room) => room.id === 6));
        setTimeout(() => {
            assert(!roomsService.rooms.some((room) => room.id === 5));
            assert(!roomsService.rooms.some((room) => room.id === 6));
            assert(stub.calledTwice);
            done();
        }, DELETION_DELAY + 100);
    });
    it('should not error when unpending/removing an unknown room', () => {
        // eslint-disable-next-line dot-notation
        roomsService.rooms.filter((room) => room.id === 2).map((room) => (room['otherPlayer'] = undefined));
        roomsService.rooms.filter((room) => room.id === 5).map((room) => (room.mainPlayer.connected = false));
        roomsService.rooms
            .filter((room) => room.id === 6)
            .forEach((room) => {
                const otherPlayer = room.getOtherPlayer();
                if (otherPlayer !== undefined) otherPlayer.connected = false;
            });
        roomsService.unpendDeletion(20);
        roomsService.unpendDeletion(5);
        roomsService.unpendDeletion(6);
        roomsService.unpendDeletion(0);
        roomsService.unpendDeletion(2);
        roomsService.remove(999);
    });
});
