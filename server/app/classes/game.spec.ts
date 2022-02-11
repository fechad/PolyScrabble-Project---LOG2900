import { Message } from '@app/message';
import { DictionnaryService } from '@app/services/dictionnary.service';
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
    let dictionnary: DictionnaryService;

    before(async () => {
        dictionnary = new DictionnaryService();
        await dictionnary.init();
    });

    beforeEach(() => {
        players = [
            { name: 'Bob', id: '0' },
            { name: 'notBob', id: '1' },
        ];
        parameters = new Parameters();
        game = new Game(0, players, parameters, dictionnary);
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

    it('should change letters', (done) => {
        const stub = sinon.stub();
        game.eventEmitter.on('rack', stub);
        const letters = 'abcd';
        // eslint-disable-next-line dot-notation
        game['isPlayer0Turn'] = true;
        game.changeLetters(letters, '0');
        assert(stub.calledWith('0', letters));
        assert(stubError.notCalled);
        done();
    });

    it('should not change letters when it is not your turn', (done) => {
        const stub = sinon.stub();
        game.eventEmitter.on('rack', stub);
        const letters = 'abcd';
        // eslint-disable-next-line dot-notation
        game['isPlayer0Turn'] = true;
        game.changeLetters(letters, '1');
        assert(stub.notCalled);
        assert(stubError.called);
        done();
    });

    it('should place letters', (done) => {
        const stub = sinon.stub();
        const position = 'h7h';
        const letters = 'test';
        game.eventEmitter.on('score', stub);
        // eslint-disable-next-line dot-notation
        game['isPlayer0Turn'] = true;
        game.placeLetters(letters, position, '0');
        assert(stub.called);
        assert(stubError.notCalled);
        done();
    });

    it('should not place letters if it is not your turn', (done) => {
        const stub = sinon.stub();
        const position = 'h7h';
        const letters = 'test';
        game.eventEmitter.on('placed', stub);
        // eslint-disable-next-line dot-notation
        game['isPlayer0Turn'] = true;
        game.placeLetters(letters, position, '1');
        assert(stub.notCalled);
        assert(stubError.called);
        done();
    });

    it('should check turn of player', (done) => {
        // eslint-disable-next-line dot-notation
        game['isPlayer0Turn'] = true;
        // eslint-disable-next-line dot-notation
        game['checkTurn']('0');
        assert(stubError.notCalled);
        // eslint-disable-next-line dot-notation
        assert(game['isPlayer0Turn']);
        // eslint-disable-next-line dot-notation
        game['checkTurn']('1');
        assert(stubError.called);
        done();
    });

    it('should skip turn', (done) => {
        // eslint-disable-next-line dot-notation
        game['isPlayer0Turn'] = true;
        game.skipTurn(game.players[0].id);
        // eslint-disable-next-line dot-notation
        assert(!game['isPlayer0Turn']);
        game.skipTurn(game.players[1].id);
        // eslint-disable-next-line dot-notation
        assert(game['isPlayer0Turn']);
        assert(stubError.notCalled);
        done();
    });

    it('should not skip turn if it is not your turn', (done) => {
        // eslint-disable-next-line dot-notation
        game['isPlayer0Turn'] = true;
        game.skipTurn(game.players[1].id);
        // eslint-disable-next-line dot-notation
        assert(game['isPlayer0Turn']);
        assert(stubError.called);
        done();
    });
});
