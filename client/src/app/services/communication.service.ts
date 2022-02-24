import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Dictionnary } from '@app/classes/dictionnary';
import { GameState } from '@app/classes/game';
import { Letter } from '@app/classes/letter';
import { Message } from '@app/classes/message';
import { Parameters } from '@app/classes/parameters';
import { PlayerId, Room, RoomId } from '@app/classes/room';
import { IoWrapper } from '@app/classes/socket-wrapper';
import { BehaviorSubject } from 'rxjs';
import { take } from 'rxjs/operators';
import { Socket } from 'socket.io-client';
import { environment } from 'src/environments/environment';
import swal from 'sweetalert2';
import { GameContextService } from './game-context.service';
import { GridService } from './grid.service';

type Token = number;

const IDS_KEY = 'ids';

@Injectable({
    providedIn: 'root',
})
export class CommunicationService {
    readonly rooms: BehaviorSubject<Room[]> = new BehaviorSubject([] as Room[]);
    readonly selectedRoom: BehaviorSubject<Room | undefined> = new BehaviorSubject(undefined as Room | undefined);
    readonly dictionnaries: Promise<Dictionnary[]>;
    congratulations: string | undefined = undefined;
    endGame: boolean = false;
    forfeited: boolean = false;
    private myId: BehaviorSubject<PlayerId | undefined> = new BehaviorSubject(undefined as PlayerId | undefined);
    private token: Token;

    private readonly waitingRoomsSocket: Socket;
    private readonly mainSocket: Socket;
    private roomSocket: Socket | undefined = undefined;
    private gameSocket: Socket | undefined = undefined;

    constructor(
        public gameContextService: GameContextService,
        public gridService: GridService,
        httpClient: HttpClient,
        private router: Router,
        private io: IoWrapper,
    ) {
        this.waitingRoomsSocket = this.io.io(`${environment.socketUrl}/waitingRoom`);
        const auth = this.getAuth();
        this.mainSocket = this.io.io(`${environment.socketUrl}/`, { auth });

        this.listenRooms();
        this.mainSocket.on('join', (room) => this.joinRoomHandler(room));
        this.mainSocket.on('error', (e) => this.handleError(e));
        this.waitingRoomsSocket.on('broadcast-rooms', (rooms) => this.rooms.next(rooms));
        this.dictionnaries = httpClient.get<Dictionnary[]>(`${environment.serverUrl}/dictionnaries`).toPromise();

        this.mainSocket.on('id', (id: PlayerId, token: Token) => {
            this.myId.next(id);
            this.token = token;
            this.gameContextService.myId = id;

            addEventListener('beforeunload', () => this.saveAuth(id), { capture: true });
        });
    }

    isMainPlayer(): boolean {
        return this.selectedRoom.value !== undefined && this.selectedRoom.value.mainPlayer.id === this.myId.value;
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
        this.gameContextService.addMessage(message, true, false);
    }
    sendCommandMessage(message: string) {
        this.gameContextService.addMessage(message, false, true);
    }
    sendMessage(message: string) {
        this.gameSocket?.emit('message', message);
        this.gameContextService.addMessage(message, false, false);
    }

    getId(): BehaviorSubject<PlayerId | undefined> {
        return this.myId;
    }

    switchTurn(timerRequest: boolean) {
        this.gameSocket?.emit('switch-turn', timerRequest);
    }

    place(letters: string, position: string) {
        this.gameContextService.tempUpdateRack(letters);
        this.gridService.tempUpdateBoard(letters, position);
        this.gameContextService.allowSwitch(false);
        this.gameSocket?.emit('place-letters', letters, position);
    }

    exchange(letters: string) {
        this.gameSocket?.emit('change-letters', letters);
    }

    confirmForfeit() {
        this.gameSocket?.emit('confirm-forfeit');
        this.leaveGame();
    }

    async joinRoom(playerName: string, roomId: RoomId) {
        if (this.selectedRoom.value !== undefined) throw Error('Already in a room');

        this.mainSocket.emit('join-room', roomId, playerName);
        await this.waitForRoom();
    }

    async waitForRoom() {
        await new Promise((resolve, reject) => {
            this.mainSocket.once('join', () => resolve(null));
            this.mainSocket.once('error', (e) => reject(e));
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
        // eslint-disable-next-line no-console
        if (!environment.production) console.error(e);
    }

    private leaveGame() {
        if (!this.forfeited) this.gameContextService.clearMessages();
        this.roomSocket?.close();
        this.roomSocket = undefined;
        this.gameSocket?.close();
        this.gameSocket = undefined;
        this.gameContextService.clearMessages();
        this.selectedRoom.next(undefined);
    }

    private joinRoomHandler(roomId: RoomId) {
        this.roomSocket = this.io.io(`${environment.socketUrl}/rooms/${roomId}`, { auth: { id: this.myId.value, token: this.token } });
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
        this.roomSocket.on('error', (e) => this.handleError(e));

        this.roomSocket.on('join-game', (gameId) => {
            this.joinGameHandler(gameId);
        });
    }

    private joinGameHandler(gameId: string) {
        this.gameSocket = this.io.io(`${environment.socketUrl}/games/${gameId}`, { auth: { id: this.myId.value, token: this.token } });

        this.gameSocket.on('forfeit', (idLoser) => {
            if (idLoser !== this.myId.value) {
                this.forfeited = true;
                let text = [''];
                if (this.endGame)
                    text = [
                        'La salle est devenue bien silencieuse...',
                        'Votre adversaire a quitté la partie, voulez-vous retourner au menu principal?',
                    ];
                else text = ['Gagnant par défaut', '👑 Votre adversaire a abandonné, vous avez gagné! 👑 Voulez-vous retourner au menu principal?'];
                swal.fire({
                    title: text[0],
                    text: text[1],
                    showCloseButton: true,
                    showCancelButton: true,
                    confirmButtonText: 'Oui',
                    cancelButtonText: 'Non',
                }).then((result) => {
                    if (result.value) {
                        this.gameContextService.clearMessages();
                        this.forfeited = false;
                        this.router.navigate(['/']);
                    }
                });
            }
            this.endGame = false;
            this.congratulations = undefined;
            this.leaveGame();
        });

        this.gameSocket.on('state', (state: GameState) => this.gameContextService.state.next(state));
        this.gameSocket.on('message', (message: Message, msgCount: number) => {
            this.gameContextService.receiveMessages(message, msgCount, message.emitter === this.myId.value);
        });
        this.gameSocket.on('game-error', (error: string) => this.sendLocalMessage(error));
        this.gameSocket.on('valid-exchange', (response: string) => this.sendCommandMessage(response));
        this.gameSocket.on('rack', (rack: Letter[]) => {
            this.gameContextService.rack.next(rack);
            this.gameContextService.allowSwitch(true);
        });
    }

    private getAuth(): { id?: PlayerId } {
        const idsString = sessionStorage.getItem(IDS_KEY) || '';
        const ids = idsString.split(';').filter((s) => s.length > 0);
        const auth: { id?: PlayerId } = {};
        if (ids.length > 0) {
            auth.id = ids.pop();
            sessionStorage.setItem(IDS_KEY, ids.join(';'));
        }
        return auth;
    }

    private saveAuth(id: PlayerId) {
        const idsString = sessionStorage.getItem(IDS_KEY) || '';
        const ids = idsString.split(';').filter((s) => s.length > 0);
        const filteredIds = ids.filter((ident) => ident !== id);
        filteredIds.push(id);
        sessionStorage.setItem(IDS_KEY, filteredIds.join(';'));
    }
}
