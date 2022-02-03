import { Injectable } from '@angular/core';
import { Parameters } from '@app/classes/parameters';
import { Room, RoomId } from '@app/classes/room';
import { BehaviorSubject } from 'rxjs';
import { take } from 'rxjs/operators';
import { io, Socket } from 'socket.io-client';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class CommunicationService {
    readonly rooms: BehaviorSubject<Room[]> = new BehaviorSubject([] as Room[]);
    readonly selectedRoom: BehaviorSubject<Room | undefined> = new BehaviorSubject(undefined as Room | undefined);
    readonly isCreator: BehaviorSubject<boolean | undefined> = new BehaviorSubject(undefined as boolean | undefined);

    private readonly roomsSocket: Socket = io(`${environment.socketUrl}/waitingRoom`);
    private readonly mainSocket: Socket = io(`${environment.socketUrl}/`);
    private gameSocket: Socket | undefined = undefined;

    constructor() {
        this.listenRooms();
        this.mainSocket.on('join', (room, token) => this.joinHandler(room, token));
        this.mainSocket.on('error', (e) => this.handleError(e));
        this.roomsSocket.on('broadcastRooms', (rooms) => this.rooms.next(rooms));
        (window as any)['communication'] = this; // TODO: wack
        (window as any)['io'] = io; // TODO: wack
    }

    kick() {
        if (this.selectedRoom.value !== undefined && this.isCreator.value) {
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
        if (this.selectedRoom.value !== undefined && this.isCreator.value) {
            this.gameSocket?.emit('start');
        } else {
            throw new Error('Tried to start when not room creator');
        }
    }

    async joinRoom(playerName: string, roomId: RoomId) {
        if (this.selectedRoom.value !== undefined) throw Error('Already in a room');

        this.mainSocket.emit('joinRoom', roomId, playerName);
        await this.waitForRoom(false);
    }

    async waitForRoom(creator: boolean) {
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
        this.isCreator.next(creator);
        await this.selectedRoom.pipe(take(2)).toPromise();
    }

    async createRoom(playerName: string, parameters: Parameters) {
        if (this.selectedRoom.value !== undefined) throw Error('Already in a room');

        this.mainSocket.emit('createRoom', playerName, parameters);
        await this.waitForRoom(true);
    }

    async listenRooms() {
        await new Promise((resolve) => {
            if (!this.roomsSocket.connected) {
                this.roomsSocket.once('connect', () => resolve(null));
                this.roomsSocket.connect();
            } else {
                resolve(null);
            }
        });
    }

    unlistenRooms() {
        if (this.roomsSocket.connected) this.roomsSocket.disconnect();
    }

    private handleError(e: string | Error) {
        console.error(e);
    }

    private leaveGame() {
        this.gameSocket?.close();
        this.gameSocket = undefined;
        this.selectedRoom.next(undefined);
    }

    private joinHandler(room: string, token: number) {
        console.log(`Join room ${room} with token ${token}`);
        this.gameSocket = io(`${environment.socketUrl}/rooms/${room}`, { auth: { token } });
        this.gameSocket.on('kick', () => this.leaveGame());
        this.gameSocket.on('updateRoom', (room) => this.selectedRoom.next(room));
        this.gameSocket.on('error', (e) => this.handleError(e));

        this.isCreator.next(this.isCreator.value === true);
    }
}
