import { Parameters } from '@app/classes/parameters';
import { PlayerId, Room, RoomId } from '@app/classes/room';
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

    constructor(server: http.Server) {
        this.io = new io.Server(server, { cors: { origin: '*', methods: ['GET', 'POST'] } });
        this.rooms = [];
    }

    init(): void {
        this.io.on('connection', (socket) => {
            console.log(`Connexion par l'utilisateur avec id : ${socket.id}`);

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

                const namespace = this.io.of(`/rooms/${roomId}`);
                namespace.use((s, next) => {
                    const token = s.handshake.auth.token;
                    if (token === 0 || token === 1) {
                        // valid token
                        next();
                    } else {
                        next(Error('Invalid token for room'));
                    }
                });
                const messages: Message[] = []; // TODO
                namespace.on('connect', (namespaceSocket) => {
                    const isMainPlayer = namespaceSocket.handshake.auth.token === 0;

                    const events: { [key: string]: () => void } = { updateRoom: () => namespaceSocket.emit('updateRoom', room) };
                    if (!isMainPlayer) events.kick = () => namespaceSocket.emit('kick');
                    Object.entries(events).forEach(([name, handler]) => room.events.on(name, handler));

                    if (isMainPlayer) {
                        namespaceSocket.on('kick', () => room.kickOtherPlayer());

                        namespaceSocket.on('start', () => {
                            if (room.hasOtherPlayer()) {
                                console.log('start'); // TODO
                                namespace.emit('start');
                            } else {
                                namespaceSocket.emit('error', 'No other player');
                            }
                        });
                    }
                    namespaceSocket.on('message', (message: string) => {
                        const otherPlayer = room.getOtherPlayer()?.id;
                        if (otherPlayer === undefined) {
                            return;
                        }
                        const playerId: PlayerId = isMainPlayer ? room.mainPlayer.id : otherPlayer;
                        messages.push({ emitter: playerId, text: message });
                        namespace.emit('message', messages);
                    });

                    namespaceSocket.on('disconnect', () => {
                        room.quit(isMainPlayer);
                        Object.entries(events).forEach(([name, handler]) => room.events.off(name, handler));
                        if (isMainPlayer) {
                            // swap remove
                            const idx = this.rooms.indexOf(room);
                            if (idx === -1) throw Error('Current room does not exist?');
                            this.rooms[idx] = this.rooms[this.rooms.length - 1];
                            this.rooms.pop();
                        }
                    });

                    namespaceSocket.emit('updateRoom', room);
                });
                this.rooms.push(room);
            });

            socket.on('disconnect', (reason) => {
                console.log(`Deconnexion par l'utilisateur avec id : ${socket.id}`);
                console.log(`Raison de deconnexion : ${reason}`);
            });
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
