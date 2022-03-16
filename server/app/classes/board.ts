import { DictionnaryService } from '@app/services/dictionnary.service';
import { WordGetter } from '@app/services/word-getter';
import { GameTile } from './game-tile';
import * as Multipliers from './multipliers';

const CONTACT_CHAR = '*';
const FIRST_WORD = -1;
const VALID_CONTACT = -1;
const BOARD_LENGTH = 15;
const HALF_LENGTH = 7;
const WORD_LENGTH_BONUS = 7;
const BONUS_POINTS = 50;
const BOARD_PLACEMENT_DELAY = 3000; // ms

export class Board {
    board: GameTile[][];
    wordGetter: WordGetter;

    constructor(private dictionnary: DictionnaryService) {
        this.board = [];
        for (let i = 0; i < BOARD_LENGTH; i++) {
            this.board[i] = [];
            for (let j = 0; j < BOARD_LENGTH; j++) {
                this.board[i][j] = new GameTile(1);
            }
        }
        this.initList(Multipliers.MULT_WORDS_3, 1, 3);
        this.initList(Multipliers.MULT_WORDS_2, 1, 2);
        this.initList(Multipliers.MULT_LETTERS_3, 3);
        this.initList(Multipliers.MULT_LETTERS_2, 2);
        this.wordGetter = new WordGetter(this.board);
    }

    async placeWord(word: string, row: number, col: number, isHorizontal?: boolean): Promise<number> {
        if (!this.isWordInBound(word.length, row, col, isHorizontal)) throw new Error('Placement invalide le mot ne rentre pas dans la grille');
        await new Promise((resolve) => {
            setTimeout(() => {
                resolve(null);
            }, BOARD_PLACEMENT_DELAY);
        });
        if (!this.firstWordValidation(word.length, row, col, isHorizontal)) throw new Error('Placement invalide pour le premier mot');
        const contacts = this.getContacts(word.length, row, col, isHorizontal);
        if (isHorizontal === undefined) {
            isHorizontal = this.isInContact(row, col, false);
        }
        const words = this.wordGetter.getWords(word, row, col, contacts, isHorizontal as boolean);
        if (!this.dictionnary.validateWords(words)) throw new Error('Un des mots crees ne fait pas partie du dictionnaire');
        const score = this.placeWithScore(words);
        return word.length === WORD_LENGTH_BONUS ? score + BONUS_POINTS : score;
    }

