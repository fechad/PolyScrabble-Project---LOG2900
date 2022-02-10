// import { WordValidation } from "@app/services/word-validation.service";
import { Multipliers } from 'assets/multipliers';
import { GameTile } from './gameTile';
const INVALID = -1;
const BOARD_LENGTH = 15;
const HALF_LENGTH = 7;
const A_ASCII = 'a'.charCodeAt(0);

export class Board {
    board: GameTile[][];
    // private wordValidation: WordValidation
    constructor() {
        // this.wordValidation = new WordValidation();
        this.board = [];
        for (let i = 0; i < BOARD_LENGTH; i++) {
            this.board[i] = [];
            for (let j = 0; j < BOARD_LENGTH; j++) {
                this.board[i][j] = new GameTile(1);
            }
        }
        const multipliers = new Multipliers();
        this.initList(multipliers.MULT_WORDS_3, 1, 3);
        this.initList(multipliers.MULT_WORDS_2, 1, 2);
        this.initList(multipliers.MULT_LETTERS_3, 3);
        this.initList(multipliers.MULT_LETTERS_2, 2);
    }

    placeWord(word: string, position: string): number | Error {
        let score = 0;
        let error;
        const positionArray = this.separatePosition(position);
        if (this.validatePositionSyntax(positionArray)) {
            if (this.isWordInBound(word.length, positionArray)) {
                if (this.firstWordValidation(word.length, positionArray)) {
                    const contacts = this.getContacts(word.length, positionArray);
                    if (contacts.length !== 0) {
                        const words = this.getWords(word, positionArray, contacts);
                        if (this.validateWords(words)) {
                            score = this.placeWithScore(words);
                        } else error = new Error('Un des mots crees ne fait pas partie du dictionnaire');
                    } else error = new Error('Placement invalide vous devez toucher un autre mot');
                } else error = new Error('Placement invalide pour le premier mot');
            } else error = new Error('Placement invalide le mot ne rentre pas dans la grille');
        } else error = new Error("Erreur de syntaxe dans le placement d'un mot");
        return error !== undefined ? error : score;
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
                // console.log(this.board[currentRow][currentCol].getPoints())
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
            // console.log(`${wordAndPos[3]} : ${wordScore}\ntotal: ${score}`)
        });

        this.changeNewlyPlaced(words[0].split(';'));
        return score;
    }

    private changeNewlyPlaced(wordAndPos: string[]) {
        let currentRow = parseInt(wordAndPos[1], 10);
        let currentCol = parseInt(wordAndPos[2], 10);
        for (let i = 0; i < wordAndPos[3].length; i++) {
            this.board[currentRow][currentCol].newlyPlaced = false;
            if (wordAndPos[0] === 'h') {
                currentCol++;
            } else if (wordAndPos[0] === 'v') {
                currentRow++;
            }
        }
    }

    // TODO: update with new word-validation
    private validateWords(wordList: string[]): boolean {
        const isValid = true;
        /* wordList.forEach((word) => {
            let separatedWord = word.split(';');
            this.wordValidation.isValid(separatedWord[separatedWord.length - 1]).then((valid) => {
                if(!valid){
                    isValid = false;
                }
            });
        });*/
        return isValid;
    }

    private getWords(word: string, position: string[], contacts: number[][]): string[] {
        const words: string[] = [];
        let letterCount = 0;
        let tempWord = '';
        let currentRow = position[0].charCodeAt(0) - A_ASCII;
        let currentCol = parseInt(position[1], 10) - 1;

        // get attempted word
        if (position[2] === 'h') {
            while (currentCol - 1 >= 0 && !this.board[currentRow][currentCol - 1].empty) currentCol--;
            tempWord += position[2] + ';';
            tempWord += currentRow.toString() + ';';
            tempWord += currentCol.toString() + ';';
            while (currentCol < BOARD_LENGTH && (letterCount < word.length || !this.board[currentRow][currentCol + 1].empty)) {
                if (this.board[currentRow][currentCol].empty) {
                    tempWord += word.charAt(letterCount);
                    letterCount++;
                } else {
                    tempWord += this.board[currentRow][currentCol].getChar();
                }
                currentCol++;
            }
            words.push(`${tempWord}`);
        } else if (position[2] === 'v') {
            while (currentRow - 1 >= 0 && !this.board[currentRow - 1][currentCol].empty) currentRow--;
            tempWord += position[2] + ';';
            tempWord += currentRow.toString() + ';';
            tempWord += currentCol.toString() + ';';
            while (currentRow < BOARD_LENGTH && (letterCount < word.length || !this.board[currentRow + 1][currentCol].empty)) {
                if (this.board[currentRow][currentCol].empty) {
                    tempWord += word.charAt(letterCount);
                    letterCount++;
                } else {
                    tempWord += this.board[currentRow][currentCol].getChar();
                }
                currentRow++;
            }
            words.push(`${tempWord}`);
        }

        // get words by contact
        if (contacts[0][0] !== INVALID) {
            for (const contact of contacts) {
                letterCount = 0;
                tempWord = '';
                currentRow = contact[0];
                currentCol = contact[1];

                if (position[2] === 'h') {
                    while (currentRow - 1 >= 0 && !this.board[currentRow - 1][currentCol].empty) currentRow--;
                    tempWord += 'v;';
                    tempWord += currentRow.toString() + ';';
                    tempWord += currentCol.toString() + ';';
                    while (currentRow < BOARD_LENGTH && (!this.board[currentRow][currentCol].empty || currentRow <= contact[0])) {
                        if (!this.board[currentRow][currentCol].empty) {
                            tempWord += `${this.board[currentRow][currentCol].getChar()}`;
                        } else if (currentRow === contact[0] && currentCol === contact[1]) {
                            if (contact[2] !== INVALID) {
                                tempWord += `${word.charAt(contact[2])}`;
                            }
                        }
                        currentRow++;
                    }
                    words.push(`${tempWord}`);
                } else if (position[2] === 'v') {
                    while (currentCol - 1 >= 0 && !this.board[currentRow][currentCol - 1].empty) currentCol--;
                    tempWord += 'h;';
                    tempWord += currentRow.toString() + ';';
                    tempWord += currentCol.toString() + ';';
                    while (currentCol < BOARD_LENGTH && (!this.board[currentRow][currentCol].empty || currentCol <= contact[1])) {
                        if (!this.board[currentRow][currentCol].empty) {
                            tempWord += this.board[currentRow][currentCol].getChar();
                        } else if (currentRow === contact[0] && currentCol === contact[1]) {
                            if (contact[2] !== INVALID) {
                                tempWord += word.charAt(contact[2]);
                            }
                        }
                        currentCol++;
                    }
                    words.push(`${tempWord}`);
                }
            }
        }
        return words;
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

    private validatePositionSyntax(position: string[]): boolean {
        if (position[0].match(/[a-o]/g) !== null) {
            if (position[2].match(/[hv]/g) !== null) {
                if (position[1].length === 1) {
                    if (position[1].match(/[1-9]/g) !== null) {
                        return true;
                    }
                }
                if (position[1].length === 2) {
                    if (position[1][1].match(/[0-5]/g) !== null && position[1][0] === '1') {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    private separatePosition(position: string): string[] {
        const positionArray: string[] = [];
        positionArray[0] = position.charAt(0);
        if (position.length === 3) {
            positionArray[1] = position.charAt(1);
            positionArray[2] = position.charAt(2);
        } else {
            positionArray[1] = position.charAt(1) + position.charAt(2);
            positionArray[2] = position.charAt(3);
        }
        return positionArray;
    }

    private initList(array: number[][], multLetter: number, multWord?: number) {
        for (const position of array) {
            this.board[position[0]][position[1]] = new GameTile(multLetter, multWord);
        }
    }
}
