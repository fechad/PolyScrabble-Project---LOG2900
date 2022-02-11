import { Parameters } from '@app/classes/parameters';
import { PlayerId, Room } from '@app/classes/room';
import { Message } from '@app/message';
import { RoomsService } from '@app/services/rooms.service';
import { ROOMS_LIST_UPDATE_TIMEOUT } from '@app/services/waiting-room.service';
import { Server } from 'app/server';
import { assert, expect } from 'chai';
import * as sinon from 'sinon';
import { io as ioClient, Socket } from 'socket.io-client';
import { Container } from 'typedi';
import { SocketManager } from './socket.controller';

const RESPONSE_DELAY = 100;

async function waitForCommunication(time: number): Promise<void> {
    return new Promise((resolve) => {
        setTimeout(() => resolve(), time);
    });
}

describe('SocketManager service tests', () => {
    let service: SocketManager;
    let server: Server;
    let playersSocket: Socket[];
    let broadcastSocket: Socket;
    const identifiers: { id: PlayerId; token: number }[] = [];

    const urlString = 'http://localhost:3000';
    beforeEach(async () => {
        server = Container.get(Server);
        Container.get(RoomsService).rooms.splice(0);
        server.init();
        // eslint-disable-next-line dot-notation
        service = server['socketManager'];
        service.games.splice(0);
        service['logins']['users'] = {};
        playersSocket = [ioClient(`${urlString}/`, { forceNew: true }), ioClient(`${urlString}/`, { forceNew: true })];
        broadcastSocket = ioClient(`${urlString}/waitingRoom`, { forceNew: true });
        for (let i = 0; i < 2; i++) {
            playersSocket[i].on('id', (id, token) => {
                identifiers[i] = { id, token };
            });
        }
        // wait for connections
        for (const socket of [broadcastSocket, ...playersSocket]) {
            if (!socket.connected) {
                await new Promise((resolve) => {
                    socket.once('connect', () => resolve(undefined));
                });
            }
        }
    });

    afterEach(() => {
        playersSocket.forEach((socket) => socket.close());
        broadcastSocket.close();
        // eslint-disable-next-line dot-notation
        service['io'].close();
        sinon.restore();
    });

    it('should broadcast available rooms on connect', async () => {
        const stub = sinon.stub();
        broadcastSocket.disconnect();
        broadcastSocket.on('broadcast-rooms', stub);
        broadcastSocket.connect();
        await waitForCommunication(ROOMS_LIST_UPDATE_TIMEOUT + RESPONSE_DELAY);
        expect(stub.callCount).to.equal(1);
        assert(stub.alwaysCalledWith([]));
    });

    it('should create a room', async () => {
        const stub = sinon.stub();
        broadcastSocket.on('broadcast-rooms', stub);
        const parameters = new Parameters();
        playersSocket[0].emit('create-room', 'Dummy', parameters);
        const expectedRoom = new Room(0, playersSocket[0].id, 'Dummy', parameters);
        const expectedRoomSerialized = JSON.parse(JSON.stringify(expectedRoom));
        await waitForCommunication(ROOMS_LIST_UPDATE_TIMEOUT + RESPONSE_DELAY);
        expect(stub.args).to.deep.equal([[[expectedRoomSerialized]]]);
    });

    it('should join a room', async () => {
        const stub = sinon.stub();
        broadcastSocket.on('broadcast-rooms', stub);
        const parameters = new Parameters();
        playersSocket[0].emit('create-room', 'Dummy', parameters);
        const expectedRoom = new Room(0, playersSocket[0].id, 'Dummy', parameters);
        const expectedRoomSerialized = JSON.parse(JSON.stringify(expectedRoom));
        await waitForCommunication(ROOMS_LIST_UPDATE_TIMEOUT + RESPONSE_DELAY);
        expect(stub.args).to.deep.equal([[[expectedRoomSerialized]]]);

        const stub2 = sinon.stub();
        playersSocket[1].on('join', stub2);
        playersSocket[1].emit('join-room', 0);
        await waitForCommunication(RESPONSE_DELAY);
        assert(stub2.calledWith(0));
    });

    it('should not display full rooms', async () => {
        let full = false;
        let connected = false;
        const parameters = new Parameters();
        playersSocket[0].emit('create-room', 'Dummy', parameters);
        broadcastSocket.on('broadcast-rooms', (rooms) => {
            const empty = rooms.length === 0;
            assert(full === empty || (connected && !empty));
        });
        await waitForCommunication(ROOMS_LIST_UPDATE_TIMEOUT + RESPONSE_DELAY);
        connected = true;
        playersSocket[1].on('join', () => { full = true; });
        playersSocket[1].emit('join-room', 0);
        await waitForCommunication(ROOMS_LIST_UPDATE_TIMEOUT + RESPONSE_DELAY);
        await waitForCommunication(ROOMS_LIST_UPDATE_TIMEOUT + RESPONSE_DELAY);
    });

    it('should return an error if room does not exist', async () => {
        const stub = sinon.stub();
        await waitForCommunication(RESPONSE_DELAY);
        playersSocket[0].on('error', stub);
        playersSocket[0].emit('join-room', 0);
        await waitForCommunication(RESPONSE_DELAY);
        expect(stub.args).to.deep.equal([['Room is no longer available']]);
    });

    it('should return an error if an error is created in room', async () => {
        playersSocket.push(ioClient(`${urlString}/`, { forceNew: true }));
        const stub = sinon.stub();
        const parameters = new Parameters();
        playersSocket[0].emit('create-room', 'Dummy', parameters);
        new Room(0, playersSocket[0].id, 'Dummy', parameters);
        await waitForCommunication(RESPONSE_DELAY);
        playersSocket[1].on('join', stub);
        playersSocket[1].emit('join-room', 0);
        await waitForCommunication(RESPONSE_DELAY);
        assert(stub.calledWith(0));

        const stub2 = sinon.stub();
        playersSocket[2].on('error', stub2);
        playersSocket[2].emit('join-room', 0);
        await waitForCommunication(RESPONSE_DELAY);
        assert(stub2.calledWith('already 2 players in the game'));
    });

    async function createRoom(): Promise<[Socket, Socket]> {
        const stub = sinon.stub();
        playersSocket[0].on('join', stub);
        const parameters = new Parameters();
        playersSocket[0].emit('create-room', 'Dummy', parameters);
        await waitForCommunication(RESPONSE_DELAY);
        expect(stub.args).to.deep.equal([[0]]);

        const stub2 = sinon.stub();
        playersSocket[1].on('join', stub2);
        playersSocket[1].emit('join-room', 0, 'NotDummy');

        const roomSocket = ioClient(`${urlString}/rooms/0`, { auth: identifiers[0], forceNew: true });
        roomSocket.on('join-game', stub);
        await waitForCommunication(RESPONSE_DELAY);
        expect(stub2.args).to.deep.equal([[0]]);

        const roomSocket2 = ioClient(`${urlString}/rooms/0`, { auth: identifiers[1], forceNew: true });
        roomSocket2.on('join-game', stub);

        return [roomSocket, roomSocket2];
    }

    it('should create a game', async () => {
        const [roomSocket, _roomSocket2] = await createRoom();
        expect(service.roomsService.rooms.length).to.equal(1);
        roomSocket.emit('start');
        await waitForCommunication(RESPONSE_DELAY);
        expect(service.roomsService.rooms[0].isStarted()).to.equal(true);
        expect(service.games.length).to.equal(1);
    });

    async function joinGame(): Promise<[Socket, Socket, Socket, Socket]> {
        const [roomSocket, roomSocket2] = await createRoom();
        
        roomSocket.emit('start');
        await waitForCommunication(RESPONSE_DELAY);
        expect(service.games.length).to.equal(1);

        const gameSocket = ioClient(`${urlString}/games/0`, { auth: identifiers[0], forceNew: true });
        const gameSocket2 = ioClient(`${urlString}/games/0`, { auth: identifiers[1], forceNew: true });
        await waitForCommunication(RESPONSE_DELAY);
        service.games[0]['isPlayer0Turn'] = true;
        
        return [roomSocket, roomSocket2, gameSocket, gameSocket2];
    }

    it('should send and receive a message in game', async () => {
        const message: Message = { text: 'this is a test message', emitter: identifiers[0].id };

        const [_roomSocket, _roomSocket2, gameSocket, gameSocket2] = await joinGame();
        const stub = sinon.stub();
        const stub2 = sinon.stub();
        gameSocket.on('message', stub);
        gameSocket2.on('message', stub2);
        gameSocket.emit('message', message.text);
        await waitForCommunication(RESPONSE_DELAY * 2);

        expect(service.games[0].messages).to.deep.equal([message], 'Did not register message');
        expect(stub.args).to.deep.equal([[message]], 'Did not send the messages to player 1');
        expect(stub2.args).to.deep.equal([[message]], 'Did not send the messages to player 2');
    });

    it('should skip turn', async () => {
        const [_roomSocket, _roomSocket2, gameSocket, gameSocket2] = await joinGame();
        
        const stub = sinon.stub();
        const stub2 = sinon.stub();
        gameSocket.on('turn', stub);
        gameSocket2.on('turn', stub2);
        gameSocket.emit('switch-turn');
        await waitForCommunication(RESPONSE_DELAY);
        // eslint-disable-next-line dot-notation
        assert(!service.games[0]['isPlayer0Turn'], 'wrong turn');
        expect(stub.args).to.deep.equal([[identifiers[1].id]], 'did not send right idents for player 1');
        expect(stub2.args).to.deep.equal([[identifiers[1].id]], 'did not send right idents for player 2');
    });

    it('should send an error on wrong player skipping turn', async () => {
        const [_roomSocket, _roomSocket2, gameSocket, gameSocket2] = await joinGame();

        const stub = sinon.stub();
        const stub2 = sinon.stub();
        const stub3 = sinon.stub();
        gameSocket2.on('game-error', stub);
        gameSocket.on('turn', stub2);
        gameSocket2.on('turn', stub3);
        gameSocket2.emit('switch-turn');
        await waitForCommunication(RESPONSE_DELAY);
        assert(stub.called, 'not called error');
        assert(service.games[0]['isPlayer0Turn'], 'wrong turn');
        assert(stub2.notCalled, 'did not call turn');
        assert(stub3.notCalled, 'did not call turn for other player');
    });

    it('should change letters', async () => {
        const letters = 'abcd';
        
        const [_roomSocket, _roomSocket2, gameSocket, gameSocket2] = await joinGame();
        const stub = sinon.stub();
        const stub2 = sinon.stub();
        gameSocket.on('rack', stub);
        gameSocket2.on('rack', stub2);
        gameSocket.emit('change-letters', letters);
        await waitForCommunication(RESPONSE_DELAY);
        // TODO: adapter avec integration service
        expect(stub.args).to.deep.equal([[letters]]);
        assert(stub2.notCalled);
    });

    it('should place letters', async () => {
        const letters = 'test';
        const position = 'h7h';
        const expectedPoints = 6;

        const [_roomSocket, _roomSocket2, gameSocket, gameSocket2] = await joinGame();

        const stub = sinon.stub();
        const stub2 = sinon.stub();
        gameSocket.on('score', stub);
        gameSocket2.on('score', stub2);
        gameSocket.emit('place-letters', letters, position);
        await waitForCommunication(RESPONSE_DELAY);
        // TODO: adapter avec integration validation mots et calcul de points
        expect(stub.args).to.deep.equal([[expectedPoints, identifiers[0].id]]);
        expect(stub2.args).to.deep.equal([[expectedPoints, identifiers[0].id]]);
    });

    // TODO add tests
});
