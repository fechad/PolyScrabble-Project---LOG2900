import { Room, RoomId } from '@app/classes/room';
import { Service } from 'typedi';

export const DELETION_DELAY = 5000; // ms
const NOT_FOUND = -1;

@Service()
export class RoomsService {
    readonly rooms: Room[] = [];
    private markedForDeletion: { [key: number]: NodeJS.Timer } = {};

    pendDeletion(roomId: RoomId, onDelete: () => void) {
        this.markedForDeletion[roomId] = setTimeout(() => {
            this.remove(roomId);
            delete this.markedForDeletion[roomId];
            onDelete();
        }, DELETION_DELAY);
    }

    remove(roomId: RoomId) {
        const idx = this.rooms.findIndex((room) => room.id === roomId);
        if (idx !== NOT_FOUND) {
            this.rooms.splice(idx, 1);
        }
    }

    unpendDeletion(roomId: RoomId) {
        const room = this.rooms.find((r) => r.id === roomId);
        if (room === undefined) return;
        if (!room.mainPlayer.connected || !room.getOtherPlayer()?.connected) return;
        if (this.markedForDeletion[roomId]) {
            clearTimeout(this.markedForDeletion[roomId]);
            delete this.markedForDeletion[roomId];
        }
    }
}
