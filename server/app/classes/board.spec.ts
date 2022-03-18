import { PlacementOption } from '@app/classes/placement-option';
import { DictionnaryService } from '@app/services/dictionnary.service';
import { expect } from 'chai';
import { assert } from 'console';
import { Board } from './board';

/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable dot-notation */
/* eslint-disable max-lines */

const BOARD_LENGTH = 15;

describe('Board', () => {
    let board: Board;
    let dictionnary: DictionnaryService;

    before(async () => {
        dictionnary = new DictionnaryService();
        await dictionnary.init();
    });

    beforeEach(() => {
        board = new Board(dictionnary);
    });

    it('should create 225 tiles', () => {
        const expectedCount = BOARD_LENGTH * BOARD_LENGTH;
        assert(board.board !== undefined);
        let count = 0;
        board.board.forEach((row) => {
            row.forEach((tile) => {
                if (tile !== undefined) count++;
            });
        });
        expect(count).equal(expectedCount);
    });

    it('should have all type of multipliers', () => {
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
    });

    it('should validate if word is inside the board', () => {
        let placement = new PlacementOption(2, 11, true, 'test');
        let result = board['isWordInBound'](placement);
        expect(result).to.equal(true);

        placement = new PlacementOption(11, 8, false, 'test');
        result = board['isWordInBound'](placement);
        expect(result).to.equal(true);
    });

    it('should not let the word get out of the board', () => {
        let placement = new PlacementOption(2, 12, true, 'test');
        let result = board['isWordInBound'](placement);
        expect(result).to.equal(false);

        placement = new PlacementOption(13, 9, false, 'test');
        result = board['isWordInBound'](placement);
        expect(result).to.equal(false);

        placement = new PlacementOption(3, -4, true, 'test');
        result = board['isWordInBound'](placement);
        expect(result).to.equal(false);

        placement = new PlacementOption(3, 11, true, 'test');
        result = board['isWordInBound'](placement);
        expect(result).to.equal(true);
        board.board[3][12].setLetter('a');
        result = board['isWordInBound'](placement);
        expect(result).to.equal(false);

        placement = new PlacementOption(10, 9, false, 'test');
        result = board['isWordInBound'](placement);
        expect(result).to.equal(true);
        board.board[11][9].setLetter('a');
        board.board[13][9].setLetter('t');
        result = board['isWordInBound'](placement);
        expect(result).to.equal(false);
    });

    it('should let a placement on the star for first word', () => {
        let placement = new PlacementOption(7, 5, true, 'test');
        let result = board['firstWordValidation'](placement);
        expect(result).to.equal(true);

        placement = new PlacementOption(4, 7, false, 'test');
        result = board['firstWordValidation'](placement);
        expect(result).to.equal(true);

        placement = new PlacementOption(7, 7, true, 'test');
        result = board['firstWordValidation'](placement);
        expect(result).to.equal(true);
    });

    it('should not let a placement not on the star for first word', () => {
        let placement = new PlacementOption(8, 5, true, 'test');
        let result = board['firstWordValidation'](placement);
        expect(result).to.equal(false);

        placement = new PlacementOption(3, 7, false, 'test');
        result = board['firstWordValidation'](placement);
        expect(result).to.equal(false);

        placement = new PlacementOption(7, 8, true, 'test');
        result = board['firstWordValidation'](placement);
        expect(result).to.equal(false);
    });

    it('should get all the points of contact of the word', () => {
        board.board[7][6].setLetter('a');
        board.board[7][7].setLetter('s');

        let placement = new PlacementOption(8, 5, true, 'test');
        let contacts = board['getContacts'](placement);
        assert(contacts.length === 2);
        expect(contacts[0][0]).to.equal(8);
        expect(contacts[0][1]).to.equal(6);
        expect(contacts[0][2]).to.equal(1);

        expect(contacts[1][0]).to.equal(8);
        expect(contacts[1][1]).to.equal(7);
        expect(contacts[1][2]).to.equal(2);

        board.board[8][6].setLetter('i');

        contacts = board['getContacts'](placement);
        assert(contacts.length === 1);

        expect(contacts[0][0]).to.equal(8);
        expect(contacts[0][1]).to.equal(7);
        expect(contacts[0][2]).to.equal(1);

        placement = new PlacementOption(4, 6, false, 'test');
        try {
            contacts = board['getContacts'](placement);
            expect(false, 'placement devrait etre invalide');
        } catch (e) {
            expect(true);
        }

        placement = new PlacementOption(4, 5, false, 'test');
        contacts = board['getContacts'](placement);
        assert(contacts.length === 1);
        expect(contacts[0][0]).to.equal(7);
        expect(contacts[0][1]).to.equal(5);
        expect(contacts[0][2]).to.equal(3);

        placement = new PlacementOption(1, 1, false, 'test');
        try {
            contacts = board['getContacts'](placement);
            expect(false, 'placement devrait etre invalide');
        } catch (e) {
            expect(true);
        }
    });

    it('should change newly placed word', () => {
        board.board[7][6].setLetter('a');
        board.board[7][7].setLetter('s');
        board.board[9][6].setLetter('v');
        board.board[10][6].setLetter('u');

        let placement = new PlacementOption(7, 6, true, 'as');
        board['changeNewlyPlaced'](placement, true);

        expect(board.board[7][6].newlyPlaced).to.equal(false);
        expect(board.board[7][7].newlyPlaced).to.equal(false);
        expect(board.board[9][6].newlyPlaced).to.equal(true);
        expect(board.board[10][6].newlyPlaced).to.equal(true);

        placement = new PlacementOption(9, 6, false, 'vu');
        board['changeNewlyPlaced'](placement, true);

        expect(board.board[7][6].newlyPlaced).to.equal(false);
        expect(board.board[7][7].newlyPlaced).to.equal(false);
        expect(board.board[9][6].newlyPlaced).to.equal(false);
        expect(board.board[10][6].newlyPlaced).to.equal(false);
    });

    it('should delete the letters', () => {
        board.board[7][6].setLetter('a');
        board.board[7][7].setLetter('s');
        board.board[9][6].setLetter('v');
        board.board[10][6].setLetter('u');

        let placement = new PlacementOption(7, 6, true, 'as');
        board['changeNewlyPlaced'](placement, false);

        expect(board.board[7][6].empty).to.equal(true);
        expect(board.board[7][7].empty).to.equal(true);
        expect(board.board[9][6].newlyPlaced).to.equal(true);
        expect(board.board[10][6].newlyPlaced).to.equal(true);

        placement = new PlacementOption(9, 6, false, 'vu');
        board['changeNewlyPlaced'](placement, false);

        expect(board.board[7][6].empty).to.equal(true);
        expect(board.board[7][7].empty).to.equal(true);
        expect(board.board[9][6].empty).to.equal(true);
        expect(board.board[10][6].empty).to.equal(true);
    });

    it('should place the letters on the board and get the score', () => {
        let placements = [new PlacementOption(7, 6, true, 'as'), new PlacementOption(9, 6, false, 'vu')];
        let expectedScore = 7;
        let score = board['getScore'](placements, false);
        expect(score).to.equal(expectedScore);

        score = board['getScore'](placements, true);
        expect(score).to.equal(expectedScore);

        placements = [new PlacementOption(4, 5, false, 'test'), new PlacementOption(7, 5, true, 'tas')];
        expectedScore = 9;
        score = board['getScore'](placements, true);
        expect(score).to.equal(expectedScore);

        placements = [new PlacementOption(4, 3, true, 'metro'), new PlacementOption(4, 5, false, 'test')];
        expectedScore = 16;
        score = board['getScore'](placements, true);
        expect(score).to.equal(expectedScore);
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
        const word = 'test';
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
        errorMessage = 'Placement invalide aucun point de contact';
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

    // TODO fix test
    /* it('should test playable position', () => {
        board.board[7][6].setLetter('a');
        board.board[7][7].setLetter('s');
        board.getPlayablePositions(7);
        assert(true);
    });*/
});
