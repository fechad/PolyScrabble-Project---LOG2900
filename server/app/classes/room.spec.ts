import { SocketManager } from '@app/services/socketmanager.service';
import { Server } from 'app/server';
import { assert } from 'chai';
import * as sinon from 'sinon';
import { io as ioClient, Socket } from 'socket.io-client';
import { Container } from 'typedi';
import { Parameters } from './parameters';
import { Room } from './room';

describe('Room', () => {
    let parameters: Parameters;
    let room: Room;
    let server: Server;
    let service: SocketManager;
    let clientSocket: Socket;

    const urlString = 'http://localhost:3000';
    beforeEach(async () => {
        server = Container.get(Server);
        server.init();
        service = server['socketManager'];
        service.init();
        clientSocket = ioClient(urlString);
        parameters = new Parameters();
        await new Promise<void>((resolve, reject) => {
            service['io'].on('connection', () => {
                resolve();
            });
        })
        let playerSocket = service['connections'][0];
        let deleteFunction = () => {console.log("delete room")};
        room = new Room(playerSocket, 'name', deleteFunction);
    });

    afterEach(() => {
        clientSocket.close();
        service['io'].close();
        sinon.restore();
    });

    it('should join a room', (done) => {
        const spy = sinon.spy(console, 'log');
        clientSocket.emit('joinRoom', room);
        setTimeout(() => {
            assert(spy.called);
            done();
        }, 1000);
    });

    it('should change ', (done) => {
        let nbrCalls = 0;
        const spy = sinon.spy(service['connections'][0], 'stopBroadcastsRooms')
        clientSocket.on('rooms', () => {
            if(nbrCalls < 2){
                clientSocket.emit('joinRoom', room);
                nbrCalls++;
                if (nbrCalls == 2){
                    setTimeout(() => {
                        assert(spy.called);
                        done();
                    }, 1000);
                }
            } else {
                assert(false);
            } 
        });
    });
});
