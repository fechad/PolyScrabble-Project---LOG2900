// import { WordValidation } from "@app/services/word-validation.service";
import { GameTile } from './gameTile';

const BOARD_LENGTH = 15;
const A_ASCII = 'a'.charCodeAt(0);

const MULT_WORDS_3 = [
    [0, 0],
    [0, 7],
    [0, 14],
    [7, 0],
    [7, 14],
    [14, 0],
    [14, 7],
    [14, 14]
];
const MULT_WORDS_2 = [
    [1, 1],
    [1, 13],
    [2, 2],
    [2, 12],
    [3, 3],
    [3, 11],
    [4, 4],
    [4, 10],
    [10, 4],
    [10, 10],
    [11, 3],
    [11, 11],
    [12, 2],
    [12, 12],
    [13, 13],
    [13, 13]
];
const MULT_LETTERS_3 = [
    [1, 5],
    [1, 9],
    [5, 1],
    [5, 5],
    [5, 9],
    [5, 13],
    [7, 1],
    [7, 9],
    [9, 1],
    [9, 5],
    [9, 9],
    [9, 13],
    [7, 13],
    [13, 5],
    [13, 9]
];
const MULT_LETTERS_2 = [
    [0, 3],
    [0, 11],
    [2, 6],
    [2, 8],
    [3, 0],
    [3, 7],
    [3, 14],
    [6, 2], 
    [6, 6],
    [6, 8],
    [6, 12],
    [7, 3],
    [7, 11],
    [8, 2],
    [8, 6],
    [8, 8],
    [8, 12],
    [11, 0],
    [11, 7],
    [11, 14],
    [12, 6],
    [12, 8],
    [14, 3],
    [14, 11]
];

export class Board {
    board: GameTile[][];
    // private wordValidation: WordValidation
    constructor(){
        // this.wordValidation = new WordValidation();
        this.board = [];
        for( let i: number = 0; i < BOARD_LENGTH; i++) {
            this.board[i] = [];
            for (let j: number = 0; j < BOARD_LENGTH; j++) {
                this.board[i][j] = new GameTile(1);
            }
        }
        this.initList(MULT_WORDS_3, 1, 3);
        this.initList(MULT_WORDS_2, 1, 2);
        this.initList(MULT_LETTERS_3, 3);
        this.initList(MULT_LETTERS_2, 2);
    }

    placeWord(word: string, position: string): number | Error {
        let score = 0;
        let error;
        let positionArray = this.separatePosition(position);
        if(this.validatePositionSyntax(positionArray)) {
            if(this.isWordInBound(word.length, positionArray)) {
                if(this.firstWordValidation(word.length, positionArray)) {
                    let contacts = this.getContacts(word.length, positionArray);
                    if(contacts.length !== 0) {
                        let words = this.getWords(word, positionArray, contacts);
                        if(this.validateWords(words)) {
                            score = this.placeWithScore(words);
                        } else error = new Error('Un des mots crees ne fait pas partie du dictionnaire');
                    } else error = new Error('Placement invalide vous devez toucher un autre mot');
                } else error = new Error('Placement invalide pour le premier mot');
            } else error = new Error('Placement invalide le mot ne rentre pas dans la grille');
        } else error = new Error('Erreur de syntaxe dans le placement d\'un mot');
        return error !== undefined ? error : score;
    }

