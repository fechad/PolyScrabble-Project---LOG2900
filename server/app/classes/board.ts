import { LetterPlacement } from '@app/classes/placement-option';
import * as constants from '@app/constants';
import { GameTile } from './game-tile';
import { Position } from './position';

export class Board {
    private board: GameTile[][];

    constructor() {
        this.board = [];
        for (let i = 0; i < constants.BOARD_LENGTH; i++) {
            this.board[i] = [];
            for (let j = 0; j < constants.BOARD_LENGTH; j++) {
                this.board[i][j] = new GameTile(1);
            }
        }
        this.initList(constants.MULT_WORDS_3, 1, 3);
        this.initList(constants.MULT_WORDS_2, 1, 2);
        this.initList(constants.MULT_LETTERS_3, 3);
        this.initList(constants.MULT_LETTERS_2, 2);
    }

    get(position: Position): GameTile {
        if (!position.isInBound()) throw new Error('Cette case est hors du plateau');
        return this.board[position.row][position.col];
    }

    place(newLetters: LetterPlacement[]) {
        for (const placement of newLetters) {
            this.get(placement.position).letter = placement.letter.toUpperCase();
        }
    }

    isInContact(pos: Position, isWordHorizontal: boolean): boolean {
        return isWordHorizontal
            ? (pos.row > 0 && !!this.board[pos.row - 1][pos.col].letter) ||
                  (pos.row + 1 < constants.BOARD_LENGTH && !!this.board[pos.row + 1][pos.col].letter)
            : (pos.col > 0 && !!this.board[pos.row][pos.col - 1].letter) ||
                  (pos.col + 1 < constants.BOARD_LENGTH && !!this.board[pos.row][pos.col + 1].letter);
    }

    getState(): (string | undefined)[][] {
        return this.board.map((row) => row.map((tile) => tile.letter));
    }

    private initList(array: number[][], multLetter: number, multWord?: number) {
        for (const position of array) {
            this.board[position[0]][position[1]] = new GameTile(multLetter, multWord);
        }
    }
}
