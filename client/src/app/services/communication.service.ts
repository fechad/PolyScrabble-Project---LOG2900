import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Dictionnary } from '@app/classes/dictionnary';
import { Message } from '@app/classes/message';
import { Parameters } from '@app/classes/parameters';
import { Player, PlayerId, Room, RoomId } from '@app/classes/room';
import { BehaviorSubject } from 'rxjs';
import { take } from 'rxjs/operators';
import { io, Socket } from 'socket.io-client';
import { environment } from 'src/environments/environment';
import { Letter } from './alphabet';
import { Board, GameContextService } from './game-context.service';
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
    private myId: BehaviorSubject<PlayerId | undefined> = new BehaviorSubject(undefined as PlayerId | undefined);
    private token: Token;

    private readonly waitingRoomsSocket: Socket = io(`${environment.socketUrl}/waitingRoom`);
    private readonly mainSocket: Socket;
    private roomSocket: Socket | undefined = undefined;
    private gameSocket: Socket | undefined = undefined;
    private loserId: string | undefined = undefined;

    constructor(public gameContextService: GameContextService, public gridService: GridService, httpClient: HttpClient, private router: Router) {
        const auth = this.getAuth();
        this.mainSocket = io(`${environment.socketUrl}/`, { auth });

        this.listenRooms();
        this.mainSocket.on('join', (room) => this.joinRoomHandler(room));
        this.mainSocket.on('error', (e) => this.handleError(e));
        this.waitingRoomsSocket.on('broadcast-rooms', (rooms) => this.rooms.next(rooms));
        this.dictionnaries = httpClient.get<Dictionnary[]>(`${environment.serverUrl}/dictionnaries`).toPromise();

        this.mainSocket.on('id', (id: PlayerId, token: Token) => {
            this.myId.next(id);
            this.token = token;

            addEventListener('beforeunload', () => this.saveAuth(id), { capture: true });
        });
    }

    isMainPlayer(): boolean {
        return this.selectedRoom.value?.mainPlayer.id === this.myId.value;
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
        this.gameSocket?.emit('message', message);
        this.gameContextService.addMessage(message, false);
    }

    getId(): BehaviorSubject<PlayerId | undefined> {
        return this.myId;
    }

    switchTurn() {
        this.gameSocket?.emit('switch-turn');
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

    getLoserId(): string | undefined {
        return this.loserId;
    }

    confirmForfeit() {
        this.loserId = this.myId.value;
        this.gameSocket?.emit('confirm-forfeit');
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
        // eslint-disable-next-line no-console
        if (!environment.production) console.error(e);
    }

    private leaveGame() {
        this.roomSocket?.close();
        this.roomSocket = undefined;
        this.selectedRoom.next(undefined);
    }

    private joinRoomHandler(roomId: RoomId) {
        this.roomSocket = io(`${environment.socketUrl}/rooms/${roomId}`, { auth: { id: this.myId.value, token: this.token } });
        this.roomSocket.on('kick', () => {
            this.leaveGame();
            setTimeout("alert('Vous avez été éjecté de la salle d'attente');", 1);
            this.router.navigate(['/joining-room']);
        });
        this.roomSocket.on('update-room', (room) => this.selectedRoom.next(room));
        this.roomSocket.on('error', (e) => this.handleError(e));

        this.roomSocket.on('join-game', (gameId) => {
            this.joinGameHandler(gameId);
        });
    }

    private joinGameHandler(gameId: string) {
        this.gameSocket = io(`${environment.socketUrl}/games/${gameId}`, { auth: { id: this.myId.value, token: this.token } });

        this.gameSocket.on('forfeit', (idLoser) => {
            if (idLoser !== this.myId.value) {
                setTimeout("alert('👑 Votre adversaire a abandonné, vous avez gagné! 👑');", 2);
            }
            this.gameContextService.clearMessages();
            this.leaveGame();
            this.router.navigate(['/']);
        });

        this.gameSocket.on('turn', (id: PlayerId) => {
            this.gameContextService.setMyTurn(id === this.myId.value);
        });
        this.gameSocket.on('message', (message: Message, msgCount: number, id: PlayerId) => {
            this.gameContextService.receiveMessages(message, msgCount, id === this.myId.value);
        });
        this.gameSocket.on('game-error', (error: string) => {
            this.sendLocalMessage(error);
        });
        this.gameSocket.on('valid-command', (response: string) => {
            this.sendLocalMessage(response);
        });
        this.gameSocket.on('valid-exchange', (response: string) => {
            this.sendLocalMessage(response);
        });
        this.gameSocket.on('reserve', (count: number) => {
            this.gameContextService.updateReserveCount(count);
        });
        this.gameSocket.on('rack', (rack: Letter[], opponentRackCount: number) => {
            this.gameContextService.updateRack(rack, opponentRackCount);
            this.gameContextService.allowSwitch(true);
        });
        this.gameSocket.on('players', (players: Player[]) => {
            for (const player of players) {
                this.gameContextService.setName(player, player.id === this.myId.value);
            }
        });
        this.gameSocket.on('board', (board: Board) => {
            this.gameContextService.setBoard(board);
        });
        this.gameSocket.on('score', (score: number, player: PlayerId) => {
            this.gameContextService.setScore(score, this.myId.value === player);
        });
        this.gameSocket.on('congratulations', (winner: Player) => {
            if (winner.id === this.myId.value) {
                this.congratulations = `Félicitations ${winner.name}, vous avez gagné la partie !!`;
            } else this.loserId = this.myId.value;
        });
        this.gameSocket.on('game-summary', (summary: string) => {
            this.sendLocalMessage(summary);
            // this.gameContextService.setMyTurn(false);
        });
        this.gameSocket.on('its-a-tie', (playerOne: Player, playerTwo) => {
            this.congratulations = `Félicitations, ${playerOne.name} et ${playerTwo}, vous avez gagné la partie !!`;
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
