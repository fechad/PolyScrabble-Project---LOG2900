import { Server } from 'app/server';
import { assert } from 'chai';
import * as sinon from 'sinon';
import { io as ioClient, Socket } from 'socket.io-client';
import { Container } from 'typedi';
import { Parameters } from './parameters';
import { Room } from './connection';
import { SocketManager } from '../services/socketmanager.service';

const RESPONSE_DELAY = 200;
describe('SocketManager service tests', () => {
    let parameters : Parameters;
    let service: SocketManager;
    let server: Server;
    let room: Room;
    let clientSocket: Socket;

    const urlString = 'http://localhost:3000';
    beforeEach(async () => {
        server = Container.get(Server);
        server.init();
        service = server['socketManager'];
        service.init();
        clientSocket = ioClient(urlString);
        parameters = new Parameters();
        const roomName = 'helloWorld';
        room = {name: roomName, parameters : parameters};
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
        }, RESPONSE_DELAY);
    });

    it('should broadcast rooms more than once', (done) => {
        let counter = 0;
        clientSocket.on('rooms', (result: boolean) => {
            counter ++;
            if(counter >= 4){
                done();
            }
        });
    });


    //TODO: fix test
    it('should stop broadcast rooms when room is joined', (done) => {
        let called = false;
        clientSocket.on('rooms', () => {
            console.log(`called: ${called}`)
            if(!called){
                clientSocket.emit('joinRoom', room);
                called = true;
                setTimeout(() => done(), 1000);
            } else {
                assert(false);
            }
        });
    });
});
