import { Parameters } from '@app/classes/parameters';
import { Room, RoomId } from '@app/classes/room';
import { Message } from '@app/message';
import * as http from 'http';
import * as io from 'socket.io';
import { isDeepStrictEqual } from 'util';

const ROOMS_LIST_UPDATE_TIMEOUT = 200; // ms

export class SocketManager {
    private io: io.Server;
    private rooms: Room[];
    private prevRooms: Room[];
    private nextRoomId = 0;
    private messages: { [room: number]: Message[] } = {}; // number is RoomId, but typescript does not allow this

    constructor(server: http.Server) {
        this.io = new io.Server(server, { cors: { origin: '*', methods: ['GET', 'POST'] } });
        this.rooms = [];
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
            const roomId = Number.parseInt(s.nsp.name.substring('/rooms/'.length));
            const idx = this.rooms.findIndex(room => room.id === roomId);
            if (idx === -1) {
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
                    if (room.hasOtherPlayer()) {
                        console.log('start'); // TODO: create room
                        rooms.to(`room-${room.id}`).emit('start');
                    } else {
                        socket.emit('error', 'No other player');
                    }
                });
            }
            socket.on('message', (message: string) => {
                const playerId = isMainPlayer ? room.mainPlayer.id : room.getOtherPlayer()?.id;
                if (playerId === undefined) throw new Error('Undefined player tried to send a message');
                messages.push({ emitter: playerId, text: message });
                rooms.to(`room-${room.id}`).emit('message', messages);
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
        setInterval(() => {
            const newRooms = this.rooms.filter((room) => !room.hasOtherPlayer());
            if (!isDeepStrictEqual(newRooms, this.prevRooms)) {
                waitingRoom.emit('broadcastRooms', newRooms);
                this.prevRooms = newRooms;
            }
        }, ROOMS_LIST_UPDATE_TIMEOUT);
    }

    getNewRoomId(): RoomId {
        const roomId = this.nextRoomId;
        this.nextRoomId += 1;
        return roomId;
    }
}
