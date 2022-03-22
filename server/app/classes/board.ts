import { PlacementOption } from '@app/classes/placement-option';
import * as cst from '@app/constants';
import { DictionnaryService } from '@app/services/dictionnary.service';
import { WordGetter } from '@app/services/word-getter';
import { GameTile } from './game-tile';

export class Board {
    board: GameTile[][];
    wordGetter: WordGetter;

    constructor(private dictionnary: DictionnaryService) {
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
        this.wordGetter = new WordGetter(this.board);
    }

    async placeWord(word: string, row: number, col: number, isHorizontal?: boolean): Promise<number> {
        isHorizontal ||= this.isInContact(row, col, false);
        const triedPlacement = new PlacementOption(row, col, isHorizontal, word);

        if (!this.isWordInBound(triedPlacement)) throw new Error('Placement invalide le mot ne rentre pas dans la grille');
        await new Promise((resolve) => {
            setTimeout(() => {
                resolve(null);
            }, cst.BOARD_PLACEMENT_DELAY);
        });
        if (!this.firstWordValidation(triedPlacement)) throw new Error('Placement invalide pour le premier mot');
        const contacts = this.getContacts(triedPlacement);
        const words = this.wordGetter.getWords(triedPlacement, contacts);
        if (!words.every((wordOption) => this.dictionnary.isValidWord(wordOption.word)))
            throw new Error('Un des mots crees ne fait pas partie du dictionnaire');
        const score = this.getScore(words, true);
        return word.length === cst.WORD_LENGTH_BONUS ? score + cst.BONUS_POINTS : score;
    }

    getScoreVirtualPlayer(command: PlacementOption) {
        const contacts = this.getContacts(command);
        const words = this.wordGetter.getWords(command, contacts);
        const score = this.getScore(words, false);
        return command.word.length === cst.WORD_LENGTH_BONUS ? score + cst.BONUS_POINTS : score;
    }

    getPlayablePositions(rackLength: number): string[][][] {
        const playablePositions: string[][][] = [];
        for (let i = 0; i < cst.BOARD_LENGTH; i++) {
            playablePositions[i] = [];
            for (let j = 0; j < cst.BOARD_LENGTH; j++) {
                playablePositions[i][j] = [];
                if (!this.board[i][j].empty) {
                    playablePositions[i][j][0] = '';
                    playablePositions[i][j][1] = '';
                } else {
                    playablePositions[i][j][0] = this.getPositionString(i, j, rackLength, true);
                    playablePositions[i][j][1] = this.getPositionString(i, j, rackLength, false);
                }
            }
        }
        return playablePositions;
    }

    getScore(words: PlacementOption[], placeWord: boolean): number {
        let score = 0;
        words.forEach((word) => {
            let wordScore = 0;
            let wordMultiplier = 1;
            let row = word.row;
            let col = word.col;

            for (let offset = 0; offset < word.word.length; offset++) {
                if (word.isHorizontal) col = word.col + offset;
                else row = word.row + offset;

                if (this.board[row][col].empty) this.board[row][col].setLetter(word.word.charAt(offset));
                wordScore += this.board[row][col].getPoints();
                wordMultiplier *= this.board[row][col].wordMultiplier;
            }
            score += wordScore * wordMultiplier;
        });
        this.changeNewlyPlaced(words[0], placeWord);
        return score;
    }

    private changeNewlyPlaced(attemptedWord: PlacementOption, placeWord: boolean) {
        let row = attemptedWord.row;
        let col = attemptedWord.col;
        let offset = 0;
        while (offset < attemptedWord.word.length) {
            if (!placeWord && this.board[row][col].newlyPlaced) {
                this.board[row][col].deleteLetter();
            } else {
                this.board[row][col].newlyPlaced = false;
            }
            if (attemptedWord.isHorizontal) col++;
            else row++;
            offset++;
        }
    }

