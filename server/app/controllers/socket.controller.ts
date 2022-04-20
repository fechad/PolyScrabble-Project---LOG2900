import { Game } from '@app/classes/game';
import { Position } from '@app/classes/position';
import { PlayerId, Room, State } from '@app/classes/room';
import * as constants from '@app/constants';
import { DictionnaryService } from '@app/services/dictionnary.service';
import { GameHistoryService } from '@app/services/game-history-service';
import { LoginsService } from '@app/services/logins.service';
import { MainLobbyService } from '@app/services/main-lobby.service';
import { RoomsService } from '@app/services/rooms.service';
import { WaitingRoomService } from '@app/services/waiting-room.service';
import * as http from 'http';
import * as io from 'socket.io';
import { Service } from 'typedi';

type Handlers = [string, (params: unknown[]) => void][];

@Service()
export class SocketManager {
    private io: io.Server;
    private token: number;

    constructor(
        server: http.Server,
        public roomsService: RoomsService,
        private logins: LoginsService,
        private dictionnaryService: DictionnaryService,
        private gameHistoryService: GameHistoryService,
    ) {
        this.io = new io.Server(server, { cors: { origin: '*', methods: ['GET', 'POST'] } });
    }

    init(): void {
        this.initLobby();
        this.initWaitingRoom();
        this.initRooms();
        this.initGames();
    }

    private initLobby(): void {
        const mainLobby = new MainLobbyService(this.roomsService, this.dictionnaryService, this.gameHistoryService);
        this.io.on('connection', (socket) => {
            const [id, token] = this.logins.login(socket.handshake.auth.id, socket.id);
            this.token = token;
            socket.emit('id', id, token);
            mainLobby.connect(socket, id);

            socket.on('disconnect', (reason) => {
                console.log(`Raison de deconnexion : ${reason}`);
                this.logins.logout(id);
            });
        });
    }

    private initWaitingRoom(): void {
        const waitingRoomService = new WaitingRoomService(this.roomsService);
        const waitingRoom = this.io.of('/waitingRoom');
        waitingRoom.on('connect', (socket) => {
            const handlers: Handlers = WaitingRoomService.globalEvents.map((event) => [
                event,
                (...params: unknown[]) => socket.emit(event, ...params),
            ]);
            handlers.forEach(([event, handler]) => waitingRoomService.on(event, handler));
            waitingRoomService.connect(socket);

            socket.on('disconnect', () => {
                handlers.forEach(([event, handler]) => waitingRoomService.off(event, handler));
            });
        });
    }

    private initRooms(): void {
        const rooms = this.io.of(/^\/rooms\/\d+$/);
        rooms.use((socket, next) => {
            const roomId = Number.parseInt(socket.nsp.name.substring('/rooms/'.length), 10);
            const idx = this.roomsService.rooms.findIndex((room) => room.id === roomId);
            if (idx === constants.UNDEFINED) {
                next(Error('Numéro de salle invalide'));
                return;
            }
            socket.data.room = this.roomsService.rooms[idx];

            const { id, token } = socket.handshake.auth;
            if (this.logins.verify(id, token)) {
                next();
            } else {
                next(Error('Jeton invalide pour la salle'));
            }
        });
        rooms.on('connect', (socket) => {
            const room: Room = socket.data.room;
            const isMainPlayer = room.mainPlayer.id === socket.handshake.auth.id;
            socket.join(`room-${room.id}`);

            if (isMainPlayer) {
                room.mainPlayer.connected = true;
            } else {
                const otherPlayer = room.getOtherPlayer();
                if (otherPlayer) otherPlayer.connected = true;
            }

            if (room.getState() === State.Started) socket.emit('join-game', room.id);

            const events: [string, () => void][] = [['update-room', () => socket.emit('update-room', room)]];
            if (!isMainPlayer) events.push(['kick', () => socket.emit('kick')]);
            events.forEach(([name, handler]) => room.on(name, handler));

            if (isMainPlayer) {
                socket.on('kick', () => room.kickOtherPlayer());
                socket.on('start', () => {
                    room.start();
                    const game = new Game(room, this.dictionnaryService.dictionnaries[room.parameters.dictionnary], this.gameHistoryService);
                    this.roomsService.games.push(game);
                    rooms.to(`room-${room.id}`).emit('join-game', game.id);
                });
            }

            socket.on('disconnect', () => {
                room.quit(isMainPlayer);
                if (isMainPlayer && room.getState() === State.Setup) {
                    this.roomsService.remove(room.id);
                }
                events.forEach(([name, handler]) => room.off(name, handler));
            });

            socket.emit('update-room', room);
        });
    }

    private initGames() {
        const games = this.io.of(/^\/games\/\d+$/);
        games.use((socket, next) => {
            const gameId = Number.parseInt(socket.nsp.name.substring('/games/'.length), 10);
            const idx = this.roomsService.games.findIndex((game) => game.id === gameId);
            if (idx === constants.UNDEFINED) {
                next(Error('Numéro de partie invalide'));
                return;
            }
            socket.data.gameId = gameId;
            socket.data.gameIdx = idx;

            const { id, token } = socket.handshake.auth;
            if (this.logins.verify(id, token)) {
                next();
            } else {
                next(Error('Jeton invalide pour la partie'));
            }
        });
        games.on('connect', (socket) => {
            const id = socket.handshake.auth.id;
            const game = this.roomsService.games[socket.data.gameIdx];
            socket.join(`game-${game.id}`);

            console.log(`Partie ${socket.data.gameId} contient le joueur avec le jeton: ${socket.handshake.auth.token}`);

            for (const message of game.messages) {
                socket.emit('message', message);
            }

            const events: string[] = ['message', 'state'];
            const handlers: [string, (...params: unknown[]) => void][] = events.map((event) => [event, (...params) => socket.emit(event, ...params)]);
            const specificPlayerEvents = ['objectives', 'rack', 'game-error', 'valid-exchange', 'reserve-content'];
            for (const event of specificPlayerEvents) {
                handlers.push([
                    event,
                    (targetId: PlayerId, ...params: unknown[]) => {
                        if (targetId === id) socket.emit(event, ...params);
                    },
                ]);
            }
            handlers.forEach(([name, handler]) => game.eventEmitter.on(name, handler));

            socket.on('message', (message: string) => game.sendMessage({ text: message, emitter: id }));
            socket.on('confirm-forfeit', async () => game.forfeit(id));
            socket.on('change-letters', (letters: string) => game.changeLetters([...letters[0]], id));
            socket.on('place-letters', async (letters: string, row: number, col: number, isHorizontal?: boolean) =>
                game.placeLetters(id, [...letters], new Position(row, col), isHorizontal),
            );
            socket.on('switch-turn', () => game.skipTurn(id));
            socket.on('reserve-content', () => game.showReserveContent(id));
            socket.on('current-rack', (rack) => game.matchRack(rack));
            socket.on('hint', () => game.hint(id));

            socket.on('disconnect', () => {
                handlers.forEach(([name, handler]) => game.eventEmitter.off(name, handler));
                setTimeout(() => {
                    if (!this.logins.verify(id, this.token)) game.forfeit(id);
                }, constants.DISCONNECTED_DELAY);
            });

            game.sendState();
        });
    }
}
