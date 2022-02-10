import { Game } from '@app/classes/game';
import { Parameters } from '@app/classes/parameters';
import { Player, PlayerId, Room, RoomId } from '@app/classes/room';
import { Message } from '@app/message';
import * as http from 'http';
import * as io from 'socket.io';
import { isDeepStrictEqual } from 'util';

const ROOMS_LIST_UPDATE_TIMEOUT = 200; // ms

export class SocketManager {
    readonly rooms: Room[] = [];
    readonly games: Game[] = [];
    private io: io.Server;
    private nextRoomId = 0;
    private messages: { [room: number]: Message[] } = {}; // number is RoomId, but typescript does not allow this

    constructor(server: http.Server) {
        this.io = new io.Server(server, { cors: { origin: '*', methods: ['GET', 'POST'] } });
    }

    init(): void {
        this.io.on('connection', (socket) => {
            console.log(`Connexion par l'utilisateur avec id : ${socket.id}`);
            socket.emit('id', socket.id);

            // message initial
            socket.on('joinRoom', (id: RoomId, playerName: string) => {
                const room = this.rooms.find((r) => r.id === id);
                if (room === undefined) {
                    socket.emit('error', 'Room is no longer available');
                    return;
                }
                const error = room.addPlayer(socket.id, playerName);
                if (error !== undefined) {
                    socket.emit('error', error.message);
                    return;
                }
                socket.emit('join', id, 1);
            });

            socket.on('createRoom', (playerName: string, parameters: Parameters) => {
                const roomId = this.getNewRoomId();
                const room = new Room(roomId, socket.id, playerName, parameters);
                socket.emit('join', roomId, 0);
                console.log(`Created room ${roomId} for player ${playerName}`);
                this.rooms.push(room);
            });

            socket.on('disconnect', (reason) => {
                console.log(`Deconnexion par l'utilisateur avec id : ${socket.id}`);
                console.log(`Raison de deconnexion : ${reason}`);
            });
        });

        const rooms = this.io.of(/^\/rooms\/\d+$/);
        rooms.use((s, next) => {
            const roomId = Number.parseInt(s.nsp.name.substring('/rooms/'.length), 10);
            const idx = this.rooms.findIndex((room) => room.id === roomId);
            const NOT_FOUND = -1;
            if (idx === NOT_FOUND) {
                next(Error('Invalid room number'));
                return;
            }
            s.data.roomId = roomId;
            s.data.roomIdx = idx;

            const token = s.handshake.auth.token;
            if (token === 0 || token === 1) {
                // valid token
                next();
            } else {
                next(Error('Invalid token for room'));
            }
        });
        rooms.on('connect', (socket) => {
            const isMainPlayer = socket.handshake.auth.token === 0;
            if (this.messages[socket.data.roomId] === undefined) this.messages[socket.data.roomId] = [];
            const messages: Message[] = this.messages[socket.data.roomId];
            const room = this.rooms[socket.data.roomIdx];
            socket.join(`room-${room.id}`);
            const events: { [key: string]: () => void } = { updateRoom: () => socket.emit('updateRoom', room) };
            if (!isMainPlayer) events.kick = () => socket.emit('kick');
            Object.entries(events).forEach(([name, handler]) => room.events.on(name, handler));

            if (isMainPlayer) {
                socket.on('kick', () => room.kickOtherPlayer());
                socket.on('start', () => {
                    room.start();
                    const game = new Game(room.id, [room.mainPlayer, room.getOtherPlayer() as Player], room.parameters);
                    socket.emit('you-start', 0);
                    console.log(game.players[0].id);
                    this.games.push(game);
                    rooms.to(`room-${room.id}`).emit('join-game', game.gameId);
                });
            }

            // ne plus utiliser, envoyer messages par la game
            socket.on('message', (message: string) => {
                const playerId = isMainPlayer ? room.mainPlayer.id : room.getOtherPlayer()?.id;
                if (playerId === undefined) throw new Error('Undefined player tried to send a message');
                messages.push({ emitter: playerId, text: message });
                console.log('devrait pu etre call');
                rooms.to(`room-${room.id}`).emit('message', messages[messages.length - 1], playerId);
            });

            socket.on('disconnect', () => {
                room.quit(isMainPlayer);
                Object.entries(events).forEach(([name, handler]) => room.events.off(name, handler));
                if (isMainPlayer) {
                    // swap remove
                    this.rooms[socket.data.roomId] = this.rooms[this.rooms.length - 1];
                    this.rooms.pop();
                }
            });

            socket.emit('updateRoom', room);
        });

        const waitingRoom = this.io.of('/waitingRoom');
        waitingRoom.on('connect', (socket) => {
            socket.emit(
                'broadcastRooms',
                this.rooms.filter((room) => !room.hasOtherPlayer()),
            );
        });
        let prevRooms: Room[];
        setInterval(() => {
            const newRooms = this.rooms.filter((room) => !room.hasOtherPlayer());
            if (!isDeepStrictEqual(newRooms, prevRooms)) {
                waitingRoom.emit('broadcastRooms', newRooms);
                prevRooms = newRooms;
            }
        }, ROOMS_LIST_UPDATE_TIMEOUT);

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

            socket.on('message', (message: Message) => game.message(message));
            socket.on('change-letters', (letters: string, playerId: PlayerId) => game.changeLetters(letters, playerId));
            socket.on('place-letters', (letters: string, position: string, playerId: PlayerId) => game.placeLetters(letters, position, playerId));
            socket.on('switch-turn', (playerId: PlayerId) => {
                game.skipTurn(playerId, false);
            });
            socket.on('reset-timer', (id: PlayerId) => {
                // console.log('received timer-request');
                game.skipTurn(id, true);
            });
            socket.on('parameters', () => game.getParameters());

            const events: string[] = ['message', 'rack', 'placed', 'turn', 'parameters', 'game-error'];
            const handlers: [string, (...params: unknown[]) => void][] = events.map((event) => [event, (...params) => socket.emit(event, ...params)]);
            handlers.forEach(([name, handler]) => game.eventEmitter.on(name, handler));

            socket.on('disconnect', () => {
                handlers.forEach(([name, handler]) => game.eventEmitter.off(name, handler));
            });
        });
    }

    getNewRoomId(): RoomId {
        const roomId = this.nextRoomId;
        this.nextRoomId += 1;
        return roomId;
    }
}
