import { MAIN_PLAYER, OTHER_PLAYER } from '@app/constants';
import { Message } from '@app/message';
import { DictionnaryService } from '@app/services/dictionnary.service';
import { GameHistoryService } from '@app/services/game-history-service';
import { assert, expect } from 'chai';
import * as sinon from 'sinon';
import { Container } from 'typedi';
import { EndGameCalculator } from './end-game-calculator';
import { Game } from './game';
import { Parameters } from './parameters';
import { Position } from './position';
import { Letter } from './reserve';
import { Player, Room } from './room';

/* eslint-disable dot-notation, @typescript-eslint/no-magic-numbers, max-lines */

const RESPONSE_DELAY = 400;
const HALF_LENGTH = 7;
const BOARD_LENGTH = 15;

describe('Game', () => {
    let players: Player[];
    let parameters: Parameters;
    let game: Game;
    let stubError: sinon.SinonStub;
    let dictionnary: DictionnaryService;
    let gameHistory: GameHistoryService;
    let stubSetTimeout: sinon.SinonStub;
    let stubClearTimeout: sinon.SinonStub;

    before(async () => {
        dictionnary = Container.get(DictionnaryService);
        await dictionnary.init();
        gameHistory = Container.get(GameHistoryService);
        await gameHistory.connect();
    });

    beforeEach(() => {
        players = [
            { avatar: 'a', name: 'Bob', id: '0', connected: true, virtual: false },
            { avatar: 'b', name: 'notBob', id: '1', connected: true, virtual: false },
        ];
        parameters = new Parameters();
        const room = new Room(0, players[0].id, players[0].name, parameters);
        room.addPlayer(players[1].id, players[1].name, false, 'a');
        stubSetTimeout = sinon.stub(global, 'setTimeout').returns(0 as unknown as NodeJS.Timeout);
        stubClearTimeout = sinon.stub(global, 'clearTimeout');
        game = new Game(room, dictionnary, gameHistory);
        stubError = sinon.stub();
        game.eventEmitter.on('game-error', stubError);
        game['isPlayer0Turn'] = true;
    });

    afterEach(() => {
        sinon.restore();
    });

    it('should exit with error if trying to create game with only one player', () => {
        const room = new Room(0, players[0].id, players[0].name, parameters);
        expect(() => new Game(room, dictionnary, gameHistory)).to.throw();
    });

    it('should get a message and broadcast it', (done) => {
        const stub = sinon.stub();
        const message: Message = { text: 'test message', emitter: '0' };
        game.eventEmitter.on('message', stub);
        game.message(message);
        stubSetTimeout.callThrough()(() => {
            assert(stub.calledWith(message));
            assert(game['messages'][0] === message);
            done();
        }, RESPONSE_DELAY);
    });

    it('should change letters', () => {
        const stub = sinon.stub();
        const before: Letter[] = game.reserve.letterRacks[0].slice();
        game.eventEmitter.on('rack', stub);
        const letters = [game.reserve.letterRacks[0][0].toLowerCase(), game.reserve.letterRacks[0][3].toLowerCase()];
        expect(stub.args).to.deep.equal([]);
        game.changeLetters(letters, game.players[0].id);
        const transform = (args: { name: string; score: number }[][][]) =>
            args.filter((call) => (call[0] as unknown as string) === game.players[0].id).map((call) => call[1].map((letter) => letter.name).sort());
        const out = transform(stub.args);
        expect(out.length).to.equal(1);
        before.forEach((letter, i) => {
            if (i === 0 || i === 3) return;
            expect(out[0]).to.include(letter);
        });
        assert(stubError.notCalled);
    });

    it('should error when trying to get unknown player', () => {
        expect(() => game.getPlayerInfo('unknown')).to.throw();
    });

    it('should not change letters when it is not your turn', () => {
        const stub = sinon.stub();
        game.eventEmitter.on('rack', stub);
        const letters = [...'abcd'];
        game.changeLetters(letters, '1');
        assert(stub.notCalled);
        assert(stubError.called);
    });

    it('should place letters', async () => {
        const stubValidCommand = sinon.stub();
        const stubState = sinon.stub();

        game.eventEmitter.on('message', stubValidCommand);
        game.eventEmitter.on('state', stubState);
        const row = 7;
        const col = 6;
        game.reserve.letterRacks[0].push(...'TEST');
        const letters = 'test';
        const promise = game.placeLetters(game.players[0].id, [...letters], new Position(row, col), true);
        expect(stubClearTimeout.callCount).to.equal(1);
        stubSetTimeout.args[stubSetTimeout.args.length - 1][0]();
        await promise;
        assert(stubValidCommand.called, 'Did not send message');
        assert(stubState.called, 'Did not update state');
        assert(stubError.notCalled, 'Errored');
    });

    it('should not place letters when it is not your turn', async () => {
        const letters = 'test';
        const row = 7;
        const col = 6;
        const isHorizontal = true;
        game['isPlayer0Turn'] = false;
        const stubValidCommand = sinon.stub();
        game.eventEmitter.on('valid-command', stubValidCommand);

        const promise = game.placeLetters(game.players[0].id, [...letters], new Position(row, col), isHorizontal);
        stubSetTimeout.args[stubSetTimeout.args.length - 1][0]();
        await promise;

        assert(stubValidCommand.notCalled);
        assert(stubError.called);
    });

    it('should output an error when not placing valid words', async () => {
        const stub = sinon.stub();
        const row = 7;
        const col = 6;
        const isHorizontal = true;
        const letters = [...'testz'];
        game.reserve.letterRacks[0].push(...'TESTZ');
        game.eventEmitter.on('score', stub);
        game['isPlayer0Turn'] = true;
        const promise = game.placeLetters(game.players[0].id, letters, new Position(row, col), isHorizontal);
        stubSetTimeout.args[stubSetTimeout.args.length - 1][0]();
        await promise;
        assert(stub.notCalled);
        expect(stubError.args).to.deep.equal([[game.players[0].id, 'Un des mots crees ne fait pas partie du dictionnaire testz']]);
    });

    it('should output an error when placing valid words that go outside the board', async () => {
        const stub = sinon.stub();
        const row = 7;
        const col = 6;
        const isHorizontal = true;
        const letters = [...'testaaaaaaaaaaa'];
        game.eventEmitter.on('score', stub);
        game['isPlayer0Turn'] = true;
        const promise = game.placeLetters(game.players[0].id, [...letters], new Position(row, col), isHorizontal);
        stubSetTimeout.args[stubSetTimeout.args.length - 1][0]();
        await promise;
        assert(stub.notCalled);
        expect(stubError.args).to.deep.equal([[game.players[0].id, 'Placement invalide: Le mot ne rentre pas dans la grille']]);
    });

    it('should output an error when placing outside the board', async () => {
        const stub = sinon.stub();
        const isHorizontal = true;
        const letters = [...'testaaaaaaaaaaa'];
        game.eventEmitter.on('score', stub);
        game['isPlayer0Turn'] = true;
        const promise = game.placeLetters(game.players[0].id, [...letters], new Position(80, 80), isHorizontal);
        stubSetTimeout.args[stubSetTimeout.args.length - 1][0]();
        await promise;
        assert(stub.notCalled);
        assert(stubError.called);
    });

    it('should not place letters if it is not your turn', async () => {
        const stub = sinon.stub();
        const row = 7;
        const col = 6;
        const isHorizontal = true;
        const letters = [...'test'];
        game.eventEmitter.on('placed', stub);
        // eslint-disable-next-line dot-notation
        game['isPlayer0Turn'] = true;
        const promise = game.placeLetters(game.players[1].id, letters, new Position(row, col), isHorizontal);
        stubSetTimeout.args[stubSetTimeout.args.length - 1][0]();
        await promise;
        assert(stub.notCalled);
        assert(stubError.called);
    });

    it('should check turn of player', (done) => {
        game['checkTurn']('0');
        assert(stubError.notCalled);
        game['checkTurn']('1');
        assert(stubError.called);
        done();
    });

    it('should skip turn', (done) => {
        game.skipTurn(game.players[0].id);
        assert(!game['isPlayer0Turn']);
        game.skipTurn(game.players[1].id);
        assert(game['isPlayer0Turn']);
        assert(stubError.notCalled);
        done();
    });

    it('should not skip turn if it is not your turn', (done) => {
        game.skipTurn(game.players[1].id);
        assert(game['isPlayer0Turn']);
        assert(stubError.called);
        done();
    });

    it('should show content of reserve', (done) => {
        const stub = sinon.stub();
        game.eventEmitter.on('reserve-content', stub);
        game.showReserveContent('me');
        assert(stub.calledWith('me', game.reserve.getContent()));
        assert(stubError.notCalled);
        done();
    });

    it('Skipping 6 turns in a row should call endGame', () => {
        game['skipCounter'] = 5;
        const endGame = sinon.spy(game, 'endGame' as never);
        game['nextTurn'](true);
        assert(endGame.called);
    });

    it('updating the skipCounter after a valid command should reset the counter', () => {
        game['skipCounter'] = 5;
        game['nextTurn'](false);
        expect(game['skipCounter']).to.equal(0);
    });

    // it('endGame should call calculateFinalScore, createGameSummaryMessage, getWinner', () => {
    //     const calculateFinalScores = sinon.spy(EndGameCalculator, 'calculateFinalScores');
    //     const createGameSummaryMessage = sinon.spy(EndGameCalculator, 'createGameSummaryMessage');
    //     game.endGame();
    //     assert(calculateFinalScores.called, 'Did not call final scores');
    //     assert(createGameSummaryMessage.called, 'Did not call game summary');
    //     expect(game['winner']).to.not.equal(undefined);
    // });

    it('getWinner should return the winners id', () => {
        const mainPlayer = game.players[MAIN_PLAYER];
        const otherPlayer = game.players[OTHER_PLAYER];

        game.reserve.letterRacks[0] = [];
        game.reserve.letterRacks[1] = [];

        game.scores[0] = 20;
        game.scores[1] = 10;
        const result1 = game.getWinner();
        assert(result1 === mainPlayer.id);

        game.scores[0] = 10;
        game.scores[1] = 20;
        const result2 = game.getWinner();
        assert(result2 === otherPlayer.id);
    });

    it('getWinner should return tie if its a tie', () => {
        game.reserve['letterRacks'][0] = [...game.reserve['letterRacks'][1]];
        game.scores[0] = 20;
        game.scores[1] = 20;
        const result1 = game.getWinner();
        expect(result1).to.equal(undefined);
    });

    it('empty reserve and empty rack should trigger endGame', async () => {
        const row = 7;
        const col = 6;
        const isHorizontal = true;
        const endGame = sinon.stub(game, 'endGame' as never);
        game.reserve.drawLetters(game.reserve['reserve'].length);
        game.reserve.letterRacks[MAIN_PLAYER] = ['A', 'L', 'L', 'O'];
        game['isPlayer0Turn'] = true;
        const promise = game.placeLetters(game.players[MAIN_PLAYER].id, [...'allo'], new Position(row, col), isHorizontal);
        stubSetTimeout.args[stubSetTimeout.args.length - 1][0]();
        await promise;
        assert(endGame.called);
    });

    it('Reserve of less than 7 shouldnt allow letter exchanges', async () => {
        const remainingLettersInReserve = 4;
        game.reserve.drawLetters(game.reserve['reserve'].length - remainingLettersInReserve);
        game.reserve.letterRacks[MAIN_PLAYER] = ['A', 'L', 'L', 'O'];
        game.changeLetters([...'allo'], game.players[MAIN_PLAYER].id);
        assert(stubError.called);
    });

    it('should calculate the final scores when the mainPlayer rack is empty', () => {
        const scoreMainPlayer = 10;
        const scoreOtherPlayer = 20;
        const scores = [scoreMainPlayer, scoreOtherPlayer];
        game.reserve.letterRacks = [['A', 'B'], ['C']];
        game.reserve.drawLetters(game.reserve['reserve'].length);
        game.reserve.letterRacks[MAIN_PLAYER].length = 0;
        EndGameCalculator.calculateFinalScores(scores, game.reserve);
        expect(scores).to.deep.equal([13, 17]);
    });

    it('should calculate the final scores when the otherPlayer rack is empty', () => {
        const scoreMainPlayer = 10;
        const scoreOtherPlayer = 20;
        const scores = [scoreMainPlayer, scoreOtherPlayer];
        game.reserve.letterRacks = [['A', 'B'], ['C']];
        game.reserve.drawLetters(game.reserve['reserve'].length);
        game.reserve.letterRacks[OTHER_PLAYER].length = 0;
        EndGameCalculator.calculateFinalScores(scores, game.reserve);
        expect(scores).to.deep.equal([6, 24]);
    });

    it('should initialise a game', () => {
        const stubBoard = sinon.stub();
        game.eventEmitter.on('state', stubBoard);
        const stubRack = sinon.stub();
        game.eventEmitter.on('rack', stubRack);

        game.sendState();

        assert(stubBoard.called);
        assert(stubRack.calledTwice);
    });

    it('should get formatted board', () => {
        game.board.place([{ letter: 'A', position: new Position(HALF_LENGTH, HALF_LENGTH) }]);
        const expectedLetter = 'A';
        const formattedBoard = game.board.getState();
        for (let i = 0; i < BOARD_LENGTH; i++) {
            for (let j = 0; j < BOARD_LENGTH; j++) {
                if (i === HALF_LENGTH && j === HALF_LENGTH) {
                    expect(formattedBoard[i][j]).to.equal(expectedLetter);
                } else {
                    expect(formattedBoard[i][j]).to.equal(undefined);
                }
            }
        }
    });

    it('should end turn after timeout', () => {
        expect(stubSetTimeout.callCount).to.equal(1);
        const callback = stubSetTimeout.args[0][0];
        const prevTurn = game.getCurrentPlayer().id;
        const stub = sinon.stub();
        game.eventEmitter.on('state', stub);
        callback();
        expect(prevTurn).to.not.equal(game.getCurrentPlayer().id);
        expect(stub.callCount).to.equal(1);
    });

    it('should cancel turn after timeout', () => {
        expect(stubSetTimeout.callCount).to.equal(1);
        const callback = stubSetTimeout.args[0][0];
        const prevTurn = game.getCurrentPlayer().id;
        const stub = sinon.stub();
        game.eventEmitter.on('state', stub);
        callback();
        expect(prevTurn).to.not.equal(game.getCurrentPlayer().id);
        expect(stub.callCount).to.equal(1);
    });
});
