import { Difficulty, GameType, Parameters } from '@app/classes/parameters';
import { Letter } from '@app/letter';
import { DictionnaryService } from '@app/services/dictionnary.service';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { Game } from './game';
import { Room } from './room';
import { PlacementOption, VirtualPlayer } from './virtual-player';
// eslint-disable-next-line @typescript-eslint/no-require-imports

describe('VirtualPlayer', () => {
    let game: Game;
    let vP: VirtualPlayer;
    let dictionnaryService: DictionnaryService;
    let parameters: Parameters;

    before(async() => {
        dictionnaryService = new DictionnaryService();
        await dictionnaryService.init();
    });

    beforeEach(() => {
        parameters = new Parameters();
        parameters.timer = 60;
        parameters.dictionnary = 0;
        parameters.gameType = GameType.Solo;
        parameters.difficulty = Difficulty.Beginner;
        parameters.log2990 = false;
        const room = new Room(1, '1', 'Dummy', parameters);
        room.addPlayer('2', 'otherDummy', false);
        room.addPlayer('VP', 'heo', true);

        game = new Game(room, dictionnaryService);
    });
    it('playTurn should send a message v1', () => {
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        Math.random = () => 0.0;
        vP = new VirtualPlayer(true, game);
        vP.playTurn();
    });
    it('playTurn should send a message v2', () => {
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        Math.random = () => 0.1;
        vP = new VirtualPlayer(true, game);
        vP.playTurn();
    });
    it('playTurn should send a message v3', () => {
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        Math.random = () => 0.1;
        vP = new VirtualPlayer(false, game);
        vP.playTurn();
    });

    it('should playturn when current turn is my turn', (done) => {
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        Math.random = () => 0.1;
        vP = new VirtualPlayer(false, game);
        vP.playTurn = sinon.stub();
        game.getCurrentPlayer().id = 'VP';
        vP.waitForTurn();
        const timeout = 1500;
        setTimeout(() => {
            expect((vP.playTurn as sinon.SinonStub).args).to.deep.equal([[]]);
            done();
        }, timeout);
    });

    it('should give the rack as a string', () => {
        vP = new VirtualPlayer(true, game);
        const letterA: Letter = {id: 0, name: 'A', score: 1, quantity: 1};
        const letterR: Letter = {id: 0, name: 'R', score: 1, quantity: 1};
        const letterZ: Letter = {id: 0, name: 'Z', score: 1, quantity: 1};

        let testRack: Letter[] = [letterA, letterR];
        let expectedString = 'AR';
        game.reserve.letterRacks[1] = testRack;
        expect(vP['rackToString']()).to.deep.equal(expectedString);

        testRack = [letterZ, letterA, letterR, letterA];
        expectedString = 'ZARA';
        game.reserve.letterRacks[1] = testRack;
        expect(vP['rackToString']()).to.deep.equal(expectedString);
    });

    it('should find replacement for the contactchar', () => {
        game.board.board[7][6].setLetter('a');
        game.board.board[7][7].setLetter('s');
        vP = new VirtualPlayer(true, game);

        let exploredOptions: PlacementOption[] = [];
        let option = {row: 2, col: 5, isHorizontal: false, word: '     * '};
        let letterCount = 5;
        let availableLetters = 'RZA';
        let result = vP['contactReplacement'](exploredOptions, option, letterCount, availableLetters);
        console.log(result);
    });

    it('randomtest', ()=> {
        game.board.board[7][6].setLetter('a');
        game.board.board[7][7].setLetter('s');
        vP = new VirtualPlayer(true, game);
        vP.getPlayablePositions();
    })
});
