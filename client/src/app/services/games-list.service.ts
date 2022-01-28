import { Injectable } from '@angular/core';
import { GameParameters } from '@app/classes/game-parameters';
import { io, Socket } from 'socket.io-client';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class GamesListService {
    socket: Socket;
    readonly url: string = 'http://localhost:4200';
    private gamesList: GameParameters[] = [];

    isSocketAlive() {
        return this.socket && this.socket.connected;
    }

    connect() {
        this.socket = io(environment.serverUrl, { transports: ['websocket'], upgrade: false });
    }

    disconnect() {
        this.socket.disconnect();
    }

    on<T>(event: string, action: (data: T) => void): void {
        this.socket.on(event, action);
    }

    send<T>(event: string, data?: T): void {
        if (data) {
            this.socket.emit(event, data);
        } else {
            this.socket.emit(event);
        }
    }

    constructor() {}

    addGame(game: GameParameters) {
        this.gamesList.push(game);
    }

    removeGame(id: number) {
        const game = this.gamesList.findIndex((g) => g.ID === id);
        this.gamesList.splice(game, 1);
    }

    getAllGames() {
        return this.gamesList;
    }
    // createNewGame(): unknown {
    //     this.socket.emit('create-game', { creategame: 1 });
    //     const observable = new Observable<string>((observer: Observer<string>) => {
    //         this.socket.on('new-game', (data: string) => {
    //             observer.next(data);
    //         });
    //         return () => {
    //             this.socket.disconnect();
    //         };
    //     });
    //     return observable;
    // }
}