    getPlayablePositions(rackLength: number): string[][][] {
        const playablePositions: string[][][] = [];
        for (let i = 0; i < BOARD_LENGTH; i++) {
            playablePositions[i] = [];
            for (let j = 0; j < BOARD_LENGTH; j++) {
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

    private placeWithScore(words: string[]): number {
        let score = 0;
        words.forEach((word) => {
            let wordScore = 0;
            let wordMultiplier = 1;
            const wordAndPos = word.split(';');
            let currentRow = parseInt(wordAndPos[1], 10);
            let currentCol = parseInt(wordAndPos[2], 10);

            for (let i = 0; i < wordAndPos[3].length; i++) {
                if (this.board[currentRow][currentCol].empty) {
                    this.board[currentRow][currentCol].setLetter(wordAndPos[3].charAt(i));
                }
                wordScore += this.board[currentRow][currentCol].getPoints();
                wordMultiplier *= this.board[currentRow][currentCol].wordMultiplier;
                if (wordAndPos[0] === 'h') {
                    currentCol++;
                } else {
                    currentRow++;
                }
            }
            score += wordScore * wordMultiplier;
        });
        this.changeNewlyPlaced(words[0].split(';'));
        return score;
    }

    private changeNewlyPlaced(wordAndPos: string[]) {
        const currentRow = parseInt(wordAndPos[1], 10);
        const currentCol = parseInt(wordAndPos[2], 10);
        for (let i = 0; i < wordAndPos[3].length; i++) {
            if (wordAndPos[0] === 'h') {
                this.board[currentRow][currentCol + i].newlyPlaced = false;
            } else {
                this.board[currentRow + i][currentCol].newlyPlaced = false;
            }
        }
    }

    private getContacts(wordLength: number, row: number, col: number, isHorizontal?: boolean): number[][] {
        let contacts: number[][] = [];
        if (this.board[HALF_LENGTH][HALF_LENGTH].empty) {
            return [[FIRST_WORD]];
        }
        if (isHorizontal === undefined) {
            if (this.isInContact(row, col, true) && this.isInContact(row, col, false)) {
                contacts.push([row, col, 0]);
            }
        } else {
            contacts = contacts.concat(this.getUniqueContact(row, col, wordLength, isHorizontal));
        }
        return contacts;
    }

    private getUniqueContact(startRow: number, startCol: number, wordLength: number, isHoriontal: boolean): number[][] {
        let collisions = 0;
        let wordPos = 0;
        const contacts = [];
        if (isHoriontal) while (this.containsLetter(startRow, startCol - 1)) startCol--;
        else while (this.containsLetter(startRow - 1, startCol)) startRow--;

        let row = startRow;
        let col = startCol;
        for (let offset = 0; offset < wordLength + collisions || this.containsLetter(row, col); offset++) {
            if (isHoriontal) col = startCol + offset;
            else row = startRow + offset;
            if (this.isInContact(row, col, isHoriontal)) {
                if (this.board[row][col].empty) {
                    contacts.push([row, col, wordPos]);
                }
            }
            if (this.board[row][col].empty) wordPos++;
            else collisions++;
        }
        if (collisions !== 0 && contacts.length === 0) {
            contacts.push([VALID_CONTACT]);
        }
        return contacts;
    }

    private firstWordValidation(wordLength: number, row: number, col: number, isHorizontal?: boolean): boolean {
        if (!this.board[HALF_LENGTH][HALF_LENGTH].empty) {
            return true;
        } else if (isHorizontal === undefined) {
            return row === HALF_LENGTH && col === HALF_LENGTH;
        } else if (wordLength > 1) {
            if (isHorizontal && row === HALF_LENGTH && col <= HALF_LENGTH && col + wordLength - 1 >= HALF_LENGTH) {
                return true;
            } else if (col === HALF_LENGTH && row <= HALF_LENGTH && row + wordLength - 1 >= HALF_LENGTH) {
                return true;
            }
        }
        return false;
    }

    private isWordInBound(wordLength: number, row: number, col: number, isHorizontal?: boolean) {
        let collisions = 0;
        if (row < 0 || col < 0) return false;
        if (isHorizontal === undefined) return row < BOARD_LENGTH && col < BOARD_LENGTH;
        let currentRow = row;
        let currentCol = col;
        for (let offset = 0; offset < wordLength + collisions; offset++) {
            if (isHorizontal) currentCol = col + offset;
            else currentRow = row + offset;

            if (currentRow >= BOARD_LENGTH || currentCol >= BOARD_LENGTH) return false;
            if (this.containsLetter(currentRow, currentCol)) {
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
        for (let offset = 0; (isHorizontal ? startCol : startRow) + offset < BOARD_LENGTH && offset < rackLength + collisions; offset++) {
            if (isHorizontal) col = startCol + offset;
            else row = startRow + offset;

            if (this.containsLetter(row, col)) {
                position += this.board[row][col].getChar();
                collisions++;
            } else if (this.isInContact(row, col, isHorizontal)) {
                position += CONTACT_CHAR;
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
        const inBound = row >= 0 && row < BOARD_LENGTH && col >= 0 && col < BOARD_LENGTH;
        return inBound && !this.board[row][col].empty;
    }

    private isInContact(row: number, col: number, isWordHorizontal: boolean): boolean {
        return isWordHorizontal
            ? (row - 1 >= 0 && !this.board[row - 1][col].empty) || (row + 1 < BOARD_LENGTH && !this.board[row + 1][col].empty)
            : (col - 1 >= 0 && !this.board[row][col - 1].empty) || (col + 1 < BOARD_LENGTH && !this.board[row][col + 1].empty);
    }

    private initList(array: number[][], multLetter: number, multWord?: number) {
        for (const position of array) {
            this.board[position[0]][position[1]] = new GameTile(multLetter, multWord);
        }
    }
}
