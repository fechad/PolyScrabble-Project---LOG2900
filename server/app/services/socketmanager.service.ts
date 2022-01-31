import { Parameters } from '@app/classes/parameters';
import { Room, RoomId } from '@app/classes/room';
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
                socket.emit('join', id);
            });

            socket.on('createRoom', (playerName: string, parameters: Parameters) => {
                const roomId = this.getNewRoomId();
                const namespace = this.io.of(`/rooms/${roomId}`);
                const room = new Room(roomId, socket.id, playerName, parameters, (event: string, payload: unknown) => {
                    namespace.emit(event, payload);
                });
                socket.emit('join', roomId);
                console.log(`Created room ${roomId} for player ${playerName}`);

                namespace.on('connect', (namespaceSocket) => {
                    const isMainPlayer = namespaceSocket.id === room.mainPlayer.id;

                    if (isMainPlayer) {
                        namespace.on('kick', () => {
                            room.kickOtherPlayer();
                            namespace.emit('kick');
                        });

                        namespace.on('start', () => {
                            console.log('start');
                        }); // TODO
                    } else {
                        namespace.on('join', (name: string) => {
                            const error = room.addPlayer(socket.id, name);
                            if (error !== undefined) {
                                socket.emit('error', error.message);
                            }
                        });
                    }
                    namespaceSocket.on('disconnect', () => {
                        room.quit(namespaceSocket.id);
                    });
                    namespaceSocket.on('leave', () => {
                        room.quit(namespaceSocket.id);
                    });
                });
                this.rooms.push(room);
            });

            socket.on('disconnect', (reason) => {
                console.log(`Deconnexion par l'utilisateur avec id : ${socket.id}`);
                console.log(`Raison de deconnexion : ${reason}`);
                this.rooms
                    .filter((room) => room.mainPlayer.id === socket.id || room.getOtherPlayer()?.id === socket.id)
                    .forEach((room) => room.quit(socket.id));
                this.rooms = this.rooms.filter((room) => room.mainPlayer.id !== socket.id);
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
