import { alphabetTemplate } from '@app/alphabet-template';
import { Letter } from '@app/letter';
import { Message } from '@app/message';
import { DictionnaryService } from '@app/services/dictionnary.service';
import { assert, expect } from 'chai';
import * as sinon from 'sinon';
import { Game, MAIN_PLAYER, OTHER_PLAYER } from './game';
import { Parameters } from './parameters';
import { Player } from './room';

/* eslint-disable dot-notation */

const RESPONSE_DELAY = 400;
const HALF_LENGTH = 7;
const BOARD_LENGTH = 15;

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
            assert(game['messages'][0] === message);
            done();
        }, RESPONSE_DELAY);
    });

    it('should change letters', (done) => {
        const stub = sinon.stub();
        game.eventEmitter.on('rack', stub);
        const letters = game.reserve.letterRacks[0][0].name.toLowerCase() + game.reserve.letterRacks[0][3].name.toLowerCase();
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
        game['isPlayer0Turn'] = true;
        game.changeLetters(letters, '1');
        assert(stub.notCalled);
        assert(stubError.called);
        done();
    });

    it('should place letters', async () => {
        const stubScore = sinon.stub();
        const stubValidCommand = sinon.stub();
        const stubReserve = sinon.stub();
        const stubBoard = sinon.stub();

        game.eventEmitter.on('score', stubScore);
        game.eventEmitter.on('valid-command', stubValidCommand);
        game.eventEmitter.on('reserve', stubReserve);
        game.eventEmitter.on('board', stubBoard);
        const row = 7;
        const col = 6;
        const isHorizontal = true;
        game.reserve.letterRacks[0].push({ id: 0, name: 'T', score: 1, quantity: 0 } as Letter);
        game.reserve.letterRacks[0].push({ id: 0, name: 'E', score: 1, quantity: 0 } as Letter);
        game.reserve.letterRacks[0].push({ id: 0, name: 'S', score: 1, quantity: 0 } as Letter);
        game.reserve.letterRacks[0].push({ id: 0, name: 'T', score: 1, quantity: 0 } as Letter);
        const letters = 'test';
        game['isPlayer0Turn'] = true;
        try{
            await game.placeLetters(letters, row, col, game.players[0].id, isHorizontal);
        } catch (e) {
            console.log(e);
        }
        assert(stubScore.called);
        assert(stubValidCommand.called);
        assert(stubReserve.called);
        assert(stubBoard.called);
        assert(stubError.notCalled);
    });

    it('should not place letters when it is not your turn', async () => {
        const letters = 'test';
        const row = 7;
        const col = 6;
        const isHorizontal = true;
        game['isPlayer0Turn'] = false;
        const stubValidCommand = sinon.stub();
        game.eventEmitter.on('valid-command', stubValidCommand);

        await game.placeLetters(letters, row, col, game.players[0].id, isHorizontal);

        assert(stubValidCommand.notCalled);
        assert(stubError.called);
    });

    it('should output an error when not placing letters', async () => {
        const stub = sinon.stub();
        const row = 7;
        const col = 6;
        const isHorizontal = true;
        const letters = 'testaaaaaaaaaaa';
        game.eventEmitter.on('score', stub);
        game['isPlayer0Turn'] = true;
        await game.placeLetters(letters, row, col, game.players[0].id, isHorizontal);
        assert(stub.notCalled);
        assert(stubError.called);
    });

    it('should not place letters if it is not your turn', (done) => {
        const stub = sinon.stub();
        const row = 7;
        const col = 6;
        const isHorizontal = true;
        const letters = 'test';
        game.eventEmitter.on('placed', stub);
        // eslint-disable-next-line dot-notation
        game['isPlayer0Turn'] = true;
        game.placeLetters(letters, row, col, game.players[1].id, isHorizontal);
        assert(stub.notCalled);
        assert(stubError.called);
        done();
    });

    it('should check turn of player', (done) => {
        game['isPlayer0Turn'] = true;
        game['checkTurn']('0');
        assert(stubError.notCalled);
        assert(game['isPlayer0Turn']);
        game['checkTurn']('1');
        assert(stubError.called);
        done();
    });

    it('should skip turn', (done) => {
        game['isPlayer0Turn'] = true;
        game.skipTurn(game.players[0].id, true);
        assert(!game['isPlayer0Turn']);
        game.skipTurn(game.players[1].id, true);
        assert(game['isPlayer0Turn']);
        assert(stubError.notCalled);
        done();
    });

    it('should not skip turn if it is not your turn', (done) => {
        game['isPlayer0Turn'] = true;
        game.skipTurn(game.players[1].id, true);
        assert(game['isPlayer0Turn']);
        assert(stubError.called);
        done();
    });

    it('Skipping 6 turns in a row should call endGame', () => {
        game['skipCounter'] = 5;
        const endGame = sinon.spy(game, 'endGame');
        game.updateSkipCounter(true);
        assert(endGame.called);
    });

    it('updating the skipCouter after a valid command should reset the counter', () => {
        game.updateSkipCounter(false);
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
        const row = 7;
        const col = 6;
        const isHorizontal = true;
        const endGame = sinon.stub(game, 'endGame');
        game.reserve.drawLetters(game.reserve['reserve'].length);
        game.reserve.letterRacks[MAIN_PLAYER] = [alphabetTemplate[0], alphabetTemplate[11], alphabetTemplate[11], alphabetTemplate[14]];
        game['isPlayer0Turn'] = true;
        await game.placeLetters('allo', row, col, game.players[MAIN_PLAYER].id, isHorizontal);
        assert(endGame.called);
    });

    it('Reserve of less than 7 shouldnt allow letter exchanges', async () => {
        const remainingLettersInReserve = 4;
        game.reserve.drawLetters(game.reserve['reserve'].length - remainingLettersInReserve);
        game.reserve.letterRacks[MAIN_PLAYER] = [alphabetTemplate[0], alphabetTemplate[11], alphabetTemplate[11], alphabetTemplate[14]];
        game['isPlayer0Turn'] = true;
        game.changeLetters('allo', game.players[MAIN_PLAYER].id);
        assert(stubError.called);
    });

    it('should calulate the final scores when the mainPlayer rack is empty', () => {
        const scoreMainPlayer = 10;
        const scoreOtherPlayer = 20;
        const scores = [scoreMainPlayer, scoreOtherPlayer];
        game.reserve.drawLetters(game.reserve['reserve'].length);
        game.reserve.letterRacks[MAIN_PLAYER].length = 0;
        const result = game.endGameService.calculateFinalScores(scores, game.reserve);
        assert(result);
    });

    it('should calulate the final scores when the otherPlayer rack is empty', () => {
        const scoreMainPlayer = 10;
        const scoreOtherPlayer = 20;
        const scores = [scoreMainPlayer, scoreOtherPlayer];
        game.reserve.drawLetters(game.reserve['reserve'].length);
        game.reserve.letterRacks[OTHER_PLAYER].length = 0;
        const result = game.endGameService.calculateFinalScores(scores, game.reserve);
        assert(result);
    });

    it('should send the players rack', (done) => {
        const stub = sinon.stub();
        game.eventEmitter.on('rack', stub);

        game['sendRack']();
        assert(stub.called);
        done();
    });

    it('should forfeit the game', (done) => {
        const stub = sinon.stub();
        game.eventEmitter.on('forfeit', stub);

        game.forfeit(game.players[0].id);
        assert(stub.calledWith(game.players[0].id));
        done();
    });

    it('should initialise a game', (done) => {
        const stubBoard = sinon.stub();
        game.eventEmitter.on('board', stubBoard);
        const stubRack = sinon.stub();
        game.eventEmitter.on('rack', stubRack);
        const stubTurn = sinon.stub();
        game.eventEmitter.on('turn', stubTurn);
        const stubPlayers = sinon.stub();
        game.eventEmitter.on('players', stubPlayers);
        const stubReserve = sinon.stub();
        game.eventEmitter.on('reserve', stubReserve);

        game['isPlayer0Turn'] = true;
        game.gameInit();

        assert(stubBoard.called);
        assert(stubRack.calledTwice);
        assert(stubTurn.calledWith(game.players[0].id));
        assert(stubReserve.calledWith(game.reserve.getCount()));

        done();
    });

    it('should get the name of the player', (done) => {
        game['isPlayer0Turn'] = true;
        expect(game.getPlayerName()).to.equal(game.players[0].name);

        game['isPlayer0Turn'] = false;
        expect(game.getPlayerName()).to.equal(game.players[1].name);
        done();
    });

    it('should get the id of the player', (done) => {
        game['isPlayer0Turn'] = true;
        expect(game['getPlayerId'](true)).to.equal(game.players[0].id);

        expect(game['getPlayerId'](false)).to.equal(game.players[1].id);
        done();
    });

    it('should get reserve called', (done) => {
        const stub = sinon.stub();
        game.eventEmitter.on('reserve', stub);

        const count = game.reserve.getCount();
        game.getReserveCount();
        assert(stub.calledWith(count));
        done();
    });

    it('should get formatted board', (done) => {
        game.board.board[HALF_LENGTH][HALF_LENGTH].setLetter('a');
        const expectedLetter = { id: 1, name: 'A', score: 1, quantity: 9 };
        const formattedBoard = game['formatSendableBoard']();
        for (let i = 0; i < BOARD_LENGTH; i++) {
            for (let j = 0; j < BOARD_LENGTH; j++) {
                if (i === HALF_LENGTH && j === HALF_LENGTH) {
                    expect(formattedBoard[i][j] === expectedLetter);
                } else {
                    assert(formattedBoard[i][j] === undefined);
                }
            }
        }
        done();
    });
});
