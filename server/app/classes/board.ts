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
        let positionArray = [row, col];
        if (!this.isWordInBound(word.length, positionArray, isHorizontal)) throw new Error('Placement invalide le mot ne rentre pas dans la grille');
        await new Promise((resolve) => {
            setTimeout(() => {
                resolve(null);
            }, BOARD_PLACEMENT_DELAY);
        });
        if (!this.firstWordValidation(word.length, positionArray)) throw new Error('Placement invalide pour le premier mot');
        if (!this.isTouchingOtherWord(word.length, positionArray)) throw new Error('Placement invalide vous devez toucher un autre mot');
        const contacts = this.getContacts(word.length, positionArray);
        const words = this.wordGetter.getWords(word, positionArray, contacts, isHorizontal);
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
                if (wordMultiplier === 1) {
                    wordMultiplier *= this.board[currentRow][currentCol].wordMultiplier;
                }
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

    private getContacts(wordLength: number, pos: number[], isHorizontal?: boolean): number[][] {
        let contacts: number[][] = [];
        let collisions = 0;
        if (this.board[HALF_LENGTH][HALF_LENGTH].empty) {
            contacts = [[INVALID]];
        } else if (isHorizontal === undefined) {
            if (!this.board[pos[0]][pos[1] - 1].empty || !this.board[pos[0]][pos[1] + 1].empty) {
                isHorizontal = true;
            } else {
                if (isHorizontal !== undefined) {
                    contacts.push([pos[0], pos[1], 0]);
                } else {
                    isHorizontal = false;
                }
            }
        } else if (isHorizontal) {
            for (let i = 0; i < wordLength + collisions; i++) {
                if (!this.board[pos[0]][pos[1] + i].empty) {
                    collisions++;
                    contacts.push([pos[0], pos[1] + i, INVALID]);
                } else if (!this.board[pos[0] - 1][pos[1] + i].empty || !this.board[pos[0] + 1][pos[1] + i].empty) {
                    contacts.push([pos[0], pos[1] + i, i - collisions]);
                }
            }
        } else {
            for (let i = 0; i < wordLength + collisions; i++) {
                if (!this.board[pos[0] + i][pos[1]].empty) {
                    collisions++;
                    contacts.push([pos[0] + i, pos[1], INVALID]);
                } else if (!this.board[pos[0] + i][pos[1] - 1].empty || !this.board[pos[0] + i][pos[1] + 1].empty) {
                    contacts.push([pos[0] + i, pos[1], i - collisions]);
                }
            }
        }
        return contacts;
    }

    private isTouchingOtherWord(wordLength: number, pos: number[], isHorizontal?: boolean): boolean {
        if (this.board[HALF_LENGTH][HALF_LENGTH].empty) {
            return true;
        }
        if (isHorizontal === undefined) {
            return this.isWordTouchingOneLetter(pos);
        }
        if (isHorizontal) {
            return this.isWordTouchingHorizontal(wordLength, pos);
        }
        return this.isWordTouchingVertical(wordLength, pos);
    }

    // fonctionne avec seulement h et v donc pas necessaires
    private isWordTouchingOneLetter(pos: number[]): boolean {
        const valid = !this.board[pos[0]][pos[1] - 1].empty || !this.board[pos[0]][pos[1] + 1].empty;
        return valid || !this.board[pos[0] - 1][pos[1]] || !this.board[pos[0] + 1][pos[1]].empty;
    }

    private isWordTouchingHorizontal(wordLength: number, pos: number[]): boolean {
        if ((pos[0] - 1 > 0 && !this.board[pos[0]][pos[1] - 1].empty) || (pos[1] + wordLength < BOARD_LENGTH && !this.board[pos[0]][pos[1] + wordLength].empty)) {
            return true;
        }
        for (let i = pos[1]; i < pos[1] + wordLength; i++) {
            if (!this.board[pos[0]][i].empty) {
                return true;
            } else if ((pos[0] - 1 >= 0 && !this.board[pos[0] - 1][i].empty) || (pos[0] + 1 < BOARD_LENGTH && !this.board[pos[0] + 1][i].empty)) {
                return true;
            }
        }
        return false;
    }

    private isWordTouchingVertical(wordLength: number, pos: number[]): boolean {
        if (pos[0] - 1 > 0 && !this.board[pos[0] - 1][pos[1]].empty) {
            return true;
        }
        if (pos[0] + wordLength < BOARD_LENGTH && !this.board[pos[0] + wordLength][pos[1]].empty) {
            return true;
        }
        for (let i = pos[0]; i < pos[0] + wordLength; i++) {
            if (!this.board[i][pos[1]].empty) {
                return true;
            } else if (pos[1] - 1 >= 0 && !this.board[i][pos[1] - 1].empty) {
                return true;
            }
            if (pos[1] + 1 < BOARD_LENGTH && !this.board[i][pos[1] + 1].empty) {
                return true;
            }
        }
        return false;
    }

    private firstWordValidation(wordLength: number, pos: number[], isHorizontal?: boolean): boolean {
        if (!this.board[HALF_LENGTH][HALF_LENGTH].empty) {
            return true;
        } else if (isHorizontal === undefined) {
            return pos[0] === HALF_LENGTH && pos[1] === HALF_LENGTH;
        } else if (wordLength > 1) {
            if (isHorizontal && pos[0] === HALF_LENGTH && pos[1] <= HALF_LENGTH && pos[1] + wordLength - 1 >= HALF_LENGTH) {
                return true;
            } else if (pos[1] === HALF_LENGTH && pos[0] <= HALF_LENGTH && pos[0] + wordLength - 1 >= HALF_LENGTH) {
                return true;
            }
        }
        return false;
    }

    private isWordInBound(wordLength: number, pos: number[], isHorizontal?: boolean) {
        let collisionsCol = 0;
        let collisionsRow = 0;
        if (pos[0] < 0 || pos[1] < 0) return false;
        if (isHorizontal === undefined) return pos[0] < BOARD_LENGTH && pos[1] < BOARD_LENGTH;

        if (isHorizontal) {
            for (let i = 0; i < wordLength + collisionsCol; i++) {
                if (pos[1] + i >= BOARD_LENGTH) {
                    return false;
                }
                if (!this.board[pos[0]][pos[1] + i].empty) {
                    collisionsCol++;
                }
            }
        } else {
            for (let i = 0; i < wordLength + collisionsRow; i++) {
                if (pos[0] + i >= BOARD_LENGTH) {
                    return false;
                }
                if (!this.board[pos[0] + i][pos[1]].empty) {
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