    private getContacts(placement: PlacementOption): number[][] {
        if (this.board[cst.HALF_LENGTH][cst.HALF_LENGTH].empty) return [];
        let collisions = 0;
        let wordPos = 0;
        const contacts = [];
        let row = placement.row;
        let col = placement.col;
        if (placement.isHorizontal) while (this.containsLetter(row, col - 1)) col--;
        else while (this.containsLetter(row - 1, col)) row--;

        for (let offset = 0; offset <= placement.word.length + collisions || this.containsLetter(row, col); offset++) {
            if (placement.isHorizontal) col = placement.col + offset;
            else row = placement.row + offset;

            if (this.isInContact(row, col, placement.isHorizontal) && this.board[row][col].empty) {
                contacts.push([row, col, wordPos]);
            }
            if (this.board[row][col].empty) wordPos++;
            else collisions++;
        }
        if (collisions === 0 && contacts.length === 0) {
            throw new Error('Placement invalide aucun point de contact');
        }
        return contacts;
    }

    private firstWordValidation(placement: PlacementOption): boolean {
        if (!this.board[cst.HALF_LENGTH][cst.HALF_LENGTH].empty) {
            return true;
        } else {
            const length = placement.word.length - 1;
            if (
                placement.isHorizontal &&
                placement.row === cst.HALF_LENGTH &&
                placement.col <= cst.HALF_LENGTH &&
                placement.col + length >= cst.HALF_LENGTH
            ) {
                return true;
            } else if (
                !placement.isHorizontal &&
                placement.col === cst.HALF_LENGTH &&
                placement.row <= cst.HALF_LENGTH &&
                placement.row + length >= cst.HALF_LENGTH
            ) {
                return true;
            }
        }
        return false;
    }

    private isWordInBound(placement: PlacementOption) {
        let collisions = 0;
        if (placement.row < 0 || placement.col < 0) return false;
        let row = placement.row;
        let col = placement.col;
        for (let offset = 0; offset < placement.word.length + collisions; offset++) {
            if (placement.isHorizontal) col = placement.col + offset;
            else row = placement.row + offset;

            if (row >= cst.BOARD_LENGTH || col >= cst.BOARD_LENGTH) return false;
            if (this.containsLetter(row, col)) {
                collisions++;
            }
        }
        return true;
    }

    private getPositionString(startRow: number, startCol: number, rackLength: number, isHorizontal: boolean): string {
        let position = '';
        let collisions = 0;
        if (isHorizontal) while (this.containsLetter(startRow, startCol - 1)) startCol--;
        else while (this.containsLetter(startRow - 1, startCol)) startRow--;

        let row = startRow;
        let col = startCol;
        for (let offset = 0; (isHorizontal ? startCol : startRow) + offset < cst.BOARD_LENGTH && offset < rackLength + collisions; offset++) {
            if (isHorizontal) col = startCol + offset;
            else row = startRow + offset;

            if (this.containsLetter(row, col)) {
                position += this.board[row][col].getChar();
                collisions++;
            } else if (this.isInContact(row, col, isHorizontal)) {
                position += cst.CONTACT_CHAR;
            } else {
                position += ' ';
            }
        }
        while (this.containsLetter(row, col)) {
            position += this.board[row][col].getChar();
            if (isHorizontal) col++;
            else row++;
        }
        return position;
    }

    private containsLetter(row: number, col: number) {
        const inBound = row >= 0 && row < cst.BOARD_LENGTH && col >= 0 && col < cst.BOARD_LENGTH;
        return inBound && !this.board[row][col].empty;
    }

    private isInContact(row: number, col: number, isWordHorizontal: boolean): boolean {
        return isWordHorizontal
            ? (row - 1 >= 0 && !this.board[row - 1][col].empty) || (row + 1 < cst.BOARD_LENGTH && !this.board[row + 1][col].empty)
            : (col - 1 >= 0 && !this.board[row][col - 1].empty) || (col + 1 < cst.BOARD_LENGTH && !this.board[row][col + 1].empty);
    }

    private initList(array: number[][], multLetter: number, multWord?: number) {
        for (const position of array) {
            this.board[position[0]][position[1]] = new GameTile(multLetter, multWord);
        }
    }
}
