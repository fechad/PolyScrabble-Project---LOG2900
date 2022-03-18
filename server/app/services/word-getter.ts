import { GameTile } from '@app/classes/game-tile';
import { PlacementOption } from '@app/placement-option';

const ROW_CONTACT = 0;
const COL_CONTACT = 1;
const CONTACT_CHAR = '#'
const LETTER_PLACE_CONTACT = 2;
const BOARD_LENGTH = 15;

export class WordGetter {
    constructor(public board: GameTile[][]) {}

    getStringPositionVirtualPlayer(row: number, col: number, isHoriontal: boolean) {
        const initialRow = row;
        const initialCol = col;
        let contactWord = '';
        if (isHoriontal) {
            while (col > 0 && !this.board[row][col - 1].empty) col--;
            while (col < BOARD_LENGTH && (!this.board[row][col].empty || col === initialCol)) {
                if (col === initialCol) contactWord += CONTACT_CHAR;
                else contactWord += this.board[row][col].getChar();
                col++;
            }
        } else {
            while (row > 0 && !this.board[row - 1][col].empty) row--;
            while (row < BOARD_LENGTH && (!this.board[row][col].empty || row === initialRow)) {
                if (row === initialRow) contactWord += CONTACT_CHAR;
                else contactWord += this.board[row][col].getChar();
                row++;
            }
        }
        return contactWord;
    }

    getWords(placement: PlacementOption, contacts: number[][]): PlacementOption[] {
        const words: PlacementOption[] = [];

        words.push(this.getLettersAttemptedWord(placement));

        contacts.forEach((contact) => {
            if (contact.length === 0) return;
            const contactPlacement = new PlacementOption(contact[ROW_CONTACT], contact[COL_CONTACT], !placement.isHorizontal, placement.word);
            words.push(this.getLettersContactWord(contactPlacement, contact[LETTER_PLACE_CONTACT]));
        });
        return words;
    }

    private getLettersAttemptedWord(placement: PlacementOption): PlacementOption {
        let letterCount = 0;
        let letters = '';
        let row = placement.row;
        let col = placement.col;
        if (placement.isHorizontal) while (col - 1 >= 0 && !this.board[row][col - 1].empty) col--;
        else while (row - 1 >= 0 && !this.board[row - 1][col].empty) row--;

        while (this.containsLetter(row, col) || letterCount < placement.word.length) {
            if (this.board[row][col].empty) {
                letters += placement.word.charAt(letterCount);
                letterCount++;
            } else {
                letters += this.board[row][col].getChar();
            }
            if (placement.isHorizontal) col++;
            else row++;
        }
        return placement.deepCopy(letters);
    }

    private getLettersContactWord(contact: PlacementOption, letterPlace: number): PlacementOption {
        let letters = '';
        let row = contact.row;
        let col = contact.col;
        if (contact.isHorizontal) while (col - 1 >= 0 && !this.board[row][col - 1].empty) col--;
        else while (row - 1 >= 0 && !this.board[row - 1][col].empty) row--;
        const minRow = row;
        const minCol = col;

        while (this.containsLetter(row, col) || (row === contact.row && col === contact.col)) {
            if (this.containsLetter(row, col)) {
                letters += this.board[row][col].getChar();
            } else if (row === contact.row && col === contact.col) {
                letters += contact.word.charAt(letterPlace);
            }
            if (contact.isHorizontal) col++;
            else row++;
        }
        return new PlacementOption(minRow, minCol, contact.isHorizontal, letters);
    }

    private containsLetter(row: number, col: number) {
        const inBound = row >= 0 && row < BOARD_LENGTH && col >= 0 && col < BOARD_LENGTH;
        return inBound && !this.board[row][col].empty;
    }
}
