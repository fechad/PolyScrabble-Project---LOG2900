import { Connection } from '@app/classes/connection';
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

            const connection = new Connection(socket);
            connection.init();
        });
    }
}
