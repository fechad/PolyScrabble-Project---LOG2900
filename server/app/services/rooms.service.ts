import { Game } from '@app/classes/game';
import { Room, RoomId } from '@app/classes/room';
import { Service } from 'typedi';

export const DELETION_DELAY = 5000; // ms
const UNDEFINED = -1;

@Service()
export class RoomsService {
    readonly rooms: Room[] = [];
    readonly games: Game[] = [];

    remove(roomId: RoomId) {
        const roomIdx = this.rooms.findIndex((room) => room.id === roomId);
        if (roomIdx !== UNDEFINED) {
            this.rooms.splice(roomIdx, 1);
        }
        const gameIdx = this.games.findIndex((game) => game.id === roomId);
        if (gameIdx !== UNDEFINED) {
            this.games.splice(gameIdx, 1);
        }
    }
}
