import { PlacementOption } from '@app/classes/placement-option';
import { expect } from 'chai';
import { Board } from './board';
import { Position } from './position';
import { Placement, WordGetter } from './word-getter';

/* eslint-disable @typescript-eslint/no-magic-numbers */

describe('Word getter', () => {
    let board: Board;
    let wordGetter: WordGetter;

    beforeEach(() => {
        board = new Board();
        wordGetter = new WordGetter(board);
    });

    it('should get the attempted word', () => {
        let testPlacement = PlacementOption.newPlacement(wordGetter.board, new Position(7, 7), false, [...'test']);
        let words = wordGetter.getWords(testPlacement);
        expect(words).to.deep.equal([{ word: 'test', position: new Position(7, 7), horizontal: false, score: 4, contact: false }]);

        testPlacement = PlacementOption.newPlacement(wordGetter.board, new Position(7, 4), true, [...'test']);
        words = wordGetter.getWords(testPlacement);
        expect(words).to.deep.equal([{ word: 'test', position: new Position(7, 4), horizontal: true, score: 4, contact: false }]);

        wordGetter.board.place([{ letter: 'a', position: new Position(7, 7) }]);
        testPlacement = PlacementOption.newPlacement(wordGetter.board, new Position(7, 5), true, [...'test']);
        words = wordGetter.getWords(testPlacement);
        expect(words).to.deep.equal([{ word: 'teast', position: new Position(7, 5), horizontal: true, score: 5, contact: true }]);

        testPlacement = PlacementOption.newPlacement(wordGetter.board, new Position(4, 7), false, [...'test']);
        words = wordGetter.getWords(testPlacement);
        expect(words).to.deep.equal([{ word: 'tesat', position: new Position(4, 7), horizontal: false, score: 5, contact: true }]);
    });

    it('should get the words by contact', () => {
        wordGetter.board.place([
            { letter: 'i', position: new Position(7, 6) },
            { letter: 'a', position: new Position(7, 7) },
            { letter: 's', position: new Position(9, 6) },
            { letter: 't', position: new Position(9, 7) },
        ]);

        let testPlacement = PlacementOption.newPlacement(wordGetter.board, new Position(8, 5), true, [...'test']);
        const EXPECTED1: Placement[] = [
            { word: 'ies', position: new Position(7, 6), horizontal: false, score: 4, contact: true },
            { word: 'ast', position: new Position(7, 7), horizontal: false, score: 3, contact: true },
            { word: 'test', position: new Position(8, 5), horizontal: true, score: 6, contact: false },
        ];
        expect(wordGetter.getWords(testPlacement)).to.deep.equal(EXPECTED1);

        testPlacement = PlacementOption.newPlacement(wordGetter.board, new Position(6, 5), false, [...'test']);
        const EXPECTED2: Placement[] = [
            { word: 'eia', position: new Position(7, 5), horizontal: true, score: 3, contact: true },
            { word: 'tst', position: new Position(9, 5), horizontal: true, score: 5, contact: true },
            { word: 'test', position: new Position(6, 5), horizontal: false, score: 6, contact: false },
        ];
        expect(wordGetter.getWords(testPlacement)).to.deep.equal(EXPECTED2);
    });
});
