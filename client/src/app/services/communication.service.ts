import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Message } from '@app/classes/message';
import { Parameters } from '@app/classes/parameters';
import { fromEventPattern, Observable, of } from 'rxjs';
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

@Injectable({
    providedIn: 'root',
})
export class CommunicationService {
    private readonly baseUrl: string = environment.serverUrl;
    private readonly roomsSocket: Socket = io(`${environment.socketUrl}/waitingRoom`);
    //private readonly mainSocket: Socket = io(`${environment.socketUrl}/`);
    //private gameSocket: Socket | undefined = undefined;

    readonly rooms: Observable<Room[]> = fromEventPattern<Room[]>((handler) => { this.roomsSocket.on('broadcastRooms', handler) }, (handler) => { this.roomsSocket.off('broadcastRooms', handler) }).pipe(
        startWith(<Room[]>[]),
        shareReplay(1),
      );
    

    constructor(private readonly http: HttpClient) {
        this.listenRooms();
        (<any>window)['communication'] = this; // TODO: wack
        (<any>window)['io'] = io; // TODO: wack
    }

    listenRooms(): Promise<void> {
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
