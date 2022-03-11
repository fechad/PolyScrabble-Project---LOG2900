import { DictionnaryService } from '@app/services/dictionnary.service';
import { WordGetter } from '@app/services/word-getter';
import { GameTile } from './game-tile';
import * as Multipliers from './multipliers';

const FIRST_WORD = -1;
const VALID_CONTACT = -1;
const BOARD_LENGTH = 15;
const HALF_LENGTH = 7;
const WORD_LENGTH_BONUS = 7;
const BONUS_POINTS = 50;
const BOARD_PLACEMENT_DELAY = 3000; // ms

export class Board {
    board: GameTile[][];
    private wordGetter: WordGetter;

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
            isHorizontal = (col - 1 >= 0 && !this.board[row][col - 1].empty) || (col + 1 < BOARD_LENGTH && !this.board[row][col + 1].empty);
        }
        const words = this.wordGetter.getWords(word, row, col, contacts, isHorizontal as boolean);
        if (!this.dictionnary.validateWords(words)) throw new Error('Un des mots crees ne fait pas partie du dictionnaire');
        const score = this.placeWithScore(words);
        return word.length === WORD_LENGTH_BONUS ? score + BONUS_POINTS : score;
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
            if ((col - 1 >= 0 && !this.board[row][col - 1].empty) || (col + 1 < BOARD_LENGTH && !this.board[row][col + 1].empty)) {
                if ((row - 1 >= 0 && !this.board[row - 1][col].empty) || (row + 1 < BOARD_LENGTH && !this.board[row - 1][col].empty)) {
                    contacts.push([row, col, 0]);
                }
            }
        } else if (isHorizontal) {
            contacts = contacts.concat(this.getContactHorizontal(row, col, wordLength));
        } else {
            contacts = contacts.concat(this.getContactVertical(row, col, wordLength));
        }
        return contacts;
    }

    private getContactHorizontal(row: number, col: number, wordLength: number): number[][] {
        let collisions = 0;
        let wordPos = 0;
        const contacts = [];
        while (col - 1 >= 0 && !this.board[row][col - 1].empty) col--;
        for (let i = 0; i < wordLength + collisions || (col + i < BOARD_LENGTH && !this.board[row][col + i].empty); i++) {
            if ((row - 1 >= 0 && !this.board[row - 1][col + i].empty) || (row + 1 < BOARD_LENGTH && !this.board[row + 1][col + i].empty)) {
                if (this.board[row][col + i].empty) {
                    contacts.push([row, col + i, wordPos]);
                }
            }
            if (this.board[row][col + i].empty) wordPos++;
            else collisions++;
        }
        if (collisions !== 0 && contacts.length === 0) {
            contacts.push([VALID_CONTACT]);
        }
        return contacts;
    }

    private getContactVertical(row: number, col: number, wordLength: number): number[][] {
        let collisions = 0;
        let wordPos = 0;
        const contacts = [];
        while (row - 1 >= 0 && !this.board[row - 1][col].empty) row--;
        for (let i = 0; i < wordLength + collisions || (row + i < BOARD_LENGTH && !this.board[row + i][col].empty); i++) {
            if ((col - 1 >= 0 && !this.board[row + i][col - 1].empty) || (col + 1 < BOARD_LENGTH && !this.board[row + i][col + 1].empty)) {
                if (this.board[row + i][col].empty) {
                    contacts.push([row + i, col, wordPos]);
                }
            }
            if (this.board[row + i][col].empty) wordPos++;
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
        let collisionsCol = 0;
        let collisionsRow = 0;
        if (row < 0 || col < 0) return false;
        if (isHorizontal === undefined) return row < BOARD_LENGTH && col < BOARD_LENGTH;

        if (isHorizontal) {
            for (let i = 0; i < wordLength + collisionsCol; i++) {
                if (col + i >= BOARD_LENGTH) {
                    return false;
                }
                if (!this.board[row][col + i].empty) {
                    collisionsCol++;
                }
            }
        } else {
            for (let i = 0; i < wordLength + collisionsRow; i++) {
                if (row + i >= BOARD_LENGTH) {
                    return false;
                }
                if (!this.board[row + i][col].empty) {
                    collisionsRow++;
                }
            }
        }
        return true;
    }

    private initList(array: number[][], multLetter: number, multWord?: number) {
        for (const position of array) {
            this.board[position[0]][position[1]] = new GameTile(multLetter, multWord);
        }
    }
}
