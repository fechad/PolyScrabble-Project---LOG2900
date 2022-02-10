import { Parameters } from '@app/classes/parameters';
import { PlayerId, Room, RoomId } from '@app/classes/room';
import { EventEmitter } from 'events';
import { Service } from 'typedi';
import { RoomsService } from './rooms.service';

export const ROOMS_LIST_UPDATE_TIMEOUT = 200; // ms

@Service()
export class MainLobbyService {
    private nextRoomId = 0;

    constructor(private roomsService: RoomsService) {}

    connect(socket: EventEmitter, id: PlayerId) {
        console.log(`Connexion par l'utilisateur avec id : ${id}`);
        socket.emit('id', id);

        // message initial
        socket.on('join-room', (roomId: RoomId, playerName: string) => {
            const room = this.roomsService.rooms.find((r) => r.id === roomId);
            if (room === undefined) {
                socket.emit('error', 'Room is no longer available');
                return;
            }
            const error = room.addPlayer(id, playerName);
            if (error !== undefined) {
                socket.emit('error', error.message);
                return;
            }
            socket.emit('join', roomId, 1);
        });

        socket.on('create-room', (playerName: string, parameters: Parameters) => {
            const roomId = this.getNewRoomId();
            const room = new Room(roomId, id, playerName, parameters);
            socket.emit('join', roomId, 0);
            console.log(`Created room ${roomId} for player ${playerName}`);
            this.roomsService.rooms.push(room);
        });
    }

    getNewRoomId(): RoomId {
        const roomId = this.nextRoomId;
        this.nextRoomId += 1;
        return roomId;
    }
}
