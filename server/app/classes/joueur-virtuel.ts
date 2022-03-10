import { Letter } from '@app/letter';
import { Board } from './board';
import { Game } from './game';

const AI_ID = 1;
const BOARD_LENGTH = 15;

export class JoueurVirtuel {
    board: Board;
    myRack: Letter[];

    constructor(readonly isDebutant: boolean, private game: Game) {
        this.board = game.board;
        this.myRack = game.reserve.letterRacks[AI_ID];
    }

    playTurn() {
        const random = Math.floor(Math.random() * 10);
        if(this.isDebutant && random === 0) {
            // skipTurn
        } else if (this.isDebutant && random === 1) {
            // echangerLettres
        } else {
            // play word
        }
        return;
    }

    getPlayablePositions() {
        const positions = this.board.getPlayablePositions(this.myRack.length);
        const arrayPos: any[][] = [];
        for (let i = 0; i < BOARD_LENGTH; i++) {
            for (let j = 0; j < BOARD_LENGTH; j++) {
                let valid = false;
                for (const char of positions[i][j][0]) {
                    if (char !== ' ') valid = true;
                }
                if (valid) arrayPos.push([i, j, true, positions[i][j][0]]);

                valid = false;
                for (const char of positions[i][j][1]) {
                    if (char !== ' ') valid = true;
                }
                if (valid) arrayPos.push([i, j, false, positions[i][j][1]]);
            }
        }
        this.validateCrosswords(arrayPos);
        console.log(arrayPos);
    }

    private validateCrosswords(array: any[][]): any[][] {
        // let validWords: any[][] = [];
        for (const option of array) {
            let letterCount = 0;
            // let replacements: string[] = [];
            for (let letter of option[3]) {
                if (letter === '*') {
                    const row = option[2] ? option[0] : option[0] + letterCount;
                    const col = option[2] ? option[1] + letterCount : option[1];
                    const crossWord = this.board.wordGetter.getStringPositionVirtualPlayer(row, col, !option[2]);
                    console.log(row, !option[2], col, crossWord);
                    for (const rackLetter of this.myRack) {
                        // verify if replace only the first *
                        const attemptedWord = crossWord.replace('*', rackLetter.name.toLowerCase());
                        if (this.game.dictionnaryService.isValidWord(attemptedWord)) {
                            console.log(attemptedWord);
                            // TODO
                        }
                    }
                }
                letterCount++;
            }
        }
        return [[0]];
    }
}
