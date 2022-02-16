import { alphabetTemplate } from '@app/alphabet-template';
import { Letter } from '@app/letter';
import { Message } from '@app/message';
import { DictionnaryService } from '@app/services/dictionnary.service';
import { assert } from 'chai';
import * as sinon from 'sinon';
import { Game, MAIN_PLAYER, OTHER_PLAYER } from './game';
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
            { name: 'Bob', id: '0', connected: true },
            { name: 'notBob', id: '1', connected: true },
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
        const letters = game.reserve.letterRacks[0][0].name.toLowerCase() + game.reserve.letterRacks[0][3].name.toLowerCase();
        // eslint-disable-next-line dot-notation
        game['isPlayer0Turn'] = true;
        game.changeLetters(letters, game.players[0].id);
        assert(stub.calledWith(game.players[0].id, game.reserve.letterRacks[0]));
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

    it('should place letters', async () => {
        const stub = sinon.stub();
        const position = 'h7h';
        game.reserve.letterRacks[0].push({ id: 0, name: 'T', score: 1, quantity: 0 } as Letter);
        game.reserve.letterRacks[0].push({ id: 0, name: 'E', score: 1, quantity: 0 } as Letter);
        game.reserve.letterRacks[0].push({ id: 0, name: 'S', score: 1, quantity: 0 } as Letter);
        game.reserve.letterRacks[0].push({ id: 0, name: 'T', score: 1, quantity: 0 } as Letter);
        const letters = 'test';
        game.eventEmitter.on('score', stub);
        // eslint-disable-next-line dot-notation
        game['isPlayer0Turn'] = true;
        await game.placeLetters(letters, position, game.players[0].id);
        assert(stub.called);
        assert(stubError.notCalled);
    });

    it('should output an error when not placing letters', async () => {
        const stub = sinon.stub();
        const position = 'h7h';
        const letters = 'testaaaaaaaaaaa';
        game.eventEmitter.on('score', stub);
        // eslint-disable-next-line dot-notation
        game['isPlayer0Turn'] = true;
        await game.placeLetters(letters, position, '0');
        assert(stub.notCalled);
        assert(stubError.called);
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
    it('Skipping 6 turns in a row should call endGame', () => {
        // eslint-disable-next-line dot-notation
        game['skipCounter'] = 5;
        const endGame = sinon.spy(game, 'endGame');
        game.updateSkipCounter(true);
        assert(endGame.called);
    });
    it('updating the skipCouter after a valid command should reset the counter', () => {
        game.updateSkipCounter(false);
        // eslint-disable-next-line dot-notation
        assert(game['skipCounter'] === 0);
    });
    it('endGame should call calculateFinalScore, createGameSummaryMessage, getWinner', () => {
        const calculateFinalScores = sinon.spy(game.endGameService, 'calculateFinalScores');
        const createGameSummaryMessage = sinon.spy(game.endGameService, 'createGameSummaryMessage');
        const getWinner = sinon.spy(game, 'getWinner');
        game.endGame();
        assert(calculateFinalScores.called);
        assert(createGameSummaryMessage.called);
        assert(getWinner.called);
    });
    it('getWinner should return the winners id', () => {
        const mainPlayer = game.players[MAIN_PLAYER];
        const otherPlayer = game.players[OTHER_PLAYER];
        const mainPlayerScore = 20;
        const otherPlayerScore = 10;
        const result1 = game.getWinner([mainPlayerScore, otherPlayerScore]);
        assert(result1 === mainPlayer);

        const result2 = game.getWinner([otherPlayerScore, mainPlayerScore]);
        assert(result2 === otherPlayer);
    });
    it('getWinner should return a player with an id called equalScore if its a tie', () => {
        const score = 20;
        const result1 = game.getWinner([score, score]);
        assert(result1.id === 'equalScore');
    });
    it('empty reserve and empty rack should trigger endGame', async () => {
        const endGame = sinon.stub(game, 'endGame');
        // eslint-disable-next-line dot-notation
        game.reserve.drawLetters(game.reserve['reserve'].length);
        game.reserve.letterRacks[MAIN_PLAYER] = [alphabetTemplate[0], alphabetTemplate[11], alphabetTemplate[11], alphabetTemplate[14]];
        // eslint-disable-next-line dot-notation
        game['isPlayer0Turn'] = true;
        await game.placeLetters('allo', 'h7h', game.players[MAIN_PLAYER].id);
        assert(endGame.called);
    });

    it('Reserve of less than 7 shouldnt allow letter exchanges', async () => {
        const endGame = sinon.stub(game, 'endGame');

        const remainingLettersInReserve = 4;
        // eslint-disable-next-line dot-notation
        game.reserve.drawLetters(game.reserve['reserve'].length - remainingLettersInReserve);
        game.reserve.letterRacks[MAIN_PLAYER] = [alphabetTemplate[0], alphabetTemplate[11], alphabetTemplate[11], alphabetTemplate[14]];
        // eslint-disable-next-line dot-notation
        game['isPlayer0Turn'] = true;
        game.changeLetters('allo', game.players[MAIN_PLAYER].id);
        assert(endGame.called);
    });

    it('should calulate the final scores when the mainPlayer rack is empty', () => {
        const scoreMainPlayer = 10;
        const scoreOtherPlayer = 20;
        const scores = [scoreMainPlayer, scoreOtherPlayer];
        // eslint-disable-next-line dot-notation
        game.reserve.drawLetters(game.reserve['reserve'].length);
        game.reserve.letterRacks[MAIN_PLAYER].length = 0;
        const result = game.endGameService.calculateFinalScores(scores, game.reserve);
        assert(result);
    });
    it('should calulate the final scores when the otherPlayer rack is empty', () => {
        const scoreMainPlayer = 10;
        const scoreOtherPlayer = 20;
        const scores = [scoreMainPlayer, scoreOtherPlayer];
        // eslint-disable-next-line dot-notation
        game.reserve.drawLetters(game.reserve['reserve'].length);
        game.reserve.letterRacks[OTHER_PLAYER].length = 0;
        const result = game.endGameService.calculateFinalScores(scores, game.reserve);
        assert(result);
    });
});
