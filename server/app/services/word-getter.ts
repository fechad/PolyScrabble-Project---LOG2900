import { GameTile } from '@app/classes/game-tile';

const INVALID = -1;
const BOARD_LENGTH = 15;

export class WordGetter {
    constructor(public board: GameTile[][]) {}

    getWords(word: string, position: string[], contacts: number[][]): string[] {
        const words: string[] = [];
        const currentRow = position[0].charCodeAt(0) - 'a'.charCodeAt(0);
        const currentCol = parseInt(position[1], 10) - 1;

        // get attempted word
        words.push(this.getWord(currentRow, currentCol, word, position[2] === 'h', position[2]));

        // get words by contact
        if (contacts[0][0] !== INVALID) {
            for (const contact of contacts) {
                const wordStart = position[2] === 'h' ? 'v' : 'h';
                words.push(this.getWord(contact[0], contact[1], word, position[2] === 'v', wordStart, contact[2]));
            }
        }
        return words;
    }

    private getWord(row: number, col: number, attemptedWord: string, horizontal: boolean, word: string, letterPlace?: number): string {
        const startRow = row;
        const startCol = col;

        if (horizontal) {
            while (col - 1 >= 0 && !this.board[row][col - 1].empty) col--;
        } else {
            while (row - 1 >= 0 && !this.board[row - 1][col].empty) row--;
        }
        word += ';' + row.toString() + ';' + col.toString() + ';';
        if (letterPlace !== undefined) {
            word += this.getLettersOtherWord(row, startRow, col, startCol, attemptedWord, horizontal, letterPlace);
        } else {
            word += this.getLettersAttemptedWord(row, col, attemptedWord, horizontal);
        }
        return word;
    }

    private getLettersAttemptedWord(row: number, col: number, testedWord: string, horizontal: boolean): string {
        let letterCount = 0;
        let letters = '';
        while (col < BOARD_LENGTH && row < BOARD_LENGTH) {
            if (
                letterCount < testedWord.length ||
                (horizontal ? col + 1 < BOARD_LENGTH && !this.board[row][col + 1].empty : row + 1 < BOARD_LENGTH && !this.board[row + 1][col].empty)
            ) {
                if (this.board[row][col].empty) {
                    letters += testedWord.charAt(letterCount);
                    letterCount++;
                } else {
                    letters += this.board[row][col].getChar();
                }
            } else {
                break;
            }
            if (horizontal) col++;
            else row++;
        }
        return letters;
    }

    private getLettersOtherWord(
        row: number,
        refRow: number,
        col: number,
        refCol: number,
        testedWord: string,
        horizontal: boolean,
        letterPlace: number,
    ): string {
        let letters = '';
        while (col < BOARD_LENGTH && row < BOARD_LENGTH && (!this.board[row][col].empty || (col <= refCol && row <= refRow))) {
            if (!this.board[row][col].empty) {
                letters += this.board[row][col].getChar();
            } else if (row === refRow && col === refCol && letterPlace !== INVALID) {
                letters += testedWord.charAt(letterPlace);
            }
            if (horizontal) col++;
            else row++;
        }
        return letters;
    }
}
