import { Difficulty, GameType, Parameters } from '@app/classes/parameters';
import { Letter } from '@app/letter';
import { DictionnaryService } from '@app/services/dictionnary.service';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { Game } from './game';
import { Room } from './room';
import { PlacementOption, VirtualPlayer } from './virtual-player';
/* eslint-disable dot-notation*/

describe('VirtualPlayer', () => {
    let game: Game;
    let vP: VirtualPlayer;
    let dictionnaryService: DictionnaryService;
    let parameters: Parameters;

    before(async () => {
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

    it('should validate crosswords to list possible contacts', () => {
        vP = new VirtualPlayer(false, game);
        game.board.board[0][0].setLetter('a');
        game.board.board[0][1].setLetter('s');
        const letterA: Letter = { id: 0, name: 'A', score: 1, quantity: 1 };
        const letterR: Letter = { id: 0, name: 'R', score: 1, quantity: 1 };
        const letterW: Letter = { id: 0, name: 'W', score: 1, quantity: 1 };
        const letterZ: Letter = { id: 0, name: 'Z', score: 1, quantity: 1 };
        game.reserve.letterRacks[1] = [letterA, letterR, letterZ, letterZ, letterR, letterW, letterW];

        const expectedValidOptions = [
            { row: 0, col: 2, isHorizontal: true, word: 'as       ' },
            { row: 0, col: 2, isHorizontal: false, word: 'A      ' },
            { row: 1, col: 0, isHorizontal: true, word: 'A' },
            { row: 1, col: 0, isHorizontal: false, word: 'a       ' },
            { row: 1, col: 1, isHorizontal: true, word: 'A      ' },
            { row: 1, col: 1, isHorizontal: false, word: 's       ' },
        ];
        const result = vP.getPlayablePositions();
        expect(result).to.deep.equal(expectedValidOptions);
    });

    it('should validate crosswords to list possible contacts', () => {
        vP = new VirtualPlayer(false, game);
        game.board.board[0][0].setLetter('a');
        game.board.board[0][1].setLetter('s');
        const letterA: Letter = { id: 0, name: 'A', score: 1, quantity: 1 };
        const letterR: Letter = { id: 0, name: 'R', score: 1, quantity: 1 };
        const letterZ: Letter = { id: 0, name: 'Z', score: 1, quantity: 1 };
        game.reserve.letterRacks[1] = [letterA, letterR, letterZ];
        const placementOptions = [
            { row: 0, col: 2, isHorizontal: true, word: 'as       ' },
            { row: 0, col: 2, isHorizontal: false, word: '*      ' },
            { row: 1, col: 0, isHorizontal: true, word: '**     ' },
            { row: 1, col: 0, isHorizontal: false, word: 'a       ' },
            { row: 1, col: 1, isHorizontal: true, word: '*      ' },
            { row: 1, col: 1, isHorizontal: false, word: 's       ' },
        ];
        const exploredOptions: PlacementOption[] = [{ row: 7, col: 7, isHorizontal: true, word: 'Z' }];

        const expectedExploredOptions = [
            { row: 7, col: 7, isHorizontal: true, word: 'Z' },
            { row: 0, col: 2, isHorizontal: false, word: 'A' },
            { row: 1, col: 0, isHorizontal: true, word: 'A' },
            { row: 1, col: 1, isHorizontal: true, word: 'A' },
        ];
        const expectedValidOptions = [
            { row: 0, col: 2, isHorizontal: true, word: 'as       ' },
            { row: 0, col: 2, isHorizontal: false, word: 'A      ' },
            { row: 1, col: 0, isHorizontal: true, word: 'A' },
            { row: 1, col: 0, isHorizontal: false, word: 'a       ' },
            { row: 1, col: 1, isHorizontal: true, word: 'A      ' },
            { row: 1, col: 1, isHorizontal: false, word: 's       ' },
        ];
        const result = vP['validateCrosswords'](placementOptions, exploredOptions);
        expect(result).to.deep.equal(expectedValidOptions);
        expect(exploredOptions).to.deep.equal(expectedExploredOptions);
    });

    it('should give the rack as a string', () => {
        vP = new VirtualPlayer(true, game);
        const letterA: Letter = { id: 0, name: 'A', score: 1, quantity: 1 };
        const letterR: Letter = { id: 0, name: 'R', score: 1, quantity: 1 };
        const letterZ: Letter = { id: 0, name: 'Z', score: 1, quantity: 1 };

        let testRack: Letter[] = [letterA, letterR];
        let expectedString = 'AR';
        game.reserve.letterRacks[1] = testRack;
        expect(vP['rackToString']()).to.deep.equal(expectedString);

        testRack = [letterZ, letterA, letterR, letterA];
        expectedString = 'ZARA';
        game.reserve.letterRacks[1] = testRack;
        expect(vP['rackToString']()).to.deep.equal(expectedString);
    });

    it('should find new options of word for a contact', () => {
        vP = new VirtualPlayer(true, game);

        const validOptions: PlacementOption[] = [];
        const option = { row: 2, col: 5, isHorizontal: false, word: '     * ' };
        const contactString = '*as';
        const rackLetters = 'RZAAR';

        const expectedPossibleLetters = 'RA';
        const expectedValidOptions = [
            { row: 2, col: 5, isHorizontal: false, word: '     R ' },
            { row: 2, col: 5, isHorizontal: false, word: '     A ' },
        ];
        const possibleOptions = vP['findNewOptions'](validOptions, option, rackLetters, contactString);
        expect(validOptions).to.deep.equal(expectedValidOptions);
        expect(possibleOptions).to.equal(expectedPossibleLetters);
    });

    it('should find replacement for the contact char', () => {
        game.board.board[7][6].setLetter('a');
        game.board.board[7][7].setLetter('s');
        vP = new VirtualPlayer(true, game);

        const exploredOptions: PlacementOption[] = [];
        const option = { row: 2, col: 5, isHorizontal: false, word: '     * ' };
        const letterCount = 5;
        const availableLetters = 'RZA';

        const expectedReturn = [
            { row: 2, col: 5, isHorizontal: false, word: '     R ' },
            { row: 2, col: 5, isHorizontal: false, word: '     A ' },
        ];
        const result = vP['contactReplacement'](exploredOptions, option, letterCount, availableLetters);
        expect(result).to.deep.equal(expectedReturn);
    });

    it('should find replacement from previous replacements', () => {
        game.board.board[7][6].setLetter('a');
        game.board.board[7][7].setLetter('s');
        vP = new VirtualPlayer(true, game);

        const exploredOptions: PlacementOption[] = [{ row: 7, col: 5, isHorizontal: false, word: 'RA' }];
        const option = { row: 2, col: 5, isHorizontal: false, word: '     * ' };
        const letterCount = 5;
        const availableLetters = 'RZA';

        const expectedReturn = [
            { row: 2, col: 5, isHorizontal: false, word: '     R ' },
            { row: 2, col: 5, isHorizontal: false, word: '     A ' },
        ];
        const result = vP['contactReplacement'](exploredOptions, option, letterCount, availableLetters);
        expect(result).to.deep.equal(expectedReturn);
    });

    it('should deep copy a placement option', () => {
        const originalPlacement = { row: 2, col: 5, isHorizontal: false, word: '     * ' };
        let result = vP['deepCopyPlacementOption'](originalPlacement);
        expect(result).to.deep.equal(originalPlacement);

        result = vP['deepCopyPlacementOption'](originalPlacement, 'test');
        originalPlacement.word = 'test';
        expect(result).to.deep.equal(originalPlacement);
    });
});
