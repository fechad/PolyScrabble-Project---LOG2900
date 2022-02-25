import { GameTile } from '@app/classes/game-tile';

const INVALID = -1;
const BOARD_LENGTH = 15;

export class WordGetter {
    constructor(public board: GameTile[][]) {}

    getWords(word: string, row: number, col: number, contacts: number[][], isHorizontal: boolean): string[] {
        if (contacts.length === 0) throw new Error('Placement invalide vous devez toucher un autre mot');
        const words: string[] = [];

        // get attempted word
        words.push(this.getWord(row, col, word, isHorizontal));

        // get words by contact
        if (contacts[0][0] !== INVALID) {
            for (const contact of contacts) {
                words.push(this.getWord(contact[0], contact[1], word, !isHorizontal, contact[2]));
            }
        }
        return words;
    }

    private getWord(row: number, col: number, attemptedWord: string, isHorizontal: boolean, letterPlace?: number): string {
        const startRow = row;
        const startCol = col;
        let word = isHorizontal ? 'h' : 'v';

        if (isHorizontal) {
            while (col - 1 >= 0 && !this.board[row][col - 1].empty) col--;
        } else {
            while (row - 1 >= 0 && !this.board[row - 1][col].empty) row--;
        }
        word += ';' + row.toString() + ';' + col.toString() + ';';

        if (letterPlace !== undefined) {
            word += this.getLettersOtherWord(row, startRow, col, startCol, attemptedWord, isHorizontal, letterPlace);
        } else {
            word += this.getLettersAttemptedWord(row, col, attemptedWord, isHorizontal);
        }
        return word;
    }

    private getLettersAttemptedWord(row: number, col: number, testedWord: string, isHorizontal: boolean): string {
        let letterCount = 0;
        let letters = '';
        while (col < BOARD_LENGTH && row < BOARD_LENGTH) {
            if (
                letterCount < testedWord.length ||
                (isHorizontal ? col + 1 < BOARD_LENGTH && !this.board[row][col + 1].empty : row + 1 < BOARD_LENGTH && !this.board[row + 1][col].empty)
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
            if (isHorizontal) col++;
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
        isHorizontal: boolean,
        letterPlace: number,
    ): string {
        let letters = '';
        while (col < BOARD_LENGTH && row < BOARD_LENGTH && (!this.board[row][col].empty || (col <= refCol && row <= refRow))) {
            if (!this.board[row][col].empty) {
                letters += this.board[row][col].getChar();
            } else if (row === refRow && col === refCol && letterPlace !== INVALID) {
                letters += testedWord.charAt(letterPlace);
            }
            if (isHorizontal) col++;
            else row++;
        }
        return letters;
    }
}
