import { Game } from '@app/classes/game';
import { Difficulty, Parameters } from '@app/classes/parameters';
import { PlayerId, Room, RoomId, State } from '@app/classes/room';
import { VirtualPlayer } from '@app/classes/virtual-player';
import { EventEmitter } from 'events';
import { Service } from 'typedi';
import { DictionnaryTrieService } from './dictionnary-trie.service';
import { DictionnaryService } from './dictionnary.service';
import { RoomsService } from './rooms.service';

export const ROOMS_LIST_UPDATE_TIMEOUT = 200; // ms

@Service()
export class MainLobbyService {
    private nextRoomId = 0;

    constructor(private roomsService: RoomsService, private dictionnaryService: DictionnaryService, private trie: DictionnaryTrieService) {}

    connect(socket: EventEmitter, id: PlayerId) {
        const alreadyJoinedRoom = this.roomsService.rooms
            .filter((r) => r.getState() === State.Started)
            .find((r) => r.mainPlayer.id === id || r.getOtherPlayer()?.id === id);
        if (alreadyJoinedRoom) {
            socket.emit('join', alreadyJoinedRoom.id);
        }

        // message initial
        socket.on('join-room', (roomId: RoomId, playerName: string) => {
            const room = this.roomsService.rooms.find((r) => r.id === roomId);
            if (room === undefined) {
                socket.emit('error', 'Room is no longer available');
                return;
            }
            const error = room.addPlayer(id, playerName, false);
            if (error !== undefined) {
                socket.emit('error', error.message);
                return;
            }
            socket.emit('join', roomId);
        });

        socket.on('create-room', (playerName: string, parameters: Parameters, virtualPlayer?: string) => {
            const roomId = this.getNewRoomId();
            const room = new Room(roomId, id, playerName, parameters);
            socket.emit('join', roomId);
            console.log(`Created room ${roomId} for player ${playerName}`);
            this.roomsService.rooms.push(room);
            if (virtualPlayer) {
                room.addPlayer('VP', virtualPlayer, true);
                room.start();
                const game = new Game(room, this.dictionnaryService);
                this.roomsService.games.push(game);
                const isBeginner = parameters.difficulty !== Difficulty.Expert;
                const vP = new VirtualPlayer(isBeginner, game, this.dictionnaryService, this.trie);
                vP.waitForTurn();
            }
        });
    }

    getNewRoomId(): RoomId {
        const roomId = this.nextRoomId;
        this.nextRoomId += 1;
        return roomId;
    }
}
