import * as http from 'http';
import * as io from 'socket.io';

export class SocketManager {
    private io: io.Server;
    constructor(server: http.Server) {
        this.io = new io.Server(server, { cors: { origin: '*', methods: ['GET', 'POST'] } });
    }

    init(): void {
        this.io.on('connection', (socket) => {
            console.log(`Connexion par l'utilisateur avec id : ${socket.id}`);
            // message initial
            socket.emit('hello', 'Hello World!');

            socket.on('message', (message: string) => {
                console.log(message);
            });
            socket.on('validate', (word: string) => {
                const isValid = word.length > 5;
                socket.emit('wordValidated', isValid);
            });

            socket.on('broadcastAll', (message: string) => {
                this.io.sockets.emit('massMessage', `${socket.id} : ${message}`);
            });

            socket.on('disconnect', (reason) => {
                console.log(`Deconnexion par l'utilisateur avec id : ${socket.id}`);
                console.log(`Raison de deconnexion : ${reason}`);
            });
        });
    }
}
