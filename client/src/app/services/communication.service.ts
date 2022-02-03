import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Parameters } from '@app/classes/parameters';
import { BehaviorSubject, fromEventPattern, Observable, of } from 'rxjs';
import { catchError, shareReplay, startWith } from 'rxjs/operators';
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
export type Message = { message: string; playerId: number };
export type GameId = number;

@Injectable({
    providedIn: 'root',
})
export class CommunicationService {
    private readonly baseUrl: string = environment.serverUrl;
    private readonly roomsSocket: Socket = io(`${environment.socketUrl}/waitingRoom`);
    private readonly mainSocket: Socket = io(`${environment.socketUrl}/`);
    private gameSocket: Socket | undefined = undefined;

    readonly rooms: Observable<Room[]> = fromEventPattern<Room[]>(
        (handler) => {
            this.roomsSocket.on('broadcastRooms', handler);
        },
        (handler) => {
            this.roomsSocket.off('broadcastRooms', handler);
        },
    ).pipe(startWith(<Room[]>[]), shareReplay(1));
    readonly selectedRoom: BehaviorSubject<Room | undefined> = new BehaviorSubject(<Room | undefined>undefined);

    constructor(private readonly http: HttpClient) {
        this.listenRooms();
        this.mainSocket.on('join', (room, token) => this._joinRoom(room, token));
        this.mainSocket.on('error', (e) => this._error(e));
        (<unknown>window).communication = this; // TODO: wack
        (<unknown>window).io = io; // TODO: wack
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
        if (this.selectedRoom.value !== undefined && this.isRoomCreator()) {
            console.log(this.gameSocket);
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

    sendMessage(message: Message) {
        this.gameSocket?.emit('sendMessage');
    }

    receiveMessage(message: Message) {
        console.log(message.message);
    }

    private _joinGame(gameId: GameId, token: number) {
        this.gameSocket = io(`${environment.socketUrl}/games/${gameId}`, { auth: { token, bob: 'Lennon' } });
        this.gameSocket.on('receiveMessage', (message: Message) => {
            this.receiveMessage(message);
        });
    }

    start() {
        if (this.selectedRoom.value !== undefined && this.isRoomCreator()) {
            this.gameSocket?.emit('start');
        } else {
            throw new Error('Tried to start when not room creator');
        }
    }

    joinRoom(playerName: string, roomId: RoomId) {
        if (this.selectedRoom.value === undefined) {
            this.mainSocket.emit('joinRoom', roomId, playerName);
        }
    }

    private _joinRoom(room: string, token: number) {
        console.log(`Join room ${room} with token ${token}`);
        this.gameSocket = io(`${environment.socketUrl}/rooms/${room}`, { auth: { token, bob: 'Lennon' } });
        this.gameSocket.on('kick', () => this._leave());
        this.gameSocket.on('updateRoom', (room) => {
            this.selectedRoom.next(room);
        });
        this.gameSocket.on('gameStarted', (gameId: number) => {
            this._joinGame(gameId, token);
        });
        this.gameSocket.on('error', (e) => this._error(e));
    }

    createRoom(playerName: string, parameters: Parameters) {
        if (this.selectedRoom.value === undefined) {
            this.mainSocket.emit('createRoom', playerName, parameters);
        }
    }

    isRoomCreator(): boolean {
        return this.selectedRoom.value?.mainPlayer.id === this.mainSocket.id;
    }

    async listenRooms(): Promise<void> {
        return new Promise((resolve) => {
            if (this.roomsSocket.connected) return;
            this.roomsSocket.once('connect', () => resolve());
            this.roomsSocket.connect();
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
