import { Game } from '@app/classes/game';
import { Player, PlayerId, Room } from '@app/classes/room';
import { DictionnaryService } from '@app/services/dictionnary.service';
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
    readonly games: Game[] = [];
    private io: io.Server;
    private logins: LoginsService = new LoginsService();

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
            const [id, token] = this.logins.login(socket.handshake.auth.id, socket.id);
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
            const NOT_FOUND = -1;
            if (idx === NOT_FOUND) {
                next(Error('Invalid room number'));
                return;
            }
            socket.data.room = this.roomsService.rooms[idx];

            const { id, token } = socket.handshake.auth;
            if (this.logins.verify(id, token)) {
                next();
            } else {
                next(Error('Invalid token for room'));
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
            this.roomsService.unpendDeletion(room.id);

            if (room.isStarted()) {
                socket.emit('join-game', room.id);
            }

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

            socket.on('disconnect', () => {
                room.quit(isMainPlayer);
                if (room.isStarted()) {
                    this.roomsService.pendDeletion(room.id, () => {
                        const NOT_FOUND = -1;

                        const idx = this.games.findIndex((game) => game.gameId === room.id);
                        if (idx !== NOT_FOUND) {
                            this.games.splice(idx, 1);
                        }
                        events.forEach(([name, handler]) => room.off(name, handler));
                    });
                } else {
                    if (isMainPlayer) {
                        this.roomsService.remove(room.id);
                    }
                    events.forEach(([name, handler]) => room.off(name, handler));
                }
            });

            socket.emit('update-room', room);
        });
    }

    private initGames() {
        const games = this.io.of(/^\/games\/\d+$/);
        games.use((socket, next) => {
            const gameId = Number.parseInt(socket.nsp.name.substring('/games/'.length), 10);
            const idx = this.games.findIndex((game) => game.gameId === gameId);
            const NOT_FOUND = -1;
            if (idx === NOT_FOUND) {
                next(Error('Invalid game number'));
                return;
            }
            socket.data.gameId = gameId;
            socket.data.gameIdx = idx;

            const { id, token } = socket.handshake.auth;
            if (this.logins.verify(id, token)) {
                next();
            } else {
                next(Error('Invalid token for game'));
            }
        });
        games.on('connect', (socket) => {
            const id = socket.handshake.auth.id;
            const game = this.games[socket.data.gameIdx];
            socket.join(`game-${game.gameId}`);

            console.log(`game ${socket.data.gameId} joined by player with token: ${socket.handshake.auth.token}`);

            for (const message of game.messages) {
                socket.emit('message', message);
            }

            const events: string[] = [
                'message',
                'score',
                'turn',
                'parameters',
                'players',
                'forfeit',
                'board',
                'valid-command',
                'reserve',
                'rackCount',
                'congratulations',
                'game-summary',
                'its-a-tie',
            ];
            const handlers: [string, (...params: unknown[]) => void][] = events.map((event) => [event, (...params) => socket.emit(event, ...params)]);
            const specificPlayerEvents = ['rack', 'game-error', 'valid-exchange'];
            for (const event of specificPlayerEvents) {
                handlers.push([
                    event,
                    (targetId: PlayerId, ...params: unknown[]) => {
                        if (targetId === id) socket.emit(event, ...params);
                    },
                ]);
            }
            handlers.forEach(([name, handler]) => game.eventEmitter.on(name, handler));

            socket.on('message', (message: string) => {
                game.message({ text: message, emitter: id });
            });
            socket.on('confirm-forfeit', () => game.forfeit(id));
            socket.on('change-letters', (letters: string) => game.changeLetters(letters, id));
            socket.on('place-letters', async (letters: string, position: string) => game.placeLetters(letters, position, id));
            socket.on('switch-turn', () => game.skipTurn(id));

            socket.on('disconnect', () => {
                handlers.forEach(([name, handler]) => game.eventEmitter.off(name, handler));
            });

            game.gameInit();
        });
    }
}
