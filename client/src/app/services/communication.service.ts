import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Parameters } from '@app/classes/parameters';
import { PlayerId, Room, RoomId } from '@app/classes/room';
import { IoWrapper } from '@app/classes/socket-wrapper';
import { BehaviorSubject } from 'rxjs';
import { take } from 'rxjs/operators';
import { Socket } from 'socket.io-client';
import { environment } from 'src/environments/environment';
import swal from 'sweetalert2';
import { AuthService } from './auth.service';
import { GameContextService } from './game-context.service';

type Token = number;
type SaveScoreBody = { id: string | undefined; token: number; room: number | undefined };
type ConnectBody = { id: string | undefined; token: number };
export type DialogDictionary = { id: number; name: string; description: string; words: string[] };

@Injectable({
    providedIn: 'root',
})
export class CommunicationService {
    readonly rooms: BehaviorSubject<Room[]>;
    readonly selectedRoom: BehaviorSubject<Room | undefined>;
    readonly dictionnaries: Promise<DialogDictionary[]>;
    private myId: BehaviorSubject<PlayerId | undefined>;
    private token: Token;

    private readonly waitingRoomsSocket: Socket;
    private readonly mainSocket: Socket;
    private roomSocket: Socket | undefined;

    constructor(public gameContextService: GameContextService, private httpClient: HttpClient, private router: Router, private io: IoWrapper) {
        this.rooms = new BehaviorSubject([] as Room[]);
        this.selectedRoom = new BehaviorSubject(undefined as Room | undefined);
        this.myId = new BehaviorSubject(undefined as PlayerId | undefined);
        this.roomSocket = undefined;
        this.waitingRoomsSocket = this.io.io(`${environment.socketUrl}/waitingRoom`);
        const auth = AuthService.getAuth();
        this.mainSocket = this.io.io(`${environment.socketUrl}/`, { auth });

        this.listenRooms();
        this.mainSocket.on('join', (room) => this.joinRoomHandler(room));
        this.mainSocket.on('error', (error) => this.handleError(error));
        this.waitingRoomsSocket.on('broadcast-rooms', (rooms) => this.rooms.next(rooms));
        this.dictionnaries = httpClient.get<DialogDictionary[]>(`${environment.serverUrl}/dictionnaries`).toPromise();

        this.mainSocket.on('id', (id: PlayerId, token: Token) => {
            this.myId.next(id);
            this.token = token;
            this.gameContextService.myId = id;

            addEventListener('beforeunload', () => AuthService.saveAuth(id), { capture: true });
        });
    }

    async saveScore() {
        try {
            const body: SaveScoreBody = { id: this.myId.value, token: this.token, room: this.selectedRoom.value?.id };
            await this.httpClient.post(`${environment.serverUrl}/high-scores`, body).toPromise();
        } catch (e) {
            /* Discard errors */
        }
    }

    isMainPlayer(): boolean {
        return !!this.selectedRoom.value && this.selectedRoom.value.mainPlayer.id === this.myId.value;
    }

    isServerDown(): boolean {
        if ((!this.mainSocket?.connected && !this.roomSocket?.connected) || !this.mainSocket?.connected) {
            this.serverDownAlert();
            return true;
        }
        return false;
    }

    kick() {
        if (this.isServerDown()) return;
        if (this.isMainPlayer()) {
            this.roomSocket?.emit('kick');
        } else {
            throw new Error("Vous avez essayé de rejeter un joueur de la salle alors que vous n'êtes pas son créateur.");
        }
    }

    leave() {
        if (this.selectedRoom.value) {
            this.leaveGame();
        } else {
            throw new Error('Vous avez essayé de quitter une salle alors que vous êtes dans aucune salle.');
        }
    }

    start() {
        if (this.isServerDown()) return;
        if (this.isMainPlayer()) {
            this.roomSocket?.emit('start');
        } else {
            throw new Error("Vous avez essayé de démarrer la partie alors que vous n'êtes pas le créateur.");
        }
    }

    getId(): BehaviorSubject<PlayerId | undefined> {
        return this.myId;
    }

    confirmForfeit() {
        this.gameContextService.confirmForfeit();
        this.leaveGame();
    }

    async joinRoom(avatar: string, playerName: string, roomId: RoomId) {
        if (this.selectedRoom.value) throw Error('Vous êtes déjà dans une salle de jeu.');

        if (this.isServerDown()) return;
        this.mainSocket.emit('join-room', roomId, playerName, avatar);
        await this.waitForRoom();
    }

    async waitForRoom() {
        await new Promise((resolve, reject) => {
            this.mainSocket.once('join', () => resolve(null));
            this.mainSocket.once('error', (e) => reject(e));
        });
        await this.selectedRoom.pipe(take(2)).toPromise();
    }

    async createRoom(playerName: string, parameters: Parameters, joueurVirtuel?: string) {
        if (this.selectedRoom.value) throw Error('Vous êtes déjà dans une salle de jeu.');
        if (this.isServerDown()) return;
        this.mainSocket.emit('create-room', playerName, parameters, joueurVirtuel);
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

    private handleError(error: string) {
        // eslint-disable-next-line no-console
        if (!environment.production) console.error(error);
        if (error === 'Il y a déjà deux joueurs dans cette partie.') {
            swal.fire({
                title: 'Erreur!',
                text: error,
                showCloseButton: true,
                confirmButtonText: 'Ok!',
            });
        }
    }

    private leaveGame() {
        this.roomSocket?.close();
        this.roomSocket = undefined;
        this.gameContextService.close();
        this.selectedRoom.next(undefined);
    }

    private joinRoomHandler(roomId: RoomId) {
        const body: ConnectBody = { id: this.myId.value, token: this.token };
        this.roomSocket = this.io.io(`${environment.socketUrl}/rooms/${roomId}`, { auth: body });
        this.roomSocket.on('kick', () => {
            this.leaveGame();
            swal.fire({
                title: 'Oh non!',
                text: 'Vous avez été éjecté de la salle',
                showCloseButton: true,
                confirmButtonText: 'Compris!',
            });
            this.router.navigate(['/joining-room']);
        });
        this.roomSocket.on('update-room', (room) => this.selectedRoom.next(room));
        this.roomSocket.on('error', (error: string) => this.handleError(error));

        this.roomSocket.on('join-game', (gameId) => {
            this.joinGameHandler(gameId);
        });
    }

    private joinGameHandler(gameId: string) {
        const body: ConnectBody = { id: this.myId.value, token: this.token };
        const gameSocket = this.io.io(`${environment.socketUrl}/games/${gameId}`, { auth: body });

        this.gameContextService.init(gameSocket);
    }

    private serverDownAlert() {
        swal.fire({
            title: 'Oh non!',
            text: "Vous n'êtes pas connecté au serveur actuellement.",
            showCloseButton: true,
            confirmButtonText: 'Compris!',
            heightAuto: false,
        });
    }
}
