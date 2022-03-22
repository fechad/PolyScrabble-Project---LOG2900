import { GameTile } from '@app/classes/game-tile';
import { PlacementOption } from '@app/classes/placement-option';
import * as cst from '@app/constants';

export class WordGetter {
    constructor(public board: GameTile[][]) {}

    getStringPositionVirtualPlayer(row: number, col: number, isHoriontal: boolean) {
        const initialRow = row;
        const initialCol = col;
        let contactWord = '';
        if (isHoriontal) {
            while (col > 0 && !this.board[row][col - 1].empty) col--;
            while (col < cst.BOARD_LENGTH && (!this.board[row][col].empty || col === initialCol)) {
                if (col === initialCol) contactWord += cst.CONTACT_CHAR;
                else contactWord += this.board[row][col].getChar();
                col++;
            }
        } else {
            while (row > 0 && !this.board[row - 1][col].empty) row--;
            while (row < cst.BOARD_LENGTH && (!this.board[row][col].empty || row === initialRow)) {
                if (row === initialRow) contactWord += cst.CONTACT_CHAR;
                else contactWord += this.board[row][col].getChar();
                row++;
            }
        }
        return contactWord;
    }

    getWords(placement: PlacementOption, contacts: number[][]): PlacementOption[] {
        const words: PlacementOption[] = [];
        words.push(this.getLettersAttemptedWord(placement));
        words.push(
            ...contacts
                .filter((contact) => contact.length !== 0)
                .map((contact) => {
                    const contactPlacement = new PlacementOption(
                        contact[cst.ROW_CONTACT],
                        contact[cst.COL_CONTACT],
                        !placement.isHorizontal,
                        placement.word,
                    );
                    return this.getLettersContactWord(contactPlacement, contact[cst.LETTER_PLACE_CONTACT]);
                }),
        );
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
        const inBound = row >= 0 && row < cst.BOARD_LENGTH && col >= 0 && col < cst.BOARD_LENGTH;
        return inBound && !this.board[row][col].empty;
    }
}
