import { DictionnaryService } from '@app/services/dictionnary.service';
import { expect } from 'chai';
import { assert } from 'console';
import { Board } from './board';

/* eslint-disable @typescript-eslint/no-magic-numbers, dot-notation, max-lines */

const BOARD_LENGTH = 15;

describe('Board', () => {
    let board: Board;
    let dictionnary: DictionnaryService;

    before(async () => {
        dictionnary = new DictionnaryService();
        await dictionnary.init();
    });

    beforeEach(() => {
        board = new Board();
    });

    it('should create 225 tiles', () => {
        const expectedCount = BOARD_LENGTH * BOARD_LENGTH;
        assert(board['board'] !== undefined);
        let count = 0;
        board['board'].forEach((row) => {
            row.forEach((tile) => {
                if (tile !== undefined) count++;
            });
        });
        expect(count).equal(expectedCount);
    });

    it('should have all type of multipliers', () => {
        let testRef = [0, 0, 1, 3];
        assert(board['board'][testRef[0]][testRef[1]].multiplier === testRef[2]);
        assert(board['board'][testRef[0]][testRef[1]].wordMultiplier === testRef[3]);

        testRef = [1, 13, 1, 2];
        assert(board['board'][testRef[0]][testRef[1]].multiplier === testRef[2]);
        assert(board['board'][testRef[0]][testRef[1]].wordMultiplier === testRef[3]);

        testRef = [5, 1, 3, 1];
        assert(board['board'][testRef[0]][testRef[1]].multiplier === testRef[2]);
        assert(board['board'][testRef[0]][testRef[1]].wordMultiplier === testRef[3]);

        testRef = [0, 3, 2, 1];
        assert(board['board'][testRef[0]][testRef[1]].multiplier === testRef[2]);
        assert(board['board'][testRef[0]][testRef[1]].wordMultiplier === testRef[3]);

        testRef = [2, 4, 1, 1];
        assert(board['board'][testRef[0]][testRef[1]].multiplier === testRef[2]);
        assert(board['board'][testRef[0]][testRef[1]].wordMultiplier === testRef[3]);
    });
});
