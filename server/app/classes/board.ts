import { LetterPlacement } from '@app/classes/placement-option';
import * as cst from '@app/constants';
import { GameTile } from './game-tile';
import { Position } from './position';

export class Board {
    private board: GameTile[][];

    constructor() {
        this.board = [];
        for (let i = 0; i < cst.BOARD_LENGTH; i++) {
            this.board[i] = [];
            for (let j = 0; j < cst.BOARD_LENGTH; j++) {
                this.board[i][j] = new GameTile(1);
            }
        }
        this.initList(cst.MULT_WORDS_3, 1, 3);
        this.initList(cst.MULT_WORDS_2, 1, 2);
        this.initList(cst.MULT_LETTERS_3, 3);
        this.initList(cst.MULT_LETTERS_2, 2);
    }

    get(position: Position): GameTile {
        return this.board[position.row][position.col];
    }

    /* getPlayablePositions(rackLength: number): PlacementOption[] {
        const arrayPos: PlacementOption[] = [];
        for (let i = 0; i < cst.BOARD_LENGTH; i++) {
            for (let j = 0; j < cst.BOARD_LENGTH; j++) {
                if (!this.board[i][j].letter) continue;
                // for each direction
                for (const isHorizontal of [true, false]) {
                    const word = this.getPositionString(new PlacementOption(new Position(i, j), isHorizontal, ''), rackLength);
                    if ([...word].some((char) => char !== ' ')) arrayPos.push(new PlacementOption(new Position(i, j), isHorizontal, word));
                }
            }
        }
        return arrayPos;
    }*/

    place(newLetters: LetterPlacement[]) {
        for (const placement of newLetters) {
            this.board[placement.position.row][placement.position.col].letter = placement.letter.toUpperCase();
        }
    }

    isInContact(row: number, col: number, isWordHorizontal: boolean): boolean {
        if (row < 0 || col < 0 || row >= cst.BOARD_LENGTH || col >= cst.BOARD_LENGTH) return false;
        return isWordHorizontal
            ? (row > 0 && !!this.board[row - 1][col]) || (row + 1 < cst.BOARD_LENGTH && !!this.board[row + 1][col])
            : (col > 0 && !!this.board[row][col - 1]) || (col + 1 < cst.BOARD_LENGTH && !!this.board[row][col + 1]);
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
