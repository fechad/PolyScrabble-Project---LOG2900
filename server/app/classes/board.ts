import { DictionnaryService } from '@app/services/dictionnary.service';
import { SyntaxValidator } from '@app/services/syntax-validator';
import { WordGetter } from '@app/services/word-getter';
import { GameTile } from './game-tile';
import * as Multipliers from './multipliers';

const INVALID = -1;
const BOARD_LENGTH = 15;
const HALF_LENGTH = 7;
const WORD_LENGTH_BONUS = 7;
const BONUS_POINTS = 50;
const A_ASCII = 'a'.charCodeAt(0);
const BOARD_PLACEMENT_DELAY = 3000; // ms

export class Board {
    board: GameTile[][];
    private syntaxValidator: SyntaxValidator;
    private wordGetter: WordGetter;

    constructor(private dictionnary: DictionnaryService) {
        this.syntaxValidator = new SyntaxValidator();
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

    async placeWord(word: string, position: string): Promise<number> {
        const positionArray = this.syntaxValidator.separatePosition(position);
        if (!this.syntaxValidator.validatePositionSyntax(positionArray, word.length === 1))
            throw new Error("Erreur de syntaxe dans le placement d'un mot");
        if (!this.isWordInBound(word.length, positionArray)) throw new Error('Placement invalide le mot ne rentre pas dans la grille');
        await new Promise((resolve) => {
            setTimeout(() => {
                resolve(null);
            }, BOARD_PLACEMENT_DELAY);
        });
        if (!this.firstWordValidation(word.length, positionArray)) throw new Error('Placement invalide pour le premier mot');
        if (!this.isTouchingOtherWord(word.length, positionArray)) throw new Error('Placement invalide vous devez toucher un autre mot');
        const contacts = this.getContacts(word.length, positionArray);
        const wordWithoutAccents = this.syntaxValidator.removeAccents(word);
        const words = this.wordGetter.getWords(wordWithoutAccents, positionArray, contacts);
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
                } else if (wordAndPos[0] === 'v') {
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
            } else if (wordAndPos[0] === 'v') {
                this.board[currentRow + i][currentCol].newlyPlaced = false;
            }
        }
    }

    private getContacts(wordLength: number, position: string[]): number[][] {
        let contacts: number[][] = [];
        const row = position[0].charCodeAt(0) - A_ASCII;
        const col = parseInt(position[1], 10) - 1;
        let collisions = 0;
        if (this.board[HALF_LENGTH][HALF_LENGTH].empty) {
            contacts = [[INVALID]];
        } else if (position[2] === 'h') {
            for (let i = 0; i < wordLength + collisions; i++) {
                if (!this.board[row][col + i].empty) {
                    collisions++;
                    contacts.push([row, col + i, INVALID]);
                } else if (!this.board[row - 1][col + i].empty || !this.board[row + 1][col + i].empty) {
                    contacts.push([row, col + i, i - collisions]);
                }
            }
        } else if (position[2] === 'v') {
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

    private isTouchingOtherWord(wordLength: number, position: string[]): boolean {
        if (this.board[HALF_LENGTH][HALF_LENGTH].empty) {
            return true;
        }
        const row = position[0].charCodeAt(0) - A_ASCII;
        const col = parseInt(position[1], 10) - 1;

        if (position[2] === 'h') {
            return this.isWordTouchingHorizontal(wordLength, row, col);
        }
        return this.isWordTouchingVertical(wordLength, row, col);
    }

    private isWordTouchingHorizontal(wordLength: number, row: number, col: number): boolean {
        if ((col - 1 > 0 && !this.board[row][col - 1].empty) || (col + wordLength < BOARD_LENGTH && !this.board[row][col + wordLength].empty)) {
            return true;
        }
        for (let i = col; i < col + wordLength; i++) {
            if ((row - 1 >= 0 && !this.board[row - 1][i].empty) || (row + 1 < BOARD_LENGTH && !this.board[row + 1][i].empty)) {
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
            if (col - 1 >= 0 && !this.board[i][col - 1].empty) {
                return true;
            }
            if (col + 1 < BOARD_LENGTH && !this.board[i][col + 1].empty) {
                return true;
            }
        }
        return false;
    }

    private firstWordValidation(wordLength: number, position: string[]): boolean {
        if (!this.board[HALF_LENGTH][HALF_LENGTH].empty) {
            return true;
        } else {
            const row = position[0].charCodeAt(0) - A_ASCII;
            const col = parseInt(position[1], 10) - 1;
            if (position[2] === 'h' && row === HALF_LENGTH && col <= HALF_LENGTH && col + wordLength - 1 >= HALF_LENGTH) {
                return true;
            } else if (col === HALF_LENGTH && row <= HALF_LENGTH && row + wordLength - 1 >= HALF_LENGTH) {
                return true;
            }
        }
        return false;
    }

    private isWordInBound(wordLength: number, position: string[]) {
        const row = position[0].charCodeAt(0) - A_ASCII;
        const col = parseInt(position[1], 10) - 1;
        let collisionsCol = 0;
        let collisionsRow = 0;
        if (row < 0 || col < 0) return false;

        if (position[2] === 'h') {
            for (let i = 0; i < wordLength + collisionsCol; i++) {
                if (col + i >= BOARD_LENGTH) {
                    return false;
                }
                if (!this.board[row][col + i].empty) {
                    collisionsCol++;
                }
            }
        } else if (position[2] === 'v') {
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

    // only for debug purpose
    /*
    private printBoard() {
        for (const row of this.board) {
            for (const tile of row) {
                if (!tile.empty) {
                    process.stdout.write(`${tile.getChar().toUpperCase()} `);
                } else {
                    process.stdout.write(
                        tile.wordMultiplier !== 1 ? `x${tile.wordMultiplier}` : tile.multiplier !== 1 ? `${tile.multiplier} ` : '  ',
                    );
                }
            }
            console.log();
        }
    }*/
}
