import { Parameters } from '@app/classes/parameters';
import { Room } from '@app/classes/room';
import { assert } from 'chai';
import { RoomsService } from './rooms.service';

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
            room.addPlayer(`NotDummyId${i}`, 'NotDummy', false);
        });
    });
    it('should be created', () => {
        assert(roomsService !== undefined);
    });
    it('should remove a room from the list of rooms', () => {
        const size = roomsService.rooms.length;
        roomsService.remove(0);
        assert(roomsService.rooms.length === size - 1);
    });
    it('should not remove a room from the list of rooms if it doesnt exist', () => {
        const size = roomsService.rooms.length;
        roomsService.remove(1);
        assert(roomsService.rooms.length === size);
    });
});
