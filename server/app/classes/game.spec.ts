import { Message } from '@app/message';
import { assert } from 'chai';
import * as sinon from 'sinon';
import { Game } from './game';
import { Parameters } from './parameters';
import { Player } from './room';

const RESPONSE_DELAY = 400;

describe('Game', () => {
    let players: Player[];
    let parameters: Parameters;
    let game: Game;

    beforeEach(async () => {
        players = [
            { name: 'Bob', id: '0' },
            { name: 'notBob', id: '1' },
        ];
        parameters = new Parameters();
        game = new Game(0, players, parameters);
    });

    afterEach(() => {
        sinon.restore();
    });

    it('should get a message and broadcast it', (done) => {
        const stub = sinon.stub();
        const message: Message = { text: 'test message', emitter: players[0].id };
        game.eventEmitter.on('message', stub);
        game.sendMessage(message);
        setTimeout(() => {
            assert(stub.calledWith(message));
            // eslint-disable-next-line dot-notation
            assert(game['messages'][0] === message);
            done();
        }, RESPONSE_DELAY);
    });

    it('should get parameters', (done) => {
        const stub = sinon.stub();
        game.eventEmitter.on('parameters', stub);
        game.getParameters();
        setTimeout(() => {
            assert(stub.calledWith(parameters));
            done();
        }, RESPONSE_DELAY);
    });
});
