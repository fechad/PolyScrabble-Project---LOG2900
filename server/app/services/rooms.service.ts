import { Room, RoomId } from '@app/classes/room';
import { Service } from 'typedi';

export const DELETION_DELAY = 5000; // ms
const NOT_FOUND = -1;

@Service()
export class RoomsService {
    readonly rooms: Room[] = [];

    remove(roomId: RoomId) {
        const idx = this.rooms.findIndex((room) => room.id === roomId);
        if (idx !== NOT_FOUND) {
            this.rooms.splice(idx, 1);
        }
    }
}
