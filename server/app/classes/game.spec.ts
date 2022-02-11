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
    let stubError: sinon.SinonStub;

    beforeEach(async () => {
        players = [
            { name: 'Bob', id: '0' },
            { name: 'notBob', id: '1' },
        ];
        parameters = new Parameters();
        game = new Game(0, players, parameters);
        stubError = sinon.stub();
        game.eventEmitter.on('game-error', stubError);
    });

    afterEach(() => {
        sinon.restore();
    });

    it('should get a message and broadcast it', (done) => {
        const stub = sinon.stub();
        const message: Message = { text: 'test message', emitter: '0' };
        game.eventEmitter.on('message', stub);
        game.message(message);
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

    it('should change letters', (done) => {
        const stub = sinon.stub();
        game.eventEmitter.on('rack', stub);
        const letters = 'abcd';
        // eslint-disable-next-line dot-notation
        assert(game['isPlayer0Turn']);
        game.changeLetters(letters, '0');
        assert(stub.calledWith(letters, '0'));
        assert(stubError.notCalled);
        done();
    });

    it('should not change letters when it is not your turn', (done) => {
        const stub = sinon.stub();
        game.eventEmitter.on('rack', stub);
        const letters = 'abcd';
        // eslint-disable-next-line dot-notation
        assert(game['isPlayer0Turn']);
        game.changeLetters(letters, '1');
        assert(stub.notCalled);
        assert(stubError.called);
        done();
    });

    it('should place letters', (done) => {
        const stub = sinon.stub();
        const expectedPoints = 26;
        const position = 'c8h';
        const letters = 'abcd';
        game.eventEmitter.on('placed', stub);
        // eslint-disable-next-line dot-notation
        assert(game['isPlayer0Turn']);
        game.placeLetters(letters, position, '0');
        assert(stub.calledWith(letters, position, expectedPoints, '0'));
        assert(stubError.notCalled);
        done();
    });

    it('should not place letters if it is not your turn', (done) => {
        const stub = sinon.stub();
        const position = 'c8h';
        const letters = 'abcd';
        game.eventEmitter.on('placed', stub);
        // eslint-disable-next-line dot-notation
        assert(game['isPlayer0Turn']);
        game.placeLetters(letters, position, '1');
        assert(stub.notCalled);
        assert(stubError.called);
        done();
    });

    it('should check turn of player', (done) => {
        // eslint-disable-next-line dot-notation
        assert(game['isPlayer0Turn']);
        // eslint-disable-next-line dot-notation
        game['checkTurn']('0', false);
        assert(stubError.notCalled);
        // eslint-disable-next-line dot-notation
        assert(game['isPlayer0Turn']);
        // eslint-disable-next-line dot-notation
        game['checkTurn']('1', false);
        assert(stubError.called);
        done();
    });

    it('should skip turn', (done) => {
        // eslint-disable-next-line dot-notation
        assert(game['isPlayer0Turn']);
        game.skipTurn(game.players[0].id, false);
        // eslint-disable-next-line dot-notation
        assert(!game['isPlayer0Turn']);
        game.skipTurn(game.players[1].id, false);
        // eslint-disable-next-line dot-notation
        assert(game['isPlayer0Turn']);
        assert(stubError.notCalled);
        done();
    });

    it('should not skip turn if it is not your turn', (done) => {
        // eslint-disable-next-line dot-notation
        assert(game['isPlayer0Turn']);
        game.skipTurn(game.players[1].id, false);
        // eslint-disable-next-line dot-notation
        assert(game['isPlayer0Turn']);
        assert(stubError.called);
        done();
    });
});
