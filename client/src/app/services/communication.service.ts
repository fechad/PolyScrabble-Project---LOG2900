import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Message } from '@app/classes/message';
import { Parameters } from '@app/classes/parameters';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map, take } from 'rxjs/operators';
import { io, Socket } from 'socket.io-client';
import { environment } from 'src/environments/environment';

export type RoomId = number;
export type PlayerId = string;
export type Player = { name: string; id: PlayerId };

export class Room {
    readonly parameters: Parameters;
    readonly name: string;
    readonly id: RoomId;
    readonly mainPlayer: Player;
    readonly otherPlayer: Player | undefined;
}

@Injectable({
    providedIn: 'root',
})
export class CommunicationService {
    private readonly baseUrl: string = environment.serverUrl;
    private readonly roomsSocket: Socket = io(`${environment.socketUrl}/waitingRoom`);
    private readonly mainSocket: Socket = io(`${environment.socketUrl}/`);
    private gameSocket: Socket | undefined = undefined;

    readonly rooms: BehaviorSubject<Room[]> = new BehaviorSubject(<Room[]>[]);
    readonly selectedRoom: BehaviorSubject<Room | undefined> = new BehaviorSubject(<Room | undefined>undefined);
    readonly isCreator: BehaviorSubject<boolean | undefined> = new BehaviorSubject(<boolean | undefined>undefined);

    constructor(private readonly http: HttpClient) {
        this.listenRooms();
        this.mainSocket.on('join', (room, token) => this._joinRoom(room, token));
        this.mainSocket.on('error', (e) => this._error(e));
        this.roomsSocket.on('broadcastRooms', (rooms) => this.rooms.next(rooms));
        (<any>window)['communication'] = this; // TODO: wack
        (<any>window)['io'] = io; // TODO: wack
    }

    private _error(e: string | Error) {
        console.log(e);
    }

    private _leave() {
        this.gameSocket?.close();
        this.gameSocket = undefined;
        this.selectedRoom.next(undefined);
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
            this._leave();
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

    private _joinRoom(room: string, token: number) {
        console.log(`Join room ${room} with token ${token}`);
        this.gameSocket = io(`${environment.socketUrl}/rooms/${room}`, { auth: { token } });
        this.gameSocket.on('kick', () => this._leave());
        this.gameSocket.on('updateRoom', (room) => this.selectedRoom.next(room));
        this.gameSocket.on('error', (e) => this._error(e));

        this.isCreator.next(this.isCreator.value === true);
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
        await this.selectedRoom.pipe(take(2), map(x => console.log(x))).toPromise()
    }

    async createRoom(playerName: string, parameters: Parameters) {
        if (this.selectedRoom.value !== undefined) throw Error('Already in a room');
        
        this.mainSocket.emit('createRoom', playerName, parameters);
        await this.waitForRoom(true);
    }

    listenRooms(): Promise<void> {
        return new Promise((resolve) => {
            if (!this.roomsSocket.connected) {
                this.roomsSocket.once('connect', () => resolve());
                this.roomsSocket.connect();
            } else {
                resolve();
            }
        });
    }

    unlistenRooms() {
        if (this.roomsSocket.connected) this.roomsSocket.disconnect();
    }

    basicGet(): Observable<Message> {
        return this.http.get<Message>(`${this.baseUrl}/example`).pipe(catchError(this.handleError<Message>('basicGet')));
    }

    basicPost(message: Message): Observable<void> {
        return this.http.post<void>(`${this.baseUrl}/example/send`, message).pipe(catchError(this.handleError<void>('basicPost')));
    }

    private handleError<T>(request: string, result?: T): (error: Error) => Observable<T> {
        return () => of(result as T);
    }
}
