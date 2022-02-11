import { Game } from '@app/classes/game';
import { Player, PlayerId } from '@app/classes/room';
import { Message } from '@app/message';
import { DictionnaryService } from '@app/services/dictionnary.service';
import { MainLobbyService } from '@app/services/main-lobby.service';
import { RoomsService } from '@app/services/rooms.service';
import { WaitingRoomService } from '@app/services/waiting-room.service';
import * as http from 'http';
import * as io from 'socket.io';
import { Service } from 'typedi';

type Handlers = [string, (params: unknown[]) => void][];

@Service()
export class SocketManager {
    readonly games: Game[] = [];
    private io: io.Server;

    constructor(server: http.Server, public roomsService: RoomsService, private dictionnaryService: DictionnaryService) {
        this.io = new io.Server(server, { cors: { origin: '*', methods: ['GET', 'POST'] } });
    }

    init(): void {
        this.initLobby();
        this.initWaitingRoom();
        this.initRooms();
        this.initGames();
    }

    private initLobby(): void {
        const mainLobby = new MainLobbyService(this.roomsService);
        this.io.on('connection', (socket) => {
            mainLobby.connect(socket, socket.id);

            socket.on('disconnect', (reason) => {
                console.log(`Deconnexion par l'utilisateur avec id : ${socket.id}`);
                console.log(`Raison de deconnexion : ${reason}`);
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
            const NOT_FOUND = -1;
            if (idx === NOT_FOUND) {
                next(Error('Invalid room number'));
                return;
            }
            socket.data.roomIdx = idx;

            // TODO: use real tokens
            const token = socket.handshake.auth.token;
            if (token === 0 || token === 1) {
                // valid token
                next();
            } else {
                next(Error('Invalid token for room'));
            }
        });
        rooms.on('connect', (socket) => {
            const isMainPlayer = socket.handshake.auth.token === 0;
            const room = this.roomsService.rooms[socket.data.roomIdx];
            socket.join(`room-${room.id}`);

            const events: [string, () => void][] = [['update-room', () => socket.emit('update-room', room)]];
            if (!isMainPlayer) events.push(['kick', () => socket.emit('kick')]);
            events.forEach(([name, handler]) => room.on(name, handler));

            if (isMainPlayer) {
                socket.on('kick', () => room.kickOtherPlayer());
                socket.on('start', () => {
                    room.start();
                    const game = new Game(room.id, [room.mainPlayer, room.getOtherPlayer() as Player], room.parameters, this.dictionnaryService);
                    this.games.push(game);
                    rooms.to(`room-${room.id}`).emit('join-game', game.gameId);
                });
            }
            socket.on('confirmForfeit', () => room.forfeit());

            socket.on('disconnect', () => {
                room.quit(isMainPlayer);
                if (isMainPlayer) {
                    this.roomsService.rooms.splice(socket.data.roomIdx, 1);
                }
                events.forEach(([name, handler]) => room.off(name, handler));
            });

            socket.emit('update-room', room);
        });
    }

    private initGames() {
        const games = this.io.of(/^\/games\/\d+$/);
        games.use((s, next) => {
            const gameId = Number.parseInt(s.nsp.name.substring('/games/'.length), 10);
            const idx = this.games.findIndex((game) => game.gameId === gameId);
            const NOT_FOUND = -1;
            if (idx === NOT_FOUND) {
                next(Error('Invalid game number'));
                return;
            }
            s.data.gameId = gameId;
            s.data.gameIdx = idx;

            const token = s.handshake.auth.token;
            if (token === 0 || token === 1) {
                // valid token
                next();
            } else {
                next(Error('Invalid token for game'));
            }
        });
        games.on('connect', (socket) => {
            const game = this.games[socket.data.gameIdx];
            socket.join(`game-${game.gameId}`);

            console.log(`game ${socket.data.gameId} joined by player with token: ${socket.handshake.auth.token}`);

            const events: string[] = ['message', 'rack', 'score', 'turn', 'parameters', 'game-error', 'players', 'board'];
            const handlers: [string, (...params: unknown[]) => void][] = events.map((event) => [event, (...params) => socket.emit(event, ...params)]);
            handlers.forEach(([name, handler]) => game.eventEmitter.on(name, handler));

            socket.on('message', (message: Message) => game.message(message));
            socket.on('change-letters', (letters: string, playerId: PlayerId) => game.changeLetters(letters, playerId));
            socket.on('place-letters', (letters: string, position: string, playerId: PlayerId) => game.placeLetters(letters, position, playerId));
            socket.on('switch-turn', (playerId: PlayerId) => {
                game.skipTurn(playerId, false);
            });
            socket.on('reset-timer', (id: PlayerId) => {
                game.skipTurn(id, true);
            });
            socket.on('parameters', () => game.getParameters());

            socket.on('disconnect', () => {
                handlers.forEach(([name, handler]) => game.eventEmitter.off(name, handler));
            });

            game.gameInit();
        });
    }
}
