import { Injectable } from '@angular/core';
import { Message } from '@app/classes/message';
import { Parameters } from '@app/classes/parameters';
import { PlayerId, Room, RoomId } from '@app/classes/room';
import { BehaviorSubject } from 'rxjs';
import { take } from 'rxjs/operators';
import { io, Socket } from 'socket.io-client';
import { environment } from 'src/environments/environment';
import { GameContextService } from './game-context.service';

@Injectable({
    providedIn: 'root',
})
export class CommunicationService {
    readonly rooms: BehaviorSubject<Room[]> = new BehaviorSubject([] as Room[]);
    readonly selectedRoom: BehaviorSubject<Room | undefined> = new BehaviorSubject(undefined as Room | undefined);

    private myId: PlayerId | undefined;
    private readonly waitingRoomsSocket: Socket = io(`${environment.socketUrl}/waitingRoom`);
    private readonly mainSocket: Socket = io(`${environment.socketUrl}/`);
    private gameSocket: Socket | undefined = undefined;

    private msgCount: number = 0;

    constructor(public gameContextService: GameContextService) {
        this.listenRooms();
        this.mainSocket.on('join', (room, token) => this.joinRoomHandler(room, token));
        this.mainSocket.on('error', (e) => this.handleError(e));
        this.waitingRoomsSocket.on('broadcastRooms', (rooms) => this.rooms.next(rooms));
        this.mainSocket.on('id', (id: string) => {
            this.myId = id;
        });
    }

    isMainPlayer() {
        return this.selectedRoom.value?.mainPlayer.id === this.myId;
    }

    kick() {
        if (this.isMainPlayer()) {
            this.gameSocket?.emit('kick');
        } else {
            throw new Error('Tried to kick when not room creator');
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
            this.gameSocket?.emit('start');
        } else {
            throw new Error('Tried to start when not room creator');
        }
    }

    sendLocalMessage(message: string) {
        this.gameContextService.addMessage(message, true);
    }

    sendMessage(message: string) {
        this.gameSocket?.emit('message', message, this.msgCount++);
        this.tempMessages.next([...this.tempMessages.value, message]);
    }

    getId(): PlayerId | undefined {
        return this.myId;
    }

    switchTurn() {
        console.log('intered in switch');
        this.gameSocket?.emit('switch-turn', this.myId);
    }
    resetTimer() {
        this.gameSocket?.emit('reset-timer', this.myId);
    }

    async joinRoom(playerName: string, roomId: RoomId) {
        if (this.selectedRoom.value !== undefined) throw Error('Already in a room');

        this.mainSocket.emit('joinRoom', roomId, playerName);
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
        this.mainSocket.emit('createRoom', playerName, parameters);
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
        this.gameSocket?.close();
        this.gameSocket = undefined;
        this.selectedRoom.next(undefined);
    }

    private joinRoomHandler(room: string, token: number) {
        console.log(`Join room ${room} with token ${token}`);
        this.gameSocket = io(`${environment.socketUrl}/rooms/${room}`, { auth: { token } });
        this.gameSocket.on('kick', () => this.leaveGame());
        this.gameSocket.on('updateRoom', (room) => this.selectedRoom.next(room));
        this.gameSocket.on('error', (e) => this.handleError(e));
        this.gameSocket.on('message', (message: Message, msgCount: number, id: PlayerId) => {
            this.messages.next([...this.messages.value, message]);
            if (this.msgCount < msgCount && id === this.myId) {
                this.tempMessages.value.splice(0, msgCount - this.msgCount);
                this.msgCount = msgCount;
            }
        });
        this.gameSocket.on('id', (id: PlayerId) => {
            this.myId = id;
        });
    }
}
