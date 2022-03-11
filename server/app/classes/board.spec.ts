import { DictionnaryService } from '@app/services/dictionnary.service';
import { expect } from 'chai';
import { assert } from 'console';
import { Board } from './board';

/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable dot-notation */
/* eslint-disable max-lines */

const BOARD_LENGTH = 15;
const INVALID = -1;

describe('Board', () => {
    let board: Board;
    let word: string;
    let dictionnary: DictionnaryService;

    before(async () => {
        dictionnary = new DictionnaryService();
        await dictionnary.init();
    });

    beforeEach(() => {
        board = new Board(dictionnary);
        word = 'test';
    });

    it('should create 225 tiles', (done) => {
        const expectedCount = BOARD_LENGTH * BOARD_LENGTH;
        assert(board.board !== undefined);
        let count = 0;
        board.board.forEach((row) => {
            row.forEach((tile) => {
                if (tile !== undefined) count++;
            });
        });
        expect(count).equal(expectedCount);
        done();
    });

    it('should have all type of multipliers', (done) => {
        let testRef = [0, 0, 1, 3];
        assert(board.board[testRef[0]][testRef[1]].multiplier === testRef[2]);
        assert(board.board[testRef[0]][testRef[1]].wordMultiplier === testRef[3]);

        testRef = [1, 13, 1, 2];
        assert(board.board[testRef[0]][testRef[1]].multiplier === testRef[2]);
        assert(board.board[testRef[0]][testRef[1]].wordMultiplier === testRef[3]);

        testRef = [5, 1, 3, 1];
        assert(board.board[testRef[0]][testRef[1]].multiplier === testRef[2]);
        assert(board.board[testRef[0]][testRef[1]].wordMultiplier === testRef[3]);

        testRef = [0, 3, 2, 1];
        assert(board.board[testRef[0]][testRef[1]].multiplier === testRef[2]);
        assert(board.board[testRef[0]][testRef[1]].wordMultiplier === testRef[3]);

        testRef = [2, 4, 1, 1];
        assert(board.board[testRef[0]][testRef[1]].multiplier === testRef[2]);
        assert(board.board[testRef[0]][testRef[1]].wordMultiplier === testRef[3]);
        done();
    });

    it('should validate if word is inside the board', (done) => {
        let row = 2;
        let col = 11;
        let isHoriontal = true;
        let result = board['isWordInBound'](word.length, row, col, isHoriontal);
        assert(result);

        row = 11;
        col = 8;
        isHoriontal = false;
        result = board['isWordInBound'](word.length, row, col, isHoriontal);
        assert(result);
        done();
    });

    it('should not let the word get out of the board', (done) => {
        let row = 2;
        let col = 12;
        let isHoriontal = true;
        let result = board['isWordInBound'](word.length, row, col, isHoriontal);
        assert(!result);

        row = 13;
        col = 9;
        isHoriontal = false;
        result = board['isWordInBound'](word.length, row, col, isHoriontal);
        assert(!result);

        row = 3;
        col = -4;
        isHoriontal = true;
        result = board['isWordInBound'](word.length, row, col, isHoriontal);
        assert(!result);

        row = 3;
        col = 11;
        isHoriontal = true;
        result = board['isWordInBound'](word.length, row, col, isHoriontal);
        assert(result);
        board.board[3][12].setLetter('a');
        result = board['isWordInBound'](word.length, row, col, isHoriontal);
        assert(!result);

        row = 10;
        col = 9;
        isHoriontal = false;
        result = board['isWordInBound'](word.length, row, col, isHoriontal);
        assert(result);
        board.board[11][9].setLetter('a');
        board.board[13][9].setLetter('t');
        result = board['isWordInBound'](word.length, row, col, isHoriontal);
        assert(!result);
        done();
    });

    it('should let a placement on the star for first word', (done) => {
        let row = 7;
        let col = 5;
        let isHoriontal = true;
        let result = board['firstWordValidation'](word.length, row, col, isHoriontal);
        assert(result);

        row = 4;
        col = 7;
        isHoriontal = false;
        result = board['firstWordValidation'](word.length, row, col, false);
        assert(result);

        row = 7;
        col = 7;
        isHoriontal = true;
        result = board['firstWordValidation'](word.length, row, col, isHoriontal);
        assert(result);
        done();
    });

    it('should let not first word not touch the star', (done) => {
        const row = 12;
        const col = 4;
        const isHoriontal = true;
        board.board[7][7].setLetter('a');
        const result = board['firstWordValidation'](word.length, row, col, isHoriontal);
        assert(result);
        done();
    });

    it('should not let a placement not on the star for first word', (done) => {
        let row = 8;
        let col = 5;
        let isHoriontal = true;
        let result = board['firstWordValidation'](word.length, row, col, isHoriontal);
        assert(!result);

        row = 3;
        col = 7;
        isHoriontal = false;
        result = board['firstWordValidation'](word.length, row, col, isHoriontal);
        assert(!result);

        row = 7;
        col = 8;
        isHoriontal = true;
        result = board['firstWordValidation'](word.length, row, col, isHoriontal);
        assert(!result);
        done();
    });

    it('should get all the points of contact of the word', (done) => {
        board.board[7][6].setLetter('a');
        board.board[7][7].setLetter('s');

        let row = 8;
        let col = 5;
        let isHoriontal = true;
        let contacts = board['getContacts'](word.length, row, col, isHoriontal);
        assert(contacts.length === 2);
        assert(contacts[0][0] === 8);
        assert(contacts[0][1] === 6);
        assert(contacts[0][2] === 1);

        assert(contacts[1][0] === 8);
        assert(contacts[1][1] === 7);
        assert(contacts[1][2] === 2);

        board.board[8][6].setLetter('i');

        row = 8;
        col = 5;
        isHoriontal = true;
        contacts = board['getContacts'](word.length, row, col, isHoriontal);
        assert(contacts.length === 1);

        assert(contacts[0][0] === 8);
        assert(contacts[0][1] === 7);
        assert(contacts[0][2] === 1);

        row = 4;
        col = 6;
        isHoriontal = false;
        contacts = board['getContacts'](word.length, row, col, isHoriontal);
        assert(contacts.length === 1);
        assert(contacts[0][0] === INVALID);
        
        row = 4;
        col = 5;
        isHoriontal = false;
        contacts = board['getContacts'](word.length, row, col, isHoriontal);
        assert(contacts.length === 1);
        assert(contacts[0][0] === 7);
        assert(contacts[0][1] === 5);
        assert(contacts[0][2] === 3);

        row = 1;
        col = 1;
        isHoriontal = false;
        contacts = board['getContacts'](word.length, row, col, isHoriontal);
        assert(contacts.length === 0);
        done();
    });

    it('should change newly placed word', (done) => {
        board.board[7][6].setLetter('a');
        board.board[7][7].setLetter('s');
        board.board[9][6].setLetter('v');
        board.board[10][6].setLetter('u');

        let wordAndPos = ['h', '7', '6', 'as'];
        board['changeNewlyPlaced'](wordAndPos);

        assert(!board.board[7][6].newlyPlaced);
        assert(!board.board[7][7].newlyPlaced);
        assert(board.board[9][6].newlyPlaced);
        assert(board.board[10][6].newlyPlaced);

        wordAndPos = ['v', '9', '6', 'vu'];
        board['changeNewlyPlaced'](wordAndPos);

        assert(!board.board[7][6].newlyPlaced);
        assert(!board.board[7][7].newlyPlaced);
        assert(!board.board[9][6].newlyPlaced);
        assert(!board.board[10][6].newlyPlaced);
        done();
    });

    it('should place the letters on the board and get the score', (done) => {
        let wordAndPos = ['h;7;6;as', 'v;9;6;vu'];
        let expectedScore = 7;
        let score = board['placeWithScore'](wordAndPos);
        expect(score).to.equal(expectedScore);

        wordAndPos = ['v;4;5;test', 'h;7;5;tas'];
        expectedScore = 9;
        score = board['placeWithScore'](wordAndPos);
        expect(score).to.equal(expectedScore);

        wordAndPos = ['h;4;3;metro', 'v;4;5;test'];
        expectedScore = 16;
        score = board['placeWithScore'](wordAndPos);
        expect(score).to.equal(expectedScore);

        wordAndPos = ['v;7;7;speciale', 'h;7;5;tas'];
        expectedScore = 42;
        score = board['placeWithScore'](wordAndPos);
        expect(score).to.equal(expectedScore);
        done();
    });

    it('should place a word on the board', async () => {
        let row = 5;
        let col = 7;
        let isHoriontal = false;
        let attemptedWord = 'testeur';
        let expectedScore = 58;

        let result = await board.placeWord(attemptedWord, row, col, isHoriontal);
        expect(result).to.equals(expectedScore);

        row = 5;
        col = 5;
        isHoriontal = true;
        attemptedWord = 'ars';
        expectedScore = 6;

        result = await board.placeWord(attemptedWord, row, col, isHoriontal);
        expect(result).to.equals(expectedScore);
    });

    it('should not place a word  if there is something invalid', async () => {
        let row = 5;
        let col = 13;
        let isHoriontal = true;
        let errorMessage = 'Placement invalide le mot ne rentre pas dans la grille';
        try {
            await board.placeWord(word, row, col, isHoriontal);
            assert(false);
        } catch (error) {
            expect(error.message).to.equal(errorMessage);
        }

        row = 2;
        col = 1;
        isHoriontal = true;
        errorMessage = 'Placement invalide pour le premier mot';
        try {
            await board.placeWord(word, row, col, isHoriontal);
            assert(false);
        } catch (error) {
            expect(error.message).to.equal(errorMessage);
        }

        board.board[7][6].setLetter('a');
        board.board[7][7].setLetter('s');

        row = 2;
        col = 1;
        isHoriontal = true;
        errorMessage = 'Placement invalide vous devez toucher un autre mot';
        try {
            await board.placeWord(word, row, col, isHoriontal);
            assert(false);
        } catch (error) {
            expect(error.message).to.equal(errorMessage);
        }

        row = 4;
        col = 7;
        isHoriontal = false;
        errorMessage = 'Un des mots crees ne fait pas partie du dictionnaire';
        try {
            await board.placeWord(word, row, col, isHoriontal);
            assert(false);
        } catch (error) {
            expect(error.message).to.equal(errorMessage);
        }
    });
});
