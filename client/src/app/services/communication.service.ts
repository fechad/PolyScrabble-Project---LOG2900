import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Dictionnary } from '@app/classes/dictionnary';
import { Message } from '@app/classes/message';
import { Parameters } from '@app/classes/parameters';
import { PlayerId, Room, RoomId } from '@app/classes/room';
import { BehaviorSubject } from 'rxjs';
import { take } from 'rxjs/operators';
import { io, Socket } from 'socket.io-client';
import { environment } from 'src/environments/environment';
import { Letter } from './Alphabet';
import { Board, GameContextService } from './game-context.service';

export type Player = { name: string; id: PlayerId; score: number };

@Injectable({
    providedIn: 'root',
})
export class CommunicationService {
    readonly rooms: BehaviorSubject<Room[]> = new BehaviorSubject([] as Room[]);
    readonly selectedRoom: BehaviorSubject<Room | undefined> = new BehaviorSubject(undefined as Room | undefined);
    readonly dictionnaries: Promise<Dictionnary[]>;

    private myId: PlayerId | undefined;
    private readonly waitingRoomsSocket: Socket = io(`${environment.socketUrl}/waitingRoom`);
    private readonly mainSocket: Socket = io(`${environment.socketUrl}/`);
    private roomSocket: Socket | undefined = undefined;
    private gameSocket: Socket | undefined = undefined;

    private loserId: string | undefined = undefined;

    constructor(public gameContextService: GameContextService, httpClient: HttpClient, private router: Router) {
        this.listenRooms();
        this.mainSocket.on('join', (room, token) => this.joinRoomHandler(room, token));
        this.mainSocket.on('error', (e) => this.handleError(e));
        this.waitingRoomsSocket.on('broadcast-rooms', (rooms) => this.rooms.next(rooms));
        this.mainSocket.on('id', (id: string) => {
            this.myId = id;
        });
        this.dictionnaries = httpClient.get<Dictionnary[]>(`${environment.serverUrl}/dictionnaries`).toPromise();
    }

    isMainPlayer() {
        return this.selectedRoom.value?.mainPlayer.id === this.myId;
    }

    kick() {
        if (this.isMainPlayer()) {
            this.roomSocket?.emit('kick');
        } else {
            throw new Error('Tried to kick when not room creator');
        }
    }

    kickLeave() {
        if (this.selectedRoom.value !== undefined && this.isMainPlayer()) {
            this.gameSocket?.emit('kick');
            this.leaveGame();
        } else {
            throw new Error('Tried to leave when not in room');
        }
    }

    leave() {
        if (this.selectedRoom.value !== undefined) {
            this.leaveGame();
        } else {
            throw new Error('Tried to leave when not in room');
        }
    }

    start() {
        if (this.isMainPlayer()) {
            this.roomSocket?.emit('start');
        } else {
            throw new Error('Tried to start when not room creator');
        }
    }

    sendLocalMessage(message: string) {
        this.gameContextService.addMessage(message, true);
    }

    sendMessage(message: string) {
        this.gameSocket?.emit('message', { emitter: this.getId(), text: message });
        // this.msgCount++;
        this.gameContextService.addMessage(message, false);
    }

    getId(): PlayerId | undefined {
        return this.myId;
    }

    switchTurn() {
        this.gameSocket?.emit('switch-turn', this.myId);
    }

    resetTimer() {
        this.gameSocket?.emit('reset-timer', this.myId);
    }

    placer(letters: string, position: string) {
        this.gameSocket?.emit('place-letters', letters, position, this.myId);
    }
    echanger(letters: string) {
        this.gameSocket?.emit('change-letters', letters, this.myId);
    }
    getLoserId(): string | undefined {
        return this.loserId;
    }

    confirmForfeit() {
        this.loserId = this.myId;
        this.gameSocket?.emit('confirm-forfeit', this.loserId);
    }

    async joinRoom(playerName: string, roomId: RoomId) {
        if (this.selectedRoom.value !== undefined) throw Error('Already in a room');

        this.mainSocket.emit('join-room', roomId, playerName);
        await this.waitForRoom();
    }

    async waitForRoom() {
        await new Promise((resolve, reject) => {
            let ended = false;
            this.mainSocket.once('join', () => {
                if (!ended) {
                    ended = true;
                    resolve(null);
                }
            });
            this.mainSocket.once('error', (e) => {
                if (!ended) {
                    ended = true;
                    reject(e);
                }
            });
        });
        await this.selectedRoom.pipe(take(2)).toPromise();
    }

    async createRoom(playerName: string, parameters: Parameters) {
        if (this.selectedRoom.value !== undefined) throw Error('Already in a room');
        this.mainSocket.emit('create-room', playerName, parameters);
        await this.waitForRoom();
    }

    async listenRooms() {
        await new Promise((resolve) => {
            if (!this.waitingRoomsSocket.connected) {
                this.waitingRoomsSocket.once('connect', () => resolve(null));
                this.waitingRoomsSocket.connect();
            } else {
                resolve(null);
            }
        });
    }

    unlistenRooms() {
        if (this.waitingRoomsSocket.connected) this.waitingRoomsSocket.disconnect();
    }

    private handleError(e: string | Error) {
        console.error(e);
    }

    private leaveGame() {
        this.roomSocket?.close();
        this.roomSocket = undefined;
        this.selectedRoom.next(undefined);
    }

    private joinRoomHandler(room: string, token: number) {
        this.roomSocket = io(`${environment.socketUrl}/rooms/${room}`, { auth: { token } });
        this.roomSocket.on('kick', () => {
            this.leaveGame();
            setTimeout("alert('Vous avez été rejeté.');", 1);
        });
        this.roomSocket.on('update-room', (room) => this.selectedRoom.next(room));
        this.roomSocket.on('error', (e) => this.handleError(e));
        this.roomSocket.on('id', (id: PlayerId) => {
            this.myId = id;
        });

        this.roomSocket.on('join-game', (gameId) => {
            this.joinGameHandler(gameId, token);
        });
    }

    private joinGameHandler(gameId: string, token: number) {
        this.gameSocket = io(`${environment.socketUrl}/games/${gameId}`, { auth: { token } });

        this.gameSocket.on('forfeit', (idLoser) => {
            if (idLoser !== this.myId) {
                this.router.navigate(['/home']);
                setTimeout("alert('Votre adversaire à abandonner, vous avez gagné! 👑👑👑');", 1);
            }
        });

        this.gameSocket.on('turn', (id: PlayerId) => {
            this.gameContextService.setMyTurn(id === this.myId);
        });
        this.gameSocket.on('message', (message: Message, msgCount: number, id: PlayerId) => {
            this.gameContextService.receiveMessages(message, msgCount, id === this.myId);
        });
        this.gameSocket.on('turn-error', (error: string) => {
            this.sendLocalMessage(error);
        });
        this.gameSocket.on('rack', (rack: Letter[], id: PlayerId) => {
            if (id === this.myId) this.gameContextService.updateRack(rack);
        });
        this.gameSocket.on('players', (players: Player[]) => {
            for (const player of players) {
                this.gameContextService.setInfos(player, player.id === this.myId);
            }
        });
        this.gameSocket.on('board', (board: Board) => {
            this.gameContextService.setBoard(board);
        });
        this.gameSocket.on('score', (score: Number, player: PlayerId) => {});
    }
}
