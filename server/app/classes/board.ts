import { DictionnaryService } from '@app/services/dictionnary.service';
import { WordGetter } from '@app/services/word-getter';
import { GameTile } from './game-tile';
import * as Multipliers from './multipliers';

const INVALID = -1;
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
        if (!this.isTouchingOtherWord(word.length, row, col, isHorizontal)) throw new Error('Placement invalide vous devez toucher un autre mot');
        const contacts = this.getContacts(word.length, row, col, isHorizontal);
        const words = this.wordGetter.getWords(word, row, col, contacts, isHorizontal);
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
        let collisions = 0;
        if (this.board[HALF_LENGTH][HALF_LENGTH].empty) {
            contacts = [[INVALID]];
        } else if (isHorizontal === undefined) {
            if (!this.board[row][col - 1].empty || !this.board[row][col + 1].empty) {
                isHorizontal = true;
            } else {
                if (isHorizontal !== undefined) {
                    contacts.push([row, col, 0]);
                } else {
                    isHorizontal = false;
                }
            }
        } else if (isHorizontal) {
            for (let i = 0; i < wordLength + collisions; i++) {
                if (!this.board[row][col + i].empty) {
                    collisions++;
                    contacts.push([row, col + i, INVALID]);
                } else if (!this.board[row - 1][col + i].empty || !this.board[row + 1][col + i].empty) {
                    contacts.push([row, col + i, i - collisions]);
                }
            }
        } else {
            for (let i = 0; i < wordLength + collisions; i++) {
                if (!this.board[row + i][col].empty) {
                    collisions++;
                    contacts.push([row + i, col, INVALID]);
                } else if (!this.board[row + i][col - 1].empty || !this.board[row + i][col + 1].empty) {
                    contacts.push([row + i, col, i - collisions]);
                }
            }
        }
        return contacts;
    }

    private isTouchingOtherWord(wordLength: number, row: number, col: number, isHorizontal?: boolean): boolean {
        if (this.board[HALF_LENGTH][HALF_LENGTH].empty) {
            return true;
        }
        if (isHorizontal === undefined) {
            return this.isWordTouchingOneLetter(row, col);
        }
        if (isHorizontal) {
            return this.isWordTouchingHorizontal(wordLength, row, col);
        }
        return this.isWordTouchingVertical(wordLength, row, col);
    }

    // fonctionne avec seulement h et v donc pas necessaires
    private isWordTouchingOneLetter(row: number, col: number): boolean {
        const valid = !this.board[row][col - 1].empty || !this.board[row][col + 1].empty;
        return valid || !this.board[row - 1][col] || !this.board[row + 1][col].empty;
    }

    private isWordTouchingHorizontal(wordLength: number, row: number, col: number): boolean {
        if ((row - 1 > 0 && !this.board[row][col - 1].empty) || (col + wordLength < BOARD_LENGTH && !this.board[row][col + wordLength].empty)) {
            return true;
        }
        for (let i = col; i < col + wordLength; i++) {
            if (!this.board[row][i].empty) {
                return true;
            } else if ((row - 1 >= 0 && !this.board[row - 1][i].empty) || (row + 1 < BOARD_LENGTH && !this.board[row + 1][i].empty)) {
                return true;
            }
        }
        return false;
    }

    private isWordTouchingVertical(wordLength: number, row: number, col: number): boolean {
        if (row - 1 > 0 && !this.board[row - 1][col].empty) {
            return true;
        }
        if (row + wordLength < BOARD_LENGTH && !this.board[row + wordLength][col].empty) {
            return true;
        }
        for (let i = row; i < row + wordLength; i++) {
            if (!this.board[i][col].empty) {
                return true;
            } else if (col - 1 >= 0 && !this.board[i][col - 1].empty) {
                return true;
            }
            if (col + 1 < BOARD_LENGTH && !this.board[i][col + 1].empty) {
                return true;
            }
        }
        return false;
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
