import { GameTile } from "./gameTile";

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
    [7, 5],
    [7, 9],
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

export class Board{
    private board: GameTile[][];
    
    constructor(){
        this.board = [];
        for(let i: number = 0; i < BOARD_LENGTH; i++){
            this.board[i] = [];
            for(let j: number = 0; j < BOARD_LENGTH; j++){
                this.board[i][j] = new GameTile(1);
            }
        }
        this.initList(MULT_WORDS_3, 1, 3);
        this.initList(MULT_WORDS_2, 1, 2);
        this.initList(MULT_LETTERS_3, 3);
        this.initList(MULT_LETTERS_2, 2);
    }

    placeWord(word: string, position: string): number | Error{
        let score = 0;
        let error;
        let positionArray = this.separatePosition(position);
        if(this.validatePositionSyntax(positionArray)){
            if(this.isWordInBound(word.length, positionArray)){
                if(this.firstWordValidation(word.length, positionArray)){
                    let contacts = this.getContacts(word.length, positionArray);
                    console.log(contacts);
                } else {
                    error = new Error('Placement invalide pour le premier mot');
                }
            } else {
                error = new Error('Le mot ne rentre pas dans la grille')
            }
        } else {
            error = new Error('Erreur de syntaxe dans le placement d\'un mot');
        }
        return error !== undefined ? error : score;
    }

    private getContacts(wordLength: number, position: string[]): number[][]{
        let contacts: number[][] = [];
        let row = position[0].charCodeAt(0) - A_ASCII;
        let col = parseInt(position[1]) - 1;
        if(this.board[Math.floor(BOARD_LENGTH/2)][Math.floor(BOARD_LENGTH/2)].empty){
            contacts = [[-1]];
        } else if(position[2] === 'h') {
            for(let i=0; i < wordLength; i++){
                if(!this.board[row][col + i].empty){
                    return[];
                } else if(!this.board[row - 1][col + i].empty || !this.board[row + 1][col + i].empty){
                    contacts.push([row, col + i]);
                }
            }
        } else if(position[2] === 'v') {
            for(let i=0; i < wordLength; i++){
                if(!this.board[row + i][col].empty){
                    return[];
                } else if(!this.board[row + i][col-1].empty || !this.board[row + i][col+1].empty){
                    contacts.push([row+i, col]);
                }
            }
        }
        return contacts;
    }

    private firstWordValidation(wordLength: number, position: string[]): boolean{
        if(!this.board[Math.floor(BOARD_LENGTH/2)][Math.floor(BOARD_LENGTH/2)].empty){
            return true;
        } else {
            let row = position[0].charCodeAt(0) - A_ASCII;
            let col = parseInt(position[1]) - 1;
            switch(position[2]){
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
                default:{
                    return false;
                }
            }
        }
        return false;
    }

    private isWordInBound(wordLength: number, position: string[]){
        let row = position[0].charCodeAt(0) - A_ASCII;
        let col = parseInt(position[1]) - 1;
        if(row < 0 || col < 0) return false;

        if(position[2] === 'h'){
            col += wordLength - 1;
        } else if(position[2] === 'v'){
            row += wordLength - 1;
        }
        return row < BOARD_LENGTH && col < BOARD_LENGTH;
    }

    private validatePositionSyntax(position: string[]): boolean{
        if(position[0].match(/[a-o]/g) !== null){
            if(position[2].match(/[hv]/g) !== null){
                if(position[1].length == 1){
                    if(position[1].match(/[1-9]/g) !== null){
                        return true;
                    }
                }if(position[1].length == 2){
                    if(position[1][1].match(/[0-5]/g) !== null && position[1][0] === '1'){
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
        if(position.length === 3){
            positionArray[1] = position.charAt(1);
            positionArray[2] = position.charAt(2);
        } else {
            positionArray[1] = position.charAt(1) + position.charAt(2);
            positionArray[2] = position.charAt(3);
        }
        return positionArray;
    }

    private initList(array:number[][], multLetter:number, multWord?:number){
        for(let i = 0; i < array.length; i++){
            this.board[array[i][0]] [array[i][1]] = new GameTile(multLetter, multWord);
        }
    }

}