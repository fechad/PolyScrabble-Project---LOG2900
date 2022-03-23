import { GameTile } from '@app/classes/game-tile';
import { PlacementOption } from '@app/classes/placement-option';
import * as cst from '@app/constants';
import { assert, expect } from 'chai';
import { WordGetter } from './word-getter';

/* eslint-disable @typescript-eslint/no-magic-numbers */

describe('Word getter', () => {
    let board: GameTile[][];
    let wordGetter: WordGetter;

    beforeEach(() => {
        board = [];
        for (let i = 0; i < cst.BOARD_LENGTH; i++) {
            const row: GameTile[] = [];
            for (let j = 0; j < cst.BOARD_LENGTH; j++) {
                row.push(new GameTile(1));
            }
            board.push(row);
        }
        wordGetter = new WordGetter(board);
    });

    it('should get the attempted word', () => {
        let testPlacement = new PlacementOption(4, 5, true, 'test');
        let contacts: number[][] = [[]];
        let words = wordGetter.getWords(testPlacement, contacts);
        assert(words.length === 1);
        expect(words[0]).to.deep.equal(testPlacement);

        testPlacement = new PlacementOption(2, 9, false, 'test');
        contacts = [[]];
        words = wordGetter.getWords(testPlacement, contacts);
        assert(words.length === 1);
        expect(words[0]).to.deep.equal(testPlacement);

        wordGetter.board[7][7].setLetter('a');
        testPlacement = new PlacementOption(7, 5, true, 'test');
        let expectedResult = testPlacement.deepCopy('teast');
        contacts = [[]];
        words = wordGetter.getWords(testPlacement, contacts);
        assert(words.length === 1);
        expect(words[0]).to.deep.equal(expectedResult);

        testPlacement = new PlacementOption(4, 7, false, 'test');
        expectedResult = testPlacement.deepCopy('tesat');
        contacts = [[]];
        words = wordGetter.getWords(testPlacement, contacts);
        assert(words.length === 1);
        expect(words[0]).to.deep.equal(expectedResult);
    });

    it('should get the words by contact', () => {
        wordGetter.board[7][6].setLetter('i');
        wordGetter.board[7][6].newlyPlaced = false;
        wordGetter.board[7][7].setLetter('a');
        wordGetter.board[7][7].newlyPlaced = false;
        wordGetter.board[9][6].setLetter('s');
        wordGetter.board[9][6].newlyPlaced = false;
        wordGetter.board[9][7].setLetter('t');
        wordGetter.board[9][7].newlyPlaced = false;

        let testPlacement = new PlacementOption(8, 5, true, 'test');
        let expectedWord = testPlacement.deepCopy();
        let expectedWord1 = new PlacementOption(7, 6, false, 'ies');
        let expectedWord2 = new PlacementOption(7, 7, false, 'ast');
        let contacts = [
            [8, 6, 1],
            [8, 7, 2],
        ];
        let words = wordGetter.getWords(testPlacement, contacts);
        assert(words.length === 3);
        expect(words[0]).to.deep.equal(expectedWord);
        expect(words[1]).to.deep.equal(expectedWord1);
        expect(words[2]).to.deep.equal(expectedWord2);

        testPlacement = new PlacementOption(6, 5, false, 'test');
        expectedWord = testPlacement.deepCopy();
        expectedWord1 = new PlacementOption(7, 5, true, 'eia');
        expectedWord2 = new PlacementOption(9, 5, true, 'tst');
        contacts = [
            [7, 5, 1],
            [9, 5, 3],
        ];
        words = wordGetter.getWords(testPlacement, contacts);
        assert(words.length === 3);
        expect(words[0]).to.deep.equal(expectedWord);
        expect(words[1]).to.deep.equal(expectedWord1);
        expect(words[2]).to.deep.equal(expectedWord2);

        testPlacement = new PlacementOption(7, 5, true, 't');
        expectedWord = testPlacement.deepCopy('tia');
        contacts = [[]];
        words = wordGetter.getWords(testPlacement, contacts);
        assert(words.length === 1);
        expect(words[0]).to.deep.equal(expectedWord);
    });
});
