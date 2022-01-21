import { Server } from 'app/server';
import { assert, expect } from 'chai';
import * as sinon from 'sinon';
import { io as ioClient, Socket } from 'socket.io-client';
import { Container } from 'typedi';
import { SocketManager } from './socketmanager.service';

const RESPONSE_DELAY = 200;
describe('SocketManager service tests', () => {
    let service: SocketManager;
    let server: Server;
    let clientSocket: Socket;

    const urlString = 'http://localhost:3000';
    beforeEach(async () => {
        server = Container.get(Server);
        server.init();
        service = server['socketManager'];
        clientSocket = ioClient(urlString);
    });

    afterEach(() => {
        clientSocket.close();
        service['io'].close();
        sinon.restore();
    });

    it('should handle a message event print it to console', (done) => {
        const spy = sinon.spy(console, 'log');
        const testMessage = 'Hello World';
        clientSocket.emit('message', testMessage);
        setTimeout(() => {
            assert(spy.called);
            assert(spy.calledWith(testMessage));
            done();
        }, RESPONSE_DELAY);
    });

    it('should handle a validate event and return true if word if longer than 5 letters', (done) => {
        const testMessage = 'Hello World';
        clientSocket.emit('validate', testMessage);
        clientSocket.on('wordValidated', (result: boolean) => {
            // eslint-disable-next-line no-unused-expressions,@typescript-eslint/no-unused-expressions
            expect(result).to.be.true;
            done();
        });
    });

    it('should handle a validate event and return false if word if less than 5 letters', (done) => {
        const testMessage = 'Hello';
        clientSocket.emit('validate', testMessage);
        clientSocket.on('wordValidated', (result: boolean) => {
            // eslint-disable-next-line no-unused-expressions,@typescript-eslint/no-unused-expressions
            expect(result).to.be.false;
            done();
        });
    });

    it('should broadcast message to multiple clients on broadcastAll event', (done) => {
        const clientSocket2 = ioClient(urlString);
        const testMessage = 'Hello World';
        const spy = sinon.spy(service['io'].sockets, 'emit');

        clientSocket2.on('massMessage', (message: string) => {
            expect(message).to.contain(testMessage);
            assert(spy.called);
            done();
        });
        clientSocket.emit('broadcastAll', testMessage);
    });
});
