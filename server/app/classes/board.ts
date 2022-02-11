import { DictionnaryService } from '@app/services/dictionnary.service';
import { SyntaxValidator } from '@app/services/syntax-validator';
import { GameTile } from './game-tile';
import * as Multipliers from './multipliers';

const INVALID = -1;
const BOARD_LENGTH = 15;
const HALF_LENGTH = 7;
const WORD_LENGTH_BONUS = 7;
const BONUS_POINTS = 50;
const A_ASCII = 'a'.charCodeAt(0);

export class Board {
    board: GameTile[][];
    private syntaxValidator: SyntaxValidator;

    constructor( private dictionnary: DictionnaryService) {
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
    }

    placeWord(word: string, position: string): number | Error {
        const positionArray = this.syntaxValidator.separatePosition(position);
        if (!this.syntaxValidator.validatePositionSyntax(positionArray)) {
            return new Error("Erreur de syntaxe dans le placement d'un mot");
        }
        if (!this.isWordInBound(word.length, positionArray)) {
            return new Error('Placement invalide le mot ne rentre pas dans la grille');
        }
        if (!this.firstWordValidation(word.length, positionArray)) {
            return new Error('Placement invalide pour le premier mot');
        }
        const contacts = this.getContacts(word.length, positionArray);
        if (contacts.length === 0) {
            return new Error('Placement invalide vous devez toucher un autre mot');
        }
        const words = this.getWords(word, positionArray, contacts);
        if (!this.dictionnary.validateWords(words)) {
            return new Error('Un des mots crees ne fait pas partie du dictionnaire');
        }
        let score = this.placeWithScore(words);
        return word.length === WORD_LENGTH_BONUS ? (score + BONUS_POINTS) : score;
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

    private getWords(word: string, position: string[], contacts: number[][]): string[] {
        const words: string[] = [];
        const currentRow = position[0].charCodeAt(0) - A_ASCII;
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
        const referenceRow = row;
        const referenceCol = col;

        if (horizontal) {
            while (col - 1 >= 0 && !this.board[row][col - 1].empty) col--;
        } else {
            while (row - 1 >= 0 && !this.board[row - 1][col].empty) row--;
        }
        word += ';' + row.toString() + ';' + col.toString() + ';';
        const letters = this.getLetters(row, referenceRow, col, referenceCol, attemptedWord, horizontal, letterPlace);
        return (word += letters);
    }

    private getLetters(row:number, refRow:number, col: number, refCol:number, testedWord: string, horizontal: boolean, letterPlace?: number): string {
        let letterCount = 0;
        let letters = '';
        while (col < BOARD_LENGTH && row < BOARD_LENGTH) {
            if (
                letterPlace === undefined &&
                (letterCount < testedWord.length || (horizontal ? !this.board[row][col + 1].empty : !this.board[row + 1][col].empty))
            ) {
                if (this.board[row][col].empty) {
                    letters += testedWord.charAt(letterCount);
                    letterCount++;
                } else {
                    letters += this.board[row][col].getChar();
                }
            } else if (!this.board[row][col].empty || (col <= refCol && row <= refRow)) {
                if (!this.board[row][col].empty) {
                    letters += this.board[row][col].getChar();
                } else if (row === refRow && col === refCol) {
                    if (letterPlace !== undefined && letterPlace !== INVALID) {
                        letters += testedWord.charAt(letterPlace);
                    }
                }
            } else {
                break;
            }
            if (horizontal) col++;
            else row++;
        }
        return letters;
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

    private firstWordValidation(wordLength: number, position: string[]): boolean {
        if (!this.board[HALF_LENGTH][HALF_LENGTH].empty) {
            return true;
        } else {
            const row = position[0].charCodeAt(0) - A_ASCII;
            const col = parseInt(position[1], 10) - 1;
            switch (position[2]) {
                case 'h': {
                    if (row === HALF_LENGTH && col <= HALF_LENGTH && col + wordLength - 1 >= HALF_LENGTH) {
                        return true;
                    }
                    break;
                }
                case 'v': {
                    if (col === HALF_LENGTH && row <= HALF_LENGTH && row + wordLength - 1 >= HALF_LENGTH) {
                        return true;
                    }
                    break;
                }
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
}