    private placeWithScore(words: string[]): number {
        let score = 0;
        
        words.forEach((word) => {
            let wordScore = 0;
            let wordMultiplier = 1;
            let wordAndPos = word.split(';');
            let currentRow = parseInt(wordAndPos[1]);
            let currentCol = parseInt(wordAndPos[2]);
            
            for (let i = 0; i < wordAndPos[3].length; i++) {
                if (this.board[currentRow][currentCol].empty) {
                    this.board[currentRow][currentCol].setLetter(wordAndPos[3].charAt(i));
                }
                //console.log(this.board[currentRow][currentCol].getPoints())
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
            //console.log(`${wordAndPos[3]} : ${wordScore}\ntotal: ${score}`)
        });

        this.changeNewlyPlaced(words[0].split(';'));
        return score;
    }

    private changeNewlyPlaced(wordAndPos: string[]) {
        let currentRow = parseInt(wordAndPos[1]);
        let currentCol = parseInt(wordAndPos[2]);
        for (let i = 0; i < wordAndPos[3].length; i++) {
            this.board[currentRow][currentCol].newlyPlaced = false;
            if (wordAndPos[0] === 'h') {
                currentCol++;
            } else if (wordAndPos[0] === 'v') {
                currentRow++;
            }
        }
    }

    //TODO: update with new word-validation
    private validateWords(wordList: string[]): boolean {
        let isValid = true;
        /*wordList.forEach((word) => {
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
        let words: string[] = [];
        let row = position[0].charCodeAt(0) - A_ASCII;
        let col = parseInt(position[1]) - 1;

        let letterCount = 0;
        let tempWord: string = '';
        let currentRow = row;
        let currentCol = col;

        //get attempted word
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
                if (this.board[currentRow][currentCol].empty){
                    tempWord += word.charAt(letterCount);
                    letterCount++;
                } else {
                    tempWord += this.board[currentRow][currentCol].getChar();
                }
                currentRow++;
            }
            words.push(`${tempWord}`);
        }

        //get words by contact
        if (contacts[0][0] !== -1) {
            for (let i=0; i < contacts.length; i++) {
                letterCount = 0;
                tempWord = '';
                currentRow = contacts[i][0];
                currentCol = contacts[i][1];

                if (position[2] === 'h') {
                    while (currentRow - 1 >= 0 && !this.board[currentRow - 1][currentCol].empty) currentRow--;
                    tempWord += 'v;';
                    tempWord += currentRow.toString() + ';';
                    tempWord += currentCol.toString() + ';';
                    while (currentRow < BOARD_LENGTH && (!this.board[currentRow][currentCol].empty || currentRow <= contacts[i][0])){
                        if (!this.board[currentRow][currentCol].empty) {
                            tempWord += `${this.board[currentRow][currentCol].getChar()}`;
                        } else if (currentRow === contacts[i][0] && currentCol === contacts[i][1]) {
                            if (contacts[i][2] !== -1) {
                                tempWord += `${word.charAt(contacts[i][2])}`;
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
                    while (currentCol < BOARD_LENGTH && (!this.board[currentRow][currentCol].empty || currentCol <= contacts[i][1])) {
                        if (!this.board[currentRow][currentCol].empty) {
                            tempWord += this.board[currentRow][currentCol].getChar();
                        } else if (currentRow === contacts[i][0] && currentCol === contacts[i][1]) {
                            if (contacts[i][2] !== -1) {
                                tempWord += word.charAt(contacts[i][2]);
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
        let row = position[0].charCodeAt(0) - A_ASCII;
        let col = parseInt(position[1]) - 1;
        let collisions = 0;
        if (this.board[Math.floor(BOARD_LENGTH/2)][Math.floor(BOARD_LENGTH/2)].empty) {
            contacts = [[-1]];
        } else if (position[2] === 'h') {
            for(let i=0; i < wordLength + collisions; i++) {
                if (!this.board[row][col + i].empty) {
                    collisions++;
                    contacts.push([row, col + i, -1]);
                } else if (!this.board[row - 1][col + i].empty || !this.board[row + 1][col + i].empty) {
                    contacts.push([row, col + i, i - collisions]);
                }
            }
        } else if (position[2] === 'v') {
            for (let i=0; i < wordLength + collisions; i++) {
                if (!this.board[row + i][col].empty) {
                    collisions++;
                    contacts.push([row+i, col, -1]);
                } else if (!this.board[row + i][col-1].empty || !this.board[row + i][col+1].empty) {
                    contacts.push([row+i, col, i - collisions]);
                }
            }
        }
        return contacts;
    }

    private firstWordValidation(wordLength: number, position: string[]): boolean {
        if (!this.board[Math.floor(BOARD_LENGTH/2)][Math.floor(BOARD_LENGTH/2)].empty) {
            return true;
        } else {
            let row = position[0].charCodeAt(0) - A_ASCII;
            let col = parseInt(position[1]) - 1;
            switch (position[2]) {
                case 'h': {
                    if(row === Math.floor(BOARD_LENGTH/2) && col <= Math.floor(BOARD_LENGTH/2) && (col + wordLength - 1) >= Math.floor(BOARD_LENGTH/2)){
                        return true;
                    }
                    break;
                }
                case 'v': {
                    if(col === Math.floor(BOARD_LENGTH/2) && row <= Math.floor(BOARD_LENGTH/2) && (row + wordLength - 1) >= Math.floor(BOARD_LENGTH/2)){
                        return true;
                    }
                    break;
                }
            }
        }
        return false;
    }

    private isWordInBound(wordLength: number, position: string[]) {
        let row = position[0].charCodeAt(0) - A_ASCII;
        let col = parseInt(position[1]) - 1;
        let collisionsCol = 0;
        let collisionsRow = 0;
        if (row < 0 || col < 0) return false;

        if (position[2] === 'h') {
            for (let i=0; i < wordLength + collisionsCol; i++) {
                if (col + i >= BOARD_LENGTH) { 
                    return false;
                }
                if (!this.board[row][col + i].empty) {
                    collisionsCol++;
                }
            }
        } else if (position[2] === 'v') {
            for (let i=0; i < wordLength+ collisionsRow; i++) {
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
                if (position[1].length == 1) {
                    if (position[1].match(/[1-9]/g) !== null) {
                        return true;
                    }
                } if(position[1].length == 2) {
                    if (position[1][1].match(/[0-5]/g) !== null && position[1][0] === '1') {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    private separatePosition(position: string): string[] {
        let positionArray: string[] = [];
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

    private initList (array:number[][], multLetter:number, multWord?:number) {
        for (let i = 0; i < array.length; i++) {
            this.board[array[i][0]] [array[i][1]] = new GameTile(multLetter, multWord);
        }
    }
}