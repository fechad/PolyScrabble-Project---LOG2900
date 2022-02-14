import { GameTile } from '@app/classes/game-tile';
import { assert } from 'chai';
import { WordGetter } from './word-getter';

/* eslint-disable @typescript-eslint/no-magic-numbers */

const BOARD_LENGTH = 15;
const INVALID = -1;

describe('Word getter', () => {
    let board: GameTile[][];
    let wordGetter: WordGetter;
    let word: string;

    beforeEach(() => {
        board = [];
        for (let i = 0; i < BOARD_LENGTH; i++) {
            const row: GameTile[] = [];
            for (let j = 0; j < BOARD_LENGTH; j++) {
                row.push(new GameTile(1));
            }
            board.push(row);
        }
        wordGetter = new WordGetter(board);
        word = 'test';
    });

    it('should get the attempted word', (done) => {
        let expectedWord = 'h;4;5;test';
        let positionArray = ['e', '6', 'h'];
        let contacts = [[INVALID]];
        let words = wordGetter.getWords(word, positionArray, contacts);
        assert(words.length === 1);
        assert(words[0] === expectedWord);

        positionArray = ['e', '8', 'v'];
        expectedWord = 'v;4;7;test';
        contacts = [[INVALID]];
        words = wordGetter.getWords(word, positionArray, contacts);
        assert(words.length === 1);
        assert(words[0] === expectedWord);

        wordGetter.board[7][7].setLetter('a');
        expectedWord = 'h;7;5;teast';
        positionArray = ['h', '6', 'h'];
        contacts = [[INVALID]];
        words = wordGetter.getWords(word, positionArray, contacts);
        assert(words.length === 1);
        assert(words[0] === expectedWord);

        expectedWord = 'v;4;7;tesat';
        positionArray = ['e', '8', 'v'];
        contacts = [[INVALID]];
        words = wordGetter.getWords(word, positionArray, contacts);
        assert(words.length === 1);
        assert(words[0] === expectedWord);
        done();
    });

    it('should get the words by contact', (done) => {
        wordGetter.board[7][6].setLetter('i');
        wordGetter.board[7][7].setLetter('a');
        wordGetter.board[9][6].setLetter('s');
        wordGetter.board[9][7].setLetter('t');

        let expectedWord = 'h;8;5;test';
        let expectedWord1 = 'v;7;6;ies';
        let expectedWord2 = 'v;7;7;ast';
        let positionArray = ['i', '6', 'h'];
        let contacts = [
            [8, 6, 1],
            [8, 7, 2],
        ];
        let words = wordGetter.getWords(word, positionArray, contacts);
        assert(words.length === 3);
        assert(words[0] === expectedWord);
        assert(words[1] === expectedWord1);
        assert(words[2] === expectedWord2);

        expectedWord = 'v;6;5;test';
        expectedWord1 = 'h;7;5;eia';
        expectedWord2 = 'h;9;5;tst';
        positionArray = ['g', '6', 'v'];
        contacts = [
            [7, 5, 1],
            [9, 5, 3],
        ];
        words = wordGetter.getWords(word, positionArray, contacts);
        assert(words.length === 3);
        assert(words[0] === expectedWord);
        assert(words[1] === expectedWord1);
        assert(words[2] === expectedWord2);
        done();
    });
});
