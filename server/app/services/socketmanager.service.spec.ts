import { Server } from 'app/server';
import * as sinon from 'sinon';
import { io as ioClient, Socket } from 'socket.io-client';
import { Container } from 'typedi';
import { SocketManager } from './socketmanager.service';

// const RESPONSE_DELAY = 200;
describe('SocketManager service tests', () => {
    let service: SocketManager;
    let server: Server;
    let clientSocket: Socket;

    const urlString = 'http://localhost:3000';
    beforeEach(async () => {
        server = Container.get(Server);
        server.init();
        // eslint-disable-next-line dot-notation
        service = server['socketManager'];
        clientSocket = ioClient(urlString);
    });

    afterEach(() => {
        clientSocket.close();
        // eslint-disable-next-line dot-notation
        service['io'].close();
        sinon.restore();
    });

    /* it('should join a room', (done) => {
        clientSocket.emit('join', room);
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


    it('should stop broadcast rooms when room is joined', (done) => {
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
    });*/
});
